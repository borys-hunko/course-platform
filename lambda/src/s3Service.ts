import {
  GetObjectCommand,
  GetObjectTaggingCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getExtension } from './utils';
import { Logger } from './logger';

export const s3Client = new S3Client({ region: process.env.REGION });

const BUCKET_NAME = 'hunko-course-images';

export type S3Service = ReturnType<typeof createS3Service>;

export const createS3Service = (logger: Logger) => ({
  getObject: async (key: string, correlationId: string) => {
    const getObjectCommand = new GetObjectCommand({
      Key: key,
      Bucket: BUCKET_NAME,
    });

    const object = await s3Client.send(getObjectCommand);

    logger.info(`Received object ${key}`, correlationId);

    return object;
  },

  uploadObject: async (
    key: string,
    buffer: Buffer<ArrayBufferLike>,
    correlationId: string,
  ) => {
    const putObjectCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: `image/${getExtension(key)}`,
      Tagging: 'correlationId=' + correlationId,
    });

    const result = await s3Client.send(putObjectCommand);

    logger.info('uploaded object to s3 ', correlationId, result);
  },

  getObjectTagging: async (key: string) => {
    const getTaggingCommand = new GetObjectTaggingCommand({
      Key: key,
      Bucket: BUCKET_NAME,
    });

    const tags = await s3Client.send(getTaggingCommand);
    logger.info(`Get tag for object ${key}`);
    return tags.TagSet;
  },
});
