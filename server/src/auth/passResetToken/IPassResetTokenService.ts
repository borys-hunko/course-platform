export interface IPassResetTokenService {
  create(userEmail: string): Promise<string>;
  validate(token: string): Promise<boolean>;
}
