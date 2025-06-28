import pool from "../database.js";


export const Cargo = {

    //OBTER TODAS AS ANOTAÇÕES
    async getCargos() {
        const [rows] = await pool.query('SELECT * FROM cargo where ID>0')
        return rows
    },

    //OBTER ANOTAÇÃO POR ID
    async getCargoID(ID) {
        const [rows] = await pool.query('SELECT * FROM cargo where ID = ?', [ID]);
        return rows[0]
    },

    //APAGAR ANOTAÇÃO POR ID
    async deleteCargo(id) {
        const [rows] = await pool.query('DELETE FROM cargo where ID = ?', [id])
        return rows
    },

    //OBTER ANOTAÇÃO POR VIDEOID & UTILIZADORID
    async getCargo(videoID, utilizadorID) {
        const [rows] = await pool.query('SELECT * FROM cargo where videoID = ? AND utilizadorID = ?', [videoID, utilizadorID]);
        return rows[0]
    },

    //ATUALIZAR/CRIAR ANOTAÇÃO POR VIDEOID & UTILIZADORID
    async adicionarCargo(Tipo) {
        const [result] = await pool.query(
            `INSERT INTO cargo (Tipo) VALUES (?)`, [Tipo]
        );
        return result
    },

    async updateCargo(Tipo, ID) {
        const [result] = await pool.query(
            `UPDATE cargo SET Tipo = ? WHERE ID = ?`, [Tipo, ID]
        );
        return result
    },

}

/*

export async function createCargo(VideoID, UtilizadorID, Texto) {
    const [result] = await pool.query('INSERT INTO cargo (VideoID, utilizadorID, Texto) VALUES (?, ?, ?)', [VideoID, UtilizadorID, Texto]);
    const id = result.insertId;
    return getCargo(id);
}

export async function editCargo(ID, videoID, utilizadorID, Texto) {
    const current = await getCargo(ID);

    const updatedVideoID = videoID ?? current.VideoID;
    const updatedUtilizadorID = utilizadorID ?? current.UtilizadorID;
    const updatedTexto = Texto ?? current.Texto;

    const [result] = await pool.query('UPDATE cargo SET VideoID = ?, utilizadorID = ?, Texto = ? WHERE ID = ?', [updatedVideoID, updatedUtilizadorID, updatedTexto, ID]);
    
    if (result.affectedRows === 0) {
        throw new Error(`No cargo found with ID ${ID}`);
    }
    
    return getCargo(ID);
}

*/



