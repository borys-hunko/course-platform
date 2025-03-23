import { Initiatable } from '../types';

export interface IMailService extends Initiatable {
  sendEmail(options: EmailOption): Promise<void>;
}

export interface EmailOption {
  receiverEmail: string;
  template: string;
  templateVars: {
    [key: string]: string;
  };
  subject: string;
}
