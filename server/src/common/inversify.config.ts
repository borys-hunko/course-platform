import * as awsSES from '@aws-sdk/client-ses';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { AsyncLocalStorage } from 'async_hooks';
import express, { Express, Router } from 'express';
import { Container, interfaces } from 'inversify';
import { Liquid } from 'liquidjs';
import { createTransport, Transporter } from 'nodemailer';
import SESTransport from 'nodemailer/lib/ses-transport';
import path from 'path';
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
import { IPassResetTokenRepository } from '../auth/passResetToken/IPassResetTokenRepository';
import { PassResetTokenRepository } from '../auth/passResetToken/PassResetTokenRepository';
import datasource, { Datasource } from '../datasource';
import { IUserResitory } from '../user/IUserRepository';
import IUserService from '../user/IUserService';
import { UserRepository } from '../user/UserRepository';
import { UserRouter } from '../user/UserRouter';
import { UserService } from '../user/UserService';
import ConfigService from './config/ConfigService';
import IConfigService from './config/IConfigService';
import { CONTAINER_IDS } from './consts';
import {
  ILocalStorage,
  LocalStorage,
  LocalStorageValues,
} from './localStorage';
import { ILocalStorageLogger, ILogger, Logger } from './logger';
import { LocalStorageLogger } from './logger/LocalStorageLogger';
import { IMailService, MailService } from './mail';
import { ITransactionRunner, TransactionRunner } from './transactionRunner';
import { FeatureRouter } from './types';
import { courseModule } from '../course';
import { middlewareModule } from '../middleware/module';

const container = new Container();

//commons
container.bind<Express>(CONTAINER_IDS.APP).toDynamicValue(() => express());
container
  .bind<Datasource>(CONTAINER_IDS.DATA_SOURCE)
  .toConstantValue(datasource);
container
  .bind<IConfigService>(CONTAINER_IDS.CONFIG_SERVICE)
  .to(ConfigService)
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

// mail
const createMailTransporter: interfaces.ProviderCreator<
  Transporter<SESTransport.SentMessageInfo>
> = (context: interfaces.Context) => {
  return async () => {
    const configService = context.container.get<IConfigService>(
      CONTAINER_IDS.CONFIG_SERVICE,
    );
    const ses = new awsSES.SES({
      region: await configService.get('AWS_REGION'),
      credentials: defaultProvider(),
      apiVersion: '2010-12-01',
    });

    // console.log('domainEmail', domainEmail);
    return createTransport({
      SES: { aws: awsSES, ses },
    });
  };
};
container
  .bind<
    Transporter<SESTransport.SentMessageInfo>
  >(CONTAINER_IDS.MAIL_TRANSPORTER_PROVIDER)
  .toProvider<Transporter<SESTransport.SentMessageInfo>>(createMailTransporter);
container.bind<Liquid>(CONTAINER_IDS.TEMPLATE_ENGINE).toConstantValue(
  new Liquid({
    root: path.resolve(__dirname, '../..', 'templates'),
    extname: '.liquid',
  }),
);
container
  .bind<IMailService>(CONTAINER_IDS.MAIL_SERVICE)
  .to(MailService)
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
  .bind<FeatureRouter>(CONTAINER_IDS.FEATURE_ROUTER)
  .to(UserRouter)
  .inSingletonScope();

//auth
container
  .bind<FeatureRouter>(CONTAINER_IDS.FEATURE_ROUTER)
  .to(AuthRouter)
  .inSingletonScope();
container
  .bind<IPassResetTokenService>(CONTAINER_IDS.PASS_RESET_TOKEN_SERVICE)
  .to(PassResetTokenService)
  .inSingletonScope();
container
  .bind<IPassResetTokenRepository>(CONTAINER_IDS.PASS_RESET_TOKEN_REPOSITORY)
  .to(PassResetTokenRepository)
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

container.load(courseModule);
container.load(middlewareModule);

export default container;
