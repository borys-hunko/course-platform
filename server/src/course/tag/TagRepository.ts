import { Transaction } from '../../common/transactionRunner';
import { ITagRepository } from './iterfaces';
import { CourseToTagTable, Tag, TagsSearchRequest } from './type';
import { inject, injectable } from 'inversify';
import { Datasource } from '../../datasource';
import { COURSE_TO_TAG_TABLE_NAME, TAG_TABLE_NAME } from './consts';
import { CONTAINER_IDS } from '../../common/consts';
import { ILogger } from '../../common/logger';

@injectable()
export class TagRepository implements ITagRepository {
  constructor(
    @inject(CONTAINER_IDS.DATA_SOURCE) private readonly datasource: Datasource,
    @inject(CONTAINER_IDS.LOGGER) private readonly logger: ILogger,
  ) {}

  async upsertTags(tags: string[]): Promise<Tag[]> {
    const insertData: Pick<Tag, 'name'>[] = tags.map((tag) => ({
      name: tag,
    }));
    const res = await this.datasource<Tag>(TAG_TABLE_NAME)
      .insert(insertData, '*')
      .onConflict(['name'])
      .merge();

    return res;
  }

  async createTagsForCourse(
    courseId: number,
    tags: Tag[],
  ): Promise<CourseToTagTable[]> {
    const insertData: CourseToTagTable[] = tags.map((tag) => ({
      courseId,
      tagId: tag.id,
    }));

    const res = await this.datasource<CourseToTagTable>(
      COURSE_TO_TAG_TABLE_NAME,
    ).insert(insertData, '*');

    return res;
  }

  async deleteTagsForCourse(courseId: number): Promise<number> {
    const deletedRowNum = await this.datasource<CourseToTagTable>(
      COURSE_TO_TAG_TABLE_NAME,
    )
      .delete()
      .where('courseId', courseId);

    return deletedRowNum;
  }

  getPopular(_num: number): Promise<Tag[]> {
    throw new Error('Method not implemented.');
  }

  async search({ q, quantity }: TagsSearchRequest): Promise<Tag[]> {
    const tagsQuery = this.datasource<Tag>(TAG_TABLE_NAME).select('*');
    if (q) {
      tagsQuery.whereLike('name', `${q}%`);
    }
    tagsQuery.limit(quantity);

    return tagsQuery;
  }

  createTransactionalInstance(trx: Transaction): ITagRepository {
    return new TagRepository(trx, this.logger);
  }
}
