import { ITransactional } from '../../common/transactionRunner';
import { CourseToTagTable, Tag, TagsSearchRequest } from './type';

export interface ITagService extends ITransactional<ITagService> {
  assignTags(courseId: number, tags: string[]): Promise<Tag[]>;
  updateTags(courseId: number, tags: string[]): Promise<Tag[]>;
  getPopularTags(num: number): Promise<Tag[]>;
  search(searchRequest: TagsSearchRequest): Promise<Tag[]>;
}

export interface ITagRepository extends ITransactional<ITagRepository> {
  upsertTags(tags: string[]): Promise<Tag[]>;
  createTagsForCourse(
    courseId: number,
    tags: Tag[],
  ): Promise<CourseToTagTable[]>;
  deleteTagsForCourse(courseId: number): Promise<number>;
  getPopular(num: number): Promise<Tag[]>;
  search(searchRequest: TagsSearchRequest): Promise<Tag[]>;
}
