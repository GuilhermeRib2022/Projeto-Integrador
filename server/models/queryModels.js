import pool from "../database.js";

export const query = {

    async getQuerys() {
        const [rows] = await pool.query('SELECT * FROM query where ID>0')
        return rows
    },

    async getQuery(id) {
        const [rows] = await pool.query('SELECT * FROM query where ID = ?', [id])
        return rows[0]
    },

    async deleteQuery(id) {
        const [rows] = await pool.query('DELETE FROM query where ID = ?', [id])
        return rows
    },

}