export default interface IConfigService {
  get: (key: string) => Promise<string>;
}

export const CONFIG_SERVICE = Symbol.for('CONFIG_SERVICE');
