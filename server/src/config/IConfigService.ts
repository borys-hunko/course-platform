export default interface IConfigService {
  get: <T>(key: string, mapper: Mapper<T>) => T;
}

export type Mapper<T> = (val: string) => T;
