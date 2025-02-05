import { IPassResetTokenService } from './IPassResetTokenService';

export class PassResetTokenService implements IPassResetTokenService {
  create(_userEmail: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
  validate(_token: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
