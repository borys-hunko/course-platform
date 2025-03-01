import { Transaction } from '../common/transactionRunner';
import { ICourseRepository, ICourseService } from './interfaces';
import {
  CreateCourseRequest,
  Course,
  UpdateCourseRequest,
  SearchCourseRequest,
  CoursesPageResponse,
  CourseTable,
} from './types';
import { inject, injectable } from 'inversify';
import {
  badRequestError,
  getTotalPagesCount,
  notFoundError,
} from '../common/utils';
import { ITagService } from './tag';
import { CONTAINER_IDS } from '../common/consts';
import { ILocalStorage } from '../common/localStorage';
import IUserService from '../user/IUserService';
import { ILogger } from '../common/logger';

@injectable()
export class CourseService implements ICourseService {
  constructor(
    @inject(CONTAINER_IDS.COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    @inject(CONTAINER_IDS.TAG_SERVICE)
    private readonly tagService: ITagService,
    @inject(CONTAINER_IDS.USER_SERVICE)
    private readonly userService: IUserService,
    @inject(CONTAINER_IDS.LOCAL_STORAGE)
    private readonly localStorage: ILocalStorage,
    @inject(CONTAINER_IDS.LOGGER) private readonly logger: ILogger,
  ) {}

  async create(createRequest: CreateCourseRequest): Promise<Course> {
    const existingCourse = await this.courseRepository.findByName(
      createRequest.name,
    );

    if (existingCourse) {
      throw badRequestError('Course already exists');
    }

    const { tags, ...course } = createRequest;
    const userId = this.localStorage.getOrThrow('userId');
    const createdCourse = await this.courseRepository.create(userId, course);

    const createdTags = await this.tagService.assignTags(
      createdCourse.id,
      tags,
    );
    const user = await this.userService.getMe();

    return {
      id: createdCourse.id,
      name: createdCourse.name,
      description: createdCourse.description,
      isDraft: createdCourse.isDraft,
      tags: createdTags,
      author: {
        id: userId,
        name: user.name,
        login: user.login,
      },
    };
  }

  async update(
    id: number,
    updateRequest: UpdateCourseRequest,
  ): Promise<Course> {
    const { tags, ...courseChanges } = updateRequest;
    if (Object.keys(courseChanges).length) {
      const updateResult = await this.courseRepository.update(
        id,
        courseChanges,
      );
      if (!updateResult) {
        throw notFoundError('Course not found');
      }
    }

    if (tags) {
      await this.tagService.updateTags(id, tags);
    }

    return this.getById(id);
  }

  async getById(id: number): Promise<Course> {
    const course = await this.courseRepository.getById(id);

    if (!course) {
      throw notFoundError('Course not found');
    }

    return course;
  }

  async getByIdShallow(
    id: number,
  ): Promise<Pick<CourseTable, 'id' | 'authorId'>> {
    const course = await this.courseRepository.getByIdShallow(id);

    if (!course) {
      throw notFoundError('Course not found');
    }

    return course;
  }

  async search(search: SearchCourseRequest): Promise<CoursesPageResponse> {
    const { itemsPerPage, page } = search;
    const count = await this.courseRepository.getRowsCount(search);
    if (count < itemsPerPage * (page - 1)) {
      throw badRequestError("Page doesn't exist");
    }

    const found = await this.courseRepository.search(search);

    const totalPagesCount = getTotalPagesCount(itemsPerPage, count);
    return {
      items: found,
      itemsPerPage,
      page,
      totalPages: totalPagesCount,
    };
  }

  createTransactionalInstance(trx: Transaction): ICourseService {
    return new CourseService(
      this.courseRepository.createTransactionalInstance(trx),
      this.tagService.createTransactionalInstance(trx),
      this.userService.createTransactionalInstance(trx),
      this.localStorage,
      this.logger,
    );
  }
}
