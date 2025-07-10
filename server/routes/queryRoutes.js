import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import util from 'util';
import { Router } from 'express';
import { Query } from '../models/queryModels.js';
import { Video } from '../models/videoModels.js'
import authenticateToken from '../services/Autenticacao.js';
const router = Router();

const execPromise = promisify(exec);

function extractFrame(videoPath, videoTime, framePath) {
  const ffmpegPath = 'C:\\ffmpeg\\ffmpeg.exe';
  const cmd = `"${ffmpegPath}" -ss ${videoTime} -i "${videoPath}" -frames:v 1 -q:v 2 "${framePath}" -y`;
  return execPromise(cmd);
}

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
  const fonte = video?.TextoFonte || '';

  // Processa com LLM, armazena na BDD e retorna a resposta
  const respostaLLM = await Query.processWithLLM(question, messages, titulo, descricao, videoId, fonte);

  //Guarda a pergunta e resposta na BDD
  if (respostaLLM.isNew) {
    await Query.create({ VideoID: videoId, UtilizadorID: userId, Pergunta: question, Resposta: respostaLLM.content, VideoTime: videoTime, Embedding: JSON.stringify(respostaLLM.embedding) });
  } else {
    await Query.create({ VideoID: videoId, UtilizadorID: userId, Pergunta: question, Resposta: respostaLLM.content, VideoTime: videoTime});
  }


  // Retorna a resposta da LLM
  res.json({ role: 'assistant', content: respostaLLM.content });
});



router.post('/chatimage', authenticateToken, async (req, res) => {
  const { videoId, question, videoTime } = req.body;
  const userId = req.user?.id;
  const VIDEO_DIR = path.resolve('uploads/videos');
  const FRAME_DIR = path.resolve('uploads/frames');

  if (!userId) return res.status(401).json({ error: 'Utilizador não autenticado' });

  const video = await Video.getVideo(videoId);
  if (!video || !video.VideoPath) return res.status(404).json({ error: 'Vídeo não encontrado' });

  const videoPath = path.resolve(VIDEO_DIR, video.VideoPath);
  const framePath = path.resolve(FRAME_DIR, `frame-${videoId}-${videoTime}.jpg`);

  try {
    if (!fs.existsSync(FRAME_DIR)) fs.mkdirSync(FRAME_DIR, { recursive: true });

    // Extrai o frame
    await extractFrame(videoPath, videoTime, framePath);

    // Processa com LLM já passando a imagem pronta
    const respostaLLM = await Query.imageWithLLM(question, videoId, video.Titulo, video.Descricao, video.TextoFonte, videoTime);

    // Guarda na base de dados
    if (respostaLLM.isNew) {
      await Query.create({ VideoID: videoId, UtilizadorID: userId, Pergunta: question, Resposta: respostaLLM.content, VideoTime: videoTime});
    } else {
      await Query.create({ VideoID: videoId, UtilizadorID: userId, Pergunta: question, Resposta: respostaLLM.content, VideoTime: videoTime });
    }

    res.json({ role: 'assistant', content: respostaLLM.content });

  } catch (err) {
    console.error('Erro no chatimage:', err);
    res.status(500).json({ error: 'Erro ao processar imagem e gerar resposta.' });
  } finally {
      fs.existsSync(framePath) ? fs.unlinkSync(framePath) : ''
  }
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