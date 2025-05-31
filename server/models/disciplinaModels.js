import pool from "../database.js";

export async function getDisciplinas(){
    const [rows] = await pool.query('SELECT * FROM disciplina where ID>0')
    return rows
}

export async function getDisciplina(id){
    const [rows] = await pool.query('SELECT * FROM disciplina where ID = ?',[id])
    return rows[0]
}

export async function createDisciplina(Nome, descricao, cor) {
    const [result] = await pool.query('INSERT INTO disciplina (Nome, descricao, cor) VALUES (?, ?, ?)', [Nome, descricao, cor]); ""
    const id = result.insertId;
    return getDisciplina(id);
}

export async function deleteDisciplina(id){
    const [result] = await pool.query('DELETE FROM disciplina where ID = ?',[id])
    return result
}

export async function editDisciplina(id, nome, descricao, cor) {
    const current = await getDisciplina(id);

        const updatedNome = nome ?? current.Nome;
        const updatedDescricao = descricao ?? current.Descricao;
        const updatedCor = cor ?? current.Cor;

    const [result] = await pool.query('UPDATE disciplina SET nome = ?, descricao = ?, cor = ? WHERE ID = ?', [updatedNome, updatedDescricao, updatedCor, id]);
    if (result.affectedRows === 0) {
        throw new Error(`No disciplina found with ID ${id}`);
    }
    return getDisciplina(id);
}