import pool from "../database.js";
import axios from 'axios';
import contemPalavraOfensiva from "../services/contemPalavraOfensiva.js";
export const Query = {

  async getQuerys() {
    const [rows] = await pool.query(`SELECT q.*, v.Titulo AS Titulo, u.Nome AS Nome FROM queryllm q
            LEFT JOIN video v ON q.VideoID = v.ID
            LEFT JOIN utilizador u ON q.UtilizadorID = u.ID
            ORDER BY q.QueryTime DESC`);
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


  async create({ VideoID, UtilizadorID, Pergunta, Resposta, VideoTime }) {
    const [result] = await pool.query(
      `INSERT INTO QueryLLM (VideoID, UtilizadorID, Pergunta, Resposta, QueryTime, VideoTime)
       VALUES (?, ?, ?, ?, NOW(), ?)`,
      [VideoID, UtilizadorID, Pergunta, Resposta, VideoTime]
    );
    return result.insertId;
  },

  async processWithLLM(messages, videoTitle, videoDescription) {
    // llama3.2 vs qwen3:14b vs tryBot vs llama3.1:8b vs qwen2.5:14b  vs qwen2.5vl:7b
    // Análise: llama3.2 é fraco, llama3.1:8b é muito tecnico e pouco educado, qwen3:14b é modelo de Deep Learning.
    // qwen2.5:14b é o modelo mais recente e recomendado para tarefas gerais
    const MODEL = 'qwen2.5:14b';
    const OLLAMA_URL = 'http://localhost:11434/api/generate';

    //Verifica mensagens ofensivas do utilizador
    const ultimaMsg = messages[messages.length - 1];
    if (ultimaMsg.role === 'user' && contemPalavraOfensiva(ultimaMsg.content)) {
      return {
        role: 'assistant',
        content: 'Por favor, mantém a linguagem respeitosa. Reformula a tua pergunta sem palavrões.'
      };
    }

    //Constroi o prompt a partir das mensagens
    const buildPromptFromMessages = (msgs) => {
      
      const systemPrompt =
        `És um assistente técnico que responde com informações objetivas e factuais. Não sejas evasivo. Responde em português de Portugal, de forma clara, precisa e curta (máximo 256 caracteres).\n` +
        `O vídeo que o utilizador está a ver tem o seguinte título: "${videoTitle}".(Menciona apenas se o utilizador mencionar) \n` +
        `Descrição do vídeo: "${videoDescription}".(Menciona apenas se o utilizador mencionar) \n`;
      const dialog = msgs
        .map(msg => `${msg.role === 'user' ? 'Utilizador' : 'Assistente'}: ${msg.content}`)
        .join('\n');
      return systemPrompt + dialog + '\nAssistente:';
    };

    //Obtém o prompt completo
    const prompt = buildPromptFromMessages(messages);

    try {
      const response = await axios.post(OLLAMA_URL, {
        model: MODEL,
        prompt,
        max_tokens: 64,
        temperature: 0.8,
        frequency_penalty: 0.7,
        presence_penalty: 0.7,
        stream: false
      }, {
        timeout: 150000
      });

      return {
        role: 'assistant',
        content: response.data.response
      };
    } catch (error) {
      console.error('Erro ao comunicar com o Ollama:', error.message, error.response?.data);
      return {
        role: 'assistant',
        content: 'Erro ao gerar resposta com LLM.'
      };
    }
  }


  /*
async processWithLLM(messages) {
  const lastMessage = messages?.[messages.length - 1]?.content || '';

  try {
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'llama3.2',
      prompt: lastMessage,
      stream: false
    });

    return {
      role: 'assistant',
      content: response.data.response
    };
  } catch (error) {
    console.error('Erro ao comunicar com o Ollama:', error.message);
    return {
      role: 'assistant',
      content: 'Erro ao gerar resposta com LLM.'
    };
  }
},
*/
}