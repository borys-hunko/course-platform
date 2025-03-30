import { Context, S3Event, S3EventRecord } from 'aws-lambda';
import { compressObject } from './utils';
import { getObject, uploadObject } from './s3Service';
import { sendMessage } from './sqsService';

const validateEvent = (event: S3EventRecord) => {
  const eventName = event.eventName;

  if (!eventName.startsWith('ObjectCreated')) {
    throw new Error('Reason not implemented');
  }
};

export const compressS3PutImageHandler = async (
  event: S3Event,
  _context: Context,
) => {
  console.log('Compressing image...', JSON.stringify(event));
  const eventRecord = event.Records[0];
  validateEvent(eventRecord);
  const createdFileName = eventRecord.s3.object.key;

  const object = await getObject(createdFileName);

  if (!object.Body) {
    throw new Error('Object not found');
  }

  const image = await object.Body.transformToByteArray();

  const compressedImageBuffer = await compressObject(image, createdFileName);

  await uploadObject(createdFileName, compressedImageBuffer);

  await sendMessage(
    JSON.stringify({
      filename: createdFileName,
    }),
  );
};

module.exports = {
  handler: compressS3PutImageHandler,
};
