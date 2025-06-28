import pool from "../database.js";

export const Review = {
    //OBTEM TODAS AS REVIEWS
    async getReviews() {
        const [rows] = await pool.query('SELECT * FROM review where ID>0')
        return rows
    },

    //OBTEM REVIEW POR ID
    async getReviewID(ID) {
        const [rows] = await pool.query('SELECT * FROM review where ID = ?', [ID])
        return rows[0]
    },

    //OBTEM REVIEWS POR VIDEOID
    async getReviewVideo(videoID) {
        const [rows] = await pool.query('SELECT * FROM review where videoID = ?', [videoID])
        return rows
    },

    //OBTEM REVIEWS POR VIDEOID & UTILIZADORID
    async getReview(utilizadorID, videoID) {
        const [rows] = await pool.query('SELECT * FROM review where utilizadorID = ? AND videoID = ?', [utilizadorID, videoID])
        return rows[0]
    },

    //ATUALIZAR/CRIAR REVIEW POR VIDEOID & UTILIZADORID
    async adicionarReview(videoID, utilizadorID, nota) {
        try {
            const [result] = await pool.query(
                `INSERT INTO review (VideoID, utilizadorID, nota)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE nota = VALUES(nota)`,
                [videoID, utilizadorID, nota]
            );
            return result;
        } catch (error) {
            throw new Error(`Falha ao adicionar review: ${error.message}`);
        }
    },

    //APAGAR REVIEW POR VIDEOID & UTILIZADORID
    async deleteReview(utilizadorID, videoID) {
        const [result] = await pool.query('DELETE FROM review where utilizadorID = ? AND videoID = ?', [utilizadorID, videoID])
        return result.affectedRows > 0;
    },

}

