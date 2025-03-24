import { compare } from 'bcrypt';
import { HttpError } from 'http-errors';
import { inject, injectable } from 'inversify';
import IConfigService from '../common/config/IConfigService';
import { CONTAINER_IDS } from '../common/consts';
import { ILocalStorage } from '../common/localStorage';
import { ILogger } from '../common/logger';
import { IMailService } from '../common/mail';
import { Transaction } from '../common/transactionRunner';
import { hashString, parseToken } from '../common/utils';
import { authenticationError } from '../common/utils';
import IUserService from '../user/IUserService';
import {
  LogInRequest,
  LogInResponse,
  ResetPasswordRequest,
  SendForgotPasswordTokenRequest,
  SignUpRequest,
} from './dto';
import { IAuthService } from './IAuthService';
import { IJwtService } from './jwt';
import { IPassResetTokenService } from './passResetToken';

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject(CONTAINER_IDS.USER_SERVICE) private userService: IUserService,
    @inject(CONTAINER_IDS.PASS_RESET_TOKEN_SERVICE)
    private passResetTokenService: IPassResetTokenService,
    @inject(CONTAINER_IDS.JWT_SERVICE) private jwtService: IJwtService,
    @inject(CONTAINER_IDS.LOCAL_STORAGE) private localStorage: ILocalStorage,
    @inject(CONTAINER_IDS.MAIL_SERVICE) private mailService: IMailService,
    @inject(CONTAINER_IDS.CONFIG_SERVICE) private configService: IConfigService,
    @inject(CONTAINER_IDS.LOGGER) private logger: ILogger,
  ) {}

  createTransactionalInstance(trx: Transaction): AuthService {
    return new AuthService(
      this.userService.createTransactionalInstance(trx),
      this.passResetTokenService.createTransactionalInstance(trx),
      this.jwtService.createTransactionalInstance(trx),
      this.localStorage,
      this.mailService,
      this.configService,
      this.logger,
    );
  }

  async authenticateJwt(token: string): Promise<void | HttpError> {
    try {
      const payload = await this.jwtService.checkJwt(token);
      this.localStorage.set('userId', Number(payload.id));
    } catch (error) {
      if (error instanceof HttpError) {
        return error;
      }
      throw error;
    }
  }

  refreshJwt(refreshToken: string): Promise<LogInResponse> {
    return this.jwtService.refreshJwt(refreshToken);
  }

  async login({
    loginOrEmail,
    password,
  }: LogInRequest): Promise<LogInResponse> {
    const user = await this.userService.getByLoginOrEmail(loginOrEmail);

    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      throw authenticationError('Ivalid password');
    }

    return this.jwtService.getTokens(user.id);
  }

  async signUp(signUpRequest: SignUpRequest): Promise<LogInResponse> {
    const createdUser = await this.userService.create(signUpRequest);
    return this.jwtService.getTokens(createdUser.id);
  }

  async resetPassword({
    newPassword,
    resetToken,
  }: ResetPasswordRequest): Promise<void> {
    const validationResult =
      await this.passResetTokenService.validateAndGetUser(resetToken);

    const hashedPassword = await hashString(newPassword);

    await this.userService.update(validationResult.userId, {
      password: hashedPassword,
    });
  }

  async sendResetToken({
    email,
  }: SendForgotPasswordTokenRequest): Promise<void> {
    const token = await this.passResetTokenService.createToken(email);
    await this.sendPassResetEmail(email, token);
  }

  async logout(refreshToken: string): Promise<void> {
    const { tokenId } = parseToken(
      refreshToken,
      authenticationError('invalid token'),
    );
    await this.jwtService.deactivateRefreshToken(tokenId);
  }

  async logoutOfAllDevices(): Promise<void> {
    await this.jwtService.deactivateAllRefreshTokens();
  }

  private async sendPassResetEmail(email: string, token: string) {
    const resetLink = await this.createResetLink(token);
    this.logger.debug('sendPassResetEmail', { email });
    await this.mailService.sendEmail({
      receiverEmail: email,
      template: 'forgotPassword',
      subject: 'Password reset',
      templateVars: {
        resetLink,
      },
    });
  }

  private async createResetLink(token: string) {
    const clientUrl = await this.configService.get('CLIENT_URL');
    const resetLink = `${clientUrl}/forgot-password?token=${token}`;
    return resetLink;
  }
}
