import { Router } from 'express';
import {Video} from '../models/videoModels.js'
import authenticateToken from '../services/Autenticacao.js';

const router = Router();

router.get("/", async (req, res) => {
    const videos = await Video.getVideos()
    res.send(videos)
})



router.get("/search", async (req, res) => {
    const texto = req.query.texto;
    const disciplina = req.query.disciplina;
    let videos;
    if(!disciplina){
        videos = await Video.getSearch(texto);
    }else if(!texto){
        videos = await Video.getDisciplina(disciplina);
    } else {
        videos = await Video.getVideoDisciplina(texto, disciplina);
    }
    

    //Enviar resposta com video e texto enviado
    res.send(videos);

});


/*
router.get("/search", async (req, res) => {
    const texto = req.query.texto;
    const videos = await searchVideo(texto);

    //Enviar resposta com video e texto enviado
    res.send(videos);

});

*/

router.get("/search", async (req, res) => {
    const texto = req.query.texto;
    const disciplina = req.query.disciplina;

    const videos = await Video.searchVideoDisciplina(texto,disciplina);

    res.send(videos);
});

router.get("/:id", async (req, res) => { 
    const id = req.params.id
    const videos = await Video.getVideo(id)
    res.send(videos)
})

router.get("/:id/reviewMedia", async (req, res) => { 
    const id = req.params.id
    const videos = await Video.VideoReviewMedia(id)
    res.send(videos)
})

router.get("/:id/reviews", async (req, res) => { 
    const id = req.params.id
    const videos = await Video.VideoReviews(id)
    res.send(videos)
})

router.post("/search", async (req, res) => {
    const {Texto} = req.body;
    const videos = await Video.searchVideo(Texto)
    res.send(videos)
})

/*
router.get("/search/:text", async (req, res) => {
    const Texto = req.params.text;
    const videos = await searchVideo(Texto)
    res.send(videos)
})
*/



router.post("/search/disciplina/:id", async (req, res) => {
    const DisciplinaID = req.params.id;
    const {Texto} = req.body;
    const videos = await Video.searchVideoDisciplina(Texto, DisciplinaID)
    res.send(videos)
})

export default router;

/*
router.post("/:id/review", authenticateToken, async (req, res) => { // Rota de criação de review
    try {
        const UtilizadorID = req.user.id; // Assumindo que o ID do utilizador está disponível no token JWT
        const VideoID = req.params.id; // O ID do vídeo é passado como parâmetro na rota
        const {Nota} = req.body;
        if (!VideoID || !UtilizadorID || !Nota || Nota < 0 || Nota > 5 || typeof Nota !== 'number') {
            return res.status(400).send({ message: "Review Inválida" });
        }

        const comentario = await createVideoReview(VideoID, UtilizadorID, Nota);
        res.status(201).send(comentario);
    }
    catch (error) {
        console.error('Erro ao criar review:', error);
        res.status(500).send({ message: "Erro ao criar review" });
    }
});

router.get("/:id/comentarios", async (req, res) => { 
    const id = req.params.id
    const videos = await getVideoComentarios(id)
    res.send(videos)
})
    
router.post("/:id/comentar", authenticateToken, async (req, res) => { // Rota de criação de review
    try {
        const UtilizadorID = req.user.id; // Assumindo que o ID do utilizador está disponível no token JWT
        const VideoID = req.params.id; // O ID do vídeo é passado como parâmetro na rota
        const {Texto } = req.body;
        if (!VideoID || !UtilizadorID || !Texto || Texto.length < 1) {
            return res.status(400).send({ message: "Comentário Inválido" });
        }

        const comentario = await createVideoComentario(VideoID, UtilizadorID, Texto);
        res.status(201).send(comentario);
    }
    catch (error) {
        console.error('Erro ao criar review:', error);
        res.status(500).send({ message: "Erro ao criar review" });
    }
});

router.post("/:id/anotar", authenticateToken, async (req, res) => { // Rota de criação de review
    try {
        const UtilizadorID = req.user.id; // Assumindo que o ID do utilizador está disponível no token JWT
        const VideoID = req.params.id; // O ID do vídeo é passado como parâmetro na rota
        const {Texto} = req.body;
        if (!VideoID || !UtilizadorID || !Texto || Texto.length < 1) {
            return res.status(400).send({ message: "Comentário Inválido" });
        }

        const comentario = await createVideoAnotacao(VideoID, UtilizadorID, Texto);
        res.status(201).send(comentario);
    }
    catch (error) {
        console.error('Erro ao criar review:', error);
        res.status(500).send({ message: "Erro ao criar review" });
    }
});

router.get("/:id/anotacao", authenticateToken, async (req, res) => { // Rota de criação de review
    try {
        const UtilizadorID = req.user.id; // Assumindo que o ID do utilizador está disponível no token JWT
        const VideoID = req.params.id; // O ID do vídeo é passado como parâmetro na rota
        if (!VideoID || !UtilizadorID) {
            return res.status(400).send({ message: "Comentário Inválido" });
        }

        const comentario = await getAnotacao(VideoID, UtilizadorID);
        res.status(201).send(comentario);
    }
    catch (error) {
        console.error('Erro ao criar review:', error);
        res.status(500).send({ message: "Erro ao criar review" });
    }
});

*/



//IMPORTANTE: Upload de vídeo. Requer multer
/* Utilizador envia o vídeo com o título, descrição, disciplina e ficheiro de vídeo e thumbnail.
    O vídeo é guardado na pasta uploads/videos e a thumbnail na pasta uploads/thumbnails.
    O vídeo é guardado na base de dados com o título, descrição, disciplina e localização do vídeo e thumbnail.
    A disciplina é guardada como ID na base de dados.
    O utilizador é guardado na base de dados como ID do utilizador que enviou o vídeo.
    O utilizador deve autenticado com JWT e deve ser professor.

*/

//Falta: Apagar Review, Atualizar Review, Apagar Comentário, Atualizar Comentário, Apagar Anotação, Atualizar Anotação
//Basicamente atualizar review quando uma já existe.
