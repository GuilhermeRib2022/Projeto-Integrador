import { Router } from 'express';
import jwt from 'jsonwebtoken'
import { Utilizador } from '../models/utilizadorModels.js'
import dotenv from 'dotenv';
import pool from '../database.js';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import authenticateToken from '../services/Autenticacao.js';
import { Estatisticas } from '../models/estatisticasModels.js';
import { EstatisticasAdmin } from '../models/estatisticasAdminModels.js';
import verificarCargo from '../services/verificarCargo.js';

dotenv.config();
const router = Router();

// Para resolver __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/fotosperfil/'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });


function asyncHandler(fn) {
    return (req, res, next) => fn(req, res, next).catch(next);
}

//Obter estatísticas de utilizadores
router.get("/estatisticas", authenticateToken, verificarCargo(3),async (req, res) => {

    try {
        const estatisticas = await Utilizador.getEstatisticasUtilizador();
        res.send(estatisticas);
    } catch (error) {
        console.error("Erro ao obter estatísticas dos Utilizadores:", error);
        res.status(500).send({ message: "Erro ao obter estatísticas dos utilizadores" });
    }
});

//Rota de pesquisa todos os utilizadores
router.get("/", authenticateToken, verificarCargo(3), asyncHandler(async (req, res) => { 
    const result = await Utilizador.getUtilizadores()
    res.send(result)
}))

//Rota de editar perfil de utilizador
router.patch("/perfil/edit", authenticateToken, upload.single('fotoPerfil'), asyncHandler(async (req, res) => { 
  const utilizadorID = req.user.id;
  const { nome, email, password, descricao } = req.body;
  const fotoPerfil = req.file ? req.file.filename : null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/; //ISO/IEC 27001

    if (!nome || !email ) {
    return res.status(400).json({ message: "Campos obrigatórios: nome, password, email" });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Formato de email inválido" });
  }

  if (password && password.includes(nome)) {
    return res.status(400).json({ message: "Evite colocar o seu nome de utilizador como password" });
  }

  if (!passwordRegex.test(password) && password) {
    return res.status(400).json({ message: "Password deve ter no mínimo 8 caracteres, com pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial" });
  }

  try {
    const result = await Utilizador.editarConta({nome, email, password, descricao,fotoPerfil, utilizadorID});
    res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao atualizar utilizador:", error);
    res.status(400).json({ message: error.message });
  }
}))


//Rota de obter perfil de utilizador
router.get("/perfil/:id", asyncHandler(async (req, res) => { 
    const UtilizadorID = req.params.id
    const result = await Utilizador.getPerfil(UtilizadorID)
    res.send(result)
}))

//Rota de obter perfil de utilizador
router.get("/perfil", authenticateToken, asyncHandler(async (req, res) => { 
    const UtilizadorID = req.user.id;
    const result = await Utilizador.getPerfil(UtilizadorID)
    res.send(result)
}))

//Rota de contagem de Utilizadores
router.get("/contar", async (req, res) => { 
    const length = await Utilizador.countUtilizador()
    res.send(length)
})

//Rota de pesquisa de Utilizador por ID
router.get("/:id", authenticateToken, async (req, res) => { 
    const id = req.params.id
    const result = await Utilizador.getUtilizador(id)
    res.send(result)
})

//Registar Utilizador
router.post('/registar', async (req, res) => {
  const { nome, password, email} = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/; //ISO/IEC 27001

  if (!nome || !password || !email ) {
    return res.status(400).json({ message: "Campos obrigatórios: nome, password, email" });
  }

  if (nome.length < 4) {
    return res.status(400).json({ message: "Nome precisa de possuir 4 ou mais caractéres" });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Formato de email inválido"});
  }

  if (password.includes(nome)){
    return res.status(400).json({ message: "Evite colocar o seu nome de utilizador como password" });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({ message: "Password deve ter no mínimo 8 caracteres, com pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial" });
  }


  try {
    const result = await Utilizador.Registar({nome,password,email});
    res.status(201).json(result);
  } catch (error) {
    console.error("Erro ao criar utilizador:", error);
    res.status(500).json({ message: "Erro interno ao criar utilizador" });
  }
});

