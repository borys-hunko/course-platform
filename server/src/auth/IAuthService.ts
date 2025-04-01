import { HttpError } from 'http-errors';
import { ITransactional } from '../common/transactionRunner';
import {
  LogInRequest,
  LogInResponse,
  ResetPasswordRequest,
  SendForgotPasswordTokenRequest,
  SignUpRequest,
} from './dto';

export interface IAuthService extends ITransactional<IAuthService> {
  login(loginRequest: LogInRequest): Promise<LogInResponse>;
  signUp(signUpRequest: SignUpRequest): Promise<LogInResponse>;
  resetPassword(resetPasswordRequest: ResetPasswordRequest): Promise<void>;
  sendResetToken(
    sendForgotPassTokenRequest: SendForgotPasswordTokenRequest,
  ): Promise<void>;
  refreshJwt(refreshToken: string): Promise<LogInResponse>;
  authenticateJwt(jwt: string): Promise<void | HttpError>;
  logout(refreshToken: string): Promise<void>;
  logoutOfAllDevices(): Promise<void>;
}
