import pool from "../database.js";
//############################
//ESTATISTICAS GERAIS WEBSITE
//############################

export const EstatisticasAdmin = {
    async getTotalVideos(userId) {
        const [[{ totalVideos }]] = await pool.query(
            'SELECT COUNT(*) AS totalVideos FROM Video ',
            
        );
        return totalVideos;
    },

    async getDuracaoMediaVideos(userId) {
        const [[{ duracaoMediaVideos }]] = await pool.query(
            'SELECT AVG(Duracao) AS duracaoMediaVideos FROM Video ',
            
        );
        return duracaoMediaVideos;
    },

    async getTotalViews(userId) {
        const [[{ totalViews }]] = await pool.query(
            'SELECT COALESCE(SUM(Views), 0) AS totalViews FROM Video ',
            
        );
        return totalViews;
    },

    async getViewsSemanaAtual(userId) {
        const [[{ viewsSemanaAtual }]] = await pool.query(
            `SELECT COALESCE(SUM(Views - OldViews), 0) AS viewsSemanaAtual
     FROM Video `,
            
        );
        return viewsSemanaAtual;
    },

    async getViewsSemanaPassada(userId) {
        const [[{ viewsSemanaPassada }]] = await pool.query(
            `SELECT COALESCE(SUM(OldViews), 0) AS viewsSemanaPassada
     FROM Video `,
            
        );
        return viewsSemanaPassada;
    },

    async getTotalAvaliacoes(userId) {
        const [[{ totalAvaliacoes }]] = await pool.query(
            `SELECT COUNT(*) AS totalAvaliacoes
     FROM Review r
     JOIN Video v ON r.VideoID = v.ID
     `,
            
        );
        return totalAvaliacoes;
    },

    async getAvaliacoesSemana(userId) {
        const [[{ avaliacoesSemana }]] = await pool.query(
            `SELECT COUNT(*) AS avaliacoesSemana
     FROM Comentario r
     JOIN Video v ON r.VideoID = v.ID
     WHERE r.ID IS NOT NULL AND r.ID IN (
       SELECT ID FROM Comentario WHERE DATEDIFF(NOW(), r.UploadTime) <= 7
     )`,
            
        );
        return avaliacoesSemana;
    },

    async getAverageRating(userId) {
        const [[{ averageRating }]] = await pool.query(
            `SELECT AVG(Nota) AS averageRating
     FROM Review r
     JOIN Video v ON r.VideoID = v.ID
     `,
            
        );
        return averageRating;
    },

    async getVideoMelhorAvaliado(userId) {
        const [[row]] = await pool.query(
            `SELECT v.Titulo
     FROM Video v
     JOIN Review r ON v.ID = r.VideoID
     
     GROUP BY v.ID
     ORDER BY AVG(r.Nota) DESC
     LIMIT 1`,
            
        );
        return row ? row.Titulo : null;
    },

    async getTotalComentarios(userId) {
        const [[{ totalComentarios }]] = await pool.query(
            `SELECT COUNT(*) AS totalComentarios
     FROM Comentario c
     JOIN Video v ON c.VideoID = v.ID
     `,
            
        );
        return totalComentarios;
    },

    async getComentariosSemana(userId) {
        const [[{ comentariosSemana }]] = await pool.query(
            `SELECT COUNT(*) AS comentariosSemana
     FROM Comentario c
     JOIN Video v ON c.VideoID = v.ID
      AND c.UploadTime >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
            
        );
        return comentariosSemana;
    },

    async getTotalDisciplinas(userId) {
        const [[{ totalDisciplinas }]] = await pool.query(
            `SELECT COUNT(DISTINCT DisciplinaID) AS totalDisciplinas
     FROM DisciplinaUtilizador
     `,
            
        );
        return totalDisciplinas;
    },

    async getDisciplinaMaisVisualizada(userId) {
        const [[row]] = await pool.query(
            `SELECT d.Nome
     FROM Disciplina d
     JOIN Video v ON v.DisciplinaID = d.ID
     
     GROUP BY d.ID
     ORDER BY SUM(v.Views) DESC
     LIMIT 1`,
            
        );
        return row ? row.Nome : null;
    },

    async getDisciplinaMelhorAvaliada(userId) {
        const [[row]] = await pool.query(
            `SELECT d.Nome
     FROM Disciplina d
     JOIN Video v ON v.DisciplinaID = d.ID
     JOIN Review r ON r.VideoID = v.ID
     
     GROUP BY d.ID
     ORDER BY AVG(r.Nota) DESC
     LIMIT 1`,
            
        );
        return row ? row.Nome : null;
    },

    async getTotalAnotacoes(userId) {
        const [[{ totalAnotacoes }]] = await pool.query(
            `SELECT COUNT(*) AS totalAnotacoes
     FROM Anotacao a
     JOIN Video v ON a.VideoID = v.ID
     `,
            
        );
        return totalAnotacoes;
    },

    async getTotalPerguntasLLM(userId) {
        const [[{ totalPerguntasLLM }]] = await pool.query(
            `SELECT COUNT(*) AS totalPerguntasLLM
     FROM QueryLLM q
     JOIN Video v ON q.VideoID = v.ID
     `,
            
        );
        return totalPerguntasLLM;
    },

    async getVideoMaisVisto(userId) {
        const [[row]] = await pool.query(
            `SELECT Titulo FROM Video  ORDER BY Views DESC LIMIT 1`,
            
        );
        return row ? row.Titulo : null;
    },


}