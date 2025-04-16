import { Transaction } from '../common/transactionRunner';
import {
  ICourseFtsRepository,
  ICourseRepository,
  ICourseService,
} from './interfaces';
import {
  Course,
  CourseResponse,
  CoursesPageResponse,
  CourseTable,
  CreateCourseRequest,
  SearchCourseRequest,
  UpdateCourseRequest,
} from './types';
import { inject, injectable } from 'inversify';
import {
  badRequestError,
  generateBlurredDataUrl,
  getTotalPagesCount,
  isValidPage,
  notFoundError,
} from '../common/utils';
import { ITagService } from './tag';
import { CONTAINER_IDS } from '../common/consts';
import { ILocalStorage } from '../common/localStorage';
import IUserService from '../user/IUserService';
import { ILogger } from '../common/logger';
import { MulterFile } from '../common/types';
import { IImageService } from '../common/image';
import IConfigService from '../common/config/IConfigService';

@injectable()
export class CourseService implements ICourseService {
  constructor(
    @inject(CONTAINER_IDS.COURSE_REPOSITORY)
    private readonly courseRepository: ICourseRepository,
    @inject(CONTAINER_IDS.TAG_SERVICE)
    private readonly tagService: ITagService,
    @inject(CONTAINER_IDS.USER_SERVICE)
    private readonly userService: IUserService,
    @inject(CONTAINER_IDS.COURSE_FTS_REPOSITORY)
    private readonly courseFtsRepository: ICourseFtsRepository,
    @inject(CONTAINER_IDS.LOCAL_STORAGE)
    private readonly localStorage: ILocalStorage,
    @inject(CONTAINER_IDS.LOGGER) private readonly logger: ILogger,
    @inject(CONTAINER_IDS.IMAGE_SERVICE)
    private readonly imageService: IImageService,
    @inject(CONTAINER_IDS.CONFIG_SERVICE)
    private readonly configService: IConfigService,
  ) {}

  async create(createRequest: CreateCourseRequest): Promise<CourseResponse> {
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

    await this.courseFtsRepository.create(createdCourse.id);

    const user = await this.userService.getMe();

    return this.courseToResponse({
      id: createdCourse.id,
      name: createdCourse.name,
      description: createdCourse.description,
      isDraft: createdCourse.isDraft,
      tags: createdTags,
      isPictureMinified: createdCourse.isPictureMinified,
      pictureDataUrl: createdCourse.pictureDataUrl,
      author: {
        id: userId,
        name: user.name,
        login: user.login,
      },
    });
  }

  async update(
    id: number,
    updateRequest: UpdateCourseRequest,
  ): Promise<CourseResponse> {
    const { tags, ...courseChanges } = updateRequest;
    if (Object.keys(courseChanges).length) {
      const updateResult = await this.courseRepository.update(
        id,
        courseChanges,
      );

      this.checkIfUpdated(updateResult);
    }

    if (tags) {
      await this.tagService.updateTags(id, tags);
    }

    await this.courseFtsRepository.update(id);

    return this.getById(id);
  }

  async getById(id: number): Promise<CourseResponse> {
    const course = await this.getCourseById(id);

    return this.courseToResponse(course);
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
    if (isValidPage(count, itemsPerPage, page)) {
      throw badRequestError("Page doesn't exist");
    }

    const found = await this.courseRepository.search(search);

    const totalPagesCount = getTotalPagesCount(itemsPerPage, count);
    return {
      items: await this.coursesToResponse(found),
      itemsPerPage,
      page,
      totalPages: totalPagesCount,
    };
  }

  async uploadCoursePicture(
    courseId: number,
    file: MulterFile,
  ): Promise<CourseResponse> {
    const course = await this.getCourseById(courseId);

    if (course.picture) {
      await this.imageService.delete([
        `images/${course.picture}`,
        `minified/${course.picture}`,
      ]);
    }
    const prefix = `course_${courseId}`;
    const createdFileName = await this.imageService.upload(file, prefix);
    const pictureDataUrl = await generateBlurredDataUrl(file.buffer);
    this.logger.debug('dataUrlLength', {
      pictureDataUrl,
      pictureDataUrlLength: pictureDataUrl.length,
    });
    const updatedEntity = await this.courseRepository.update(courseId, {
      picture: createdFileName,
      isPictureMinified: false,
      pictureDataUrl: pictureDataUrl,
    });

    if (!updatedEntity) {
      throw new Error('Could upload image');
    }

    return await this.courseToResponse({
      ...course,
      picture: updatedEntity.picture,
      pictureDataUrl: pictureDataUrl,
    });
  }

  async confirmImageCompression(filename: string): Promise<void> {
    const id = this.getUserIdFromFilename(filename);

    const updateResult = await this.courseRepository.update(id, {
      isPictureMinified: true,
    });

    if (!updateResult) {
      throw notFoundError('FlexibleImage not found');
    }
  }

  createTransactionalInstance(trx: Transaction): ICourseService {
    return new CourseService(
      this.courseRepository.createTransactionalInstance(trx),
      this.tagService.createTransactionalInstance(trx),
      this.userService.createTransactionalInstance(trx),
      this.courseFtsRepository.createTransactionalInstance(trx),
      this.localStorage,
      this.logger,
      this.imageService,
      this.configService,
    );
  }

  private async getCourseById(id: number) {
    const course = await this.courseRepository.getById(id);

    if (!course) {
      throw notFoundError('Course not found');
    }
    return course;
  }

  private async courseToResponse(course: Course): Promise<CourseResponse> {
    const image_url = await this.configService.get('IMAGE_URL');
    const { picture, pictureDataUrl, isPictureMinified, ...data } = course;
    return {
      ...data,
      picture: {
        pictureDataUrl,
        url: picture ? `${image_url}/images/${picture}` : undefined,
        minifiedUrl: isPictureMinified
          ? `${image_url}/minified/${picture}`
          : undefined,
      },
    };
  }

  private async coursesToResponse(
    courses: Course[],
  ): Promise<CourseResponse[]> {
    const image_url = await this.configService.get('IMAGE_URL');
    return courses.map((course) => {
      const { picture, pictureDataUrl, isPictureMinified, ...data } = course;
      return {
        ...data,
        picture: {
          pictureDataUrl,
          url: picture ? `${image_url}/images/${picture}` : undefined,
          minifiedUrl: isPictureMinified
            ? `${image_url}/minified/${picture}`
            : undefined,
        },
      };
    });
  }

  private checkIfUpdated(updateResult: CourseTable | undefined) {
    if (!updateResult) {
      throw notFoundError('Course not found');
    }
  }

  private getUserIdFromFilename(filename: string): number {
    const id: string = filename.split('_')[1];
    const parsedId = Number(id);
    if (!parsedId) {
      throw badRequestError('Invalid filename. Filename has no userId');
    }
    return parsedId;
  }
}
