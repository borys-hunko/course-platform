import { inject, injectable } from 'inversify';
import { CONTAINER_IDS } from '../../common/consts';
import { Transaction } from '../../common/transactionRunner';
import { Datasource } from '../../datasource';
import { IRefreshTokenRepository } from './IRefreshTokenRepository';
import { RefreshToken, RefreshTokenTable } from './types';

@injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(
    @inject(CONTAINER_IDS.DATA_SOURCE) private datasource: Datasource,
  ) {}

  async create(
    token: Omit<RefreshToken, 'id' | 'isActive'>,
  ): Promise<RefreshToken> {
    const createdToken = await this.datasource<RefreshTokenTable>(
      'refreshToken',
    ).insert(token, '*');

    return createdToken[0];
  }

  async deativateAllForUser(userId: number): Promise<boolean> {
    const updatedRows = await this.datasource<RefreshTokenTable>('refreshToken')
      .update({
        isActive: false,
      })
      .where({ userId });
    return updatedRows != 0;
  }

  async deactivate(tokenId: string): Promise<boolean> {
    const updatedRows = await this.datasource<RefreshTokenTable>('refreshToken')
      .update({
        isActive: false,
      })
      .where({ tokenId });
    return updatedRows != 0;
  }

  async get(tokenId: string): Promise<RefreshToken> {
    const refreshToken = await this.datasource<RefreshTokenTable>(
      'refreshToken',
    )
      .select('*')
      .where({ tokenId });

    return refreshToken[0];
  }

  createTransactionalInstance(tsx: Transaction): IRefreshTokenRepository {
    return new RefreshTokenRepository(tsx);
  }
}
