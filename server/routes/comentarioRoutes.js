import { Router } from 'express';
import { getComentarios, getComentario, deleteComentario, createComentario, editComentario } from '../models/comentarioModels.js';
import authenticateToken from '../services/Autenticacao.js';
const router = Router();

router.get("/lista", async (req, res) => { // Rota de pesquisa de comentarios
    const comentarios = await getComentarios();
    res.send(comentarios);
});

router.get("/:id", async (req, res) => { // Obter um comentario pelo seu ID
    const id = req.params.id
    const comentarios = await getComentario(id);
    res.send(comentarios);
});

router.delete("/:id", async (req, res) => { // Obter um comentario pelo seu ID
    const id = req.params.id
    const comentarios = await deleteComentario(id);
    res.send(comentarios);
});

router.post("", authenticateToken, async (req, res) => { // Rota de criação de review
    try {
        const UtilizadorID = req.user.id; // Assumindo que o ID do utilizador está disponível no token JWT
        const { VideoID, Texto } = req.body;
        if (!VideoID || !UtilizadorID || !Texto || Texto.length < 1 || typeof VideoID !== 'number' || typeof UtilizadorID !== 'number') {
            return res.status(400).send({ message: "Comentário Inválido" });
        }

        const comentario = await createComentario(VideoID, UtilizadorID, Texto);
        res.status(201).send(comentario);
    }
    catch (error) {
        res.status(500).send({ message: "Erro ao criar review" });
    }
});

router.patch("/:id", async (req, res) => { // Rota de edição de Anotação
    try {
        const ID = req.params.id;
        const { VideoID, UtilizadorID, Texto } = req.body;

        if (!VideoID && !UtilizadorID && !Texto) {
            return res.status(400).send({ message: "Nenhum campo para atualizar" });
        }

        const comentario = await editComentario(ID, VideoID, UtilizadorID, Texto);
        res.status(200).send(comentario);
    } catch (error) {
        res.status(500).send({ message: "Erro ao editar anotação" });
    }
});

export default router;