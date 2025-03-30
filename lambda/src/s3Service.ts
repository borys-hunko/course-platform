import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getExtension } from './utils';

export const s3Client = new S3Client({ region: process.env.REGION });

const BUCKET_NAME = 'hunko-course-images';

export const getObject = (key: string) => {
  const getObjectCommand = new GetObjectCommand({
    Key: key,
    Bucket: BUCKET_NAME,
  });

  return s3Client.send(getObjectCommand);
};

export const uploadObject = async (
  key: string,
  buffer: Buffer<ArrayBufferLike>,
) => {
  const putObjectCommand = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key.replace('image', 'minified'),
    Body: buffer,
    ContentType: `image/${getExtension(key)}`,
  });

  const result = await s3Client.send(putObjectCommand);
  console.log('uploaded object to s3', result);
};
