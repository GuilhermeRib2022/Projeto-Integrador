import { Router } from 'express';
import {mediaReview} from '../models/videoModels.js'

const router = Router();

router.get("/review/:id", async (req, res) => { 
    const id = req.params.id
    const videos = await mediaReview(id)
    res.send(videos)
})

export default router;