import pool from "../database.js";

export async function getQuerys(){
    const [rows] = await pool.query('SELECT * FROM query where ID>0')
    return rows
}

export async function getQuery(id){
    const [rows] = await pool.query('SELECT * FROM query where ID = ?',[id])
    return rows[0]
}

export async function deleteQuery(id){
    const [rows] = await pool.query('DELETE FROM query where ID = ?',[id])
    return rows
}