import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios'; 
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
import fs from 'fs'; //FileSystem
import expressStatusMonitor from 'express-status-monitor'; //Importar informações do express
import os from 'os'; //Importar informações do servidor

dotenv.config();
const app = express();
app.use(expressStatusMonitor());

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


app.get('/estatisticas/sistema', (req, res) => {
  const stats = {
    uptime: os.uptime(), // segundos
    totalMemory: os.totalmem(), // bytes
    freeMemory: os.freemem(),   // bytes
    usedMemory: os.totalmem() - os.freemem(),
    loadAverage: os.loadavg(),  // [1min, 5min, 15min]
    cpus: os.cpus().length,
    platform: os.platform(),
    arch: os.arch()
  };

  res.json(stats);
});

//Obter vídeos, fotos de perfil e outros ficheiros.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/ping", (req, res) => {
    res.json("pong")
});

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});