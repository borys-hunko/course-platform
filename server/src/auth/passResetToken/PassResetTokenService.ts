import { compare } from 'bcrypt';
import { addHours } from 'date-fns';
import { inject, injectable } from 'inversify';
import IConfigService from '../../common/config/IConfigService';
import { CONTAINER_IDS } from '../../common/consts';
import { ILogger } from '../../common/logger';
import { IMailService } from '../../common/mail';
import { Transaction } from '../../common/transactionRunner';
import {
  authenticationError,
  createToken,
  hashString,
  parseToken,
} from '../../common/utils';
import IUserService from '../../user/IUserService';
import { IPassResetTokenRepository } from './IPassResetTokenRepository';
import { IPassResetTokenService } from './IPassResetTokenService';

const EXPIRATION_PERIOD_HOURS = 1;

@injectable()
export class PassResetTokenService implements IPassResetTokenService {
  constructor(
    @inject(CONTAINER_IDS.PASS_RESET_TOKEN_REPOSITORY)
    private passResetTokenRepo: IPassResetTokenRepository,
    @inject(CONTAINER_IDS.LOGGER) private logger: ILogger,
    @inject(CONTAINER_IDS.USER_SERVICE) private userService: IUserService,
    @inject(CONTAINER_IDS.MAIL_SERVICE) private mailService: IMailService,
    @inject(CONTAINER_IDS.CONFIG_SERVICE) private configService: IConfigService,
  ) {}

  createTransactionalInstance(trx: Transaction): IPassResetTokenService {
    return new PassResetTokenService(
      this.passResetTokenRepo.createTransactionalInstance(trx),
      this.logger,
      this.userService.createTransactionalInstance(trx),
      this.mailService,
      this.configService,
    );
  }

  async createToken(userEmail: string): Promise<string> {
    const user = await this.userService.getByEmail(userEmail);
    const expirationTime = addHours(new Date(), EXPIRATION_PERIOD_HOURS);
    const token = createToken();
    const createdToken = await this.passResetTokenRepo.create({
      userId: user.id,
      token: await hashString(token),
      expirationDate: expirationTime,
    });

    return `${createdToken.tokenId}.${token}`;
  }

  async validateAndGetUser(
    passResetToken: string,
  ): Promise<{ usetId: number }> {
    const { token, tokenId } = parseToken(
      passResetToken,
      authenticationError('Invalid token format'),
    );

    const foundToken = await this.passResetTokenRepo.get(tokenId);
    if (!foundToken) {
      throw authenticationError('Token does not exists');
    }

    const isEqualToHash = await compare(token, foundToken.token);
    if (!isEqualToHash) {
      throw authenticationError('Invalid token');
    }

    if (foundToken.expirationDate < new Date()) {
      throw authenticationError('Token has expired');
    }

    if (foundToken.isUsed) {
      throw authenticationError('Token was already used');
    }

    await this.passResetTokenRepo.deactivate(tokenId);

    return { usetId: foundToken.userId };
  }
}
