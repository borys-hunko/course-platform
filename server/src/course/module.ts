import { ContainerModule } from 'inversify';
import { FeatureRouter } from '../common/types';
import { CONTAINER_IDS } from '../common/consts';
import {
  CourseRouter,
  ICourseFtsRepository,
  ICourseRepository,
  ICourseService,
} from '.';
import {
  ITagRepository,
  ITagService,
  TagRepository,
  TagRouter,
  TagService,
} from './tag';
import { CourseRepository } from './CourseRepository';
import { CourseService } from './CourseService';
import { CourseFtsRepository } from './CourseFtsRepository';

export const courseModule = new ContainerModule((bind) => {
  bind<FeatureRouter>(CONTAINER_IDS.FEATURE_ROUTER)
    .to(TagRouter)
    .inSingletonScope();
  bind<ITagRepository>(CONTAINER_IDS.TAG_REPOSITORY)
    .to(TagRepository)
    .inSingletonScope();
  bind<ITagService>(CONTAINER_IDS.TAG_SERVICE)
    .to(TagService)
    .inSingletonScope();

  bind<FeatureRouter>(CONTAINER_IDS.FEATURE_ROUTER)
    .to(CourseRouter)
    .inSingletonScope();
  bind<ICourseRepository>(CONTAINER_IDS.COURSE_REPOSITORY)
    .to(CourseRepository)
    .inSingletonScope();
  bind<ICourseService>(CONTAINER_IDS.COURSE_SERVICE)
    .to(CourseService)
    .inSingletonScope();
  bind<ICourseFtsRepository>(CONTAINER_IDS.COURSE_FTS_REPOSITORY)
    .to(CourseFtsRepository)
    .inSingletonScope();
});
