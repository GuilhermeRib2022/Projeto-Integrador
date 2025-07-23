import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import utilizadorRoutes from './routes/utilizadorRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import anotacaoRoutes from './routes/anotacaoRoutes.js';
import comentarioRoutes from './routes/comentarioRoutes.js';
import queryRoutes from './routes/queryRoutes.js';
import disciplinaRoutes from './routes/disciplinaRoutes.js';
import cargoRoutes from './routes/cargoRoutes.js';
import expressStatusMonitor from 'express-status-monitor'; //Importar informações do express

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

//Obter vídeos, fotos de perfil e outros ficheiros.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/ping", (req, res) => {
    res.json("pong")
});

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});