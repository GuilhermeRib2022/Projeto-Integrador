import { Router } from 'express';
import { getDisciplinas, getDisciplina, deleteDisciplina, createDisciplina, editDisciplina} from '../models/disciplinaModels.js';
const router = Router();

router.get("/lista", async (req, res) => { // Rota de pesquisa de Disciplinas
    const disciplinas = await getDisciplinas();
    res.send(disciplinas);
});

router.get("/:id", async (req, res) => { // Obter uma disciplina pelo seu ID
    const id = req.params.id
    const disciplinas = await getDisciplina(id);
    res.send(disciplinas);
});

router.delete("/:id", async (req, res) => { // Apagar uma disicplina pelo seu ID
    const id = req.params.id
    const disciplinas = await deleteDisciplina(id);
    res.send(disciplinas);
});

router.post("/", async (req, res) => { // Criar uma disciplina
    const { Nome, Descricao, Cor } = req.body;
        if (!Nome || !Descricao || !Cor) {
        return res.status(400).send({ message: "Nome, Descrição e Cor necessários." });
    }
    const disciplinas = await createDisciplina(Nome, Descricao, Cor);
    res.send(disciplinas);
});

router.patch("/:id", async (req, res) => { // Editar uma disciplina
    const id = req.params.id;
    const { Nome, Descricao, Cor } = req.body;

        if (!Nome && !Descricao && !Cor) {
        return res.status(400).send({ message: "Valores necessários." });
    }

    try {
        const disciplina = await editDisciplina(id, Nome, Descricao, Cor);
        res.send(disciplina);
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

export default router;