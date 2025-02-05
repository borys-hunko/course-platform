import { AsyncLocalStorage } from 'async_hooks';
import express, { Express, Router } from 'express';
import { Container } from 'inversify';
import { AuthRouter } from '../auth/AuthRouter';
import { AuthService } from '../auth/AuthService';
import { IAuthService } from '../auth/IAuthService';
import {
  IJwtService,
  IRefreshTokenRepository,
  JwtService,
  RefreshTokenRepository,
} from '../auth/jwt';
import {
  IPassResetTokenService,
  PassResetTokenService,
} from '../auth/passResetToken';
import datasource, { Datasource } from '../datasource';
import { JwtAuthenticationMiddleaware } from '../middleware';
import { CorrelationIdMiddleware } from '../middleware/correlationIdMiddleware';
import { IUserResitory } from '../user/IUserRepository';
import IUserService from '../user/IUserService';
import { UserRepository } from '../user/UserRepository';
import { UserRouter } from '../user/UserRouter';
import { UserService } from '../user/UserService';
import ConfigServise from './config/ConfigService';
import IConfigService from './config/IConfigService';
import { CONTAINER_IDS } from './consts';
import {
  ILocalStorage,
  LocalStorage,
  LocalStorageValues,
} from './localStorage';
import { ILocalStorageLogger, ILogger, Logger } from './logger';
import { LocalStorageLogger } from './logger/LocalStorageLogger';
import { ITransactionRunner, TransactionRunner } from './transactionRunner';
import { FeatureRouter, Middleware } from './types';

const container = new Container();

//commons
container.bind<Express>(CONTAINER_IDS.APP).toDynamicValue(() => express());
container
  .bind<Datasource>(CONTAINER_IDS.DATA_SOURCE)
  .toConstantValue(datasource);
container
  .bind<IConfigService>(CONTAINER_IDS.CONFIG_SERVICE)
  .to(ConfigServise)
  .inSingletonScope();
container
  .bind<Router>(CONTAINER_IDS.ROUTER)
  .toDynamicValue(() => Router())
  .inTransientScope();
container
  .bind<any>(CONTAINER_IDS.ASYNC_LOCAL_STORAGE_NATIVE)
  .to(AsyncLocalStorage<LocalStorageValues>)
  .inSingletonScope();
container
  .bind<ILocalStorage>(CONTAINER_IDS.LOCAL_STORAGE)
  .to(LocalStorage)
  .inSingletonScope();
container
  .bind<ITransactionRunner<any>>(CONTAINER_IDS.TRANSACTION_RUNNER)
  .to(TransactionRunner)
  .inSingletonScope();
container.bind<ILogger>(CONTAINER_IDS.LOGGER).to(Logger).inSingletonScope();
container
  .bind<ILocalStorageLogger>(CONTAINER_IDS.LOCAL_STORAGE_LOGGER)
  .to(LocalStorageLogger)
  .inSingletonScope();

//middlewares
container
  .bind<Middleware>(CONTAINER_IDS.JWT_AUTH_MIDDLEWARE)
  .to(JwtAuthenticationMiddleaware)
  .inSingletonScope();
container
  .bind<Middleware>(CONTAINER_IDS.CORRELATION_ID_MIDDLEWARE)
  .to(CorrelationIdMiddleware)
  .inSingletonScope();

//user
container
  .bind<IUserService>(CONTAINER_IDS.USER_SERVICE)
  .to(UserService)
  .inSingletonScope();
container
  .bind<IUserResitory>(CONTAINER_IDS.USER_REPOSITORY)
  .to(UserRepository)
  .inSingletonScope();
container
  .bind<FeatureRouter>(CONTAINER_IDS.APP_ROUTER)
  .to(UserRouter)
  .inSingletonScope();

//auth
container
  .bind<FeatureRouter>(CONTAINER_IDS.APP_ROUTER)
  .to(AuthRouter)
  .inSingletonScope();
container
  .bind<IPassResetTokenService>(CONTAINER_IDS.PASS_RESET_TOKEN_SERVICE)
  .to(PassResetTokenService)
  .inSingletonScope();
container
  .bind<IRefreshTokenRepository>(CONTAINER_IDS.REFRESH_TOKEN_REPOSITORY)
  .to(RefreshTokenRepository)
  .inSingletonScope();
container
  .bind<IJwtService>(CONTAINER_IDS.JWT_SERVICE)
  .to(JwtService)
  .inSingletonScope();
container.bind<IAuthService>(CONTAINER_IDS.AUTH_SERVICE).to(AuthService);

export default container;
