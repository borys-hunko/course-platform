import { RefreshToken } from '.';
import { ITransactional } from '../../common/transactionRunner';

export interface IRefreshTokenRepository
  extends ITransactional<IRefreshTokenRepository> {
  create(token: Omit<RefreshToken, 'id' | 'isActive'>): Promise<RefreshToken>;
  deativateAllForUser(userId: number): Promise<boolean>;
  deactivate(token: string): Promise<boolean>;
  get(token: string): Promise<RefreshToken | undefined>;
}
