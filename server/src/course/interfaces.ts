import {
  Course,
  CoursesPageResponse,
  CourseTable,
  CreateCourseRequest,
  SearchCourseRequest,
  UpdateCourseRequest,
} from './types';
import { ITransactional } from '../common/transactionRunner';

export interface ICourseService extends ITransactional<ICourseService> {
  create(createRequest: CreateCourseRequest): Promise<Course>;
  update(id: number, updateRequest: UpdateCourseRequest): Promise<Course>;
  getById(id: number): Promise<Course>;
  getByIdShallow(id: number): Promise<Pick<CourseTable, 'id' | 'authorId'>>;
  search(getByTagReq: SearchCourseRequest): Promise<CoursesPageResponse>;
}

export interface ICourseRepository extends ITransactional<ICourseRepository> {
  create(
    userId: number,
    createRequest: Omit<CreateCourseRequest, 'tags'>,
  ): Promise<CourseTable>;

  update(
    id: number,
    updateRequest: Omit<UpdateCourseRequest, 'tags'>,
  ): Promise<CourseTable | undefined>;
  search(getByTagReq: SearchCourseRequest): Promise<Course[]>;
  getById(id: number): Promise<Course | undefined>;
  getByIdShallow(
    id: number,
  ): Promise<Pick<CourseTable, 'id' | 'authorId'> | undefined>;
  findByName(name: string): Promise<CourseTable | undefined>;
  getRowsCount(search: SearchCourseRequest): Promise<number>;
}
