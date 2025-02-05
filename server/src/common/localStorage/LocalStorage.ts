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
    this.logger.debug('localstorage.get(store)', 'LocalStorage', { store });
    if (!store) {
      throw new Error('Store is not defined');
    }

    const value = store[key];
    this.logger.debug('localstorage.get(returned value)', 'LocalStorage', {
      value,
    });
    return value;
  }

  getOrThrow<Key extends keyof LocalStorageValues>(
    key: Key,
  ): NonNullable<LocalStorageValues[Key]> {
    const value = this.get(key);
    this.logger.debug(
      'localstorage.getOrThrow(returned value)',
      'LocalStorage',
      {
        value,
      },
    );
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
      this.logger.debug('store', 'LocalStorage', { store });

      store[key] = value;
      this.logger.debug('value is set', 'LocalStorage', {
        store: this.storage.getStore(),
      });
    }
  }

  init(callback: () => void): void {
    this.storage.run({}, () => {
      this.logger.debug('callback run', 'LocalStorage');
      callback();
    });
  }
}
