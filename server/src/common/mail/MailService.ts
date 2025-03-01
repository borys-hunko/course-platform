import { inject, injectable } from 'inversify';
import { Liquid } from 'liquidjs';
import { Transporter } from 'nodemailer';
import SESTransport from 'nodemailer/lib/ses-transport';
import IConfigService from '../config/IConfigService';
import { CONTAINER_IDS } from '../consts';
import { ILogger } from '../logger';
import { EmailOption, IMailService } from './types';

@injectable()
export class MailService implements IMailService {
  transporter: Transporter<SESTransport.SentMessageInfo> | null = null;

  constructor(
    @inject(CONTAINER_IDS.MAIL_TRANSPORTER_PROVIDER)
    private transporterProvider: () => Promise<
      Transporter<SESTransport.SentMessageInfo>
    >,
    @inject(CONTAINER_IDS.TEMPLATE_ENGINE) private engine: Liquid,
    @inject(CONTAINER_IDS.LOGGER) private logger: ILogger,
    @inject(CONTAINER_IDS.CONFIG_SERVICE) private config: IConfigService,
  ) {}

  async init(): Promise<void> {
    this.transporter = await this.transporterProvider();
  }

  async sendEmail({
    templateVars,
    template,
    receiverEmail,
    subject,
  }: EmailOption): Promise<void> {
    if (!this.transporter) {
      throw Error('You should firstly init the service');
    }

    const domainEmail = await this.config.get('DOMAIN_EMAIL');
    this.logger.debug('sendEmail-from', { domainEmail });
    const res = await this.transporter.sendMail({
      to: receiverEmail,
      html: await this.engine.renderFile(template, templateVars),
      subject,
      from: domainEmail,
    });

    this.logger.debug(`message sent to ${receiverEmail}`, {
      response: res.response,
    });
  }
}
