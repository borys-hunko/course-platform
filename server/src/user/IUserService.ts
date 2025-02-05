import { SignUpRequest } from '../auth/dto';
import { ITransactional } from '../common/transactionRunner';
import { UserResponse } from './dto';
import { User } from './types';

export default interface IUserService extends ITransactional<IUserService> {
  getByLoginOrEmail(loginOrEmail: string): Promise<User>;
  update(id: number, user: Partial<Omit<User, 'id'>>): Promise<UserResponse>; // TODO: change input type
  create(user: SignUpRequest): Promise<User>;
  getMe(): Promise<UserResponse>;
}
