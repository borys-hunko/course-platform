import createHttpError from 'http-errors';

const createError = (code: number, errorName: string, details?: string) => {
  const error = createHttpError(code, errorName);
  error['details'] = details;
  return error;
};

export const notFoundError = (details: string) => {
  return createError(404, 'Not found', details);
};

export const badRequestError = (details: string) => {
  return createError(400, 'Bad Request', details);
};

export const authenticationError = (
  details: string,
  params?: {
    authScheme?: string;
    resource?: string;
    error?: string;
  },
) => {
  const error = createError(401, 'Unauthorized', details);
  if (params) {
    error.headers = {
      'WWW-Authenticate': `${params.authScheme} realme=${params.resource} error=${params.error} error_description=${details}`,
    };
  }
  return error;
};
