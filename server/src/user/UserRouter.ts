import { RequestHandler, Router } from 'express';
import { inject, injectable } from 'inversify';
import { CONTAINER_IDS } from '../common/consts';
import { FeatureRouter, Middleware } from '../common/types';
import IUserService from './IUserService';
import { UserResponse } from './dto';

@injectable()
export class UserRouter implements FeatureRouter {
  constructor(
    @inject(CONTAINER_IDS.ROUTER) private router: Router,
    @inject(CONTAINER_IDS.USER_SERVICE) private userService: IUserService,
    @inject(CONTAINER_IDS.JWT_AUTH_MIDDLEWARE)
    private jwtAuthMiddleware: Middleware,
  ) {}

  getRouter(): Router {
    this.router.use(this.jwtAuthMiddleware.use);
    this.router.get('/me', this.getMe);
    return this.router;
  }

  getRouterPath(): string {
    return '/user';
  }

  getMe: RequestHandler<null, UserResponse> = async (_req, res, next) => {
    const response = await this.userService.getMe();
    res.status(200).send(response);
    next();
  };
}
