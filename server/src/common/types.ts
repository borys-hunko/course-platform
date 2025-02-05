import { RequestHandler, Router } from 'express';

export interface FeatureRouter {
  getRouter(): Router;
  getRouterPath(): string;
}

export type AtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> &
    Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

export type SearchOperation = 'AND' | 'OR';

export type GetpParams = {
  seatchOperation?: SearchOperation;
  offset?: number;
  limit?: number;
};

export type UpdatedEntity<T> = {
  entity?: T;
  updatedRows: number;
};

export interface Middleware {
  use: RequestHandler;
}
