import { Router } from 'express';
import jwt from 'jsonwebtoken'
import { getUserByNickname, VerifyPassword, getUsers, getUser, createUser, deleteUser, updateUser, countUsers} from '../models/utilizadorModels.js'
import dotenv from 'dotenv';

dotenv.config();
const router = Router();

router.get("/lista", async (req, res) => { //Rota de pesquisa de utilizador por ID
    const users = await getUsers()
    res.send(users)
})

router.get("/contar", async (req, res) => { //Rota de contagem de utilizadores
    const length = await countUsers()
    res.send(length)
})

router.get("/:id", async (req, res) => { //Rota de pesquisa de utilizador por ID
    const id = req.params.id
    const users = await getUser(id)
    res.send(users)
})

router.post("", async(req, res) => { //Rota de criação de utilizador
    const {nome, password, email} = req.body
    if (!password || !nome || !email) {
        return res.status(400).send({ message: "nome, password and email are required" });
    }
    const users = await createUser(nome,password,email)
    res.status(201).send(users)
})

router.delete("/:id", async (req, res) => { //Rota de eliminação de utilizador
    const id = req.params.id
    const result = await deleteUser(id)
    res.send(result)
})

router.patch("/:id", async (req, res) => { //Rota de atualização de utilizador
    const {id} = req.params
    const { nome, email, password } = req.body;
    const result = await updateUser(id, nome, email, password)
    res.status(200).send(result)
})

router.post('/logar', async (req, res) => { //Rota de autenticação
    const { nome, password } = req.body;

    if (!nome || !password) {
        return res.status(400).send({ message: "nome and password are required" });
    }

    const users = await getUserByNickname(nome); //Verifica se o utilizador existe

    if (!users) {
        return res.status(404).send({ message: "users not found" });
    }

    const isPasswordValid = await VerifyPassword(password, users.password); //Verifica se a senha está correta

    if (!isPasswordValid) {
        return res.status(400).send({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: users.ID, nome: users.nome}, process.env.JWT_SECRET, { expiresIn: '1h' }); //Criar um token de autenticação com validade de 1 hora (planear colocar cargos)

    res.status(200).send({ message: "Logged in successfully", token });
});

router.use((err, req, res ,next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!')
})

export default router;
