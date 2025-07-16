import pool from "../database.js";

export const Comentario = {

    //OBTER TODAS OS COMENTÁRIOS
    async getComentarios() {
        const [rows] = await pool.query(`SELECT comentario.ID,VideoID, comentario.UtilizadorID, utilizador.nome, utilizador.FotoPerfil, Texto,comentario.UploadTime, comentario.EditTime FROM comentario\
                                    LEFT JOIN utilizador ON utilizador.ID = comentario.utilizadorID\
                                    ORDER BY comentario.UploadTime DESC`
        );
        return rows
    },

    //OBTER COMENTÁRIO POR ID
    async getComentario(id) {
        const [rows] = await pool.query('SELECT * FROM comentario where ID = ?', [id])
        if (!rows[0]) {
            throw new Error(`Comentario with ID ${id} not found`);
        }
        return rows[0]
    },

    //APAGAR COMENTÁRIO POR ID
    async deleteComentario(id) {
        const [result] = await pool.query('DELETE FROM comentario where ID = ?', [id])
        return result.affectedRows > 0;
    },

    //OBTÉM COMENTÁRIOS DE VIDEOID
    async getComentariosVideo(VideoID, limit, offset) {
        limit = Number.isInteger(limit) && limit > 0 ? limit : 10;
        offset = Number.isInteger(offset) && offset >= 0 ? offset : 0;

        const [rows] = await pool.query(`SELECT comentario.ID,VideoID, comentario.UtilizadorID, utilizador.nome, utilizador.FotoPerfil, Texto,comentario.UploadTime FROM comentario\
                                    LEFT JOIN utilizador ON utilizador.ID = comentario.utilizadorID\
                                    WHERE comentario.videoID = ?
                                    ORDER BY comentario.UploadTime DESC
                                    LIMIT ? OFFSET ?`
            , [VideoID, limit, offset]);
        return rows
    },

    //CRIAR COMENTÁRIO POR VIDEOID & UTILIZADORID
    async createComentario(videoID, utilizadorID, Texto) {
        const [result] = await pool.query('INSERT INTO comentario (VideoID, utilizadorID, Texto) VALUES (?, ?, ?)', [videoID, utilizadorID, Texto]);
        const id = result.insertId;
        return this.getComentario(id); 
    },

    //EDITAR COMENTÁRIO POR ID DE COMENTÁRIO
    async editComentarioID(ID, Texto) {
        const [result] = await pool.query(
            "UPDATE comentario SET Texto = ?, EditTime = NOW() WHERE ID = ?",
            [Texto, ID]
        );

        if (result.affectedRows === 0) {
            throw new Error('Comentário não encontrado para atualização');
        }

        // Opcional: buscar e retornar o comentário atualizado
        return await this.getComentario(ID);
    },

    //ATUALIZAR COMENTÁRIO POR VIDEOID & UTILIZADORID
    async editComentario(ID, VideoID, utilizadorID, Texto) {
        const current = await this.getComentario(ID)

        const updatedVideoID = VideoID ?? current.VideoID;
        const updatedUtilizadorID = utilizadorID ?? current.UtilizadorID;
        const updatedTexto = Texto ?? current.Texto;

        const [result] = await pool.query('UPDATE comentario SET VideoID = ?, utilizadorID = ?, Texto = ?, EditTime = NOW() WHERE ID = ?', [updatedVideoID, updatedUtilizadorID, updatedTexto, ID]);

        if (result.affectedRows === 0) {
            throw new Error(`No comentario found with ID ${ID}`);
        }

        return this.getComentario(ID);

    },

}

