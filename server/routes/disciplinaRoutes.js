import { Router } from 'express';
import { Disciplina } from '../models/disciplinaModels.js';
import authenticateToken from '../services/Autenticacao.js';
const router = Router();

//OBTEM TODAS AS DISCIPLINAS

//Obter disciplinas de utilizador
router.get("/utilizador", authenticateToken, async (req, res) => {
    console.log("req.user:", req.user); 
    const utilizadorID =  req.user.id;

    try{
        const disciplina = await Disciplina.listarDisciplina(utilizadorID);
        res.send(disciplina);
    }catch (error){
        console.log(error);
        res.status(500).send({message: "Erro ao listar disciplinas de utilizador."});
    }

});

//OBTER DISCIPLINA POR ID
router.get("/:id", async (req, res) => {
    const id = req.params.id
    const disciplinas = await Disciplina.getDisciplina(id);
    res.send(disciplinas);
});

router.get("", async (req, res) => {
    const result = await Disciplina.getDisciplinas();
    res.send(result);
});



router.get("", authenticateToken, async (req, res) => {
    try {
        const utilizadorID = req.user.id; // vindo do token JWT
        const result = await Disciplina.getDisciplinas(utilizadorID); // novo método
        res.send(result);
    } catch (error) {
        console.error("Erro ao buscar disciplinas:", error);
        res.status(500).send({ message: "Erro ao buscar disciplinas" });
    }
});

router.get("", async (req, res) => {
    const result = await Disciplina.getDisciplinas();
    res.send(result);
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



//Associar utilizador a disciplina
router.post("/utilizador/:id", authenticateToken, async (req, res) => {
    const disciplinaID = req.params.id;
    const utilizadorID =  req.user.id;

    try{
        //Obtém disciplinas de utilizador
        const disciplinasUsuario = await Disciplina.listarDisciplina(utilizadorID);

        // Verifica se disciplinaID já está nessa lista
        const jaAssociado = disciplinasUsuario.some(d => d.ID == disciplinaID);

        if (jaAssociado) {
            return res.status(409).send({ message: "Utilizador já está associado a essa disciplina." });
        }

        const disciplina = await Disciplina.associarDisciplina(disciplinaID, utilizadorID);
        res.send(disciplina);
    }catch (error){
        console.log(error);
        res.status(500).send({message: "Erro ao associar utilizador a disciplina."});
    }

});

//Desassociar utilizador a disciplina
router.delete("/utilizador/:id", authenticateToken, async (req, res) => {
    const disciplinaID = req.params.id;
    const utilizadorID =  req.user.id;

    try{
        const disciplina = await Disciplina.desassociarDisciplina(disciplinaID, utilizadorID);
        res.send(disciplina);
    }catch (error){
        console.log(error);
        res.status(500).send({message: "Erro ao desassociar utilizador a disciplina."});
    }

});



export default router;