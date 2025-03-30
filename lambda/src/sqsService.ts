import {
  MessageAttributeValue,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({ region: process.env.REGION });

export const sendMessage = async (
  message: string,
  attributes?: Record<string, MessageAttributeValue>,
) => {
  const sendCommand = new SendMessageCommand({
    QueueUrl: process.env.QUEUE_URL,
    MessageBody: message,
    MessageAttributes: attributes,
  });

  const output = await sqsClient.send(sendCommand);

  console.log('send message id', output.MessageId);
};
