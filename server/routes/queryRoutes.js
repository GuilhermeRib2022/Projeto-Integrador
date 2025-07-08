import { Router } from 'express';
import { Query } from '../models/queryModels.js';
import {Video} from '../models/videoModels.js'
import authenticateToken from '../services/Autenticacao.js';
const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const querys = await Query.getQuerys();
    res.json(querys);
  } catch (error) {
    console.error('Erro ao obter querys:', error);
    res.status(500).json({ error: 'Erro ao obter querys' });
  }
});

router.post('/chat', authenticateToken, async (req, res) => {
  const { messages, videoId, question, videoTime } = req.body;

  // Pegue o userId do token JWT no req.user (exemplo)
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Utilizador não autenticado' });
  }
    //Obtém o título e descrição do vídeo
    const video = await Video.getVideo(videoId);
    const titulo = video?.Titulo || '';
    const descricao = video?.Descricao || '';

  // Processa com LLM, armazena no banco e retorna a resposta
  const respostaLLM = await Query.processWithLLM(messages, titulo, descricao);

  await Query.create({
    VideoID: videoId,
    UtilizadorID: userId,
    Pergunta: question,
    Resposta: respostaLLM.content,
    VideoTime: videoTime,
  });

  res.json({ role: 'assistant', content: respostaLLM.content });
});


export default router;