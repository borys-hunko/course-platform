import { inject } from 'inversify';
import { CONTAINER_IDS } from '../common/consts';
import { Transaction } from '../common/transactionRunner/types';
import { Datasource } from '../datasource';
import { UserResponse } from './dto';
import { IUserResitory } from './IUserRepository';
import { User, UserTable } from './types';

const TABLE_NAME = 'user';
const USER_RESPONSE_PROPS = ['id', 'login', 'email', 'createTime', 'name'];

export class UserRepository implements IUserResitory {
  constructor(
    @inject(CONTAINER_IDS.DATA_SOURCE) private datasource: Datasource,
  ) {}

  async get(id: number): Promise<UserResponse | undefined> {
    const query = this.datasource<UserTable, UserResponse[]>(TABLE_NAME)
      .select(...USER_RESPONSE_PROPS)
      .where('id', id);

    const res = await query;
    return res[0];
  }

  async getByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<User | undefined> {
    const query = this.datasource<UserTable>(TABLE_NAME)
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
    const res = await this.datasource<UserTable>(TABLE_NAME)
      .update(user, USER_RESPONSE_PROPS)
      .where({ id });

    return res[0];
  }

  async create(user: Omit<User, 'createDate' | 'id'>): Promise<User> {
    const result = await this.datasource<UserTable>(TABLE_NAME).insert(
      user,
      '*',
    );
    return result[0];
  }

  async getByEmail(email: string): Promise<User | undefined> {
    return await this.datasource<UserTable>(TABLE_NAME)
      .select(...USER_RESPONSE_PROPS)
      .where('email', email)
      .first();
  }

  createTransactionalInstance(tsx: Transaction): IUserResitory {
    return new UserRepository(tsx);
  }
}
