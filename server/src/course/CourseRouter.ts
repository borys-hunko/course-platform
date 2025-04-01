import { RequestHandler, Router } from 'express';
import { FeatureRouter, Middleware, ValidatedRequest } from '../common/types';
import { CONTAINER_IDS } from '../common/consts';
import { inject, injectable } from 'inversify';
import { ICourseService } from './interfaces';
import { ITransactionRunner } from '../common/transactionRunner';
import { multipartFileUpload, schemaValidator } from '../middleware';
import {
  createCourseSchema,
  getCourseByIdSchema,
  searchCoursesSchema,
  updateCourseSchema,
  uploadPhotoSchema,
} from './schemas';
import {
  CourseResponse,
  CoursesPageResponse,
  CreateCourseRequest,
  GetCourseByIdRequest,
  SearchCourseRequest,
  UpdateCourseRequest,
} from './types';
import { ParamsDictionary } from 'express-serve-static-core';
import { isArray } from 'lodash';

@injectable()
export class CourseRouter implements FeatureRouter {
  constructor(
    @inject(CONTAINER_IDS.ROUTER) private router: Router,
    @inject(CONTAINER_IDS.JWT_AUTH_MIDDLEWARE)
    private jwtAuthMiddleware: Middleware,
    @inject(CONTAINER_IDS.COURSE_SERVICE)
    private courseService: ICourseService,
    @inject(CONTAINER_IDS.TRANSACTION_RUNNER)
    private transactionRunner: ITransactionRunner<ICourseService>,
    @inject(CONTAINER_IDS.COURSE_EDIT_AUTHORIZATION_MIDDLEWARE)
    private courseEditAuthMiddleware: Middleware,
  ) {}

  getRouter(): Router {
    this.router
      .post(
        '/',
        schemaValidator({ body: createCourseSchema }),
        this.jwtAuthMiddleware.use,
        this.createCourse,
      )
      .get(
        '/:courseId',
        schemaValidator({ params: getCourseByIdSchema }),
        this.getCourseById,
      )
      .get(
        '/',
        schemaValidator({ query: searchCoursesSchema }),
        this.searchCourse,
      )
      .patch(
        '/:courseId',
        schemaValidator({
          params: updateCourseSchema.params,
          body: updateCourseSchema.body,
        }),
        this.jwtAuthMiddleware.use,
        this.courseEditAuthMiddleware.use,
        this.updateCourse,
      )
      .put(
        '/:courseId/picture',
        schemaValidator({
          params: uploadPhotoSchema.params,
          header: uploadPhotoSchema.headers,
        }),
        this.jwtAuthMiddleware.use,
        this.courseEditAuthMiddleware.use,
        multipartFileUpload({
          filesNumber: 1,
          fieldName: 'course_picture',
          allowedTypes: ['png', 'jpeg', 'jpg', 'webp'],
        }),
        this.uploadCourseImage,
      );
    return this.router;
  }

  getRouterPath(): string {
    return '/course';
  }

  createCourse: RequestHandler<unknown, CourseResponse, CreateCourseRequest> =
    async (req, res, next) => {
      const response = await this.transactionRunner.runInsideTransaction(
        this.courseService,
        (service) => service.create(req.body),
      );
      res.status(201).json(response);
      next();
    };

  getCourseById: RequestHandler<GetCourseByIdRequest, CourseResponse> = async (
    req,
    res,
    next,
  ) => {
    const id = Number(req.params.courseId);
    const response = await this.courseService.getById(id);
    res.status(200).json(response);
    next();
  };

  searchCourse: RequestHandler<unknown, CoursesPageResponse> = async (
    req,
    res,
    next,
  ) => {
    const validatedReq = req as any as ValidatedRequest<
      any,
      any,
      SearchCourseRequest
    >;
    const response = await this.courseService.search(
      validatedReq.validated.query,
    );
    res.status(200).json(response);
    next();
  };

  updateCourse: RequestHandler<
    ParamsDictionary,
    CourseResponse,
    UpdateCourseRequest
  > = async (req, res, next) => {
    const courseId = Number(req.params.courseId);
    const result = await this.courseService.update(courseId, req.body);
    res.status(200).json(result);
    next();
  };

  uploadCourseImage: RequestHandler<ParamsDictionary, CourseResponse> = async (
    req,
    res,
    next,
  ) => {
    const files = req.files;
    if (!isArray(files) || files.length !== 1) {
      throw new Error('Invalid file format'); // this should not happen
    }
    const file = files[0];
    const resp = await this.courseService.uploadCoursePicture(
      Number(req.params.courseId),
      file,
    );
    res.status(200).json(resp);
    next();
  };
}
