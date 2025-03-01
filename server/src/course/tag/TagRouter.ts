import { NextFunction, Request, Response, Router } from 'express';
import { FeatureRouter, ValidatedRequest } from '../../common/types';
import { inject, injectable } from 'inversify';
import { CONTAINER_IDS } from '../../common/consts';
import { schemaValidator } from '../../middleware';
import { tagsSearchSchema } from './schemas';
import { TagsSearchRequest, TagsSearchResponse } from './type';
import { ITagService } from './iterfaces';

@injectable()
export class TagRouter implements FeatureRouter {
  constructor(
    @inject(CONTAINER_IDS.ROUTER) private readonly router: Router,
    @inject(CONTAINER_IDS.TAG_SERVICE)
    private readonly tagService: ITagService,
  ) {}
  getRouter(): Router {
    this.router.get(
      '/',
      schemaValidator({ query: tagsSearchSchema }),
      this.handleSearch,
    );
    return this.router;
  }

  getRouterPath(): string {
    return '/tag';
  }

  handleSearch = async (
    req: Request,
    res: Response<TagsSearchResponse>,
    next: NextFunction,
  ) => {
    const validatedRequest = req as any as ValidatedRequest<
      any,
      any,
      TagsSearchRequest
    >;
    const tags = await this.tagService.search(validatedRequest.validated.query);
    res.status(200).json({ tags });
    next();
  };
}
