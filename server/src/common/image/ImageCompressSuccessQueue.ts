import { Message, SQSClient } from '@aws-sdk/client-sqs';
import { BaseQueueConsumer } from '../queueConsumer';
import { inject, injectable } from 'inversify';
import { CONTAINER_IDS } from '../consts';
import { ILogger } from '../logger';
import IConfigService from '../config/IConfigService';
import { ICourseService } from '../../course';
import { badRequestError } from '../utils';
import { imageCompressMessageSchema } from './schemas';
import { ILocalStorage } from '../localStorage';

@injectable()
export class ImageCompressSuccessQueue extends BaseQueueConsumer {
  constructor(
    @inject(CONTAINER_IDS.COURSE_SERVICE) private courseService: ICourseService,
    @inject(CONTAINER_IDS.LOGGER) logger: ILogger,
    @inject(CONTAINER_IDS.CONFIG_SERVICE) config: IConfigService,
    @inject(CONTAINER_IDS.LOCAL_STORAGE) localStorage: ILocalStorage,
    @inject(CONTAINER_IDS.SQS_CLIENT) sqsClient: SQSClient,
  ) {
    super(logger, config, localStorage, sqsClient);

    this.start = this.start.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.getQueueUrl = this.getQueueUrl.bind(this);
  }

  protected getQueueUrl(): Promise<string> | string {
    return this.configService.get('IMAGE_COMPRESSION_QUEUE_URL');
  }

  protected async handleMessage(message: Message): Promise<Message | void> {
    if (!message.Body) {
      throw badRequestError('Missing body');
    }

    const parsedMessage = JSON.parse(message.Body);
    const validateMessage = imageCompressMessageSchema.parse(parsedMessage);
    if (validateMessage.filename.startsWith('course')) {
      await this.courseService.confirmImageCompression(
        validateMessage.filename,
      );
    } else {
      throw badRequestError('Invalid filename');
    }

    return message;
  }
}
