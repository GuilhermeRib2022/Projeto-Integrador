import { Router } from 'express';
import { getComentarios, getComentario, deleteComentario, createComentario, editComentario } from '../models/comentarioModels.js';
import authenticateToken from '../services/Autenticacao.js';
const router = Router();

router.get("/lista", async (req, res) => { // Rota de pesquisa de comentarios
    const comentarios = await getComentarios();
    res.send(comentarios);
});

router.get("/:id", async (req, res) => { // Obter um comentario pelo seu ID
    try{

    //Verifica se o ID é válido
    if(!id || isNaN(id)) { // Verifica se o ID é válido
        return res.status(400).send({ message: "ID inválido" });
    }
    const id = req.params.id
    const comentarios = await getComentario(id);

    // Verifica se o comentário existe
    if(!comentarios || comentarios.length === 0) { 
        return res.status(404).send({ message: "Comentário não encontrado" });
    }
    res.send(comentarios);
    
    } catch (error) {
        console.error("Erro ao obter comentário:", error);
        res.status(404).send({ message: "Comentário não encontrado" });
    }
});

router.delete("/:id", authenticateToken, async (req, res) => { // Apagar um comentario pelo seu ID
    try{
        const id = req.params.id
        if(!id || isNaN(id)) { // Verifica se o ID é válido
            return res.status(400).send({ message: "ID inválido" });
        }

        //Verifica se o utilizador é dono do comentário ou é administrador
        const comentarioExiste = await getComentario(id);
        if(!comentarioExiste || comentarioExiste.length === 0) {
            return res.status(404).send({ message: "Comentário não encontrado" });
        }

        if(comentarioExiste[0].UtilizadorID !== req.user.id || req.user.cargo !== 'admin') {
            return res.status(403).send({ message: "Acesso negado. Apenas o autor do comentário pode apagá-lo." });
        }

        const comentarios = await deleteComentario(id);
        res.send(comentarios);
    } catch (error) {
        res.status(500).send({ message: "Erro ao apagar comentário" });
    }
});

router.post("", authenticateToken, async (req, res) => { // Rota de criação de review
    try {
        const UtilizadorID = req.user.id; // Assumindo que o ID do utilizador está disponível no token JWT
        const { VideoID, Texto } = req.body;
        if (!VideoID || !UtilizadorID || !Texto || Texto.length < 1 || typeof VideoID !== 'number' || typeof UtilizadorID !== 'number' || typeof Texto !== 'string') {
            return res.status(400).send({ message: "Comentário Inválido" });
        }

        const comentario = await createComentario(VideoID, UtilizadorID, Texto);
        res.status(201).send(comentario);
    }
    catch (error) {
        res.status(500).send({ message: "Erro ao criar comentário" });
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