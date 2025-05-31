import pool from "../database.js";

//OBTÉM TODOS OS VÍDEOS
export async function getVideos(){
    try{
        const [rows] = await pool.query('SELECT * FROM video where ID>0')
        return rows
    } catch (error) {
        throw new Error(`Failed to fetch videos: ${error.message}`)
    }
}

//OBTÉM VÍDEO POR ID
// # TALVEZ O VIDEO INCLUIR A AVALIAÇÃO MÉDIA.
export async function getVideo(id){
    try{
        const [rows] = await pool.query('SELECT * FROM video where ID = ?',[id])
        return rows[0] || null
    }catch (error) {
        throw new Error(`Failed to fetch video with ID ${id}: ${error.message}`)
    }
}

//OBTÉM MÉDIA DE AVALIAÇÃO DE VÍDEO	
export async function VideoReviewMedia(id){
    const [rows] = await pool.query("SELECT video.ID,ROUND(AVG(nota)*10,2) as AvaliacaoMedia FROM video\
                                    LEFT JOIN review ON review.VideoID = video.ID\
                                    WHERE video.ID = ?;"
                                    , [id]);
    return rows
}

//OBTÉM AVALIAÇÕES DE VÍDEO
export async function VideoReviews(id){
    const [rows] = await pool.query("SELECT review.ID,VideoID,utilizador.nome,Nota FROM review\
                                    LEFT JOIN utilizador ON utilizador.ID = review.utilizadorID\
                                    WHERE review.videoID = ?;"
                                    , [id]);
    return rows
}

//APAGAR VÍDEO
export async function deleteVideo(id){
    const [rows] = await pool.query('DELETE FROM video where ID = ?',[id])
    return rows
}

//CRIAR COMENTÁRIO EM VÍDEO
export async function createVideoComentario(videoID, utilizadorID, Texto) {
    const [result] = await pool.query('INSERT INTO comentario (VideoID, utilizadorID, Texto) VALUES (?, ?, ?)', [videoID, utilizadorID, Texto]);
    const id = result.insertId;
    return result;
}

//CRIAR ANOTAÇÃO EM VÍDEO
export async function createVideoAnotacao(videoID, utilizadorID, Texto) {
    const [result] = await pool.query('INSERT INTO anotacao (VideoID, utilizadorID, Texto) VALUES (?, ?, ?)', [videoID, utilizadorID, Texto]);
    const id = result.insertId;
    return result;
}

//OBTÉM COMENTÁRIOS DE VÍDEO
export async function getVideoComentarios(id){
    const [rows] = await pool.query("SELECT comentario.ID,VideoID,utilizador.nome,Texto,comentario.UploadTime FROM comentario\
                                    LEFT JOIN utilizador ON utilizador.ID = comentario.utilizadorID\
                                    WHERE comentario.videoID = ?;"
                                    , [id]);
    return rows
}

//OBTER ANOTAÇÃO DE VÍDEO
export async function getAnotacao(videoID, utilizadorID) {
    const [result] = await pool.query('SELECT * FROM anotacao WHERE VideoID = ? AND utilizadorID = ?', [videoID, utilizadorID]);
    const id = result.insertId;
    return result;
}

//PESQUISAR VÍDEO POR NOME
export async function searchVideo(searchTerm) {
    const [rows] = await pool.query('SELECT * FROM video WHERE titulo LIKE ?', [`%${searchTerm}%`]);
    return rows;
}

//PESQUISAR VÍDEO POR NOME E DISCIPLINA
export async function searchVideoDisciplina(searchTerm, disciplinaID) {
    const [rows] = await pool.query('SELECT * FROM video WHERE titulo LIKE ? AND disciplinaID = ?', [`%${searchTerm}%`, disciplinaID]);
    return rows;
}

//CRIAR REVIEW EM VÍDEO
export async function createVideoReview(videoID, utilizadorID, Nota) {
    const [result] = await pool.query('INSERT INTO review (VideoID, utilizadorID, Nota) VALUES (?, ?, ?)', [videoID, utilizadorID, Nota]);
    const id = result.insertId;
    return result;
}

/*
Funções:
Em todas as situações, o ID do utilizador é obtido através do token JWT.

x Utilizador pesquisa vídeos. GET localhost:9595/video/pesquisa OU GET localhost:9595/video?search=termo
x Utilizador pesquisa videos de uma disciplina. GET localhost:9595/video/pesquisa/disciplina OU GET localhost:9595/video?search=termo&disciplina=ID
- Utilizador dá review a video. POST localhost:9595/video/:id/review 
x Utilizador cria comentário em video. POST localhost:9595/video/:id/comentario 
x Utilizador cria anotação em vídeo. POST localhost:9595/video/:id/anotacao
- Utilizador fala com LLM.
*/