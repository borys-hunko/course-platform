import { Knex } from 'knex';

export const setPaginationParams = (
  query: Knex.QueryBuilder,
  params: {
    offset?: number;
    limit?: number;
  },
) => {
  if (params.offset) {
    query.offset(params.offset);
  }
  if (params.limit) {
    query.limit(params.limit);
  }
};
