import { ContainerModule } from 'inversify';
import { Middleware } from '../common/types';
import { CONTAINER_IDS } from '../common/consts';
import { JwtAuthenticationMiddleware } from './jwtAuthenticationMiddleware';
import { CorrelationIdMiddleware } from './correlationIdMiddleware';
import { CourseEditAuthorizationMiddleware } from './courseEditAuthorizationMiddleware';

export const middlewareModule = new ContainerModule((bind) => {
  bind<Middleware>(CONTAINER_IDS.JWT_AUTH_MIDDLEWARE)
    .to(JwtAuthenticationMiddleware)
    .inSingletonScope();
  bind<Middleware>(CONTAINER_IDS.CORRELATION_ID_MIDDLEWARE)
    .to(CorrelationIdMiddleware)
    .inSingletonScope();
  bind<Middleware>(CONTAINER_IDS.COURSE_EDIT_AUTHORIZATION_MIDDLEWARE)
    .to(CourseEditAuthorizationMiddleware)
    .inSingletonScope();
});
