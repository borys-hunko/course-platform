import { inject, injectable } from 'inversify';
import { Datasource } from '../../datasource';
import { CONTAINER_IDS } from '../consts';
import { LocalStorage } from '../localStorage';
import { ILogger } from '../logger';
import { ITransactional, ITransactionRunner, Transaction } from './types';

@injectable()
export class TransactionRunner<E> implements ITransactionRunner<any> {
  constructor(
    @inject(CONTAINER_IDS.DATA_SOURCE) private datasource: Datasource,
    @inject(CONTAINER_IDS.LOCAL_STORAGE) private localStorage: LocalStorage,
    @inject(CONTAINER_IDS.LOGGER) private logger: ILogger,
  ) {}

  runInsideTransaction = async <T>(
    transactionalFactory: ITransactional<E>,
    func: (entity: E) => Promise<T>,
    propagate: boolean = true,
  ): Promise<T> => {
    let trx = this.localStorage.get('transaction');

    if (trx && propagate) {
      this.logger.info('propagate transaction');

      return await this.runTransaction<T>(transactionalFactory, trx, func);
    }

    this.logger.info('create new transaction');
    trx = await this.datasource.transaction();

    this.localStorage.set('transaction', trx);

    try {
      const result = await this.runTransaction<T>(
        transactionalFactory,
        trx,
        func,
      );

      this.logger.info('commit transaction');
      await trx.commit();

      return result;
    } catch (e: unknown) {
      this.logger.error('rollback transaction');
      await trx.rollback();

      throw e;
    }
  };

  private async runTransaction<T>(
    transactionalFactory: ITransactional<E>,
    trx: Transaction,
    func: (entity: E) => Promise<T>,
  ) {
    const transactionalInstnce =
      transactionalFactory.createTransactionalInstance(trx);

    const result = await func(transactionalInstnce);

    return result;
  }
}
