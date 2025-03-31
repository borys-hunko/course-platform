import {
  MessageAttributeValue,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { Logger } from './logger';

const sqsClient = new SQSClient({ region: process.env.REGION });

export const createSqsService = (logger: Logger) => ({
  sendMessage: async (
    message: string,
    correlationId: string,
    attributes?: Record<string, MessageAttributeValue>,
  ) => {
    const attributeValues: Record<string, MessageAttributeValue> = {
      correlationId: {
        DataType: 'String',
        StringValue: correlationId,
      },
      ...(attributes ? attributes : {}),
    };

    const sendCommand = new SendMessageCommand({
      QueueUrl: process.env.QUEUE_URL,
      MessageBody: message,
      MessageAttributes: attributeValues,
    });

    const output = await sqsClient.send(sendCommand);

    logger.info('send message id', correlationId, {
      messageId: output.MessageId,
    });
  },
});
