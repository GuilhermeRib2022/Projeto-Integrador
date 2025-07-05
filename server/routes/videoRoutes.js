import { Router } from 'express';
import {Video} from '../models/videoModels.js'
import authenticateToken from '../services/Autenticacao.js';
import express from 'express';
import upload from '../services/upload.js';
import getVideoDuration from '../services/getVideoDuration.js';
import path from 'path';
import multer from 'multer';

const router = Router();

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

//Rota para editar um vídeo
router.put('/editar/:id', authenticateToken, (req, res, next) => {
  upload.fields([{ name: 'thumbnail', maxCount: 1 }])(req, res, function (err) {
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
    const utilizadorID = req.user.id;

    const { titulo, descricao, disciplina } = req.body;
    const thumbnail = req.files?.['thumbnail']?.[0]?.filename;

    await Video.editarVideo(videoID, utilizadorID, {
      titulo,
      descricao,
      disciplina,
      thumbnail
    });

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
        res.status(404).send({ message: "Anotação não encontrada" });
    }
});

router.get("/", async (req, res) => {
    const videos = await Video.getVideos()
    res.send(videos)
})

router.get("/home", async (req, res) => {
  try {
    const maisVistos = await Video.getVideosView();      
    const melhorAvaliados = await Video.getVideosReview();    
    const recentes = await Video.getVideosDate();      
    const Disciplina1 = await Video.getVidoesDisciplina();  
    const Disciplina2 = await Video.getVidoesDisciplina();  
    res.json({
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

router.get("/search", async (req, res) => {
    const texto = req.query.texto;
    const disciplina = req.query.disciplina;

    const videos = await Video.searchVideoDisciplina(texto,disciplina);

    res.send(videos);
});

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

router.post("/search/disciplina/:id", async (req, res) => {
    const DisciplinaID = req.params.id;
    const {Texto} = req.body;
    const videos = await Video.searchVideoDisciplina(Texto, DisciplinaID)
    res.send(videos)
})

export default router;

