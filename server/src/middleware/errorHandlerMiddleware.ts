import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';
import { MulterError } from 'multer';
import { badRequestError } from '../common/utils';

export const errorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const httpError = transformError(err);
  console.error('handled error', httpError);
  const { headers, ...errResponse } = httpError;
  delete errResponse.stack;
  if (headers) {
    Object.keys(headers).forEach((key) => res.setHeader(key, headers[key]));
  }
  res.status(httpError.statusCode).json(errResponse);
};

function transformError(err: any) {
  if (err instanceof HttpError) {
    return err;
  }

  if (err instanceof MulterError) {
    const error = badRequestError(err.message);
    error.stack = err.stack;
    return error;
  }

  if (err instanceof Error) {
    return createHttpError(500, 'Unexpected server error', {
      details: err.message,
      stack: err.stack,
    });
  }

  return createHttpError(500, 'Unexpected server error', {
    stack: err?.stack,
  });
}
