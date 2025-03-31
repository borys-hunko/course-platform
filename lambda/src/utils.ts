import sharp, { Sharp } from 'sharp';
import { Tag } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';

type Extensions = 'jpg' | 'jpeg' | 'png' | 'webp';

export const getExtension = (createdFile: string): Extensions => {
  return createdFile.split('.')[1] as Extensions;
};

const modificationMap = {
  jpeg: (s: Sharp, quality?: number) => s.jpeg({ quality }),
  png: (s: Sharp, quality?: number) => s.png({ quality }),
  jpg: (s: Sharp, quality?: number) => s.jpeg({ quality }),
  webp: (s: Sharp, quality?: number) => s.webp({ quality }),
};

export const compressImage = async (
  buffer: Buffer<ArrayBuffer>,
  extension: 'jpg' | 'jpeg' | 'png' | 'webp',
) => {
  const compression = sharp(buffer);
  const modifyCompression = modificationMap[extension];
  modifyCompression(compression, 50);
  const compressedImageBuffer = await compression.toBuffer();
  return compressedImageBuffer;
};

export const compressObject = async (
  image: Uint8Array<ArrayBufferLike>,
  filename: string,
) => {
  const buffer = Buffer.from(image);
  const extension = getExtension(filename);
  const compressedImageBuffer = await compressImage(buffer, extension);
  return compressedImageBuffer;
};

export const getCorrelationId = (tags: Tag[] | undefined) => {
  const correlationId = tags?.find((tag) => tag.Key == 'correlationId');
  return correlationId?.Value || randomUUID();
};
