import { compare } from 'bcrypt';
import { inject, injectable } from 'inversify';
import { CONTAINER_IDS } from '../common/consts';
import { ILocalStorage } from '../common/localStorage';
import { ITransactionRunner, Transaction } from '../common/transactionRunner';
import { authenticationError } from '../common/utils/error';
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
    @inject(CONTAINER_IDS.TRANSACTION_RUNNER)
    private transactionRunner: ITransactionRunner<AuthService>,
  ) {}

  createTransactionalInstance(tsx: Transaction): AuthService {
    return new AuthService(
      this.userService.createTransactionalInstance(tsx),
      this.passResetTokenService,
      this.jwtService.createTransactionalInstance(tsx),
      this.localStorage,
      this.transactionRunner,
    );
  }

  async authenticateJwt(token: string): Promise<void> {
    const payload = await this.jwtService.checkJwt(token);
    this.localStorage.set('userId', payload.id);
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
    return this.transactionRunner.runInsideTransaction(
      this,
      async (service) => {
        const createdUser = await service.userService.create(signUpRequest);
        return service.jwtService.getTokens(createdUser.id);
      },
    );
  }

  resetPassword(_resetPasswordRequest: ResetPasswordRequest): Promise<void> {
    throw new Error('Method not implemented.');
  }

  sendResetToken(
    _sendForgotPassTokenRequest: SendForgotPasswordTokenRequest,
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
