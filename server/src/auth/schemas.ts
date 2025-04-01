import { z } from 'zod';

const pwdRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/;
const loginRegex = /^[a-zA-Z0-9._-]+$/;
const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)*(?:-[A-Za-z]+)*$/;

export const signUpSchema = z.object({
  email: z.string().email(),
  login: z.string().regex(loginRegex),
  name: z.string().regex(nameRegex),
  password: z.string().min(8).max(16).regex(pwdRegex),
});

export const logInSchema = z.object({
  loginOrEmail: z.string(),
  password: z.string(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export const sendPassResetTokenSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().regex(pwdRegex),
  resetToken: z.string(),
});

export const logoutAllSchema = z.object({
  accessToken: z.string(),
});

export const logoutSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
