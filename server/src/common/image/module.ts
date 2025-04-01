import { ContainerModule, interfaces } from 'inversify';
import { S3Client } from '@aws-sdk/client-s3';
import { CONTAINER_IDS } from '../consts';
import { defaultProvider } from '@aws-sdk/credential-provider-node';
import IConfigService from '../config/IConfigService';
import { IImageService } from './interfaces';
import { ImageService } from './ImageService';
import { IQueueConsumer } from '../queueConsumer';
import { ImageCompressSuccessQueue } from './ImageCompressSuccessQueue';

const s3ClientProviderCreator: interfaces.ProviderCreator<S3Client> = (
  context: interfaces.Context,
) => {
  return async () => {
    const configService = context.container.get<IConfigService>(
      CONTAINER_IDS.CONFIG_SERVICE,
    );
    return new S3Client({
      credentials: defaultProvider(),
      region: await configService.get('AWS_REGION'),
    });
  };
};

export const imageModule = new ContainerModule((bind) => {
  bind(CONTAINER_IDS.S3_CLIENT_PROVIDER).toProvider(s3ClientProviderCreator);
  bind<IImageService>(CONTAINER_IDS.IMAGE_SERVICE)
    .to(ImageService)
    .inSingletonScope()
    .onActivation(async (_ctx, service) => {
      await service.init();
      return service;
    });
  bind<IQueueConsumer>(CONTAINER_IDS.QUEUE_CONSUMER)
    .to(ImageCompressSuccessQueue)
    .inSingletonScope();
});
