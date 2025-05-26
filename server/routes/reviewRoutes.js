import { Router } from 'express';
import { getReviews} from '../models/reviewModels.js';

const router = Router();
router.get("/lista", async (req, res) => { // Rota de pesquisa de reviews
    const reviews = await getReviews();
    res.send(reviews);
});

export default router;