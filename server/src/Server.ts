import { json, urlencoded } from 'body-parser';
import cookieParser from 'cookie-parser';
import { Express, NextFunction, Request, Response, Router } from 'express';
import { inject, injectable, multiInject } from 'inversify';
import IConfigService from './common/config/IConfigService';
import { CONTAINER_IDS } from './common/consts';
import { ILocalStorage } from './common/localStorage';
import { FeatureRouter, Middleware } from './common/types';
import { notFoundError } from './common/utils';
import { Datasource } from './datasource';
import { errorHandler, localStorageMiddleware } from './middleware';

@injectable()
export class Server {
  constructor(
    @multiInject(CONTAINER_IDS.FEATURE_ROUTER)
    private featureRouters: FeatureRouter[],
    @inject(CONTAINER_IDS.ROUTER) private router: Router,
    @inject(CONTAINER_IDS.APP) private app: Express,
    @inject(CONTAINER_IDS.CONFIG_SERVICE) private configService: IConfigService,
    @inject(CONTAINER_IDS.DATA_SOURCE) private datasource: Datasource,
    @inject(CONTAINER_IDS.CORRELATION_ID_MIDDLEWARE)
    private correlationIdMiddleware: Middleware,
    @inject(CONTAINER_IDS.LOCAL_STORAGE)
    private localStorage: ILocalStorage,
  ) {}

  async startServer() {
    await this.setUpServer();

    const port = await this.configService.get('PORT');

    this.app.listen(port, async () => {
      console.log(`Example app listening on port ${port}`);
      await this.checkDb();
    });
  }

  private async setUpServer() {
    this.setUpRoutes();

    this.app.use(localStorageMiddleware(this.localStorage));
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(this.correlationIdMiddleware.use);
    this.app.use(this.router);
    this.app.use(errorHandler);
    this.app.use(this.handle404);
  }

  private async handle404(
    _error: unknown,
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const error = notFoundError(`route ${req.originalUrl} does not exists`);
    await errorHandler(error, req, res, next);
  }
  private setUpRoutes() {
    this.featureRouters.forEach((feature) =>
      this.router.use(feature.getRouterPath(), feature.getRouter()),
    );
  }

  private async checkDb() {
    try {
      await this.datasource.raw('select 1 + 1 as results');
      console.log('database is runnning');
    } catch (e) {
      console.error('error occured', e);
    }
  }
}
