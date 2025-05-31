import { Router } from 'express';
import { createReview, getReviews, getReview } from '../models/reviewModels.js';
import authenticateToken from '../services/Autenticacao.js';
import permit from '../services/verificarCargo.js';

const router = Router();
router.use(authenticateToken); // Verificar se o utilizador está autenticado

router.get("/lista", permit("quam"), async (req, res) => { // Rota de pesquisa de reviews
    const reviews = await getReviews();
    res.send(reviews);
});

router.get("/:id", async (req, res) => { // Obter uma review pelo seu ID
    const id = req.params.id
    const reviews = await getReview(id);
    res.send(reviews);
});

router.post("", async (req, res) => { // Rota de criação de review
    try {
        const { VideoID, UtilizadorID, Nota } = req.body;
        if (!VideoID || !UtilizadorID || !Nota || Nota < 0 || Nota > 5 || typeof VideoID !== 'number' || typeof UtilizadorID !== 'number' || typeof Nota !== 'number') {
            return res.status(400).send({ message: "Input Inválido" });
        }

        const review = await createReview(VideoID, UtilizadorID, Nota);
        res.status(201).send(review);
    }
    catch (error) {
        res.status(500).send({ message: "Erro ao criar review" });
    }
});

export default router;