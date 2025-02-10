import { RefreshTokenTable } from '.';
import { ITransactional } from '../../common/transactionRunner';

export interface IRefreshTokenRepository
  extends ITransactional<IRefreshTokenRepository> {
  create(
    token: Omit<RefreshTokenTable, 'id' | 'isActive' | 'tokenId'>,
  ): Promise<RefreshTokenTable>;
  deativateAllForUser(userId: number): Promise<boolean>;
  deactivate(tokenId: string): Promise<boolean>;
  get(tokenId: string): Promise<RefreshTokenTable | undefined>;
}
