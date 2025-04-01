import { addDays } from 'date-fns';
import { Response } from 'express';
import { COOKIES } from '../common/consts';
import { LogInResponse } from './dto';

export const setAuthCookies = (
  res: Response,
  { jwt, refresh }: LogInResponse,
) => {
  const expirationDay = addDays(new Date(), 7);
  res.cookie(COOKIES.ACCESS_TOKEN, jwt.token, {
    httpOnly: true,
    secure: true,
    expires: expirationDay,
  });
  res.cookie(COOKIES.REFRESH_TOKEN, refresh.token, {
    httpOnly: true,
    secure: true,
    expires: expirationDay,
  });
};
