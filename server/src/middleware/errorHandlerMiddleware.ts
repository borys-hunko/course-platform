import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import createHttpError, { HttpError } from 'http-errors';

export const createErrorResponseHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  let httpError: HttpError;
  console.log('createErrorResponseHandler', err?.stack);

  if (err instanceof HttpError) {
    httpError = err;
  } else if (err instanceof Error) {
    httpError = createHttpError(500, 'Unexpected server error', {
      details: err.message,
    });
  } else {
    httpError = createHttpError(500, 'Unexpected server error');
  }
  Error.captureStackTrace(httpError);
  console.log('created error from:', err);
  next(httpError);
};

export const errorHandler: ErrorRequestHandler = (
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error('handled error', err);
  const { headers, ...errResponse } = err;
  delete err.stack;
  if (headers) {
    Object.keys(headers).forEach((key) => res.setHeader(key, headers[key]));
  }
  res.status(err.statusCode).json(errResponse);
};
