export interface User {
  id: number;
  login: string;
  email: string;
  createDate: Date;
  name: string;
  password: string;
}

export interface UserTable {
  id: number;
  login: string;
  email: string;
  createDate: Date;
  name: string;
  password: string;
}

export interface UserSearchParams extends Omit<User, 'password' | 'id'> {
  orEmail: string;
  orLogin: string;
  q: string; //for full-text search
}
