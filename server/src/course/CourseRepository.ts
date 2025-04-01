import { Transaction } from '../common/transactionRunner';
import { ICourseRepository } from './interfaces';
import {
  Course,
  CourseTable,
  CreateCourseRequest,
  SearchCourseRequest,
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
import { COURSE_FTS_TABLE_NAME } from './CourseFtsRepository';
import { AtLeastOne } from '../common/types';

export const COURSE_TABLE_NAME = 'course';
const TAG_FILTER_CTE = 'tagFilter';
const FTS_FILTER_CTE = 'ftsFilter';

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
    updateRequest: Omit<AtLeastOne<CourseTable>, 'tags'>,
  ): Promise<CourseTable | undefined> {
    const updatedCourses = await this.datasource<CourseTable>(COURSE_TABLE_NAME)
      .update(updateRequest, '*')
      .where('id', id);
    return updatedCourses[0];
  }

  async getById(id: number): Promise<Course | undefined> {
    const result: CourseRow[] = await this.getCourses()
      .modify(this.selectCourseFields)
      .where('c.id', id);

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

  async getRowsCount(params: SearchCourseRequest): Promise<number> {
    const res = await this.getCourses()
      .countDistinct('c.id')
      .modify(this.withTags, params)
      .modify(this.withFts, params)
      .modify(this.filterTags, params)
      .modify(this.filterFts, params)
      .first();

    this.logger.debug('getRowsCount', { count: JSON.stringify(res) });
    if (!res) {
      throw Error('Could not find count');
    }

    return Number(res.count);
  }

  async search(params: SearchCourseRequest): Promise<Course[]> {
    const query = this.getCourses()
      .modify(this.selectCourseFields, params)
      .modify(this.withTags, params, true)
      .modify(this.withFts, params, true)
      .modify(this.filterTags, params)
      .modify(this.filterFts, params)
      .modify(this.orderCourses, params);

    this.logger.debug('search query', { query: query.toSQL().sql });

    const result: CourseRow[] = await query;

    return splitArrays(result, (row) => row.course_id).map((rows) =>
      this.mapRowToEntity(rows),
    );
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

  private selectCourseFields(
    q: Knex.QueryBuilder,
    params?: SearchCourseRequest,
  ) {
    const rows = [
      'c.id as course_id',
      'c.name as course_name',
      'c.description as course_description',
      'c.picture as course_picture',
      'c.isDraft as course_isDraft',
      'c.pictureDataUrl as course_pictureDataUrl',
      'c.isPictureMinified as course_isPictureMinified',
      't.id as tag_id',
      't.name as tag_name',
      'u.id as user_id',
      'u.name as user_name',
      'u.login as user_login',
    ];

    if (params?.q) {
      rows.push('fts.rank as rank', 'fts.similarity as similarity');
    }

    return q.select(...rows);
  }

  private withTags = (
    q: Knex.QueryBuilder,
    { tags, q: search, page, itemsPerPage }: SearchCourseRequest,
    withPagination?: boolean,
  ) => {
    if (!tags) {
      return q;
    }

    const tagFilterQuery = this.datasource<CourseToTagTable>(
      COURSE_TO_TAG_TABLE_NAME,
    )
      .distinct('courseId')
      .whereIn('tagId', tags);

    if (!search && withPagination) {
      tagFilterQuery
        .offset(this.getOffset(page, itemsPerPage))
        .limit(itemsPerPage);
    }

    q.with(TAG_FILTER_CTE, tagFilterQuery);

    return q;
  };

  private withFts = (
    q: Knex.QueryBuilder,
    { tags, q: search, page, itemsPerPage }: SearchCourseRequest,
    withPagination?: boolean,
  ) => {
    this.logger.debug('search', { search, tags });
    if (!search) {
      return q;
    }

    const ftsQuery = this.datasource(`${COURSE_FTS_TABLE_NAME} as fts`).select(
      'fts.courseId',
      this.datasource.raw(
        `ts_rank(fts.fulltext, to_tsquery('english', ?)) as rank`,
        [search],
      ),
      this.datasource.raw(`similarity(c.name, :search) as similarity`, {
        search,
      }),
    );

    if (tags?.length) {
      ftsQuery.join(`${TAG_FILTER_CTE} as tf`, 'tf.courseId', 'fts.courseId');
    }
    ftsQuery.join(`${COURSE_TABLE_NAME} as c`, 'c.id', 'fts.courseId');
    ftsQuery.whereRaw(
      `fts.fulltext @@ to_tsquery('english', :search) OR similarity(c.name, :search) > 0`,
      { search },
    );

    if (withPagination) {
      ftsQuery
        .orderByRaw('rank DESC, similarity DESC, fts."courseId"')
        .limit(itemsPerPage)
        .offset(this.getOffset(page, itemsPerPage));
    }

    q.with(FTS_FILTER_CTE, ftsQuery);
  };

  private filterTags(q: Knex.QueryBuilder, params: SearchCourseRequest) {
    if (!params.q && params.tags?.length) {
      q.join(`${TAG_FILTER_CTE} as tf`, 'tf.courseId', 'c.id');
    }
  }

  private filterFts(q: Knex.QueryBuilder, params: SearchCourseRequest) {
    if (params.q) {
      q.join(`${FTS_FILTER_CTE} as fts`, 'fts.courseId', 'c.id');
    }
  }

  private orderCourses(q: Knex.QueryBuilder, params: SearchCourseRequest) {
    const order: any[] = [{ column: 'c.id' }, { column: 't.id' }];

    if (params.q) {
      order.unshift(
        {
          column: 'rank',
          order: 'desc',
        },
        {
          column: 'similarity',
          order: 'desc',
        },
      );
    }

    q.orderBy(order);
  }

  private getOffset(page: number, itemsPerPage: number) {
    return (page - 1) * itemsPerPage;
  }

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
      picture: firstRow.course_picture,
      isPictureMinified: firstRow.course_isPictureMinified,
      pictureDataUrl: firstRow.course_pictureDataUrl,
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
  course_picture: string | undefined;
  course_isPictureMinified: boolean;
  course_pictureDataUrl: string | null;
  course_isDraft: boolean;
  tag_id: number;
  tag_name: string;
  user_id: number;
  user_name: string;
  user_login: string;
}