//Criar utilizador
router.post('', authenticateToken, verificarCargo(3),  upload.single('fotoPerfil'), async (req, res) => {
  const { nome, password, email, cargo, descricao } = req.body;
  const fotoPerfil = req.file ? req.file.filename : null;

  if (!nome || !password || !email || !cargo) {
    return res.status(400).json({ message: "Campos obrigatórios: nome, password, email e cargo" });
  }

  if (nome.length<4) {
    return res.status(400).json({ message: "Nome precisa de possuir 4 ou mais caractéres" });
  }

  try {
    const result = await Utilizador.createUtilizador({nome,password,email,cargoID: cargo,descricao,fotoPerfil});
    res.status(201).json(result);
  } catch (error) {
    console.error("Erro ao criar utilizador:", error);
    res.status(500).json({ message: "Erro interno ao criar utilizador" });
  }
});

//Rota de eliminação de Utilizador
router.delete("/:id", authenticateToken, verificarCargo(3), async (req, res) => { 
    const id = req.params.id
    const result = await Utilizador.deleteUtilizador(id)
    res.send(result)
})

//Atualizar utilizador
router.patch("/:id", authenticateToken, upload.single('fotoPerfil'), async (req, res) => {
  const id = req.params.id;
  const { nome, email, password, cargo, descricao } = req.body;
  const fotoPerfil = req.file ? req.file.filename : null;

  const utilizadorExiste = await Utilizador.getUtilizador(id);
  if (utilizadorExiste.UtilizadorID !== req.user.id && req.user.cargo !== 3) {
    return res.status(403).send({ message: "Acesso negado. Apenas o autor do vídeo pode alterá-lo." });
  }

  try {
    const result = await Utilizador.updateUtilizador({id,nome,email,password,cargoID: cargo,descricao,fotoPerfil});
    res.status(200).json(result);
  } catch (error) {
    console.error("Erro ao atualizar utilizador:", error);
    res.status(500).json({ message: error.message });
  }
});

