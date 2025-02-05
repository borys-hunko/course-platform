import z from 'zod';
import { TokensResponse } from './jwt';
import {
  logInSchema,
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

export type LogInResponse = TokensResponse;
