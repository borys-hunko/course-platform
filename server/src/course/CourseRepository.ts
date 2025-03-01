import { Transaction } from '../common/transactionRunner';
import { ICourseRepository } from './interfaces';
import {
  Course,
  CourseTable,
  CreateCourseRequest,
  SearchCourseRequest,
  UpdateCourseRequest,
} from './types';
import { inject } from 'inversify';
import { CONTAINER_IDS } from '../common/consts';
import { Datasource } from '../datasource';
import {
  COURSE_TO_TAG_TABLE_NAME,
  CourseToTagTable,
  Tag,
  TAG_TABLE_NAME,
} from './tag';
import { USER_TABLE_NAME } from '../user/consts';
import { ILogger } from '../common/logger';
import { splitArrays } from '../common/utils';
import { Knex } from 'knex';

const COURSE_TABLE_NAME = 'course';

export class CourseRepository implements ICourseRepository {
  constructor(
    @inject(CONTAINER_IDS.DATA_SOURCE) private readonly datasource: Datasource,
    @inject(CONTAINER_IDS.LOGGER) private readonly logger: ILogger,
  ) {}

  async create(
    userId: number,
    createRequest: Omit<CreateCourseRequest, 'tags'>,
  ): Promise<CourseTable> {
    const result = await this.datasource<CourseTable>(COURSE_TABLE_NAME).insert(
      { ...createRequest, authorId: userId },
      '*',
    );

    return result[0];
  }

  async update(
    id: number,
    updateRequest: Omit<UpdateCourseRequest, 'tags'>,
  ): Promise<CourseTable | undefined> {
    const updatedCourses = await this.datasource<CourseTable>(COURSE_TABLE_NAME)
      .update(updateRequest, '*')
      .where('id', id);
    return updatedCourses[0];
  }

  async search({
    tags,
    page,
    itemsPerPage,
  }: SearchCourseRequest): Promise<Course[]> {
    const query = this.getCourses()
      .modify(this.selectCourseFields)
      .modify(this.findCourseIdsByTags, page, itemsPerPage, tags)
      .orderBy(['c.id', 't.id']);
    this.logger.debug('search query', { query: query.toSQL().sql });
    const result: CourseRow[] = await query;

    return splitArrays(result, (row) => row.course_id).map((rows) =>
      this.mapRowToEntity(rows),
    );
  }

  async getById(id: number): Promise<Course | undefined> {
    const result: CourseRow[] = await this.getCourses()
      .modify(this.selectCourseFields)
      .where('c.id', id);

    this.logger.debug(`Getting courses from ${id}`, {
      result: JSON.stringify(result),
    });

    if (result.length === 0) {
      return undefined;
    }

    return this.mapRowToEntity(result);
  }

  getByIdShallow(
    id: number,
  ): Promise<Pick<CourseTable, 'id' | 'authorId'> | undefined> {
    return this.datasource<CourseTable>(COURSE_TABLE_NAME)
      .select('id', 'authorId')
      .where('id', id)
      .first();
  }

  async findByName(name: string): Promise<CourseTable | undefined> {
    return this.datasource<CourseTable>(COURSE_TABLE_NAME)
      .select('*')
      .where('name', name)
      .first();
  }

  async getRowsCount({
    tags,
    page,
    itemsPerPage,
  }: SearchCourseRequest): Promise<number> {
    const res = await this.getCourses()
      .countDistinct('c.id')
      .modify(this.findCourseIdsByTags, page, itemsPerPage, tags, false)
      .first();

    this.logger.debug('getRowsCount', { count: JSON.stringify(res) });
    if (!res) {
      throw Error('Could not find count');
    }

    return Number(res.count);
  }

  createTransactionalInstance(trx: Transaction): ICourseRepository {
    return new CourseRepository(trx, this.logger);
  }

  private getCourses() {
    return this.datasource(`${COURSE_TABLE_NAME} as c`)
      .join(`${COURSE_TO_TAG_TABLE_NAME} as ctt`, 'c.id', 'ctt.courseId')
      .join(`${TAG_TABLE_NAME} as t`, 't.id', 'ctt.tagId')
      .join(`${USER_TABLE_NAME} as u`, 'u.id', 'c.authorId');
  }

  private selectCourseFields(q: Knex.QueryBuilder) {
    return q.select(
      'c.id as course_id',
      'c.name as course_name',
      'c.description as course_description',
      'c.imageUrl as course_imageUrl',
      'c.isDraft as course_isDraft',
      't.id as tag_id',
      't.name as tag_name',
      'u.id as user_id',
      'u.name as user_name',
      'u.login as user_login',
    );
  }

  private findCourseIdsByTags = (
    q: Knex.QueryBuilder,
    page: number,
    itemsPerPage: number,
    tags: number[] = [],
    withPagination: boolean = true,
  ) => {
    const nestedQuery = this.datasource<CourseToTagTable>(
      COURSE_TO_TAG_TABLE_NAME,
    ).distinct('courseId');

    if (tags?.length) {
      nestedQuery.whereIn('tagId', tags);
    }
    if (withPagination) {
      nestedQuery.limit(itemsPerPage).offset((page - 1) * itemsPerPage);
    }

    q.whereIn('c.id', nestedQuery);
  };

  private mapRowToEntity(rows: CourseRow[]): Course {
    const tags: Tag[] = rows.map((cr) => ({
      id: cr.tag_id,
      name: cr.tag_name,
    }));

    const firstRow = rows[0];

    return {
      id: firstRow.course_id,
      name: firstRow.course_name,
      description: firstRow.course_description,
      isDraft: firstRow.course_isDraft,
      imageUrl: firstRow.course_imageUrl,
      author: {
        id: firstRow.user_id,
        name: firstRow.user_name,
        login: firstRow.user_login,
      },
      tags,
    };
  }
}

interface CourseRow {
  course_id: number;
  course_name: string;
  course_description: string;
  course_imageUrl: string | undefined;
  course_isDraft: boolean;
  tag_id: number;
  tag_name: string;
  user_id: number;
  user_name: string;
  user_login: string;
}