//Rota de autenticação
router.post('/logar', async (req, res) => { 
    const { nome, password } = req.body;

    if (!nome || !password) {
        return res.status(400).send({ message: "nome and password are required" });
    }

    const utilizador = await Utilizador.getUtilizadorByNickname(nome); //Verifica se o Utilizador existe

    if (!utilizador) {
        return res.status(404).send({ message: "Utilizador not found" });
    }

    const isPasswordValid = await Utilizador.VerifyPassword(password, utilizador.Password); //Verifica se a senha está correta

    if (!isPasswordValid) {
        return res.status(400).send({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: utilizador.ID, nome: utilizador.Nome, cargo: utilizador.CargoID }, process.env.JWT_SECRET, { expiresIn: '1h' }); //Criar um token de autenticação com validade de 1 hora (planear colocar cargos)

    res.status(200).send({ message: "Logado com sucesso", token });
});

//ATIVAR UM UTILIZADOR
router.patch('/:id/ativar', authenticateToken, verificarCargo(3), async (req, res) => {
  const id = req.params.id;
  
  const utilizadorExiste = await Utilizador.getUtilizador(id);
  if (utilizadorExiste.UtilizadorID !== req.user.id && req.user.cargo !== 3) {
    return res.status(403).send({ message: "Acesso negado. Apenas o autor do vídeo pode alterá-lo." });
  }

  const employees = await Utilizador.ativar(id); // ativar utilizador
  res.json(employees);
});

//DESATIVAR UM UTILIZADOR
router.delete('/:id/desativar', authenticateToken, verificarCargo(3), async (req, res) => {
  const id = req.params.id;

  const utilizadorExiste = await Utilizador.getUtilizador(id);
  if (utilizadorExiste.UtilizadorID !== req.user.id && req.user.cargo !== 3) {
    return res.status(403).send({ message: "Acesso negado. Apenas o autor do vídeo pode alterá-lo." });
  }

  const employees = await Utilizador.desativar(id); // desativar utilizador
  res.json(employees);
});


//OBTER ESTATISTICAS GERAIS DO WEBSITE
router.get('/admin/estatisticas/:id',  authenticateToken, verificarCargo(3), async (req, res) => {
  try {
    const totalVideos = await EstatisticasAdmin.getTotalVideos();
    const duracaoMediaVideos = await EstatisticasAdmin.getDuracaoMediaVideos();
    const totalViews = await EstatisticasAdmin.getTotalViews();
    const mediaViews = totalVideos > 0 ? totalViews / totalVideos : 0;
    const viewsSemanaAtual = await EstatisticasAdmin.getViewsSemanaAtual();
    const viewsSemanaPassada = await EstatisticasAdmin.getViewsSemanaPassada();
    const diferencaViews = viewsSemanaAtual - viewsSemanaPassada;
    const totalAvaliacoes = await EstatisticasAdmin.getTotalAvaliacoes();
    const avaliacoesSemana = await EstatisticasAdmin.getAvaliacoesSemana();
    const averageRating = await EstatisticasAdmin.getAverageRating();
    const videoMelhorAvaliado = await EstatisticasAdmin.getVideoMelhorAvaliado();
    const totalComentarios = await EstatisticasAdmin.getTotalComentarios();
    const comentariosSemana = await EstatisticasAdmin.getComentariosSemana();
    const mediaComentariosPorVideo = totalVideos > 0 ? totalComentarios / totalVideos : 0;
    const totalDisciplinas = await EstatisticasAdmin.getTotalDisciplinas();
    const disciplinaMaisVisualizada = await EstatisticasAdmin.getDisciplinaMaisVisualizada();
    const disciplinaMelhorAvaliada = await EstatisticasAdmin.getDisciplinaMelhorAvaliada();
    const totalAnotacoes = await EstatisticasAdmin.getTotalAnotacoes();
    const totalPerguntasLLM = await EstatisticasAdmin.getTotalPerguntasLLM();
    const videoMaisVisto = await EstatisticasAdmin.getVideoMaisVisto();

    res.json({ totalVideos, duracaoMediaVideos, totalViews, mediaViews, viewsSemanaAtual, viewsSemanaPassada, diferencaViews, videoMaisVisto, totalAvaliacoes, avaliacoesSemana, averageRating, videoMelhorAvaliado, totalComentarios, comentariosSemana, mediaComentariosPorVideo, totalDisciplinas, disciplinaMaisVisualizada, disciplinaMelhorAvaliada, totalAnotacoes, totalPerguntasLLM,});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao obter estatísticas.' });
  }
});


//OBTER TODAS AS ESTATISTICAS DE UM PROFESSOR
router.get('/professor/estatisticas/:id',authenticateToken, verificarCargo(2,3), async (req, res) => {
  try {
    const userId = req.params.id;


    if((req.params.id != req.user.id) && req.user.cargo !== 3){
          return res.status(401).json({ message: 'Sem autorização para acessar.' });
    }

    const totalVideos = await Estatisticas.getTotalVideos(userId);
    const duracaoMediaVideos = await Estatisticas.getDuracaoMediaVideos(userId);
    const totalViews = await Estatisticas.getTotalViews(userId);
    const mediaViews = totalVideos > 0 ? totalViews / totalVideos : 0;
    const viewsSemanaAtual = await Estatisticas.getViewsSemanaAtual(userId);
    const viewsSemanaPassada = await Estatisticas.getViewsSemanaPassada(userId);
    const diferencaViews = viewsSemanaAtual - viewsSemanaPassada;
    const totalAvaliacoes = await Estatisticas.getTotalAvaliacoes(userId);
    const avaliacoesSemana = await Estatisticas.getAvaliacoesSemana(userId);
    const averageRating = await Estatisticas.getAverageRating(userId);
    const videoMelhorAvaliado = await Estatisticas.getVideoMelhorAvaliado(userId);
    const totalComentarios = await Estatisticas.getTotalComentarios(userId);
    const comentariosSemana = await Estatisticas.getComentariosSemana(userId);
    const mediaComentariosPorVideo = totalVideos > 0 ? totalComentarios / totalVideos : 0;
    const totalDisciplinas = await Estatisticas.getTotalDisciplinas(userId);
    const disciplinaMaisVisualizada = await Estatisticas.getDisciplinaMaisVisualizada(userId);
    const disciplinaMelhorAvaliada = await Estatisticas.getDisciplinaMelhorAvaliada(userId);
    const totalAnotacoes = await Estatisticas.getTotalAnotacoes(userId);
    const totalPerguntasLLM = await Estatisticas.getTotalPerguntasLLM(userId);
    const videoMaisVisto = await Estatisticas.getVideoMaisVisto(userId);

    res.json({ totalVideos, duracaoMediaVideos, totalViews, mediaViews, viewsSemanaAtual, viewsSemanaPassada, diferencaViews, videoMaisVisto, totalAvaliacoes, avaliacoesSemana, averageRating, videoMelhorAvaliado, totalComentarios, comentariosSemana, mediaComentariosPorVideo, totalDisciplinas, disciplinaMaisVisualizada, disciplinaMelhorAvaliada, totalAnotacoes, totalPerguntasLLM,});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao obter estatísticas.' });
  }
});





export default router;
