import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ILocalStorage } from '../common/localStorage';

export const localStorageMiddleware =
  (localStorage: ILocalStorage): RequestHandler =>
  async (_req: Request, _res: Response, next: NextFunction) => {
    localStorage.init(next);
  };
