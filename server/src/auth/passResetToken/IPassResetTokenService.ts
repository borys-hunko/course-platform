import { ITransactional } from '../../common/transactionRunner';

export interface IPassResetTokenService
  extends ITransactional<IPassResetTokenService> {
  createToken(userEmail: string): Promise<string>;
  validateAndGetUser(token: string): Promise<{ userId: number }>;
  deactivateAll(userId: number): Promise<void>;
  deactivate(tokenId: string): Promise<void>;
}
