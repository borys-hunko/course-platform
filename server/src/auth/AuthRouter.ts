import { RequestHandler, Router } from 'express';
import { inject, injectable } from 'inversify';
import { CONTAINER_IDS } from '../common/consts';
import { FeatureRouter } from '../common/types';
import { schemaValidator } from '../middleware/validationMiddleware';
import {
  LogInRequest,
  LogInResponse,
  RefreshTokenRequest,
  SignUpRequest,
} from './dto';
import { IAuthService } from './IAuthService';
import { logInSchema, refreshTokenSchema, signUpSchema } from './schemas';

@injectable()
export class AuthRouter implements FeatureRouter {
  constructor(
    @inject(CONTAINER_IDS.ROUTER) private router: Router,
    @inject(CONTAINER_IDS.AUTH_SERVICE) private authService: IAuthService,
  ) {}

  getRouter(): Router {
    this.router
      .post(
        '/login',
        schemaValidator({ body: logInSchema }),
        this.loginRequestHandler,
      )
      .post(
        '/signup',
        schemaValidator({ body: signUpSchema }),
        this.signUpRequestHandler,
      )
      .post(
        '/refresh-token',
        schemaValidator({ body: refreshTokenSchema }),
        this.refreshTokenRequestHandler,
      );
    return this.router;
  }

  getRouterPath(): string {
    return '/auth';
  }

  loginRequestHandler: RequestHandler<any, LogInResponse, LogInRequest> =
    async (req, res, next) => {
      const response = await this.authService.login(req.body);
      res.status(200).send(response);
      next();
    };

  signUpRequestHandler: RequestHandler<any, LogInResponse, SignUpRequest> =
    async (req, res, next) => {
      const response = await this.authService.signUp(req.body);
      res.status(201).send(response);
      next();
    };

  refreshTokenRequestHandler: RequestHandler<
    any,
    LogInResponse,
    RefreshTokenRequest
  > = async (req, res, next) => {
    const response = await this.authService.refreshJwt(req.body.refreshToken);
    res.status(200).send(response);
    next();
  };
}
