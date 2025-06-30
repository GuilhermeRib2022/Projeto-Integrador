import { Router } from 'express';
import {Review} from '../models/reviewModels.js';
import authenticateToken from '../services/Autenticacao.js';
import permit from '../services/verificarCargo.js';

const router = Router();
router.use(authenticateToken); // Verificar se o utilizador está autenticado

//OBTEM TODAS AS REVIEWS
router.get("/", permit("quam"), async (req, res) => { // Rota de pesquisa de reviews
    const reviews = await Review.getReviews();
    res.send(reviews);
});

//OBTER REVIEW POR ID
router.get("/:id", async (req, res) => { // Obter uma review pelo seu ID
    const ID = req.params.id
    const reviews = await Review.getReviewID(ID);
    if(!reviews) {
        return res.status(404).send({ message: "Review não encontrada" });
    }
    res.send(reviews);
});

//OBTER REVIEWS POR VIDEOID
router.get("/video/:id/lista", async (req, res) => { // Obter uma review pelo seu ID
    const videoID = req.params.id
    const reviews = await Review.getReviewVideo(videoID);
    if(!reviews) {
        return res.status(404).send({ message: "Review não encontrada" });
    }
    res.send(reviews);
});

//OBTER REVIEWS POR VIDEOID & UTILIZADORID
router.get("/video/:id", async (req, res) => { // Obter uma review pelo seu ID
    const videoID = req.params.id
    const utilizadorID = req.user.id; // ID do utilizador autenticado
    const reviews = await Review.getReview(utilizadorID, videoID);
    if(!reviews) {
        return res.status(404).send({ message: "Review não encontrada" });
    }
    res.send(reviews);
});

//ATUALIZAR/CRIAR REVIEW POR VIDEOID & UTILIZADORID
router.post("/video/:id", async (req, res) => { // Rota de criação de review
    try {
        const UtilizadorID = req.user.id; // Assumindo que o ID do utilizador está disponível no token JWT
        const VideoID = req.params.id; // O ID do vídeo é passado como parâmetro na rota
        const { Nota } = req.body;

        const notaValida = typeof Nota === 'number' && Nota >= 0 && Nota <= 10;
        if (!VideoID || !UtilizadorID || !notaValida) {
            console.error("Dados inválidos:", { VideoID, UtilizadorID, Nota });
            return res.status(400).send({ message: "Review Inválida" });
        }

        const comentario = await Review.adicionarReview(VideoID, UtilizadorID, Nota);
        res.status(201).send(comentario);
    }
    catch (error) {
        console.error('Erro ao criar review:', error);
        res.status(500).send({ message: "Erro ao criar review" });
    }
});

//APAGAR REVIEW POR VIDEOID & UTILIZADORID
router.delete("/video/:id", async (req, res) => { // Rota de apagar review
    const UtilizadorID = req.user.id; // ID do utilizador autenticado
    const VideoID = req.params.id; // O ID do vídeo é passado como parâmetro na rota

    if (!VideoID || !UtilizadorID ) {
        return res.status(400).send({ message: "Input Inválido" });
    }

    const success = await Review.deleteReview(UtilizadorID, VideoID);
    if(success) {
        res.status(200).send({ message: "Review apagada com sucesso" });
    } else {
        res.status(404).send({ message: "Review não encontrada" });
    }
});



export default router;