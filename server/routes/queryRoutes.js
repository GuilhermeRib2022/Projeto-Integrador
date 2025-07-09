import { Router } from 'express';
import { Query } from '../models/queryModels.js';
import { Video } from '../models/videoModels.js'
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

  //Obtém o ID do utilizador autenticado
  const userId = req.user?.id;

  // Verifica se o utilizador está autenticado
  if (!userId) {
    return res.status(401).json({ error: 'Utilizador não autenticado' });
  }

  //Obtém o título e descrição do vídeo
  const video = await Video.getVideo(videoId);
  const titulo = video?.Titulo || '';
  const descricao = video?.Descricao || '';

  // Processa com LLM, armazena na BDD e retorna a resposta
  const respostaLLM = await Query.processWithLLM(question, messages, titulo, descricao, videoId);

  //Guarda a pergunta e resposta na BDD
  if (respostaLLM.isNew) {
    await Query.create({ VideoID: videoId, UtilizadorID: userId, Pergunta: question, Resposta: respostaLLM.content, VideoTime: videoTime, Embedding: JSON.stringify(respostaLLM.embedding) });
  } else {
    await Query.create({ VideoID: videoId, UtilizadorID: userId, Pergunta: question, Resposta: respostaLLM.content, VideoTime: videoTime});
  }


  // Retorna a resposta da LLM
  res.json({ role: 'assistant', content: respostaLLM.content });
});

/*

router.post('/chat', authenticateToken, async (req, res) => {
  const { messages, videoId, question, videoTime } = req.body;

  //Obtém o ID do utilizador autenticado
  const userId = req.user?.id;

  // Verifica se o utilizador está autenticado
  if (!userId) {
    return res.status(401).json({ error: 'Utilizador não autenticado' });
  }

  //Obtém o título e descrição do vídeo
  const video = await Video.getVideo(videoId);
  const titulo = video?.Titulo || '';
  const descricao = video?.Descricao || '';

  // Processa com LLM, armazena na BDD e retorna a resposta
  const respostaLLM = await Query.processWithLLM(question, messages, titulo, descricao, videoId);

  //Guarda a pergunta e resposta na BDD
  await Query.create({ VideoID: videoId, UtilizadorID: userId, Pergunta: question, Resposta: respostaLLM.content, VideoTime: videoTime, });

  // Retorna a resposta da LLM
  res.json({ role: 'assistant', content: respostaLLM.content });
});
*/

export default router;