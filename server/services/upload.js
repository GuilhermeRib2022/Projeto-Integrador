import multer from 'multer';
import path from 'path';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (LIMITE DO TAMANHO DOS FICHEIROS)

// Armazenamento de vídeos, thumbnails e PDFs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'video') cb(null, 'uploads/videos');
    else if (file.fieldname === 'thumbnail') cb(null, 'uploads/thumbnails');
    else if (file.fieldname === 'fonte') cb(null, 'uploads/fonte');
    else cb(new Error('Tipo de ficheiro inválido'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); //Obtem extensão do ficheiro
    const name = `${Date.now()}-${file.fieldname}${ext}`; //Obtem a data atual
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const isVideo = file.fieldname === 'video' && file.mimetype.startsWith('video/'); //O tipo de ficheiro deve ser vídeo
  const isImage = file.fieldname === 'thumbnail' && file.mimetype.startsWith('image/') && file.mimetype !== 'image/svg+xml'; //SEM SVG COMO THUMBNAIL
  const isPdf = file.fieldname === 'fonte' && file.mimetype === 'application/pdf'; //O tipo de ficheiro deve ser  um pdf

  if (isVideo || isImage || isPdf) cb(null, true); //Caso não seja nenhuma das opções
  else cb(new Error('Tipo de ficheiro inválido'));
};

// Middleware do multer
const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });

export default upload;


