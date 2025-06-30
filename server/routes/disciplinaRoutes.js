import { Router } from 'express';
import { Disciplina } from '../models/disciplinaModels.js';
const router = Router();

//OBTEM TODAS AS DISCIPLINAS
router.get("", async (req, res) => {
    const result = await Disciplina.getDisciplinas();
    res.send(result);
});

//OBTER DISCIPLINA POR ID
router.get("/:id", async (req, res) => {
    const id = req.params.id
    const disciplinas = await Disciplina.getDisciplina(id);
    res.send(disciplinas);
});

//APAGAR DISCIPLINA POR ID
router.delete("/:id", async (req, res) => {
    const id = req.params.id
    const disciplinas = await Disciplina.deleteDisciplina(id);
    res.send(disciplinas);
});

//ADICIONAR DISCIPLINA
router.post("/", async (req, res) => {
    const { Nome, Descricao, Cor } = req.body;
    if (!Nome || !Descricao || !Cor) {
        return res.status(400).send({ message: "Nome, Descrição e Cor necessários." });
    }
    try {
        const disciplinas = await Disciplina.createDisciplina(Nome, Descricao, Cor);
        res.status(201).send(disciplinas);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).send({ message: "Nome ou Cor da disciplina já existe." });
        }
        console.error(error);
        res.status(500).send({ message: "Erro ao criar disciplina." });
    }
});

//EDITAR DISCIPLINA
router.patch("/:id", async (req, res) => {
    const id = req.params.id;
    const { Nome, Descricao, Cor } = req.body;

    if (!Nome && !Descricao && !Cor) {
        return res.status(400).send({ message: "Valores necessários." });
    }

    try {
        const disciplina = await Disciplina.editDisciplina(id, Nome, Descricao, Cor);
        res.send(disciplina);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).send({ message: "Nome ou Cor da disciplina já existe." });
        }
        console.error(error);
        res.status(500).send({ message: "Erro ao criar disciplina." });
    }
});

export default router;