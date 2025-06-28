import { Router } from 'express';
import jwt from 'jsonwebtoken'
import { Utilizador } from '../models/utilizadorModels.js'
import dotenv from 'dotenv';
import pool from '../database.js';
import multer from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

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

//Rota de pesquisa todos os utilizadores
router.get("/", asyncHandler(async (req, res) => { 
    const result = await Utilizador.getUtilizadores()
    res.send(result)
}))

//Rota de contagem de Utilizadores
router.get("/contar", async (req, res) => { 
    const length = await Utilizador.countUtilizador()
    res.send(length)
})

//Rota de pesquisa de Utilizador por ID
router.get("/:id", async (req, res) => { 
    const id = req.params.id
    const result = await Utilizador.getUtilizador(id)
    res.send(result)
})

//Registar Utilizador
router.post('/registar', async (req, res) => {
  const { nome, password, email} = req.body;

  if (!nome || !password || !email ) {
    return res.status(400).json({ message: "Campos obrigatórios: nome, password, email e cargo" });
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
router.post('', upload.single('fotoPerfil'), async (req, res) => {
  const { nome, password, email, cargo, descricao } = req.body;
  const fotoPerfil = req.file ? req.file.filename : null;

  if (!nome || !password || !email || !cargo) {
    return res.status(400).json({ message: "Campos obrigatórios: nome, password, email e cargo" });
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
router.delete("/:id", async (req, res) => { 
    const id = req.params.id
    const result = await Utilizador.deleteUtilizador(id)
    res.send(result)
})

//Atualizar utilizador
router.patch("/:id", upload.single('fotoPerfil'), async (req, res) => {
  const { id } = req.params;
  const { nome, email, password, cargo, descricao } = req.body;
  const fotoPerfil = req.file ? req.file.filename : null;

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

    res.status(200).send({ message: "Logged in successfully", token });
});

router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!')
})

router.patch('/:id/ativar', async (req, res) => {
  const id = req.params.id;
  const employees = await Utilizador.ativar(id); // ativar utilizador
  res.json(employees);
});

router.delete('/:id/desativar', async (req, res) => {
  const id = req.params.id;
  const employees = await Utilizador.desativar(id); // desativar utilizador
  res.json(employees);
});


export default router;
