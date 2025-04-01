import z from 'zod';
import { TokensResponse } from './jwt';
import {
  logInSchema,
  logoutAllSchema,
  logoutSchema,
  refreshTokenSchema,
  resetPasswordSchema,
  sendPassResetTokenSchema,
  signUpSchema,
} from './schemas';

export type LogInRequest = z.infer<typeof logInSchema>;
export type SignUpRequest = z.infer<typeof signUpSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;
export type SendForgotPasswordTokenRequest = z.infer<
  typeof sendPassResetTokenSchema
>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
export type LogoutRequest = z.infer<typeof logoutSchema>;
export type LogoutAllRequest = z.infer<typeof logoutAllSchema>;

export type LogInResponse = TokensResponse;
