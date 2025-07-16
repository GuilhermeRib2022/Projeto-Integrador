import { Router } from 'express';
import {Video} from '../models/videoModels.js'
import authenticateToken from '../services/Autenticacao.js';
import express from 'express';
import upload from '../services/upload.js';
import { PdfReader } from "pdfreader";
import { fileURLToPath } from 'url';
import fs from "fs";
import getVideoDuration from '../services/getVideoDuration.js';
import verificarCargo from '../services/verificarCargo.js';
import path from 'path';
import multer from 'multer';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//OBTER TEXTO DE UM PDF
async function extrairTextoPdf(caminhoPdf) {
  return new Promise((resolve, reject) => {
    let textoCompleto = "";

    new PdfReader().parseFileItems(caminhoPdf, (err, item) => {
      if (err) {
        reject(err);
      } else if (!item) {
        resolve(textoCompleto);
      } else if (item.text) {
        textoCompleto += item.text + " ";
      }
    });
  });
}

//ROTA PARA PUBLICAR VIDEO
router.post('/publicar',verificarCargo(2,3), authenticateToken, (req, res, next) => {
  upload.fields([ { name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }, { name: 'fonte', maxCount: 1 } ])(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Erro no upload: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: `Erro no ficheiro: ${err.message}` });
    }
    next();
  });
},
async (req, res) => {
  try {
    const { titulo, descricao, disciplina } = req.body;
    const utilizadorID = req.user.id;
    const video = req.files['video']?.[0]?.filename;
    const thumbnail = req.files['thumbnail']?.[0]?.filename || null;
    const fonte = req.files['fonte']?.[0]?.filename || null;

    if (!titulo || !disciplina || !video) {
      return res.status(400).json({ message: 'Campos obrigatórios em falta' });
    }

    if (titulo.length > 64 || titulo.length < 4) {
      return res.status(400).json({ message: 'Tamanho do título deve ficar entre 4 e 64 caractéres.' });
    }


    const fullPath = path.join('uploads/videos', video);
    const duracao = await getVideoDuration(fullPath);

    let textoFonte = null;
    if (fonte) {
      const fontePath = path.join('uploads/fonte', fonte);
      textoFonte = await extrairTextoPdf(fontePath);
    }

    const result = await Video.publicarVideo(disciplina, utilizadorID, titulo, descricao, video, thumbnail, duracao, fonte, textoFonte);

    res.status(201).json({ message: 'Vídeo publicado com sucesso', videoID: result });
  } catch (err) {
    console.error('Erro ao publicar vídeo:', err);
    res.status(500).json({ message: 'Erro interno ao publicar vídeo' });
  }
});


/*
//Rota para publicar um vídeo
router.post('/publicar',   authenticateToken, (req, res, next) => {upload.fields([ { name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 } ])(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: `Erro no upload: ${err.message}` });
      } else if (err) {
        return res.status(400).json({ message: `Erro no ficheiro: ${err.message}` });
      }
      next(); //Segue para a próxima etapa
    });
  },
  async (req, res) => {
    try {
      const { titulo, descricao, disciplina } = req.body;
      const utilizadorID = req.user.id;
      const video = req.files['video']?.[0]?.filename;
      const thumbnail = req.files['thumbnail']?.[0]?.filename || null;

      if (!titulo || !disciplina || !video) {
        return res.status(400).json({ message: 'Campos obrigatórios em falta' });
      }

        const fullPath = path.join('uploads/videos', video);
        const duracao = await getVideoDuration(fullPath); 

        const result = await Video.publicarVideo(disciplina, utilizadorID, titulo, descricao, video, thumbnail, duracao);

        res.status(201).json({ message: 'Vídeo publicado com sucesso', videoID: result  });
    } catch (err) {
        console.error('Erro ao publicar vídeo:', err);
      res.status(500).json({ message: 'Erro interno ao publicar vídeo' });
    }
  }
);
*/

//Obter estatísticas de vídeo
router.get('/estatisticas/:id', verificarCargo(2,3), authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const estatisticas = await Video.getEstatisticasById(id);

    if (!estatisticas) {
      return res.status(404).json({ message: 'Vídeo não encontrado' });
    }

    res.json(estatisticas);
  } catch (err) {
    console.error('Erro ao obter estatísticas do vídeo:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

//ATUALIZAR VíDEO
router.put('/editar/:id', authenticateToken, verificarCargo(2,3), (req, res, next) => {
  upload.fields([{ name: 'thumbnail', maxCount: 1 },{ name: 'fonte', maxCount: 1 }])(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Erro no upload: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: `Erro no ficheiro: ${err.message}` });
    }
    next();
  });
}, async (req, res) => {
  try {
    const videoID = req.params.id;
    const utilizador = { id: req.user.id, cargoID: req.user.cargo};

    const { titulo, descricao, disciplina } = req.body;
    const thumbnail = req.files?.['thumbnail']?.[0]?.filename;
    const fonte = req.files?.['fonte']?.[0]?.filename; 
    let textoFonte = null;

    const videoExiste = await Video.getVideo(req.params.id);
    if (videoExiste.UtilizadorID !== req.user.id && req.user.cargo !== 'admin') {
      return res.status(403).send({ message: "Acesso negado. Apenas o autor do vídeo pode alterá-lo." });
    }


    if (titulo.length > 64 || titulo.length < 4) {
      return res.status(400).json({ message: 'Tamanho do título deve ficar entre 4 e 64 caractéres.' });
    }


    if (fonte) {
      const caminhoCompletoFonte = path.join(__dirname, '..', 'uploads', 'fonte', fonte);
      textoFonte = await extrairTextoPdf(caminhoCompletoFonte);
    }

    await Video.editarVideo(videoID, utilizador, { titulo, descricao, disciplina, thumbnail, fonte, textoFonte });

    res.status(200).json({ message: 'Vídeo atualizado com sucesso!' });
  } catch (err) {
    console.error('Erro ao editar vídeo:', err.message);
    res.status(500).json({ message: err.message || 'Erro ao editar vídeo' });
  }
});


