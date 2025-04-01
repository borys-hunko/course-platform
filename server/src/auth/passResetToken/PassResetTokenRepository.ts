import { inject, injectable } from 'inversify';
import { CONTAINER_IDS } from '../../common/consts';
import { Transaction } from '../../common/transactionRunner';
import { Datasource } from '../../datasource';
import { IPassResetTokenRepository } from './IPassResetTokenRepository';
import { PassResetTokenTable } from './types';
import { util } from 'zod';
import Omit = util.Omit;

const TABLE_NAME = 'passResetToken';
@injectable()
export class PassResetTokenRepository implements IPassResetTokenRepository {
  constructor(
    @inject(CONTAINER_IDS.DATA_SOURCE) private datasource: Datasource,
  ) {}

  async deactivateAll(userId: number): Promise<boolean> {
    const res = await this.datasource<PassResetTokenTable>(TABLE_NAME)
      .update('isUsed', true)
      .where('userId', userId);
    return res !== 0;
  }

  async create(
    token: Omit<PassResetTokenTable, 'id' | 'isUsed' | 'tokenId'>,
  ): Promise<PassResetTokenTable> {
    const res = await this.datasource<PassResetTokenTable>(TABLE_NAME).insert(
      token,
      '*',
    );

    return res[0];
  }

  async deactivate(tokenId: string): Promise<boolean> {
    const res = await this.datasource<PassResetTokenTable>(TABLE_NAME)
      .update('isUsed', true)
      .where('tokenId', tokenId);
    return res !== 0;
  }

  async get(tokenId: string): Promise<PassResetTokenTable | undefined> {
    const res = await this.datasource<PassResetTokenTable>(TABLE_NAME)
      .select('*')
      .where('tokenId', tokenId)
      .first();

    return res;
  }

  createTransactionalInstance(tsx: Transaction): IPassResetTokenRepository {
    return new PassResetTokenRepository(tsx);
  }
}
