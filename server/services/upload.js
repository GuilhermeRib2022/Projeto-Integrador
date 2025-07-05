
import multer from 'multer';
import path from 'path';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

// Armazenamento de vídeos
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'video') cb(null, 'uploads/videos');
    else if (file.fieldname === 'thumbnail') cb(null, 'uploads/thumbnails');
    else cb(new Error('Tipo de ficheiro inválido'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const isVideo = file.fieldname === 'video' && file.mimetype.startsWith('video/');
  const isImage = file.fieldname === 'thumbnail' && file.mimetype.startsWith('image/') && file.mimetype !== 'image/svg+xml';
  
  if (isVideo || isImage) cb(null, true);
  else cb(new Error('Tipo de ficheiro inválido'));
};

// Middleware do multer
const upload = multer({ storage: videoStorage, fileFilter, limits: { fileSize: MAX_FILE_SIZE },  });

export default upload;
