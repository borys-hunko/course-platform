import { RequestHandler, Router, Request } from 'express';
import * as core from 'express-serve-static-core';

export interface FeatureRouter {
  getRouter(): Router;
  getRouterPath(): string;
}

export type AtLeastOne<T> = {
  [K in keyof T]-?: Required<Pick<T, K>> &
    Partial<Pick<T, Exclude<keyof T, K>>>;
}[keyof T];

export interface Pagination<T> {
  items: T[];
  page: number;
  itemsPerPage: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  itemsPerPage: number;
}

export type UpdatedEntity<T> = {
  entity?: T;
  updatedRows: number;
};

export interface Middleware {
  use: RequestHandler;
}

export interface ValidatedRequest<
  ReqBody = any,
  P = core.ParamsDictionary,
  ReqQuery = any,
  Headers = any,
  Cookies = Record<string, any>,
> extends Request<P, any, ReqBody, ReqQuery> {
  validated: {
    body: ReqBody;
    headers: Headers;
    params: P;
    cookies: Cookies;
    query: ReqQuery;
  };
}
