export default interface IConfigService {
  get: (key: string) => Promise<string>;
}
