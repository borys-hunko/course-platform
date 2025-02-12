import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { IAuthService } from '../auth/IAuthService';
import { setAuthCookies } from '../auth/utils';
import IConfigService from '../common/config/IConfigService';
import { AUTH_SCHEME, CONTAINER_IDS, COOKIES } from '../common/consts';
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

  use = async (req: Request, res: Response, next: NextFunction) => {
    const authToken = req.cookies[COOKIES.ACCESS_TOKEN];
    if (typeof authToken !== 'string') {
      throw authenticationError('Token was not provided', {
        authScheme: AUTH_SCHEME,
        resource: await this.configServie.get('APP_NAME'),
      });
    }

    const error = await this.authService.authenticateJwt(authToken);
    const refreshToken = req.cookies[COOKIES.REFRESH_TOKEN];
    if (error && refreshToken && typeof refreshToken === 'string') {
      await this.refreshJwt(refreshToken, res);
    }
    next();
  };
  private refreshJwt = async (
    refreshToken: string,
    res: Response<any, Record<string, any>>,
  ) => {
    const tokens = await this.authService.refreshJwt(refreshToken);
    setAuthCookies(res, tokens);
    await this.authService.authenticateJwt(tokens.jwt.token);
  };
}
