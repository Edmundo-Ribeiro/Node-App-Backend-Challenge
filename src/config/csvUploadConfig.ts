import multer from 'multer';
import path from 'path';

const tmpFolderPath = path.resolve(__dirname, '..', '..', 'tmp');

const storage = multer.diskStorage({
  destination: tmpFolderPath,
  filename(request, file, callback) {
    return callback(null, file.originalname);
  },
});

const csvUploadConfig = {
  directoryPath: tmpFolderPath,
  storage,
};

export default csvUploadConfig;
