import { MulterFile } from '../types';
import { IImageService } from './interfaces';
import { inject } from 'inversify';
import { CONTAINER_IDS } from '../consts';
import {
  _Error,
  DeleteObjectsCommand,
  DeleteObjectsOutput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { internalError, toBase64 } from '../utils';
import { ILocalStorage } from '../localStorage';

const BUCKET_NAME = 'hunko-course-images';
const IMAGE_DIR = 'images';

export class ImageService implements IImageService {
  private s3Client?: S3Client;

  constructor(
    @inject(CONTAINER_IDS.S3_CLIENT_PROVIDER)
    private s3ClientProvider: () => Promise<S3Client>,
    @inject(CONTAINER_IDS.LOCAL_STORAGE) private localStorage: ILocalStorage,
  ) {}

  async init(): Promise<void> {
    this.s3Client = await this.s3ClientProvider();
  }

  async upload(file: MulterFile, file_prefix: string): Promise<string> {
    if (!this.s3Client) {
      throw new Error('You should init service firstly');
    }

    const name = `${file_prefix}_${this.generateFileName(file.mimetype)}`;

    const putCommand = new PutObjectCommand({
      Body: file.buffer,
      Bucket: BUCKET_NAME,
      Key: `${IMAGE_DIR}/${name}`,
      ContentType: file.mimetype,
      Tagging: `correlationId=${this.localStorage.getOrThrow('correlationId')}`,
    });
    await this.s3Client.send(putCommand);

    return name;
  }

  async delete(fileNames: string[]): Promise<void> {
    if (!this.s3Client) {
      throw new Error('You should init service firstly');
    }

    const objectsToDelete = fileNames.map((name) => ({
      Key: name,
    }));

    const deleteCommand = new DeleteObjectsCommand({
      Bucket: BUCKET_NAME,
      Delete: {
        Objects: objectsToDelete,
        Quiet: false,
      },
    });

    const response = await this.s3Client.send(deleteCommand);
    this.checkDeleteResponse(response);
  }

  private generateFileName(mime: string) {
    const type = mime.split('/')[1];
    const name = toBase64(randomUUID());
    return `${name}.${type}`;
  }

  private checkDeleteResponse(resp: DeleteObjectsOutput) {
    const errors = resp.Errors;
    if (errors) {
      this.handleDeleteErrors(errors);
    }
  }

  private handleDeleteErrors(errors: _Error[]) {
    const isNoSuchKeyOnly = errors.every((error) => error.Code === 'NoSuchKey');
    if (!isNoSuchKeyOnly) {
      throw internalError(this.createErrorMessage(errors));
    }
  }

  private createErrorMessage(errors: _Error[]) {
    return errors
      .filter((err) => err.Code !== 'NoSuchKey')
      .map((err) => err.Code)
      .join(', ');
  }
}
