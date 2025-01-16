import IConfigService, { Mapper } from './IConfigService';

export default class ConfigServise implements IConfigService {
  get<T = string>(key: string, mapper: Mapper<T> = (val) => val as T) {
    const result = process.env[key];
    if (!result) {
      throw new Error();
    }

    return mapper(result);
  }
}
