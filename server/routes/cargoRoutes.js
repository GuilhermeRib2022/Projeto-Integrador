import { Router } from 'express';
import {Cargo} from '../models/cargoModels.js';
import authenticateToken from '../services/Autenticacao.js';
import verificarCargo from '../services/verificarCargo.js';
const router = Router();

// Apply authentication to all routes
router.use(authenticateToken);


//OBTER TODAS AS ANOTAÇÕES
router.get("/", async (req, res) => {
    const cargos = await Cargo.getCargos();
    res.send(cargos);
});

//Criar Cargo
router.post("/", verificarCargo(3), async (req, res) => {
    const {Tipo} = req.body;
    const cargos = await Cargo.adicionarCargo(Tipo);
    res.send(cargos);
});

//Atualizar Cargo
router.put("/:id", verificarCargo(3),  async (req, res) => {
    const {Tipo} = req.body;
    const ID = req.params.id;
    const cargos = await Cargo.updateCargo(Tipo,ID);
    res.send(cargos);
});


//OBTER ANOTAÇÃO POR ID
router.get("/:id", async (req, res) => {
    const id = req.params.id;
    try {
        const cargo = await Cargo.getCargoID(id);
        res.send(cargo);
    } catch (error) {
        res.status(404).send({ message: "Anotação não encontrada" });
    }
});

//APAGAR ANOTAÇÃO POR ID
router.delete("/:id", verificarCargo(3), async (req, res) => { // Rota de apagar Anotação
    const id = req.params.id;
    const success = await Cargo.deleteCargo(id);
    if (success) {
        res.status(200).send({ message: "Anotação apagada com sucesso" });
    } else {
        res.status(404).send({ message: "Anotação não encontrada" });
    }
});


export default router;