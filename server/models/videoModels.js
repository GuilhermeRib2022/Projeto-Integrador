import pool from "../database.js";

//OBTÉM TODOS OS VÍDEOS
export async function getVideos() {
    try {
        const [rows] = await pool.query('SELECT * FROM video where ID>0')
        return rows
    } catch (error) {
        throw new Error(`Failed to fetch videos: ${error.message}`)
    }
}

//OBTÉM VÍDEO POR ID
// # TALVEZ O VIDEO INCLUIR A AVALIAÇÃO MÉDIA.
export async function getVideo(id) {
    try {
        const [rows] = await pool.query('SELECT * FROM video where ID = ?', [id])
        return rows[0] || null
    } catch (error) {
        throw new Error(`Failed to fetch video with ID ${id}: ${error.message}`)
    }
}

//OBTÉM MÉDIA DE AVALIAÇÃO DE VÍDEO	
export async function VideoReviewMedia(id) {
    const [rows] = await pool.query("SELECT video.ID,ROUND(AVG(nota)*10,2) as AvaliacaoMedia FROM video\
                                    LEFT JOIN review ON review.VideoID = video.ID\
                                    WHERE video.ID = ?;"
        , [id]);
    return rows
}

//OBTÉM AVALIAÇÕES DE VÍDEO
export async function VideoReviews(id) {
    const [rows] = await pool.query("SELECT review.ID,VideoID,utilizador.nome,Nota FROM review\
                                    LEFT JOIN utilizador ON utilizador.ID = review.utilizadorID\
                                    WHERE review.videoID = ?;"
        , [id]);
    return rows
}

//APAGAR VÍDEO
export async function deleteVideo(id){
   try {
       if (!id || isNaN(id)) {
           throw new Error('Valid video ID is required');
       }
       const [rows] = await pool.query('DELETE FROM video where ID = ?',[id])
       return rows
   } catch (error) {
       throw new Error(`Failed to delete video: ${error.message}`);
   }
}

//CRIAR COMENTÁRIO EM VÍDEO
export async function createVideoComentario(videoID, utilizadorID, Texto) {
   try {
       const [result] = await pool.query('INSERT INTO comentario (VideoID, utilizadorID, Texto) VALUES (?, ?, ?)', [videoID, utilizadorID, Texto]);
       return { id: result.insertId, ...result };
   } catch (error) {
       throw new Error(`Failed to create video comment: ${error.message}`);
   }
}

//CRIAR ANOTAÇÃO EM VÍDEO
export async function createVideoAnotacao(videoID, utilizadorID, Texto) {
   try {
       const [result] = await pool.query('INSERT INTO anotacao (VideoID, utilizadorID, Texto) VALUES (?, ?, ?)', [videoID, utilizadorID, Texto]);
       return { id: result.insertId, ...result };
   } catch (error) {
       throw new Error(`Failed to create video annotation: ${error.message}`);
   }
}

//OBTÉM COMENTÁRIOS DE VÍDEO
export async function getVideoComentarios(id) {
    const [rows] = await pool.query("SELECT comentario.ID,VideoID,utilizador.nome,Texto,comentario.UploadTime FROM comentario\
                                    LEFT JOIN utilizador ON utilizador.ID = comentario.utilizadorID\
                                    WHERE comentario.videoID = ?;"
        , [id]);
    return rows
}

//OBTER ANOTAÇÃO DE VÍDEO
export async function getAnotacao(videoID, utilizadorID) {
    try {
        const [rows] = await pool.query('SELECT * FROM anotacao WHERE VideoID = ? AND utilizadorID = ?', [videoID, utilizadorID]);
        return rows[0] || null;
    } catch (error) {
        throw new Error(`Failed to fetch annotation for video ${videoID} and user ${utilizadorID}: ${error.message}`);
    }
}

//PESQUISAR VÍDEO POR NOME
export async function searchVideo(searchTerm) {
    try {

        if (!searchTerm || typeof searchTerm !== 'string') {
            throw new Error('Pesquisa inválida');
        }
        const [rows] = await pool.query('SELECT * FROM video WHERE titulo LIKE ?', [`%${searchTerm}%`]);
        return rows;

    } catch (error) {
        throw new Error('Falha ao pesquisar vídeos: ' + error.message);
    }
}

//PESQUISAR VÍDEO POR NOME E DISCIPLINA
export async function searchVideoDisciplina(searchTerm, disciplinaID) {
   try {
       if (!searchTerm || typeof searchTerm !== 'string') {
           throw new Error('Valid search term is required');
       }
       if (!disciplinaID || isNaN(disciplinaID)) {
           throw new Error('Valid discipline ID is required');
       }
       const [rows] = await pool.query('SELECT * FROM video WHERE titulo LIKE ? AND disciplinaID = ?', [`%${searchTerm}%`, disciplinaID]);
       return rows;
   } catch (error) {
       throw new Error(`Failed to search videos by discipline: ${error.message}`);
   }
}

//CRIAR REVIEW EM VÍDEO
export async function createVideoReview(videoID, utilizadorID, Nota) {
   try {
       const [result] = await pool.query('INSERT INTO review (VideoID, utilizadorID, Nota) VALUES (?, ?, ?)', [videoID, utilizadorID, Nota]);
       return { id: result.insertId, ...result };
   } catch (error) {
       throw new Error(`Falha ao criar review de vídeo: ${error.message}`);
   }
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