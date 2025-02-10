import { inject, injectable } from 'inversify';
import { SignUpRequest } from '../auth/dto';
import { CONTAINER_IDS } from '../common/consts';
import { ILocalStorage } from '../common/localStorage';
import { Transaction } from '../common/transactionRunner';
import { hashString } from '../common/utils';
import { badRequestError, notFoundError } from '../common/utils/error';
import { UserResponse } from './dto';
import { IUserResitory } from './IUserRepository';
import IUserService from './IUserService';
import { User } from './types';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(CONTAINER_IDS.USER_REPOSITORY)
    private userRepository: IUserResitory,
    @inject(CONTAINER_IDS.LOCAL_STORAGE)
    private localStorage: ILocalStorage,
  ) {}

  createTransactionalInstance(tsx: Transaction): UserService {
    return new UserService(
      this.userRepository.createTransactionalInstance(tsx),
      this.localStorage,
    );
  }

  getMe = async (): Promise<UserResponse> => {
    const id = this.localStorage.getOrThrow('userId');
    const user = await this.userRepository.get(id);
    if (!user) {
      throw notFoundError(`Cannot find user with ${id}`);
    }

    return user;
  };

  async getByLoginOrEmail(loginOrEmail: string): Promise<User> {
    const user = await this.userRepository.getByLoginOrEmail(
      loginOrEmail,
      loginOrEmail,
    );
    // remove this
    if (!user) {
      throw notFoundError(`There is no user ${loginOrEmail}`);
    }

    return user;
  }

  async update(
    id: number,
    user: Partial<Omit<User, 'id'>>,
  ): Promise<UserResponse> {
    const res = await this.userRepository.update(id, user);
    if (!res) {
      throw notFoundError(`There is no user with id ${id}`);
    }

    return res;
  }

  async create(user: SignUpRequest): Promise<User> {
    const found = await this.userRepository.getByLoginOrEmail(
      user.login,
      user.email,
    );

    if (found) {
      throw badRequestError('User already exists');
    }

    user.password = await hashString(user.password);
    const createUser = await this.userRepository.create(user);

    return createUser;
  }

  async getByEmail(email: string): Promise<UserResponse> {
    const res = await this.userRepository.getByEmail(email);
    if (!res) {
      throw notFoundError(`User with email ${email} not found`);
    }
    return res;
  }
}
