import pool from "../database.js";

export async function getComentarios(){
    const [rows] = await pool.query('SELECT * FROM comentario where ID>0')
    return rows
}

export async function getComentario(id){
    const [rows] = await pool.query('SELECT * FROM comentario where ID = ?',[id])
    return rows[0]
}

export async function deleteComentario(id){
    const [rows] = await pool.query('DELETE FROM comentario where ID = ?',[id])
    return rows
}

export async function createComentario(videoID, utilizadorID, Texto) {
    const [result] = await pool.query('INSERT INTO comentario (VideoID, utilizadorID, Texto) VALUES (?, ?, ?)', [videoID, utilizadorID, Texto]);
    const id = result.insertId;
    return getComentario(id);
}

export async function editComentario(ID, videoID, utilizadorID, Texto) {
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