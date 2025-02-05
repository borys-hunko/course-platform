import { ITransactional } from '../../common/transactionRunner';
import { JwtPayload, TokensResponse } from './types';

export interface IJwtService extends ITransactional<IJwtService> {
  checkJwt(token: string): Promise<JwtPayload>;
  getTokens(id: number): Promise<TokensResponse>;
  refreshJwt(refreshToken: string): Promise<TokensResponse>;
}
