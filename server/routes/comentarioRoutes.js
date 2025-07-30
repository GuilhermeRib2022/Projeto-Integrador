import { Router } from 'express';
import { Comentario } from '../models/comentarioModels.js';
import authenticateToken from '../services/Autenticacao.js';
import verificarCargo from '../services/verificarCargo.js';
const router = Router();

function parsePositiveInt(value, defaultValue) {
  const parsed = parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : defaultValue;
}

//OBTER TODAS OS COMENTÁRIOS
router.get("/", authenticateToken, verificarCargo(3), async (req, res) => {
    const comentarios = await Comentario.getComentarios();
    res.send(comentarios);
});

//OBTER COMENTÁRIO POR ID
router.get("/:id", async (req, res) => {
    try {

        //Verifica se o ID é válido

        const id = req.params.id
        const comentarios = await Comentario.getComentario(id);

        // Verifica se o comentário existe
        if (!comentarios || comentarios.length === 0) {
            return res.status(404).send({ message: "Comentário não encontrado" });
        }
        res.send(comentarios);

    } catch (error) {
        console.error("Erro ao obter comentário:", error);
        res.status(404).send({ message: "Comentário não encontrado" });
    }
});

//APAGAR COMENTÁRIO POR ID
router.delete("/:id", authenticateToken, async (req, res) => { // Apagar um comentario pelo seu ID
    try {
        const id = req.params.id

        const comentarioExiste = await Comentario.getComentario(id);
        if (!comentarioExiste || comentarioExiste.length === 0) {
            return res.status(404).send({ message: "Comentário não encontrado" });
        }

        //Verifica se o utilizador é dono do comentário ou é administrador
        if (comentarioExiste.UtilizadorID !== req.user.id && req.user.cargo !== 3) {
            return res.status(403).send({ message: "Acesso negado. Apenas o autor do comentário pode apagá-lo." });
        }

        const comentarios = await Comentario.deleteComentario(id);
        res.send(comentarios);
    } catch (error) {
        res.status(500).send({ message: "Erro ao apagar comentário" });
    }
});

//OBTER COMENTÁRIOS POR VIDEOID
router.get("/video/:id", async (req, res) => {
  try {
    const videoId = req.params.id;
    // pegar página e limite da query string, defaults
    const page = parsePositiveInt(req.query.page, 1);
    const limit = parsePositiveInt(req.query.limit, 10);
    const offset = (page - 1) * limit;

    const comentarios = await Comentario.getComentariosVideo(videoId, limit, offset);
    res.send(comentarios);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao obter comentários');
  }
});




//CRIAR COMENTÁRIO POR VIDEOID & UTILIZADORID
router.post("/video/:id", authenticateToken, async (req, res) => { // Rota de criação de review
    try {
        const UtilizadorID = req.user.id; // Assumindo que o ID do utilizador está disponível no token JWT
        const VideoID = req.params.id; // O ID do vídeo é passado como parâmetro na rota
        const { Texto } = req.body;

        if(Texto.length>128){
          return res.status(400).send({ message: "Comentários devem ter menos de 128 caractéres" });
        }

        if (!VideoID || !UtilizadorID || !Texto || Texto.length < 1 || typeof Texto !== 'string') {
            console.error('Erro ao criar comentário: Parâmetros inválidos', { VideoID, UtilizadorID, Texto });
            return res.status(400).send({ message: "Comentário Inválido" });
        }

        const comentario = await Comentario.createComentario(VideoID, UtilizadorID, Texto);
        res.status(201).send(comentario);
    }
    catch (error) {
        console.error('Erro interno ao criar comentário:', error);
        res.status(500).send({ message: "Erro ao criar comentário" });
    }
});

// Atualizar comentário por ID
router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const ID = req.params.id;
    const { Texto } = req.body;

    if (!Texto) {
      return res.status(400).send({ message: "O campo Texto é obrigatório para atualização." });
    }
    
    if (Texto.length > 128) {
      return res.status(400).send({ message: "Comentários devem ter menos de 128 caractéres" });
    }

    // Busca o comentário pelo ID (deve retornar um único comentário)
    const comentarioExiste = await Comentario.getComentario(ID);

    if (!comentarioExiste) {
      return res.status(404).send({ message: "Comentário não encontrado" });
    }

    // Verifica permissão: só autor ou admin pode editar
    if ((comentarioExiste.UtilizadorID !== req.user.id && req.user.cargo !== 3)) {
      return res.status(403).send({ message: "Acesso negado. Apenas o autor ou admin podem editar este comentário." });
    }

    // Chama o model para editar
    const comentarioAtualizado = await Comentario.editComentarioID(ID, Texto);

    res.status(200).send(comentarioAtualizado);
  } catch (error) {
    console.error('Erro ao editar comentário:', error);
    res.status(500).send({ message: "Erro ao editar comentário" });
  }
});

export default router;