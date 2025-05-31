import { Router } from 'express';
import jwt from 'jsonwebtoken'
import { getUtilizadorByNickname, getUtilizadores, VerifyPassword, getUtilizador, createUtilizador, deleteUtilizador, updateUtilizador, countUtilizador} from '../models/utilizadorModels.js'
import dotenv from 'dotenv';
import pool from '../database.js';


dotenv.config();
const router = Router();

function asyncHandler(fn){
  return (req,res,next)=>fn(req,res,next).catch(next);
}

router.get("/lista", asyncHandler (async (req, res) => { //Rota de pesquisa de Utilizador por ID
    const Utilizador = await getUtilizadores()
    res.send(Utilizador)
}))

router.get("/contar", async (req, res) => { //Rota de contagem de Utilizadores
    const length = await countUtilizador()
    res.send(length)
})

router.get("/:id", async (req, res) => { //Rota de pesquisa de Utilizador por ID
    const id = req.params.id
    const Utilizador = await getUtilizador(id)
    res.send(Utilizador)
})

router.post("", async(req, res) => { //Rota de criação de Utilizador
    const {nome, password, email} = req.body
    if (!password || !nome || !email) {
        return res.status(400).send({ message: "nome, password and email are required" });
    }
    const Utilizador = await createUtilizador(nome,password,email)
    res.status(201).send(Utilizador)
})

router.delete("/:id", async (req, res) => { //Rota de eliminação de Utilizador
    const id = req.params.id
    const result = await deleteUtilizador(id)
    res.send(result)
})

router.patch("/:id", async (req, res) => { //Rota de atualização de Utilizador
    const {id} = req.params
    const { nome, email, password } = req.body;
    const result = await updateUtilizador(id, nome, email, password)
    res.status(200).send(result)
})

router.post('/logar', async (req, res) => { //Rota de autenticação
    const { nome, password } = req.body;

    if (!nome || !password) {
        return res.status(400).send({ message: "nome and password are required" });
    }

    const utilizador = await getUtilizadorByNickname(nome); //Verifica se o Utilizador existe

    if (!utilizador) {
        return res.status(404).send({ message: "Utilizador not found" });
    }

    const isPasswordValid = await VerifyPassword(password, utilizador.Password); //Verifica se a senha está correta

    if (!isPasswordValid) {
        return res.status(400).send({ message: "Invalid password" });
    }

    const [listCargos] = await pool.query(`
  SELECT cargo.tipo 
  FROM cargo
  JOIN cargoutilizador ON cargo.ID = cargoutilizador.CargoID
  WHERE cargoutilizador.UtilizadorID = ?
`, [utilizador.ID]);

const cargo = listCargos.map(row => row.tipo);

    const token = jwt.sign({ id: utilizador.ID, nome: utilizador.Nome, cargo: cargo}, process.env.JWT_SECRET, { expiresIn: '1h' }); //Criar um token de autenticação com validade de 1 hora (planear colocar cargos)

    res.status(200).send({ message: "Logged in successfully", token });
});

router.use((err, req, res ,next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!')
})

export default router;
