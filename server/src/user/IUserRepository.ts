import { ITransactional } from '../common/transactionRunner/types';
import { UserResponse } from './dto';
import { User } from './types';

export interface IUserResitoryBase {
  get(id: number): Promise<UserResponse | undefined>;
  getByLoginOrEmail(login: string, email: string): Promise<User | undefined>;
  update(
    id: number,
    user: Partial<Omit<User, 'id'>>,
  ): Promise<UserResponse | undefined>;
  create(user: Omit<User, 'createDate' | 'id'>): Promise<User>;
}

export type IUserResitory = IUserResitoryBase & ITransactional<IUserResitory>;
