import { inject, injectable } from 'inversify';
import { Middleware } from '../common/types';
import { RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { forbiddenError, internalError } from '../common/utils';
import { ICourseService } from '../course';
import { CONTAINER_IDS } from '../common/consts';
import { ILocalStorage } from '../common/localStorage';
import { ILogger } from '../common/logger';

@injectable()
export class CourseEditAuthorizationMiddleware implements Middleware {
  constructor(
    @inject(CONTAINER_IDS.COURSE_SERVICE)
    private readonly courseService: ICourseService,
    @inject(CONTAINER_IDS.LOCAL_STORAGE)
    private readonly localStorage: ILocalStorage,
    @inject(CONTAINER_IDS.LOGGER) private readonly logger: ILogger,
  ) {}

  use: RequestHandler<ParamsDictionary, any, any, ParsedQs> = async (
    req,
    _res,
    next,
  ) => {
    const id = Number(req.params.courseId);

    this.logger.debug('parameters', { params: req.params });

    if (!id) {
      next(internalError('Course id is required'));
      return;
    }

    const userId = this.localStorage.getOrThrow('userId');

    const course = await this.courseService.getByIdShallow(Number(id));
    this.logger.debug('authore ids', { userId, course });
    if (userId != course.authorId) {
      next(forbiddenError('You are not authorized to edit this course'));
      return;
    }

    next();
  };
}
