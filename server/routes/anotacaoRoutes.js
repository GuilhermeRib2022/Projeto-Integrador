import { Router } from 'express';
import {Anotacao} from '../models/anotacaoModels.js';
import authenticateToken from '../services/Autenticacao.js';
import verificarCargo from '../services/verificarCargo.js';
const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);


//OBTER ANOTAÇÕES POR UserID
router.get("/user", authenticateToken, async (req, res) => {
    const UtilizadorID = req.user.id;
    try {
        const anotacao = await Anotacao.getAnotacaoUser(UtilizadorID);
        res.send(anotacao);
    } catch (error) {
        res.status(404).send({ message: "Anotação não encontrada" });
    }
});

//OBTER TODAS AS ANOTAÇÕES
router.get("/", verificarCargo(3), async (req, res) => {
    const anotacoes = await Anotacao.getAnotacoes();
    res.send(anotacoes);
});

//OBTER ANOTAÇÃO POR ID
router.get("/:id", verificarCargo(3), async (req, res) => {
    const id = req.params.id;
    try {
        const anotacao = await Anotacao.getAnotacaoID(id);
        res.send(anotacao);
    } catch (error) {
        res.status(404).send({ message: "Anotação não encontrada" });
    }
});



//APAGAR ANOTAÇÃO POR ID
router.delete("/:id", verificarCargo(3), async (req, res) => { // Rota de apagar Anotação
    const id = req.params.id;
    const success = await Anotacao.deleteAnotacao(id);
    if (success) {
        res.status(200).send({ message: "Anotação apagada com sucesso" });
    } else {
        res.status(404).send({ message: "Anotação não encontrada" });
    }
});

//OBTER ANOTAÇÃO POR VIDEOID & UTILIZADORID
router.get("/video/:id", authenticateToken, async (req, res) => { // Rota de criação de review
    try {
        const UtilizadorID = req.user.id; // Assumindo que o ID do utilizador está disponível no token JWT
        const VideoID = req.params.id; // O ID do vídeo é passado como parâmetro na rota
        if (!VideoID || !   UtilizadorID) {
            return res.status(400).send({ message: "Comentário Inválido" });
        }

        const comentario = await Anotacao.getAnotacao(VideoID, UtilizadorID);
        res.status(201).send(comentario);
    }
    catch (error) {
        console.error('Erro ao criar review:', error);
        res.status(500).send({ message: "Erro ao criar review" });
    }
});

//ATUALIZAR/CRIAR ANOTAÇÃO POR VIDEOID & UTILIZADORID
router.put("/video/:id", authenticateToken, async (req, res) => {
    try {
        const UtilizadorID = req.user.id;
        const VideoID = req.params.id; // O ID do vídeo é passado como parâmetro na rota
        const { Texto } = req.body;

        if (!VideoID || !UtilizadorID || typeof Texto !== 'string') {
            return res.status(400).send({ message: "Input Inválido" });
        }
        const anotacao = await Anotacao.adicionarAnotacao(VideoID, UtilizadorID, Texto);
        res.status(200).send(anotacao);
    } catch (error) {
        console.error('Erro ao salvar anotação:', error);
        res.status(500).send({ message: "Erro ao salvar anotação" });
    }
});


/*
router.post("", async (req, res) => { // Rota de criação de Anotação
    try {
        const { VideoID, UtilizadorID, Texto } = req.body;
        if (!VideoID || !UtilizadorID || !Texto || typeof VideoID !== 'number' || typeof UtilizadorID !== 'number' || typeof Texto !== 'string') {
            return res.status(400).send({ message: "Input Inválido" });
        }
        const anotacao = await createAnotacao(VideoID, UtilizadorID, Texto);
        res.status(201).send(anotacao);
    } catch (error) {
        res.status(500).send({ message: "Erro ao criar anotação" });
    }
});

router.patch("/:id", async (req, res) => { // Rota de edição de Anotação
    try {
        const ID = req.params.id;
        const { VideoID, UtilizadorID, Texto } = req.body;

        if (!VideoID && !UtilizadorID && !Texto) {
            return res.status(400).send({ message: "Nenhum campo para atualizar" });
        }

        const anotacao = await editAnotacao(ID, VideoID, UtilizadorID, Texto);
        res.status(200).send(anotacao);
    } catch (error) {
        res.status(500).send({ message: "Erro ao editar anotação" });
    }
});
*/
export default router;