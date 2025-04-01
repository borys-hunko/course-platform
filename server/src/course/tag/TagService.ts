import { Transaction } from '../../common/transactionRunner';
import { ITagRepository, ITagService } from './iterfaces';
import { inject, injectable } from 'inversify';
import { Tag, TagsSearchRequest } from './type';
import { CONTAINER_IDS } from '../../common/consts';
import { ILogger } from '../../common/logger';

@injectable()
export class TagService implements ITagService {
  constructor(
    @inject(CONTAINER_IDS.TAG_REPOSITORY)
    private readonly tagRepository: ITagRepository,
    @inject(CONTAINER_IDS.LOGGER) private readonly logger: ILogger,
  ) {}

  async assignTags(courseId: number, tags: string[]): Promise<Tag[]> {
    const upsertTags = await this.tagRepository.upsertTags(
      tags.map((t) => t.toLowerCase()),
    );

    const updatedTagsForCourse = await this.tagRepository.createTagsForCourse(
      courseId,
      upsertTags,
    );

    this.logger.debug('Update tags for course', {
      updatedTagsForCourse: JSON.stringify(updatedTagsForCourse),
    });

    return upsertTags;
  }

  async updateTags(courseId: number, tags: string[]): Promise<Tag[]> {
    const deletedRowsNum =
      await this.tagRepository.deleteTagsForCourse(courseId);

    this.logger.debug('deleted all tags', {
      deletedRowsNum: JSON.stringify(deletedRowsNum),
    });

    return this.assignTags(courseId, tags);
  }

  getPopularTags(_num: number): Promise<Tag[]> {
    throw new Error('Method not implemented.');
  }

  search(searchRequest: TagsSearchRequest): Promise<Tag[]> {
    return this.tagRepository.search(searchRequest);
  }

  createTransactionalInstance(trx: Transaction): ITagService {
    return new TagService(
      this.tagRepository.createTransactionalInstance(trx),
      this.logger,
    );
  }
}