//Rota para adicionar uma visualização
router.post('/:id/view', async (req, res) => {
  const videoID = req.params.id;
  try {
    await Video.visualizar(videoID);
    res.status(200).send({ message: 'Visualização registrada com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Erro ao registrar visualização' });
  }
});

//OBTER Video POR UserID
router.get("/user", authenticateToken, async (req, res) => {
    const UtilizadorID = req.user.id;
    try {
        const video = await Video.getVideosUser(UtilizadorID);
        res.send(video);
    } catch (error) {
        res.status(404).send({ message: "Vídeos não encontrados" });
    }
});

//Obter todos os vídeos
router.get("/", async (req, res) => {
    const videos = await Video.getVideos()
    res.send(videos)
})

//Obter vídeos da página home (Mais vistos, melhor avaliados, mais recentes, 2 disciplinas aleatórias)
router.get("/home", async (req, res) => {
  try {
    const maisRelevante = await Video.getVideosRelevante();    
    const maisVistos = await Video.getVideosView();      
    const melhorAvaliados = await Video.getVideosReview();    
    const recentes = await Video.getVideosDate();      
    const Disciplina1 = await Video.getVidoesDisciplina();  
    const Disciplina2 = await Video.getVidoesDisciplina();  
    res.json({
      maisRelevante,
      maisVistos,
      melhorAvaliados,
      recentes,
      Disciplina1, 
      Disciplina2,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao buscar vídeos");
  }
});

//Pesquisar video por disciplina ou título ou ambos 
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

//Pesquisar video por disciplina ou título ou ambos  (Usado na página de disciplina)
router.get("/disciplina", async (req, res) => {
    const texto = req.query.texto;
    const disciplina = req.query.disciplina;
    let videos;
    if(!disciplina){
        videos = await Video.getSearch(texto);
    }else if(!texto){
        videos = await Video.getDisciplinaExact(disciplina);
    } else {
        videos = await Video.getVideoDisciplina(texto, disciplina);
    }
    
    //Enviar resposta com video e texto enviado
    res.send(videos);

});

//Pesquisar videos
router.get("/search", async (req, res) => {
    const texto = req.query.texto;
    const disciplina = req.query.disciplina;

    const videos = await Video.searchVideoDisciplina(texto,disciplina);

    res.send(videos);
});

//obter vídeo por ID
router.get('/:id', async (req, res) => {
  const videoID = req.params.id;
  try {
    const video = await Video.getVideo(videoID); 

    if (!video) {
      return res.status(404).json({ message: 'Vídeo não encontrado' });
    }

    res.json(video);
  } catch (err) {
    console.error('Erro ao buscar vídeo:', err);
    res.status(500).json({ message: 'Erro ao buscar vídeo' });
  }
});

//obter média das reviews de video
router.get("/:id/reviewMedia", async (req, res) => { 
    const id = req.params.id
    const videos = await Video.VideoReviewMedia(id)
    res.send(videos)
})

//Obter reviews de vídeo
router.get("/:id/reviews", async (req, res) => { 
    const id = req.params.id
    const videos = await Video.VideoReviews(id)
    res.send(videos)
})

//pesquisar videos
router.post("/search", async (req, res) => {
    const {Texto} = req.body;
    const videos = await Video.searchVideo(Texto)
    res.send(videos)
})

//pesquisar videos por disciplina
router.post("/search/disciplina/:id", async (req, res) => {
    const DisciplinaID = req.params.id;
    const {Texto} = req.body;
    const videos = await Video.searchVideoDisciplina(Texto, DisciplinaID)
    res.send(videos)
})


//Obter videos com ID de utilizador
router.get("/utilizador/:id", async (req, res) => {
    const UtilizadorID = req.params.id;
    const videos = await Video.getVideosUser(UtilizadorID)
    res.send(videos)
})

//ATIVAR UM VIDEO
router.patch('/:id/ativar', verificarCargo(2,3), async (req, res) => {
  const id = req.params.id;

  const videoExiste = await Video.getVideo(id);
  if (videoExiste.UtilizadorID !== req.user.id && req.user.cargo !== 'admin') {
    return res.status(403).send({ message: "Acesso negado. Apenas o autor do vídeo pode alterá-lo." });
  }

  const result = await Video.ativar(id); // ativar video
  res.json(result);
});

//DESATIVAR UM VIDEO
router.delete('/:id/desativar', verificarCargo(2,3), async (req, res) => {
  const id = req.params.id;

  const videoExiste = await Video.getVideo(id);
  if (videoExiste.UtilizadorID !== req.user.id && req.user.cargo !== 'admin') {
    return res.status(403).send({ message: "Acesso negado. Apenas o autor do vídeo pode alterá-lo." });
  }

  const result = await Video.desativar(id); // desativar video
  res.json(result);
});


export default router;

