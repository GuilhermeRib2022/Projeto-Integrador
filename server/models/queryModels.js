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

export default function normalizeText(text) {
  return text
    .toLowerCase()                       // Coloca tudo em lowercase
    .normalize("NFD")                    // separa acentos
    .replace(/[\u0300-\u036f]/g, "")     // remove acentos
    .replace(/[^\w\s]/g, '')             // remove pontuação
    .replace(/\s+/g, ' ')                // remove espaços duplicados
    .trim();
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
async function processWithLLM(question, messages, videoTitle, videoDescription, videoId, fonte) {
  const MODEL = 'qwen2.5:14b';
  const OLLAMA_URL = 'http://localhost:11434/api/generate';

  //1. VERIFICA PALAVRAS OFENSIVAS
  const ultimaMsg = question
  if (contemPalavraOfensiva(question)) {
    return {
      role: 'assistant',
      content: 'Por favor, mantém a linguagem respeitosa. Reformula a tua pergunta sem palavrões.'
    };
  }

  // 2. VERIFICA SE A PERGUNTA É EXATAMENTE IGUAL (NORMALIZADA) A ALGUMA JÁ GUARDADA
  const questionNormalized = normalizeText(question);

  const [allRows] = await pool.query(
    `SELECT Pergunta, Resposta FROM QueryLLM WHERE VideoID = ?`,
    [videoId]
  );

  let respostaDuplicada = null;
  let perguntaOriginalCorrespondente = null;

  for (const row of allRows) {
    const DBquestionNormalized = normalizeText(row.Pergunta);
    if (DBquestionNormalized === questionNormalized) {
      respostaDuplicada = row.Resposta;
      perguntaOriginalCorrespondente = row.Pergunta;
      break;
    }
  }

  if (respostaDuplicada) {
    await pool.query(
      `UPDATE QueryLLM SET counter = counter + 1 WHERE VideoID = ? AND Pergunta = ? AND Embedding IS NOT NULL`,
      [videoId, perguntaOriginalCorrespondente] // usar a pergunta original
    );

    return {
      role: 'assistant',
      content: respostaDuplicada,
      isNew: false,
    };
  }

  //3. GERAR EMBEDDING DA PERGUNTA ATUAL

  const questionEmbedding = await getEmbeddingOllama(questionNormalized);

  //3.1 Buscar na base de dados todos os embeddings de um video
  const [rows] = await pool.query(
    `SELECT Pergunta, Resposta, Embedding FROM QueryLLM WHERE VideoID = ? AND Embedding IS NOT NULL`,
    [videoId]
  );

  //3.2 Encontrar a pergunta mais semelhante semanticamente
  let melhorSimilaridade = -1; //Definir a similaridade como -1 (precisa de 0.85 para ser considerada)
  let respostaMaisProxima = null; //Definir a resposta mais próxima como nulo
  let perguntaMaisProxima = null; //Definir a pergunta da resposta mais próxima
  const LIMIAR = 0.93; // Define o limiar para considerar similaridade suficiente

  if (question.length > 8) { // Verifica se a pergunta é suficientemente longa
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

  const systemPrompt = `
Texto-fonte do vídeo, que contém detalhes adicionais: """${fonte}"""
O vídeo que o utilizador está a ver tem o seguinte título: "${videoTitle}". (Menciona apenas se o utilizador mencionar)
Descrição do vídeo: "${videoDescription}". (Menciona apenas se o utilizador mencionar)
És um assistente técnico que responde com informações objetivas e factuais, sempre em português de Portugal, de forma clara, precisa e curta (máximo 256 caracteres). Nunca ultrapasses este limite.
Nunca saias do contexto do título ou da descrição do vídeo. Se a pergunta estiver fora do contexto, responde apenas com a seguinte mensagem EXACTA, sem mencionar o conteúdo da pergunta nem justificar:
"Esta pergunta está fora do âmbito do vídeo atual. Por favor, mantém as questões relacionadas com o conteúdo apresentado."
Responde sempre assim, sem variações, e apenas em pt-pt.
`.trim();

  const prompt = systemPrompt + `Utilizador: ${question}\nAssistente:`;

  try {
    const response = await axios.post(OLLAMA_URL, {
      model: MODEL,
      prompt,
      top_p: 0.9,
      max_tokens: 64,
      temperature: 0.6,
      frequency_penalty: 0.4,
      presence_penalty: 0.2,
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



// #################################### //
// FUNÇÃO PRINCIPAL DE PROCESSAR IMAGEM //
// #################################### // 


async function imageWithLLM(question, videoId, videoTitle, videoDescription, fonte, videoTime) {
  const MODEL = 'qwen2.5vl:7b';
  const OLLAMA_URL = 'http://localhost:11434/api/generate';
  const IMAGE_URL = `http://localhost:9595/uploads/frames/frame-${videoId}-${videoTime}.jpg`;

  try {

    //2. VERIFICA SE A PERGUNTA É EXATAMENTE IGUAL A ALGUMA JÁ GUARDADA

    // 1. Obtem a imagem em dados binários através da URL (incluindo localhost se o servidor estiver no ar)
    const imageResponse = await axios.get(IMAGE_URL, { responseType: 'arraybuffer' });
    //Transforma um arraybuffer num buffer e dpeois para uma string em base64, que permite trabalhar com a imagem
    const imageBase64 = Buffer.from(imageResponse.data).toString('base64');

    // 2. Prompt (sem a imagem)
    const prompt =
      `O vídeo que o utilizador está a ver tem o seguinte título: "${videoTitle}".(Menciona apenas se o utilizador mencionar) \n` +
      `Descrição do vídeo: "${videoDescription}".(Menciona apenas se o utilizador mencionar) \n` +
      `[frame extraído do segundo ${videoTime}] \n` +
      `Pergunta do utilizador: ${question} \n` +
      `És um assistente técnico que responde com informações objetivas e factuais, sempre em português de Portugal, de forma clara, precisa e curta (máximo 256 caracteres). Nunca ultrapasses este limite. \n`+


`Se perguntas for sobre sentimentos, opinião, vida pessoal, temas gerais ou contextos externos responde apenas com esta frase EXACTA, sem variações ou justificações:
"Esta pergunta está fora do âmbito da imagem. Por favor, mantém as questões relacionadas com o conteúdo apresentado."\n`+

`Responde sempre assim, sem variações, e apenas em pt-pt. \n`.trim();

    // 3. Envia a imagem e o prompt para o modelo
    const response = await axios.post(OLLAMA_URL, {
      model: MODEL,
      prompt,
      stream: false,
      images: [imageBase64],
      temperature: 0.8,
      max_tokens: 64,
    });

    return {
      role: 'assistant',
      content: response.data.response,
      isNew: true,
      embedding: null,
    };
  } catch (err) {
    console.error('Erro ao gerar resposta visual:', err.message);
    return {
      role: 'assistant',
      content: 'Erro ao processar o frame do vídeo.',
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
    const [rows] = await pool.query('SELECT * FROM queryLLM where ID = ?', [id])
    return rows[0]
  },

  async deleteQuery(id) {
    const [rows] = await pool.query('DELETE FROM queryLLM where ID = ?', [id])
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

  processWithLLM,
  imageWithLLM

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