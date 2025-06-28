import pool from "../database.js";

export const Disciplina = {
    //OBTEM TODAS AS DISCIPLINAS
    async getDisciplinas() {
        const [rows] = await pool.query('SELECT * FROM disciplina where ID>0')
        return rows
    },

    //OBTER DISCIPLINA POR ID
    async getDisciplina(id) {
        const [rows] = await pool.query('SELECT * FROM disciplina where ID = ?', [id])
        return rows[0]
    },

    //APAGAR DISCIPLINA POR ID
    async deleteDisciplina(id) {
        const [result] = await pool.query('DELETE FROM disciplina where ID = ?', [id])
        return result
    },

    //ADICIONAR DISCIPLINA
    async createDisciplina(Nome, descricao, cor) {
        const [result] = await pool.query('INSERT INTO disciplina (Nome, descricao, cor) VALUES (?, ?, ?)', [Nome, descricao, cor]);
        const id = result.insertId;
        return Disciplina.getDisciplina(id);
    },

    //EDITAR DISCIPLINA
    async editDisciplina(id, nome, descricao, cor) {
        const current = await Disciplina.getDisciplina(id);
        if (!current) {
            throw new Error(`Disciplina com ID ${id} não encontrado`);
        }
        const updatedNome = nome ?? current.Nome;
        const updatedDescricao = descricao ?? current.Descricao;
        const updatedCor = cor ?? current.Cor;

        const [result] = await pool.query('UPDATE disciplina SET nome = ?, descricao = ?, cor = ? WHERE ID = ?', [updatedNome, updatedDescricao, updatedCor, id]);
        if (result.affectedRows === 0) {
            throw new Error(`No disciplina found with ID ${id}`);
        }
        return Disciplina.getDisciplina(id);
    },

}