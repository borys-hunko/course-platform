import { ITransactional } from '../../common/transactionRunner';
import { PassResetTokenTable } from './types';

export interface IPassResetTokenRepository
  extends ITransactional<IPassResetTokenRepository> {
  create(
    token: Omit<PassResetTokenTable, 'id' | 'isUsed' | 'tokenId'>,
  ): Promise<PassResetTokenTable>;
  deactivate(tokenId: string): Promise<boolean>;
  get(token: string): Promise<PassResetTokenTable | undefined>;
}
