import pool from "../database.js";

export async function mediaReview(id){
    const [rows] = await pool.query("SELECT video.ID,ROUND(AVG(nota)*10,2) as AvaliacaoMedia FROM video\
                                    LEFT JOIN review ON review.VideoID = video.ID\
                                    WHERE video.ID = ?;"
                                    , [id]);
    return rows
}