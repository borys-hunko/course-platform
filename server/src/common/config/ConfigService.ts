import { injectable } from 'inversify';
import IConfigService from './IConfigService';

@injectable()
export default class ConfigServise implements IConfigService {
  async get(key: string) {
    const result = process.env[key];
    if (!result) {
      throw new Error(`Can't find env variable ${key}`);
    }

    return result;
  }
}
