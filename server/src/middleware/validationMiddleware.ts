import { NextFunction, Response } from 'express';
import createError from 'http-errors';
import { z } from 'zod';

type ValidationObject = z.AnyZodObject | z.ZodEffects<any>;
export const schemaValidator = (schemas: {
  body?: ValidationObject;
  header?: ValidationObject;
  query?: ValidationObject;
  params?: ValidationObject;
  cookies?: ValidationObject;
}) => {
  return (req: any, _: Response, next: NextFunction) => {
    try {
      const { body, header, query, params, cookies } = schemas;

      req.validated = {
        body: req.body,
        headers: req.headers,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      };

      if (body) {
        req.validated.body = body.parse(req.body);
      }
      if (header) {
        req.validated.headers = header.parse(req.headers);
      }
      if (query) {
        req.validated.query = query.parse(req.query);
      }
      if (params) {
        req.validated.params = req.params = params.parse(req.params);
      }
      if (cookies) {
        req.validated.cookies = cookies.parse(req.cookies);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = extractDetailFromError(error);
        const httpError = createError<400>(400, 'Invalid request', {
          details: errorMessages,
        });
        next(httpError);
        return;
      }
      next(error);
    }
  };
};

function extractDetailFromError(error: z.ZodError<any>) {
  return error.errors.map((issue) => ({
    message: `${issue.path.join('.')} is ${issue.message}`,
  }));
}
