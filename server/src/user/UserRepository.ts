import { inject } from 'inversify';
import { CONTAINER_IDS } from '../common/consts';
import { Transaction } from '../common/transactionRunner/types';
import { Datasource } from '../datasource';
import { UserResponse } from './dto';
import { IUserResitory } from './IUserRepository';
import { User, UserTable } from './types';

export class UserRepository implements IUserResitory {
  constructor(
    @inject(CONTAINER_IDS.DATA_SOURCE) private datasource: Datasource,
  ) {}

  async get(id: number): Promise<UserResponse | undefined> {
    const query = this.datasource<UserTable, UserResponse[]>('user')
      .select('id', 'login', 'email', 'createTime', 'name')
      .where('id', id);

    const res = await query;
    return res[0];
  }

  async getByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<User | undefined> {
    const query = this.datasource<UserTable>('user')
      .select('*')
      .where('email', email)
      .orWhere('login', login)
      .first();

    const result = await query;
    return result;
  }

  async update(
    id: number,
    user: Partial<Omit<User, 'id'>>,
  ): Promise<UserResponse | undefined> {
    const res = await this.datasource<UserTable>('user')
      .update(user, ['id', 'login', 'email', 'createTime', 'name'])
      .where({ id });

    return res[0];
  }

  async create(user: Omit<User, 'createDate' | 'id'>): Promise<User> {
    const result = await this.datasource<UserTable>('user').insert(user, '*');
    return result[0];
  }

  createTransactionalInstance(tsx: Transaction): IUserResitory {
    return new UserRepository(tsx);
  }
}
