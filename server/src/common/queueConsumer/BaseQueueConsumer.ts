import { IQueueConsumer } from '.';
import { Consumer } from 'sqs-consumer';
import { DeleteMessageCommand, Message, SQSClient } from '@aws-sdk/client-sqs';
import { ILogger } from '../logger';
import IConfigService from '../config/IConfigService';
import { randomUUID } from 'crypto';
import { ILocalStorage } from '../localStorage';

/*

TODO: rewrite from  abstract method to factory
  so that it was normal class which inject list of messageHandlers and initiate query consumers for them
  */
export abstract class BaseQueueConsumer implements IQueueConsumer {
  protected constructor(
    protected logger: ILogger,
    protected configService: IConfigService,
    protected localStorage: ILocalStorage,
    protected sqsClient: SQSClient,
  ) {}

  async start(): Promise<void> {
    const consumer = Consumer.create({
      queueUrl: await this.getQueueUrl(),
      handleMessage: async (message) =>
        this.localStorage.init(() => this.handleMessageWrapper(message)),
      pollingWaitTimeMs: 500,
      shouldDeleteMessages: false,
      sqs: this.sqsClient,
    });

    consumer.on('error', (err) => {
      this.logger.error('Error while interacting with the queue', err);
    });

    consumer.on('processing_error', (err) => {
      this.logger.error('Processing error', err);
    });

    consumer.on('timeout_error', (err) => {
      this.logger.error('Timeout error', err);
    });

    consumer.start();
  }

  protected abstract getQueueUrl(): Promise<string> | string;

  protected abstract handleMessage(message: Message): Promise<Message | void>;

  private handleMessageWrapper = async (
    message: Message,
  ): Promise<Message | void> => {
    const correlationId =
      message.MessageAttributes?.correlationId?.StringValue || randomUUID();
    this.localStorage.set('correlationId', correlationId);
    await this.handleMessage(message);
    const deleteMessageCommand = new DeleteMessageCommand({
      QueueUrl: await this.getQueueUrl(),
      ReceiptHandle: message.ReceiptHandle,
    });
    await this.sqsClient.send(deleteMessageCommand);
  };
}
