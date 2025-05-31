import { Router } from 'express';
 import { getAnotacoes, getAnotacao, deleteAnotacao, createAnotacao, editAnotacao } from '../models/anotacaoModels.js';
import authenticateToken from '../services/Autenticacao.js';
 const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);

 router.get("/lista", async (req, res) => { // Rota de pesquisa de Anotações
    const anotacoes = await getAnotacoes();
    res.send(anotacoes);
});

router.get("/:id", async (req, res) => { // Rota de obter de Anotações por ID
    const id = req.params.id;
    try{
    const anotacoes = await getAnotacao(id);
    res.send(anotacoes);
    } catch (error) {
        res.status(404).send({ message: "Anotação não encontrada" });
    }
});

router.delete("/:id", async (req, res) => { // Rota de apagar Anotação
    const id = req.params.id;
    const success = await deleteAnotacao(id);
    if(success){
        res.status(200).send({ message: "Anotação apagada com sucesso" });
    } else {
        res.status(404).send({ message: "Anotação não encontrada" });
    }
});

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

export default router;