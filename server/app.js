import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import cors from 'cors';
import dotenv from 'dotenv';
import pool from './database.js';
import utilizadorRoutes from './routes/utilizadorRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import anotacaoRoutes from './routes/anotacaoRoutes.js';
import comentarioRoutes from './routes/comentarioRoutes.js';
import queryRoutes from './routes/queryRoutes.js';
import disciplinaRoutes from './routes/disciplinaRoutes.js';
import cargoRoutes from './routes/cargoRoutes.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';

dotenv.config();
const app = express();

app.use(cors()); // Permitir todas as origens
app.use(express.json()) // Permitir JSON no body
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8080;

//CLASSES
app.use("/utilizador", utilizadorRoutes);
app.use("/review", reviewRoutes);
app.use("/video", videoRoutes);
app.use("/anotacao", anotacaoRoutes);
app.use("/comentario", comentarioRoutes);
app.use("/query", queryRoutes);
app.use("/disciplina", disciplinaRoutes);
app.use("/cargo", cargoRoutes);


app.get('/uploads/videos/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads/videos', req.params.filename);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      return res.sendStatus(404);
    }

    const range = req.headers.range;
    const contentType = 'video/mp4';

    if (!range) {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stats.size,
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunkSize = (end - start) + 1;

      const file = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
      });

      file.pipe(res);
    }
  });
});

//Obter vídeos e fotos de perfil
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/ping", (req, res) => {
    res.json("pong")
});


app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});