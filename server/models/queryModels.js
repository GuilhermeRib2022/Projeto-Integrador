import pool from "../database.js";
import axios from 'axios';
import contemPalavraOfensiva from "../services/contemPalavraOfensiva.js";

//CALCULAR SIMILARIDADE COSENO ENTRE DOIS VETORES
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (magA * magB);
}

//OBTER EMBEDDING DA PERGUNTA ATUAL
async function getEmbeddingOllama(text) {
  const res = await axios.post('http://localhost:11434/api/embed', {
    model: 'qwen2.5:14b',
    input: text
  });
  return res.data.embeddings[0];
}

// #################################### //
// FUNÇÃO PRINCIPAL DE PROCESSAR PROMPT //
// #################################### // 
async function processWithLLM(question, messages, videoTitle, videoDescription, videoId) {
  const MODEL = 'qwen2.5:14b';
  const OLLAMA_URL = 'http://localhost:11434/api/generate';

  //1. VERIFICA PALAVRAS OFENSIVAS
  const ultimaMsg = messages[messages.length - 1];
  if (ultimaMsg.role === 'user' && contemPalavraOfensiva(ultimaMsg.content)) {
    return {
      role: 'assistant',
      content: 'Por favor, mantém a linguagem respeitosa. Reformula a tua pergunta sem palavrões.'
    };
  }

  //2. VERIFICA SE A PERGUNTA É EXATAMENTE IGUAL A ALGUMA JÁ GUARDADA
  const [exactMatchRows] = await pool.query(
    `SELECT Resposta FROM QueryLLM WHERE VideoID = ? AND Pergunta = ?`,
    [videoId, question]
  );

  if (exactMatchRows.length > 0) {

    await pool.query(
      `UPDATE QueryLLM SET counter = counter + 1 WHERE VideoID = ? AND Pergunta = ?`,
      [videoId, question]
    );

    return {
      role: 'assistant',
      content: exactMatchRows[0].Resposta,
      isNew: false,
    };
  }

  //3. GERAR EMBEDDING DA PERGUNTA ATUAL
  const questionNormalized = question
  .toLowerCase() //Coloca tudo em lowercase
  .replace(/[^\w\s]/g, '')  // Remove pontuação
  .replace(/\s+/g, ' ')     // Remove espaços duplos
  .trim();

  const questionEmbedding = await getEmbeddingOllama(questionNormalized );

  //3.1 Buscar na base de dados todos os embeddings de um video
  const [rows] = await pool.query(
    `SELECT Pergunta, Resposta, Embedding FROM QueryLLM WHERE VideoID = ?`,
    [videoId]
  );

  //3.2 Encontrar a pergunta mais semelhante semanticamente
  let melhorSimilaridade = -1; //Definir a similaridade como -1 (precisa de 0.85 para ser considerada)
  let respostaMaisProxima = null; //Definir a resposta mais próxima como nulo
  let perguntaMaisProxima = null; //Definir a pergunta da resposta mais próxima
  const LIMIAR = 0.85; // Define o limiar para considerar similaridade suficiente

  for (const row of rows) {
    if (!row.Embedding) continue; // Pula se não há embedding

    let embeddingDb;
    try {
      embeddingDb = JSON.parse(row.Embedding);
      if (!Array.isArray(embeddingDb)) continue; // Pula se não for array válido
    } catch (e) {
      console.warn('Embedding inválido:', row.Embedding);
      continue;
    }

    const sim = cosineSimilarity(questionEmbedding, embeddingDb);

    //console.log(`🔍 Comparando com: "${row.Pergunta}"`);
    //console.log(`📏 Similaridade: ${sim.toFixed(4)}`);

    //Verifica se o novo embedding é mais próximo do melhor embedding, se for, substitui.
    if (sim > melhorSimilaridade) {
      melhorSimilaridade = sim;
      respostaMaisProxima = row.Resposta;
      perguntaMaisProxima = row.Pergunta;
      //console.log(`✅ Nova melhor similaridade: ${melhorSimilaridade.toFixed(4)}`);
    }
  }

  //console.log(`📊 Similaridade final escolhida: ${melhorSimilaridade.toFixed(4)}`);

  // 4. SE ENCONTROU UMA SIMILARIDADE ACIMA DO LIMIAR, RETORNA A RESPOSTA GUARDADA
  if (melhorSimilaridade >= LIMIAR) {

    await pool.query(
      `UPDATE QueryLLM SET counter = counter + 1 WHERE VideoID = ? AND Pergunta = ? AND Embedding IS NOT NULL`,
      [videoId, perguntaMaisProxima]
    );

    return {
      role: 'assistant',
      content: respostaMaisProxima,
      isNew: false,
    };
  }

  // 5. CASO CONTRÁRIO, GERA UMA NOVA RESPOSTA COM O LLM
  const buildPromptFromMessages = (msgs) => {
    const systemPrompt =
      `És um assistente técnico que responde com informações objetivas e factuais. Não sejas evasivo. Responde em português de Portugal, de forma clara, precisa e curta (máximo 256 caracteres).\n` +
      `O vídeo que o utilizador está a ver tem o seguinte título: "${videoTitle}".(Menciona apenas se o utilizador mencionar) \n` +
      `Descrição do vídeo: "${videoDescription}".(Menciona apenas se o utilizador mencionar) \n` +
      `nunca, mas nunca saia do contexto do título ou da descrição, avise o aluno se sair muito do contexto do vídeo ou título ou descrição, isto é importante.\n`;

    const dialog = msgs
      .map(msg => `${msg.role === 'user' ? 'Utilizador' : 'Assistente'}: ${msg.content}`)
      .join('\n');
    return systemPrompt + dialog + '\nAssistente:';
  };

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

    const respostaLLM = response.data.response;

    return {
      role: 'assistant',
      content: respostaLLM,
      isNew: true,
      embedding: questionEmbedding
    };

  } catch (error) {
    console.error('Erro ao comunicar com o Ollama:', error.message, error.response?.data);
    return {
      role: 'assistant',
      content: 'Erro ao gerar resposta com LLM.'
    };
  }
}





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



  async create({ VideoID, UtilizadorID, Pergunta, Resposta, VideoTime, Embedding }) {
    const [result] = await pool.query(
      `INSERT INTO QueryLLM (VideoID, UtilizadorID, Pergunta, Resposta, Embedding, QueryTime, VideoTime)
     VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
      [VideoID, UtilizadorID, Pergunta, Resposta, Embedding || null, VideoTime]
    );
    return result.insertId;
  },

  processWithLLM

}

/* FUNÇAO 3.0
// Processa a pergunta do utilizador com o LLM e retorna a resposta
async processWithLLM(question, messages, videoTitle, videoDescription, videoId) {
  const MODEL = 'qwen2.5:14b'; //MODELO USADO
  const OLLAMA_URL = 'http://localhost:11434/api/generate'; // API do Ollama

  //VERIFICAÇÃO DE MENSAGENS OFENSIVAS DO UTILIZADOR
  const ultimaMsg = messages[messages.length - 1];
  if (ultimaMsg.role === 'user' && contemPalavraOfensiva(ultimaMsg.content)) {
    return {
      role: 'assistant',
      content: 'Por favor, mantém a linguagem respeitosa. Reformula a tua pergunta sem palavrões.'
    };
  }

  //Verifica se já existe uma resposta para a pergunta na base de dados
  const [rows] = await pool.query(
    `SELECT Resposta FROM QueryLLM WHERE VideoID = ? AND Pergunta = ?  ORDER BY QueryTime DESC LIMIT 1`,
    [videoId, question]
  );

  if (rows.length > 0) {
    return {
      role: 'assistant',
      content: rows[0].Resposta
    };
  }

  //Constroi o prompt a partir das mensagens
  const buildPromptFromMessages = (msgs) => {

    //Prompt base
    const systemPrompt =
      `És um assistente técnico que responde com informações objetivas e factuais. Não sejas evasivo. Responde em português de Portugal, de forma clara, precisa e curta (máximo 256 caracteres).\n` +
      `O vídeo que o utilizador está a ver tem o seguinte título: "${videoTitle}".(Menciona apenas se o utilizador mencionar) \n` +
      `Descrição do vídeo: "${videoDescription}".(Menciona apenas se o utilizador mencionar) \n`;

    //Diálogo construído a partir das mensagens
    const dialog = msgs
      .map(msg => `${msg.role === 'user' ? 'Utilizador' : 'Assistente'}: ${msg.content}`)
      .join('\n');
    return systemPrompt + dialog + '\nAssistente:';
  };

  //Obtém o prompt completo
  const prompt = buildPromptFromMessages(messages);

  //Faz a chamada à API do Ollama
  try {
    const response = await axios.post(OLLAMA_URL, {
      model: MODEL, //Modelo a ser usado
      prompt, //Prompt construído a partir das mensagens
      max_tokens: 64, //Número máximo de tokens na resposta
      temperature: 0.8, //Controla a aleatoriedade da resposta (0.0 = determinístico, 1.0 = muito aleatório)
      frequency_penalty: 0.7, // Penaliza a repetição de palavras
      presence_penalty: 0.7, // Penaliza a repetição de tópicos
      stream: false // Se true, a resposta será enviada em partes (streaming)
    }, {
      timeout: 150000 // Tempo máximo de espera pela resposta (150 segundos)
    });

    return {
      role: 'assistant',
      content: response.data.response
    };
  } catch (error) {
    console.error('Erro ao comunicar com o Ollama:', error.message, error.response?.data);
  }
}

*/

/* FUNÇAO 2.0

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

*/

/* FUNÇAO 1.0
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
