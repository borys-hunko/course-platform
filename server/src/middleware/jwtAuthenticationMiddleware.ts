import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { IAuthService } from '../auth/IAuthService';
import IConfigService from '../common/config/IConfigService';
import { AUTH_SCHEME, CONTAINER_IDS } from '../common/consts';
import { ILogger } from '../common/logger';
import { Middleware } from '../common/types';
import { authenticationError } from '../common/utils';

@injectable()
export class JwtAuthenticationMiddleaware implements Middleware {
  constructor(
    @inject(CONTAINER_IDS.AUTH_SERVICE) private authService: IAuthService,
    @inject(CONTAINER_IDS.CONFIG_SERVICE) private configServie: IConfigService,
    @inject(CONTAINER_IDS.LOGGER) private logger: ILogger,
  ) {}

  use = async (req: Request, _res: Response, next: NextFunction) => {
    const authToken = req.headers['authentication'];
    this.logger.debug('headers', req.headers);
    if (typeof authToken !== 'string') {
      throw authenticationError('Token was not provided', {
        authScheme: AUTH_SCHEME,
        resource: await this.configServie.get('APP_NAME'),
      });
    }
    await this.authService.authenticateJwt(authToken);
    next();
  };
}
