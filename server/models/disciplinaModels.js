import pool from "../database.js";

export const Disciplina = {
    //OBTEM TODAS AS DISCIPLINAS
    async getDisciplinas() {
        const [rows] = await pool.query(`SELECT * FROM disciplina where ID>0`)
        return rows
    },


    async getDisciplinasPlus(utilizadorID) {
        const [rows] = await pool.query(`
        SELECT d.*, 
               CASE 
                 WHEN du.utilizadorid IS NOT NULL THEN 1 
                 ELSE 0 
               END AS is_subscribed
        FROM disciplina d
        LEFT JOIN disciplinautilizador du 
          ON d.ID = du.disciplinaid AND du.utilizadorid = ?
        ORDER BY is_subscribed DESC, d.Nome ASC
    `, [utilizadorID]);

        return rows;
    },

    //OBTER DISCIPLINA POR ID
    async getDisciplina(id) {
        const [rows] = await pool.query(`SELECT * FROM disciplina where ID = ?`, [id])
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

    //ASSOCIAR DISCIPLINA
    async associarDisciplina(DisciplinaID, UtilizadorID) {
        const [result] = await pool.query('INSERT INTO disciplinaUtilizador (UtilizadorID, DisciplinaID) VALUES (?, ?)', [UtilizadorID, DisciplinaID]);
        const id = result.insertId;
        return Disciplina.getDisciplina(id);
    },

    //DESASSOCIAR DISCIPLINA
    async desassociarDisciplina(DisciplinaID, UtilizadorID) {
        const [result] = await pool.query('DELETE FROM disciplinaUtilizador WHERE UtilizadorID = ? AND DisciplinaID = ?', [UtilizadorID, DisciplinaID]);
        const id = result.insertId;
        return Disciplina.getDisciplina(id);
    },

    //OBTER DISCIPLINAS DE UTILIZADOR
    async listarDisciplina(utilizadorID) {

        const [result] = await pool.query(`SELECT d.* FROM disciplina d
            LEFT JOIN disciplinaUtilizador du ON du.disciplinaID = d.ID
            LEFT JOIN utilizador u ON u.ID = du.UtilizadorID
            WHERE u.ID = ? 
            ORDER BY d.nome ASC`
            , [utilizadorID]);
        return result
    },


        //OBTER DISCIPLINAS DE UTILIZADOR
    async listarDisciplinaUser(utilizadorID) {

        const [result] = await pool.query(`SELECT d.* FROM disciplina d
            LEFT JOIN disciplinaUtilizador du ON du.disciplinaID = d.ID
            LEFT JOIN utilizador u ON u.ID = du.UtilizadorID
            WHERE u.ID = ? AND u.cargoID <> 1
            ORDER BY d.nome ASC`
            , [utilizadorID]);
        return result
    },

    async getEstatisticasDisciplina() {
        const [rows] = await pool.query(`
            SELECT d.ID, d.Nome, d.cor AS Cor, COUNT(v.ID) AS TotalVideos, SUM(v.Views) AS TotalViews, AVG(r.Nota) AS MediaReviews, SUM(CASE WHEN du.UtilizadorID IS NOT NULL THEN 1 ELSE 0 END) AS Inscricoes
            FROM disciplina d
            LEFT JOIN video v ON v.DisciplinaID = d.ID
            LEFT JOIN review r ON r.VideoID = v.ID
            LEFT JOIN disciplinaUtilizador du ON du.DisciplinaID = d.ID
            GROUP BY d.ID
        `);
        return rows;
    }
}