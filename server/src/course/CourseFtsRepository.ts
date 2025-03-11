import { Transaction } from '../common/transactionRunner';
import { ICourseFtsRepository } from './interfaces';
import { inject, injectable } from 'inversify';
import { CONTAINER_IDS } from '../common/consts';
import { Datasource } from '../datasource';
import { COURSE_TABLE_NAME } from './CourseRepository';
import { USER_TABLE_NAME } from '../user/consts';
import { ILogger } from '../common/logger';

export const COURSE_FTS_TABLE_NAME = 'courseFts';

@injectable()
export class CourseFtsRepository implements ICourseFtsRepository {
  constructor(
    @inject(CONTAINER_IDS.DATA_SOURCE) private readonly datasource: Datasource,
    @inject(CONTAINER_IDS.LOGGER) private readonly logger: ILogger,
  ) {}

  async create(id: number): Promise<void> {
    await this.datasource.raw(
      `
            INSERT INTO "${COURSE_FTS_TABLE_NAME}" ("courseId", fulltext)
                SELECT
                    c.id as "courseId",
                    setweight(to_tsvector('english', coalesce(c.name, '')), 'A') ||
                    setweight(to_tsvector('english', coalesce(c.description, '')), 'B') ||
                    setweight(to_tsvector('english', coalesce(u.name, '')), 'C')
                    as fulltext
                FROM ${COURSE_TABLE_NAME} as c
                JOIN "${USER_TABLE_NAME}" as u ON u.id = c."authorId"
                WHERE c.id = ?
          `,
      [id],
    );
  }

  async update(id: number): Promise<void> {
    await this.datasource.raw(
      `
        UPDATE "${COURSE_FTS_TABLE_NAME}" as cfts
        SET fulltext =
            setweight(to_tsvector('english', coalesce(c.name, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(c.description, '')), 'B') ||
            setweight(to_tsvector('english', coalesce(u.name, '')), 'C')
        FROM ${COURSE_TABLE_NAME} as c
        JOIN "${USER_TABLE_NAME}" as u ON u.id = c."authorId"
        WHERE c.id = cfts."courseId" AND cfts."courseId" = ?
    `,
      [id],
    );
  }

  createTransactionalInstance(trx: Transaction): ICourseFtsRepository {
    return new CourseFtsRepository(trx, this.logger);
  }
}
