import { compare } from 'bcrypt';
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
import { ILogger } from '../../common/logger';
import { Transaction } from '../../common/transactionRunner';
import {
  authenticationError,
  createToken,
  hashString,
  parseToken,
} from '../../common/utils';
import { ILocalStorage } from '../../common/localStorage';

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
    @inject(CONTAINER_IDS.LOGGER) private logger: ILogger,
    @inject(CONTAINER_IDS.LOCAL_STORAGE) private localStorage: ILocalStorage,
  ) {}

  createTransactionalInstance(tsx: Transaction): JwtService {
    return new JwtService(
      this.refreshTokenRepository.createTransactionalInstance(tsx),
      this.configService,
      this.logger,
      this.localStorage,
    );
  }

  async checkJwt(token: string): Promise<JwtPayload> {
    try {
      const payload: jwt.JwtPayload = await this.verifyJwt(token);
      return { id: payload['id'] };
    } catch (error: unknown) {
      throw await this.handleJwtError(error);
    }
  }

  async getTokens(userId: number): Promise<TokensResponse> {
    const jwtToken = await this.createJwt(userId);

    const jwtExpirationTime = addHours(new Date(), JWT_LIFETIME);
    const refreshTokenExpirationTime = addDays(new Date(), REFRESH_LIFETIME);

    const refreshToken = createToken();
    const refreshTokenEntity = await this.refreshTokenRepository.create({
      userId,
      expirationDate: refreshTokenExpirationTime,
      token: await hashString(refreshToken),
    });

    const refreshTokenResponse = `${refreshTokenEntity.tokenId}.${refreshToken}`;

    return {
      jwt: {
        token: jwtToken,
        expirationTime: jwtExpirationTime.getTime(),
      },
      refresh: {
        token: refreshTokenResponse,
        expirationTime: refreshTokenExpirationTime.getTime(),
      },
    };
  }

  async refreshJwt(refreshToken: string): Promise<TokensResponse> {
    const checkedRefreshToken = await this.checkRefreshToken(refreshToken);

    await this.refreshTokenRepository.deactivate(checkedRefreshToken.tokenId);

    return this.getTokens(checkedRefreshToken.userId);
  }

  async deactivateRefreshToken(refreshTokenId: string): Promise<void> {
    await this.refreshTokenRepository.deactivate(refreshTokenId);
  }

  async deactivateAllRefreshTokens(): Promise<void> {
    const userId = this.localStorage.getOrThrow('userId');
    await this.refreshTokenRepository.deactivateAllForUser(userId);
  }

  private async createJwt(userId: number) {
    const secret = await this.getSecret();

    return jwt.sign({ id: userId }, secret, {
      algorithm: 'HS512',
      expiresIn: `${JWT_LIFETIME}h`,
    });
  }

  private async verifyJwt(token: string) {
    const secret = await this.getSecret();

    const payload = jwt.verify(token, secret);
    this.logger.debug('verifyJwt response', { payload });
    if (typeof payload === 'string' || typeof payload.id !== 'string') {
      throw await this.handleJwtError(new JsonWebTokenError('Invalid payload'));
    }
    return payload as JwtPayload;
  }

  private async handleJwtError(error: unknown) {
    if (error instanceof JsonWebTokenError) {
      const errorMessage = capitalize(error.message);
      const authError = authenticationError(errorMessage, {
        authScheme: AUTH_SCHEME,
        resource: await this.getAppName(),
        error: 'Invalid jwt',
      });
      authError.stack = error.stack;
      return authError;
    }
    return error;
  }

  private async checkRefreshToken(refreshToken: string) {
    const appName = await this.getAppName();

    const { tokenId, token } = parseToken(
      refreshToken,
      authenticationError('Invalid token format', {
        authScheme: AUTH_SCHEME,
        resource: appName,
        error: REFRESH_TOKEN_ERR,
      }),
    );

    const refreshTokenEntity = await this.refreshTokenRepository.get(tokenId);
    if (!refreshTokenEntity) {
      throw authenticationError('Refresh token not found', {
        authScheme: AUTH_SCHEME,
        resource: appName,
        error: REFRESH_TOKEN_ERR,
      });
    }

    const isMatchingToken = await compare(token, refreshTokenEntity?.token);
    if (!isMatchingToken) {
      throw authenticationError('Invalid refresh token', {
        authScheme: AUTH_SCHEME,
        resource: appName,
        error: REFRESH_TOKEN_ERR,
      });
    }

    if (refreshTokenEntity.expirationDate < new Date()) {
      throw authenticationError('Expired refresh token', {
        authScheme: AUTH_SCHEME,
        resource: appName,
        error: REFRESH_TOKEN_ERR,
      });
    }

    if (!refreshTokenEntity.isActive) {
      throw authenticationError('Refresh token is already used', {
        authScheme: AUTH_SCHEME,
        resource: appName,
        error: REFRESH_TOKEN_ERR,
      });
    }

    return refreshTokenEntity;
  }

  private async getAppName(): Promise<string | undefined> {
    return await this.configService.get('APP_NAME');
  }

  private async getSecret(): Promise<string> {
    return this.configService.get(JWT_SECRET);
  }
}
