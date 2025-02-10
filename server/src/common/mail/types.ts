export interface IMailService {
  sendEmail(options: EmailOption): Promise<void>;
  init(): Promise<void>;
}

export interface EmailOption {
  receiverEmail: string;
  template: string;
  temaplteVars: {
    [key: string]: string;
  };
  subject: string;
}
