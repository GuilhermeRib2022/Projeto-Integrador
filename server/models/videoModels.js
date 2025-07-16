import pool from "../database.js";

export const Video = {

    //VISUALIZAR VIDEO
    async visualizar(videoID) {
        const [result] = await pool.query(
            'UPDATE video SET views = views + 1 WHERE ID = ?',
            [videoID]
        );
        if (result.affectedRows === 0) {
            throw new Error('Video not found');
        }
        return result;
    },

    //PUBLICAR VIDEOS
    async publicarVideo(disciplinaID, utilizadorID, titulo, descricao, videoPath, thumbnail, duracao, FontePath, textoFonte) {
        const sql = `INSERT INTO Video (DisciplinaID, UtilizadorID, Titulo, Descricao, VideoPath, Thumbnail, Duracao, TextoFonte) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [disciplinaID, utilizadorID, titulo, descricao || null, videoPath, thumbnail || null, duracao, FontePath || null, textoFonte || null];
        const [result] = await pool.query(sql, values);
        return result.insertId;
    },

    //OBTER VIDEOS DE UTILIZADOR
    async getVideosUser(UtilizadorID) {
        try {
            const [rows] = await pool.query(`
                SELECT v.*, disciplina.Nome AS Disciplina, disciplina.Cor AS Cor, utilizador.Nome AS Autor, utilizador.CargoID AS Cargo, AVG_reviews.AvgNota AS Nota FROM video v
LEFT JOIN disciplina ON disciplina.ID = v.DisciplinaID
LEFT JOIN utilizador ON utilizador.ID = v.UtilizadorID
LEFT JOIN (SELECT videoID, AVG(Nota) AS AvgNota FROM review GROUP BY videoID) AS AVG_reviews ON AVG_reviews.videoID = v.ID
WHERE v.UtilizadorID = ?`, [UtilizadorID])
            return rows
        } catch (error) {
            throw new Error(`Failed to fetch videos: ${error.message}`)
        }
    },

    //OBTÉM TODOS OS VÍDEOS
    async getVideos() {
        try {
            const [rows] = await pool.query(`
                SELECT v.*, disciplina.Nome AS Disciplina, disciplina.Cor AS Cor, utilizador.Nome AS Autor, AVG_reviews.AvgNota AS Nota FROM video v
LEFT JOIN disciplina ON disciplina.ID = v.DisciplinaID
LEFT JOIN utilizador ON utilizador.ID = v.UtilizadorID
LEFT JOIN (SELECT videoID, AVG(Nota) AS AvgNota FROM review GROUP BY videoID) AS AVG_reviews ON AVG_reviews.videoID = v.ID
WHERE v.estado = "ativo"
ORDER BY v.ID DESC`)
            return rows
        } catch (error) {
            throw new Error(`Failed to fetch videos: ${error.message}`)
        }
    },

    //OBTÉM VÍDEO POR ID
    // # TALVEZ O VIDEO INCLUIR A AVALIAÇÃO MÉDIA.
    async getVideo(id) {
        try {
            const [rows] = await pool.query(`SELECT v.*, disciplina.Nome AS Disciplina, disciplina.Cor AS Cor, utilizador.Nome AS Autor, utilizador.FotoPerfil as FotoPerfil, AVG_reviews.AvgNota AS Nota FROM video v
LEFT JOIN disciplina ON disciplina.ID = v.DisciplinaID
LEFT JOIN utilizador ON utilizador.ID = v.UtilizadorID
LEFT JOIN (SELECT videoID, AVG(Nota) AS AvgNota FROM review GROUP BY videoID) AS AVG_reviews ON AVG_reviews.videoID = v.ID
WHERE v.ID = ? AND v.estado = "ativo"`, [id])
            return rows[0] || null
        } catch (error) {
            throw new Error(`Failed to fetch video with ID ${id}: ${error.message}`)
        }
    },

    //OBTÉM MÉDIA DE AVALIAÇÃO DE VÍDEO	
    async VideoReviewMedia(id) {
        const [rows] = await pool.query("SELECT video.ID,ROUND(AVG(nota)*10,2) as AvaliacaoMedia FROM video\
                                    LEFT JOIN review ON review.VideoID = video.ID\
                                    WHERE video.ID = ?;"
            , [id]);
        return rows
    },

    //OBTÉM AVALIAÇÕES DE VÍDEO
    async VideoReviews(id) {
        const [rows] = await pool.query("SELECT review.ID,VideoID,utilizador.nome,Nota FROM review\
                                    LEFT JOIN utilizador ON utilizador.ID = review.utilizadorID\
                                    WHERE review.videoID = ?;"
            , [id]);
        return rows
    },

    //APAGAR VÍDEO
    async deleteVideo(id) {
        try {
            if (!id || isNaN(id)) {
                throw new Error('Valid video ID is required');
            }
            const [rows] = await pool.query('DELETE FROM video where ID = ?', [id])
            return rows
        } catch (error) {
            throw new Error(`Failed to delete video: ${error.message}`);
        }
    },

    //PESQUISAR VÍDEO POR NOME
    async searchVideo(searchTerm) {
        try {

            if (!searchTerm || typeof searchTerm !== 'string') {
                throw new Error('Pesquisa inválida');
            }
            const [rows] = await pool.query('SELECT * FROM video WHERE titulo LIKE ? AND estado = "ativo"', [`%${searchTerm}%`]);
            return rows;

        } catch (error) {
            throw new Error('Falha ao pesquisar vídeos: ' + error.message);
        }
    },

    //PESQUISAR VÍDEO POR NOME MELHORADO
    async getSearch(searchTerm) {
        try {

            if (!searchTerm || typeof searchTerm !== 'string') {
                throw new Error('Pesquisa inválida');
            }
            const [rows] = await pool.query(`SELECT v.*, disciplina.Nome AS Disciplina, disciplina.Cor AS Cor, utilizador.Nome AS Autor, AVG_reviews.AvgNota AS Nota, ((v.Views - v.OldViews) / (v.OldViews + 1)) AS FatorCrescimento FROM video v
LEFT JOIN disciplina ON disciplina.ID = v.DisciplinaID
LEFT JOIN utilizador ON utilizador.ID = v.UtilizadorID
LEFT JOIN (SELECT videoID, AVG(Nota) AS AvgNota FROM review GROUP BY videoID) AS AVG_reviews ON AVG_reviews.videoID = v.ID
WHERE v.Titulo LIKE ?  AND v.estado = "ativo"`, [`%${searchTerm}%`]);
            return rows;

        } catch (error) {
            throw new Error('Falha ao pesquisar vídeos: ' + error.message);
        }
    },

    //PESQUISAR VÍDEO POR DISCIPINA MELHORADO
    async getDisciplina(searchTerm) {
        try {

            if (!searchTerm || typeof searchTerm !== 'string') {
                throw new Error('Pesquisa inválida');
            }
            const [rows] = await pool.query(`SELECT v.*, disciplina.Nome AS Disciplina, disciplina.Cor AS Cor, utilizador.Nome AS Autor, AVG_reviews.AvgNota AS Nota, ((v.Views - v.OldViews) / (v.OldViews + 1)) AS FatorCrescimento FROM video v
LEFT JOIN disciplina ON disciplina.ID = v.DisciplinaID
LEFT JOIN utilizador ON utilizador.ID = v.UtilizadorID
LEFT JOIN (SELECT videoID, AVG(Nota) AS AvgNota FROM review GROUP BY videoID) AS AVG_reviews ON AVG_reviews.videoID = v.ID
WHERE Disciplina.nome LIKE ? AND v.estado = "ativo"`, [`%${searchTerm}%`]);
            return rows;

        } catch (error) {
            throw new Error('Falha ao pesquisar vídeos: ' + error.message);
        }
    },

    async getDisciplinaExact(searchTerm) {
        try {

            if (!searchTerm || typeof searchTerm !== 'string') {
                throw new Error('Pesquisa inválida');
            }
            const [rows] = await pool.query(`SELECT v.*, disciplina.Nome AS Disciplina, disciplina.Cor AS Cor, utilizador.Nome AS Autor, AVG_reviews.AvgNota AS Nota, ((v.Views - v.OldViews) / (v.OldViews + 1)) AS FatorCrescimento FROM video v
LEFT JOIN disciplina ON disciplina.ID = v.DisciplinaID
LEFT JOIN utilizador ON utilizador.ID = v.UtilizadorID
LEFT JOIN (SELECT videoID, AVG(Nota) AS AvgNota FROM review GROUP BY videoID) AS AVG_reviews ON AVG_reviews.videoID = v.ID
WHERE Disciplina.nome LIKE ? AND v.estado = "ativo"`, [`${searchTerm}`]);
            return rows;

        } catch (error) {
            throw new Error('Falha ao pesquisar vídeos: ' + error.message);
        }
    },

    //PESQUISAR VÍDEO POR NOME E DISCIPLINA MELHORADO
    async getVideoDisciplina(searchTerm, disciplina) {
        try {

            if (!searchTerm || typeof searchTerm !== 'string') {
                throw new Error('Pesquisa inválida');
            }
            const [rows] = await pool.query(`SELECT v.*, disciplina.Nome AS Disciplina, disciplina.Cor AS Cor, utilizador.Nome AS Autor, AVG_reviews.AvgNota AS Nota FROM video v
LEFT JOIN disciplina ON disciplina.ID = v.DisciplinaID
LEFT JOIN utilizador ON utilizador.ID = v.UtilizadorID
LEFT JOIN (SELECT videoID, AVG(Nota) AS AvgNota FROM review GROUP BY videoID) AS AVG_reviews ON AVG_reviews.videoID = v.ID
WHERE v.Titulo LIKE ? AND disciplina.nome LIKE ? AND v.estado = "ativo"`, [`%${searchTerm}%`, `%${disciplina}%`]);
            return rows;

        } catch (error) {
            throw new Error('Falha ao pesquisar vídeos: ' + error.message);
        }
    },


    //PESQUISAR VÍDEO POR NOME E DISCIPLINA
    async searchVideoDisciplina(searchTerm, disciplinaID) {
        try {
            if (!searchTerm || typeof searchTerm !== 'string') {
                throw new Error('Valid search term is required');
            }
            if (!disciplinaID || isNaN(disciplinaID)) {
                throw new Error('Valid discipline ID is required');
            }
            const [rows] = await pool.query('SELECT * FROM video WHERE titulo LIKE ? AND disciplinaID = ? AND estado = "ativo"', [`%${searchTerm}%`, disciplinaID]);
            return rows;
        } catch (error) {
            throw new Error(`Failed to search videos by discipline: ${error.message}`);
        }
    },

    //Obtém todos os vídeos, ordenados por relevância
        async getVideosRelevante() {
        try {
            const [rows] = await pool.query(`
                SELECT v.*, disciplina.Nome AS Disciplina, disciplina.Cor AS Cor, utilizador.Nome AS Autor, AVG_reviews.AvgNota AS Nota, ((v.Views - v.OldViews) / (v.OldViews + 1)) AS FatorCrescimento FROM video v
LEFT JOIN disciplina ON disciplina.ID = v.DisciplinaID
LEFT JOIN utilizador ON utilizador.ID = v.UtilizadorID
LEFT JOIN (SELECT videoID, AVG(Nota) AS AvgNota FROM review GROUP BY videoID) AS AVG_reviews ON AVG_reviews.videoID = v.ID
WHERE v.estado = "ativo"
ORDER BY FatorCrescimento DESC LIMIT 12 `)

            return rows
        } catch (error) {
            throw new Error(`Failed to fetch videos: ${error.message}`)
        }
    },

    //OBTÉM TODOS OS VÍDEOS, ordenados por Visualizações
    async getVideosView() {
        try {
            const [rows] = await pool.query(`
                SELECT v.*, disciplina.Nome AS Disciplina, disciplina.Cor AS Cor, utilizador.Nome AS Autor, AVG_reviews.AvgNota AS Nota FROM video v
LEFT JOIN disciplina ON disciplina.ID = v.DisciplinaID
LEFT JOIN utilizador ON utilizador.ID = v.UtilizadorID
LEFT JOIN (SELECT videoID, AVG(Nota) AS AvgNota FROM review GROUP BY videoID) AS AVG_reviews ON AVG_reviews.videoID = v.ID
WHERE v.estado = "ativo"
ORDER BY v.Views DESC LIMIT 8 `)
            return rows
        } catch (error) {
            throw new Error(`Failed to fetch videos: ${error.message}`)
        }
    },

    async getVideosReview() {
        try {
            const [rows] = await pool.query(`
                SELECT v.*, disciplina.Nome AS Disciplina, disciplina.Cor AS Cor, utilizador.Nome AS Autor, AVG_reviews.AvgNota AS Nota, ((v.Views - v.OldViews) / (v.OldViews + 1)) AS FatorCrescimento FROM video v
LEFT JOIN disciplina ON disciplina.ID = v.DisciplinaID
LEFT JOIN utilizador ON utilizador.ID = v.UtilizadorID
LEFT JOIN (SELECT videoID, AVG(Nota) AS AvgNota FROM review GROUP BY videoID) AS AVG_reviews ON AVG_reviews.videoID = v.ID
WHERE v.estado = "ativo"
ORDER BY Nota DESC LIMIT 8`)
console.log(rows[1].FatorCrescimento)
            return rows
        } catch (error) {
            throw new Error(`Failed to fetch videos: ${error.message}`)
        }
    },

    //OBTÉM TODOS OS VÍDEOS, ordenados por data
    async getVideosDate() {
        try {
            const [rows] = await pool.query(`
                SELECT v.*, disciplina.Nome AS Disciplina, disciplina.Cor AS Cor, utilizador.Nome AS Autor, AVG_reviews.AvgNota AS Nota FROM video v
LEFT JOIN disciplina ON disciplina.ID = v.DisciplinaID
LEFT JOIN utilizador ON utilizador.ID = v.UtilizadorID
LEFT JOIN (SELECT videoID, AVG(Nota) AS AvgNota FROM review GROUP BY videoID) AS AVG_reviews ON AVG_reviews.videoID = v.ID
WHERE v.estado = "ativo"
ORDER BY v.DataPublicacao DESC LIMIT 8`)
            return rows
        } catch (error) {
            throw new Error(`Failed to fetch videos: ${error.message}`)
        }
    },

    async getVidoesDisciplina() {
        try {

            // Passo 1: buscar todas as disciplinas com pelo menos 1 vídeo
            const [disciplinasComVideo] = await pool.query(`
      SELECT DISTINCT DisciplinaID
      FROM video
    `);

            // Passo 2: escolher uma aleatória
            const randomIndex = Math.floor(Math.random() * disciplinasComVideo.length);
            const disciplinaID = disciplinasComVideo[randomIndex].DisciplinaID;

            // Passo 3: buscar vídeos dessa disciplina
            const [rows] = await pool.query(`
      SELECT v.*, d.Nome AS Disciplina, d.Cor AS Cor, u.Nome AS Autor, AVG_reviews.AvgNota AS Nota, ((v.Views - v.OldViews) / (v.OldViews + 1)) AS FatorCrescimento
      FROM video v
      LEFT JOIN disciplina d ON d.ID = v.DisciplinaID
      LEFT JOIN utilizador u ON u.ID = v.UtilizadorID
      LEFT JOIN (
        SELECT videoID, AVG(Nota) AS AvgNota FROM review GROUP BY videoID
      ) AS AVG_reviews ON AVG_reviews.videoID = v.ID
      WHERE v.DisciplinaID = ?
      ORDER BY FatorCrescimento DESC
      LIMIT 8
    `, [disciplinaID]);
            return rows;
        } catch (error) {
            throw new Error(`Failed to fetch random disciplina videos: ${error.message}`);
        }
    },


    //EDITAR O VIDEO
    async editarVideo(videoID, utilizador, { titulo, descricao, disciplina, thumbnail, fonte, textoFonte  }) {
        try {
            // Buscar o vídeo pelo ID
            const [videos] = await pool.query('SELECT * FROM video WHERE ID = ?', [videoID]);
            const video = videos[0];

            if (!video) throw new Error('Vídeo não encontrado');
            if (video.UtilizadorID !== utilizador.id && utilizador.cargoID !== 3) {
                throw new Error('Acesso negado');
            }

            // Montar partes da query dinamicamente
            const campos = [];
            const valores = [];

            if (titulo) {
                campos.push('Titulo = ?');
                valores.push(titulo);
            }

            if (descricao) {
                campos.push('Descricao = ?');
                valores.push(descricao);
            }

            if (disciplina) {
                campos.push('DisciplinaID = ?');
                valores.push(disciplina);
            }

            if (thumbnail) {
                campos.push('Thumbnail = ?');
                valores.push(thumbnail);
            }

            if (fonte) {
                campos.push('FontePath = ?');
                valores.push(fonte);
            }

            if (textoFonte) {
                campos.push('TextoFonte = ?');
                valores.push(textoFonte);
            }


            if (campos.length === 0) {
                throw new Error('Nenhuma alteração fornecida');
            }

            valores.push(videoID); // último valor é o ID para o WHERE

            const query = `
            UPDATE video
            SET ${campos.join(', ')}
            WHERE ID = ?
        `;

            await pool.query(query, valores);
            return true;

        } catch (error) {
            throw new Error(`Erro ao editar vídeo: ${error.message}`);
        }
    },

    getEstatisticasById: async (id) => {
        const [videoRows] = await pool.query(
            `SELECT 
        v.ID,
        v.Titulo,
        v.Views AS Visualizacoes,
        v.OldViews AS OldVisualizacoes,
        v.DataPublicacao AS DataCriacao, v.DataAlteracao AS DataAlteracao,
        (SELECT COUNT(*) FROM Review r WHERE r.VideoID = v.ID) AS TotalReviews,
        (SELECT AVG(r.Nota) FROM Review r WHERE r.VideoID = v.ID) AS MediaAvaliacao,
        (SELECT COUNT(*) FROM Comentario c WHERE c.VideoID = v.ID) AS TotalComentarios
      FROM Video v
      WHERE v.ID = ?`,
            [id]
        );

        return videoRows[0];
    },

    //Desativa um video
    async desativar(id) {
        await pool.query('UPDATE video SET Estado = "inativo" WHERE ID = ?', [id]);
    },

    //Ativa um video
    async ativar(id) {
        await pool.query('UPDATE video SET Estado = "ativo" WHERE ID = ?', [id]);
    },

}


