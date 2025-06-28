import pool from "../database.js";


export const Anotacao = {
    
    //OBTER TODAS AS ANOTAÇÕES
    async getAnotacoes() {
        const [rows] = await pool.query('SELECT * FROM anotacao where ID>0')
        return rows
    },

    //OBTER ANOTAÇÃO POR ID
    async getAnotacaoID(ID) {
        const [rows] = await pool.query('SELECT * FROM anotacao where ID = ?', [ID]);
        return rows[0]
    },

    //APAGAR ANOTAÇÃO POR ID
    async deleteAnotacao(id) {
        const [rows] = await pool.query('DELETE FROM anotacao where ID = ?', [id])
        return rows
    },

    //OBTER ANOTAÇÃO POR VIDEOID & UTILIZADORID
    async getAnotacao(videoID, utilizadorID) {
        const [rows] = await pool.query('SELECT * FROM anotacao where videoID = ? AND utilizadorID = ?', [videoID, utilizadorID]);
        return rows[0]
    },

    //ATUALIZAR/CRIAR ANOTAÇÃO POR VIDEOID & UTILIZADORID
    async adicionarAnotacao(VideoID, UtilizadorID, Texto) {
        const [result] = await pool.query(
            `INSERT INTO anotacao (VideoID, UtilizadorID, Texto)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE Texto = VALUES(Texto)`,
            [VideoID, UtilizadorID, Texto]
        );
        return result
    },

}

/*

export async function createAnotacao(VideoID, UtilizadorID, Texto) {
    const [result] = await pool.query('INSERT INTO anotacao (VideoID, utilizadorID, Texto) VALUES (?, ?, ?)', [VideoID, UtilizadorID, Texto]);
    const id = result.insertId;
    return getAnotacao(id);
}

export async function editAnotacao(ID, videoID, utilizadorID, Texto) {
    const current = await getAnotacao(ID);

    const updatedVideoID = videoID ?? current.VideoID;
    const updatedUtilizadorID = utilizadorID ?? current.UtilizadorID;
    const updatedTexto = Texto ?? current.Texto;

    const [result] = await pool.query('UPDATE anotacao SET VideoID = ?, utilizadorID = ?, Texto = ? WHERE ID = ?', [updatedVideoID, updatedUtilizadorID, updatedTexto, ID]);
    
    if (result.affectedRows === 0) {
        throw new Error(`No anotacao found with ID ${ID}`);
    }
    
    return getAnotacao(ID);
}

*/



