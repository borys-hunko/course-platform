import { hash } from 'bcrypt';
import { randomUUID } from 'crypto';
import { HttpError } from 'http-errors';
import sharp from 'sharp';

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

export const splitArrays = <T>(
  arr: T[],
  getKey: (val: T) => string | number | symbol,
): T[][] => {
  const mapped = arr.reduce(
    (acc, curr) => ({
      ...acc,
      [getKey(curr)]: [...(acc[getKey(curr)] || []), curr],
    }),
    {} as Record<string | number | symbol, T[]>,
  );
  return Object.values(mapped);
};

export const getTotalPagesCount = (
  itemsPerPage: number,
  totalCount: number,
) => {
  const pages = totalCount / itemsPerPage;
  if (Number.isInteger(pages)) {
    return pages;
  }
  return Math.floor(pages) + 1;
};

export function isValidPage(count: number, itemsPerPage: number, page: number) {
  return count < itemsPerPage * (page - 1);
}

export const generateBlurredDataUrl = async (buffer: Buffer) => {
  const resizedBuffer = await sharp(buffer)
    .resize(5, 5)
    .webp({ quality: 10 })
    .toBuffer();

  return `data:image/webp;base64,${resizedBuffer.toString('base64')}`;
};
