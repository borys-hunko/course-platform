import { User } from './types';

export type UserResponse = Omit<User, 'password'>;
