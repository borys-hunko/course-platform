import { AsyncLocalStorage } from 'async_hooks';
import { inject, injectable } from 'inversify';
import { ILocalStorage, LocalStorageValues } from '.';
import { CONTAINER_IDS } from '../consts';
import { ILocalStorageLogger } from '../logger';

@injectable()
export class LocalStorage implements ILocalStorage {
  private storage: AsyncLocalStorage<LocalStorageValues>;

  constructor(
    @inject(CONTAINER_IDS.ASYNC_LOCAL_STORAGE_NATIVE)
    storage: AsyncLocalStorage<LocalStorageValues>,
    @inject(CONTAINER_IDS.LOCAL_STORAGE_LOGGER)
    private logger: ILocalStorageLogger,
  ) {
    this.storage = storage;
  }

  get<Key extends keyof LocalStorageValues>(key: Key): LocalStorageValues[Key] {
    const store = this.storage.getStore();
    if (!store) {
      throw new Error('Store is not defined');
    }

    const value = store[key];

    return value;
  }

  getOrThrow<Key extends keyof LocalStorageValues>(
    key: Key,
  ): NonNullable<LocalStorageValues[Key]> {
    const value = this.get(key);
    if (!value) {
      throw new Error('Values is not defined');
    }

    return value;
  }

  set<Key extends keyof LocalStorageValues>(
    key: Key,
    value: LocalStorageValues[Key],
  ): void {
    const store = this.storage.getStore();
    if (store) {
      store[key] = value;
    }
  }

  init(callback: () => void): void {
    this.storage.run({}, () => {
      callback();
    });
  }
}
