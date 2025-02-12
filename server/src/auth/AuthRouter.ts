import { RequestHandler, Router } from 'express';
import createHttpError from 'http-errors';
import { inject, injectable } from 'inversify';
import { CONTAINER_IDS } from '../common/consts';
import { ILogger } from '../common/logger';
import { ITransactionRunner } from '../common/transactionRunner';
import { FeatureRouter } from '../common/types';
import { schemaValidator } from '../middleware/validationMiddleware';
import {
  LogInRequest,
  RefreshTokenRequest,
  ResetPasswordRequest,
  SendForgotPasswordTokenRequest,
  SignUpRequest,
} from './dto';
import { IAuthService } from './IAuthService';
import {
  logInSchema,
  refreshTokenSchema,
  resetPasswordSchema,
  sendPassResetTokenSchema,
  signUpSchema,
} from './schemas';
import { setAuthCookies } from './utils';

@injectable()
export class AuthRouter implements FeatureRouter {
  constructor(
    @inject(CONTAINER_IDS.ROUTER) private router: Router,
    @inject(CONTAINER_IDS.AUTH_SERVICE) private authService: IAuthService,
    @inject(CONTAINER_IDS.TRANSACTION_RUNNER)
    private transactionRunnner: ITransactionRunner<IAuthService>,
    @inject(CONTAINER_IDS.LOGGER) private logger: ILogger,
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
      )
      .post(
        '/forgot-password',
        schemaValidator({ body: sendPassResetTokenSchema }),
        this.sendResetPasswordLink,
      )
      .post(
        '/reset-password',
        schemaValidator({ body: resetPasswordSchema }),
        this.resetPassword,
      );
    return this.router;
  }

  getRouterPath(): string {
    return '/auth';
  }

  loginRequestHandler: RequestHandler<any, void, LogInRequest> = async (
    req,
    res,
    next,
  ) => {
    const response = await this.authService.login(req.body);
    setAuthCookies(res, response);
    res.status(200).send();
    next();
  };

  signUpRequestHandler: RequestHandler<any, void, SignUpRequest> = async (
    req,
    res,
    next,
  ) => {
    const response = await this.transactionRunnner.runInsideTransaction(
      this.authService,
      (service) => service.signUp(req.body),
    );
    setAuthCookies(res, response);
    res.status(201).send();
    next();
  };

  refreshTokenRequestHandler: RequestHandler<any, void, RefreshTokenRequest> =
    async (req, res, next) => {
      const response = await this.transactionRunnner.runInsideTransaction(
        this.authService,
        (service) => service.refreshJwt(req.body.refreshToken),
      );
      setAuthCookies(res, response);
      res.status(200).send();
      next();
    };

  sendResetPasswordLink: RequestHandler<
    any,
    any,
    SendForgotPasswordTokenRequest
  > = async (req, res, next) => {
    try {
      await this.authService.sendResetToken(req.body);
      res.status(200).send({ sent: true });
      next();
    } catch (e) {
      if (e instanceof createHttpError.HttpError && e.status === 404) {
        this.logger.info(e.message);
        res.status(200).send();
        next();
        return;
      }
      next(e);
    }
  };

  resetPassword: RequestHandler<any, void, ResetPasswordRequest> = async (
    req,
    res,
    next,
  ) => {
    await this.transactionRunnner.runInsideTransaction(
      this.authService,
      (service) => service.resetPassword(req.body),
    );
    res.status(200).send();
    next();
  };
}
