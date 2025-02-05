import { randomUUID } from 'crypto';
import { addDays, addHours } from 'date-fns';
import { inject, injectable } from 'inversify';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { capitalize } from 'lodash';
import {
  IJwtService,
  IRefreshTokenRepository,
  JwtPayload,
  TokensResponse,
} from '.';
import IConfigService from '../../common/config/IConfigService';
import { AUTH_SCHEME, CONTAINER_IDS } from '../../common/consts';
import {
  ITransactionRunner,
  Transaction,
} from '../../common/transactionRunner';
import { authenticationError, toBase64 } from '../../common/utils';

const REFRESH_TOKEN_ERR = 'Invalid refresh token';
const JWT_SECRET = 'JWT_SECRET';
const JWT_LIFETIME = 1;
const REFRESH_LIFETIME = 3;

@injectable()
export class JwtService implements IJwtService {
  constructor(
    @inject(CONTAINER_IDS.REFRESH_TOKEN_REPOSITORY)
    private refreshTokenRepository: IRefreshTokenRepository,
    @inject(CONTAINER_IDS.CONFIG_SERVICE) private configService: IConfigService,
    @inject(CONTAINER_IDS.TRANSACTION_RUNNER)
    private transactionRunner: ITransactionRunner<JwtService>,
  ) {}

  createTransactionalInstance(tsx: Transaction): JwtService {
    return new JwtService(
      this.refreshTokenRepository.createTransactionalInstance(tsx),
      this.configService,
      this.transactionRunner,
    );
  }

  async checkJwt(token: string): Promise<JwtPayload> {
    const tokenPrefix = AUTH_SCHEME + ' ';
    if (!token.startsWith(tokenPrefix)) {
      throw authenticationError('Invalid token format', {
        authScheme: AUTH_SCHEME,
        resource: await this.getAppName(),
        error: 'Invalid jwt',
      });
    }

    const jwtToken = token.split(' ')[1];

    const secret = await this.getSecret();

    try {
      const payload = jwt.verify(jwtToken, secret);
      if (typeof payload === 'string' || typeof payload.id !== 'number') {
        throw new JsonWebTokenError('Invalid payload');
      }
      return { id: payload['id'] };
    } catch (error: unknown) {
      if (error instanceof JsonWebTokenError) {
        const errorMessage = capitalize(error.message);
        throw authenticationError(errorMessage, {
          authScheme: AUTH_SCHEME,
          resource: await this.getAppName(),
          error: 'Invalid jwt',
        });
      }
      throw error;
    }
  }

  async getTokens(userId: number): Promise<TokensResponse> {
    const secret = await this.getSecret();

    const jwtToken = jwt.sign({ id: userId }, secret, {
      algorithm: 'HS512',
      expiresIn: `${JWT_LIFETIME}h`,
    });

    const jwtExpirationTime = addHours(new Date(), JWT_LIFETIME);
    const refreshTokenExpirationTime = addDays(new Date(), REFRESH_LIFETIME);

    const refreshToken = await this.refreshTokenRepository.create({
      userId,
      expirationDate: refreshTokenExpirationTime,
      token: toBase64(randomUUID()),
    });

    return {
      jwt: {
        token: jwtToken,
        expirationTime: jwtExpirationTime.getTime(),
      },
      refresh: {
        token: refreshToken.token,
        expirationTime: refreshTokenExpirationTime.getTime(),
      },
    };
  }

  async refreshJwt(refreshToken: string): Promise<TokensResponse> {
    return this.transactionRunner.runInsideTransaction(this, async (entity) => {
      const checkedRefreshToken = await entity.checkRefreshToken(refreshToken);

      await entity.refreshTokenRepository.deactivate(refreshToken);

      return entity.getTokens(checkedRefreshToken.userId);
    });
  }

  private async checkRefreshToken(token: string) {
    const refreshToken = await this.refreshTokenRepository.get(token);
    if (!refreshToken) {
      throw authenticationError('Refresh token not found', {
        authScheme: AUTH_SCHEME,
        resource: await this.getAppName(),
        error: REFRESH_TOKEN_ERR,
      });
    }
    if (refreshToken.expirationDate < new Date()) {
      throw authenticationError('Expired refresh token', {
        authScheme: AUTH_SCHEME,
        resource: await this.getAppName(),
        error: REFRESH_TOKEN_ERR,
      });
    }
    if (!refreshToken.isActive) {
      throw authenticationError('Refresh token is already used', {
        authScheme: AUTH_SCHEME,
        resource: await this.getAppName(),
        error: REFRESH_TOKEN_ERR,
      });
    }
    return refreshToken;
  }

  private async getAppName(): Promise<string | undefined> {
    return await this.configService.get('APP_NAME');
  }

  private async getSecret(): Promise<string> {
    return this.configService.get(JWT_SECRET);
  }
}
