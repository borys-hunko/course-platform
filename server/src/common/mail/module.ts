import { ContainerModule, interfaces } from 'inversify';
import { createTransport, Transporter } from 'nodemailer';
import SESTransport from 'nodemailer/lib/ses-transport';
import IConfigService from '../config/IConfigService';
import { CONTAINER_IDS } from '../consts';
import * as awsSES from '@aws-sdk/client-ses';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import { Liquid } from 'liquidjs';
import path from 'path';
import { IMailService } from './types';
import { MailService } from './MailService';

export const mailModule = new ContainerModule((bind) => {
  bind<Transporter<SESTransport.SentMessageInfo>>(
    CONTAINER_IDS.MAIL_TRANSPORTER_PROVIDER,
  ).toProvider<Transporter<SESTransport.SentMessageInfo>>(
    createMailTransporter,
  );
  bind<Liquid>(CONTAINER_IDS.TEMPLATE_ENGINE).toConstantValue(
    new Liquid({
      root: path.resolve(__dirname, '../../..', 'templates'),
      extname: '.liquid',
    }),
  );
  bind<IMailService>(CONTAINER_IDS.MAIL_SERVICE)
    .to(MailService)
    .inSingletonScope()
    .onActivation(async (_ctx, service) => {
      await service.init();
      return service;
    });
});

const createMailTransporter: interfaces.ProviderCreator<
  Transporter<SESTransport.SentMessageInfo>
> = (context: interfaces.Context) => {
  return async () => {
    const configService = context.container.get<IConfigService>(
      CONTAINER_IDS.CONFIG_SERVICE,
    );

    const ses = new awsSES.SES({
      region: await configService.get('AWS_REGION'),
      credentialDefaultProvider: defaultProvider,
      apiVersion: '2010-12-01',
    });
    return createTransport({
      SES: { aws: awsSES, ses },
    });
  };
};
