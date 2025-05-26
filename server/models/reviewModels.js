import pool from "../database.js";

export async function getReviews(){
    const [rows] = await pool.query('SELECT * FROM review where ID>0')
    return rows
}

