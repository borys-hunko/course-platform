import { UserResponse } from '../../user/dto';

export interface PassResetToken {
  id: number;
  token: string;
  tokenId: string;
  expirationDate: Date;
  user: UserResponse;
  isUsed: boolean;
}

export interface PassResetTokenTable {
  id: number;
  token: string;
  tokenId: string;
  expirationDate: Date;
  userId: number;
  isUsed: boolean;
}
