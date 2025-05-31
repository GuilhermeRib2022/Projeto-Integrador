import pool from "../database.js";

export async function getAnotacoes(){
    const [rows] = await pool.query('SELECT * FROM anotacao where ID>0')
    return rows
}

export async function getAnotacao(id){
    const [rows] = await pool.query('SELECT * FROM anotacao where ID = ?',[id])
    return rows[0]
}

export async function deleteAnotacao(id){
    const [rows] = await pool.query('DELETE FROM anotacao where ID = ?',[id])
    return rows
}

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
