import { Knex } from 'knex';

export interface ITransactionRunner<E> {
  runInsideTransaction<T>(
    transactionalFactory: ITransactional<E>,
    func: (entity: E) => Promise<T>,
    propagate?: boolean, // default: true
  ): Promise<T>;
}

export type Transaction = Knex.Transaction<any, any[]>;

export interface ITransactional<T> {
  createTransactionalInstance(tsx: Transaction): T;
}
