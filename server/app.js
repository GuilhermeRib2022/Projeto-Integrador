import express from 'express';
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
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();

app.use(cors()); // Permitir todas as origens
app.use(express.json()) // Permitir JSON no body


const PORT = process.env.PORT || 8080;


app.use("/utilizador", utilizadorRoutes);
app.use("/review", reviewRoutes);
app.use("/video", videoRoutes);
app.use("/anotacao", anotacaoRoutes);
app.use("/comentario", comentarioRoutes);
app.use("/query", queryRoutes);
app.use("/disciplina", disciplinaRoutes);

//Obter vídeos e fotos de perfil
app.use('/uploads', express.static('uploads'));

app.get("/ping", (req, res) => {
    res.json("pong")
});


app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});