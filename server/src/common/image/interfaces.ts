import { Initiatable, MulterFile } from '../types';

export interface IImageService extends Initiatable {
  upload(files: MulterFile): Promise<string>;
  delete(fileNames: string[]): Promise<void>;
}
