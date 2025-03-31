import { Context, S3Event, S3EventRecord } from 'aws-lambda';
import { compressObject, getCorrelationId } from './utils';
import { createS3Service, S3Service } from './s3Service';
import { createSqsService } from './sqsService';
import { createLogger, Logger } from './logger';

const IMAGES_PREFIX = 'images/';
const MINIFIED_PREFIX = 'minified/';

const validateEvent = (event: S3EventRecord) => {
  const eventName = event.eventName;

  if (!eventName.startsWith('ObjectCreated')) {
    throw new Error('Reason not implemented');
  }
};

async function getObjectCorrelationId(s3Service: S3Service, key: string) {
  const tags = await s3Service.getObjectTagging(key);
  return getCorrelationId(tags);
}

async function uploadCompressedImage(
  s3Service: S3Service,
  key: string,
  correlationId: string,
) {
  const object = await s3Service.getObject(IMAGES_PREFIX + key, correlationId);
  if (!object.Body) {
    throw new Error('Object not found');
  }

  const image = await object.Body.transformToByteArray();
  const compressedImageBuffer = await compressObject(image, key);
  await s3Service.uploadObject(
    MINIFIED_PREFIX + key,
    compressedImageBuffer,
    correlationId,
  );
}

async function sendSuccessSqsMessage(
  logger: Logger,
  createdFileName: string,
  correlationId: string,
) {
  const { sendMessage } = createSqsService(logger);
  await sendMessage(
    JSON.stringify({
      filename: createdFileName,
    }),
    correlationId,
  );
}

export const compressS3PutImageHandler = async (
  event: S3Event,
  _context: Context,
) => {
  const eventRecord = event.Records[0];
  validateEvent(eventRecord);

  const logger = createLogger();
  const s3Service = createS3Service(logger);

  const createdFileName = eventRecord.s3.object.key;

  const correlationId = await getObjectCorrelationId(
    s3Service,
    createdFileName,
  );

  const keyWithoutPrefix = createdFileName.replace(IMAGES_PREFIX, '');

  await uploadCompressedImage(s3Service, keyWithoutPrefix, correlationId);

  await sendSuccessSqsMessage(logger, keyWithoutPrefix, correlationId);
};

module.exports = {
  handler: compressS3PutImageHandler,
};
