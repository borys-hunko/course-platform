import { Transaction } from '../transactionRunner';

export interface ILocalStorage {
  getOrThrow<Key extends keyof LocalStorageValues>(
    key: Key,
  ): NonNullable<LocalStorageValues[Key]>;
  get<Key extends keyof LocalStorageValues>(key: Key): LocalStorageValues[Key];
  init(callback: () => void): void;
  set<Key extends keyof LocalStorageValues>(
    key: Key,
    value: LocalStorageValues[Key],
  ): void;
}

export interface LocalStorageValues {
  correlationId?: string;
  userId?: number;
  transaction?: Transaction;
}
