import { Request, RequestHandler } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { badRequestError } from '../common/utils';

interface Params {
  fieldName: string;
  fileSize?: number;
  filesNumber?: number;
  allowedTypes?: string[];
}

const DEFAULT_FILE_SIZE = 1024 * 1024;
const DEFAULT_FILES_NUMBER = 1;

export const multipartFileUpload = ({
  fieldName,
  fileSize = DEFAULT_FILE_SIZE,
  filesNumber = DEFAULT_FILES_NUMBER,
  allowedTypes = ['png', 'jpg', 'jpeg'],
}: Params): RequestHandler => {
  const storage = multer.memoryStorage();
  const upload = multer({
    storage,
    limits: { fileSize },
    fileFilter: fileFilterProducer(allowedTypes),
  });

  return upload.array(fieldName, filesNumber);
};

function fileFilterProducer(allowedTypes: string[]) {
  return (
    _req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ) => {
    const extension = file.originalname.split('.')[1];
    console.log('mime types', { ext: extension, allowedTypes });

    if (!allowedTypes.includes(extension)) {
      callback(badRequestError('Invalid file type'));
      return;
    }
    callback(null, true);
  };
}
