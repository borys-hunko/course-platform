import { UserResponse } from '../../user/dto';

export interface PassResetToken {
  id: number;
  token: string;
  expirationDate: number;
  user: UserResponse;
  isUsed: boolean;
}
