import {
  Course,
  CourseResponse,
  CoursesPageResponse,
  CourseTable,
  CreateCourseRequest,
  SearchCourseRequest,
  UpdateCourseRequest,
} from './types';
import { ITransactional } from '../common/transactionRunner';
import { AtLeastOne, MulterFile } from '../common/types';

export interface ICourseService extends ITransactional<ICourseService> {
  create(createRequest: CreateCourseRequest): Promise<CourseResponse>;

  update(
    id: number,
    updateRequest: UpdateCourseRequest,
  ): Promise<CourseResponse>;

  getById(id: number): Promise<CourseResponse>;
  getByIdShallow(id: number): Promise<Pick<CourseTable, 'id' | 'authorId'>>;
  search(getByTagReq: SearchCourseRequest): Promise<CoursesPageResponse>;

  uploadCoursePicture(
    courseId: number,
    file: MulterFile,
  ): Promise<CourseResponse>;
}

export interface ICourseRepository extends ITransactional<ICourseRepository> {
  create(
    userId: number,
    createRequest: Omit<CreateCourseRequest, 'tags'>,
  ): Promise<CourseTable>;

  update(
    id: number,
    updateRequest: Omit<AtLeastOne<CourseTable>, 'id'>,
  ): Promise<CourseTable | undefined>;
  search(getByTagReq: SearchCourseRequest): Promise<Course[]>;
  getById(id: number): Promise<Course | undefined>;
  getByIdShallow(
    id: number,
  ): Promise<Pick<CourseTable, 'id' | 'authorId'> | undefined>;
  findByName(name: string): Promise<CourseTable | undefined>;
  getRowsCount(search: SearchCourseRequest): Promise<number>;
}

export interface ICourseFtsRepository
  extends ITransactional<ICourseFtsRepository> {
  create(id: number): Promise<void>;
  update(id: number): Promise<void>;
}
