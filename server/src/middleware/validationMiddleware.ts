import { NextFunction, Request, Response } from 'express';
import createError from 'http-errors';
import { z } from 'zod';

export const schemaValidator = (schemas: {
  body?: z.AnyZodObject;
  header?: z.AnyZodObject;
  query?: z.AnyZodObject;
  params?: z.AnyZodObject;
}) => {
  return (req: Request, _: Response, next: NextFunction) => {
    try {
      const { body, header, query, params } = schemas;
      if (body) {
        body.parse(req.body);
      }
      if (header) {
        header.parse(req.headers);
      }
      if (query) {
        query.parse(req.query);
      }
      if (params) {
        params.parse(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = extractDetailFromError(error);
        const httpError = createError(400, 'Ivalid request', {
          details: errorMessages,
        });
        next(httpError);
      }
    }
  };
};

function extractDetailFromError(error: z.ZodError<any>) {
  return error.errors.map((issue) => ({
    message: `${issue.path.join('.')} is ${issue.message}`,
  }));
}
