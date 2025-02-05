import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { CONTAINER_IDS } from '../common/consts';
import { ILocalStorage } from '../common/localStorage';
import { Middleware } from '../common/types';

@injectable()
export class CorrelationIdMiddleware implements Middleware {
  constructor(
    @inject(CONTAINER_IDS.LOCAL_STORAGE) private localStorage: ILocalStorage,
  ) {}

  use = async (req: Request, _res: Response, next: NextFunction) => {
    const correlationId = req.headers['x-correlation-id'] || randomUUID();
    this.localStorage.set('correlationId', correlationId.toString());
    next();
  };
}
