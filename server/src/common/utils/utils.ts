import { hash } from 'bcrypt';
import { randomUUID } from 'crypto';
import { HttpError } from 'http-errors';

export const toBase64 = (str: string) => {
  return Buffer.from(str).toString('base64');
};

export const createToken = () => {
  const uuid = randomUUID();
  return toBase64(uuid);
};

export const hashString = (str: string) => {
  return hash(str, 10);
};

export const parseToken = (tokenStr: string, err: HttpError) => {
  const splitToken = tokenStr.split('.');
  if (splitToken.length !== 2) {
    throw err;
  }

  return {
    tokenId: splitToken[0],
    token: splitToken[1],
  };
};
