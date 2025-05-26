import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './database.js';
import utilizadorRoutes from './routes/utilizadorRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import videoRoutes from './routes/videoRoutes.js';

dotenv.config();
const app = express();

app.use(cors()); // Permitir todas as origens
app.use(express.json()) // Permitir JSON no body


const PORT = process.env.PORT || 8080;


app.use("/utilizador", utilizadorRoutes);
app.use("/review", reviewRoutes);
app.use("/video", videoRoutes);

app.get("/ping", (req, res) => {
    res.json("pong")
});

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});