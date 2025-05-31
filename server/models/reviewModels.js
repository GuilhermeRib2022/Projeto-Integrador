import pool from "../database.js";

export async function getReviews(){
    const [rows] = await pool.query('SELECT * FROM review where ID>0')
    return rows
}

export async function getReview(id){
    const [rows] = await pool.query('SELECT * FROM review where ID = ?',[id])
    return rows[0]
}

export async function deleteReview(id){
    const [rows] = await pool.query('DELETE FROM review where ID = ?',[id])
    return rows
}

export async function createReview(videoID, utilizadorID, nota) {
    const [result] = await pool.query('INSERT INTO review (VideoID, utilizadorID, Nota) VALUES (?, ?, ?)', [videoID, utilizadorID, nota]);
    const id = result.insertId;
    return getReview(id);
}