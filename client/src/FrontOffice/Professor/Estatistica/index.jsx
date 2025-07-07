import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { BASE_URL } from '../../../components/url';
import './style.css';

const Estatisticas = () => {
const { id } = useParams(); 
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.get(`${BASE_URL}/utilizador/professor/estatisticas/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Resposta da API:', response.data);
        setStats(response.data);
      } catch (error) {
        setErro('Erro ao carregar estatísticas.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p>A carregar estatísticas...</p>;
  if (erro) return <div className="erro">{erro}</div>;
  if (!stats) return null;

  const diferencaViews = (stats.viewsSemanaAtual || 0) - (stats.viewsSemanaPassada || 0);
  const diferencaColor = diferencaViews >= 0 ? 'green' : 'red';

  return (
    <div className="container mt-4 edit-video estatistica-video">
      <div className="fixd d-flex justify-content-between align-items-center mb-3">
        <h1>Estatísticas Gerais do Professor</h1>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Voltar</button>
      </div>
      <hr />

      {/* VÍDEOS */}
      <h4>🎬 VÍDEOS</h4>
      <table className="table table-bordered table-striped table-hover">
        <tbody>
          <tr>
            <th>Total de Vídeos</th>
            <td>{stats.totalVideos}</td>
          </tr>
          <tr>
            <th>Duração média dos vídeos</th>
            <td>{Number(stats.duracaoMediaVideos).toFixed(2) || '0'} segundos</td>
          </tr>
        </tbody>
      </table>

      {/* VISUALIZAÇÕES */}
      <h4>📊 VISUALIZAÇÕES</h4>
      <table className="table table-bordered table-striped table-hover">
        <tbody>
          <tr>
            <th>Visualizações Totais</th>
            <td>{stats.totalViews}</td>
          </tr>
          <tr>
            <th>Média de visualizações por vídeo</th>
            <td>{stats.mediaViews.toFixed(2) || '0'}</td>
          </tr>
          <tr>
            <th>Total desta semana</th>
            <td>{stats.viewsSemanaAtual || 0}</td>
          </tr>
          <tr>
            <th>Total da semana passada</th>
            <td>{stats.viewsSemanaPassada || 0}</td>
          </tr>
          <tr>
            <th>Diferença</th>
            <td style={{ color: diferencaColor }}>
              {diferencaViews >= 0 ? '+' : ''}
              {diferencaViews}
            </td>
          </tr>
          <tr>
            <th>Vídeo mais visto</th>
            <td>{stats.videoMaisVisto || '0'}</td>
          </tr>
        </tbody>
      </table>

      {/* AVALIAÇÕES */}
      <h4>⭐ AVALIAÇÕES</h4>
      <table className="table table-bordered table-striped table-hover">
        <tbody>
          <tr>
            <th>Total de avaliações</th>
            <td>{stats.totalAvaliacoes || '0'}</td>
          </tr>
          <tr>
            <th>Média das avaliações</th>
            <td>{!isNaN(Number(stats.averageRating)) ? Number(stats.averageRating).toFixed(2) : '0'}</td>
          </tr>
          <tr>
            <th>Vídeo melhor avaliado</th>
            <td>{stats.videoMelhorAvaliado || '0'}</td>
          </tr>
        </tbody>
      </table>

      {/* COMENTÁRIOS */}
      <h4>💬 COMENTÁRIOS</h4>
      <table className="table table-bordered table-striped table-hover">
        <tbody>
          <tr>
            <th>Total de comentários</th>
            <td>{stats.totalComentarios}</td>
          </tr>
          <tr>
            <th>Comentários na última semana</th>
            <td>{stats.comentariosSemana || '0'}</td>
          </tr>
          <tr>
            <th>Média de comentários por vídeo</th>
            <td>{stats.mediaComentariosPorVideo || '0'}</td>
          </tr>
        </tbody>
      </table>

      {/* DISCIPLINAS */}
      <h4>📚 DISCIPLINAS</h4>
      <table className="table table-bordered table-striped table-hover">
        <tbody>
          <tr>
            <th>Total de disciplinas associadas</th>
            <td>{stats.totalDisciplinas}</td>
          </tr>
          <tr>
            <th>Disciplina com mais visualizações</th>
            <td>{stats.disciplinaMaisVisualizada || '0'}</td>
          </tr>
          <tr>
            <th>Disciplina com melhor avaliação</th>
            <td>{stats.disciplinaMelhorAvaliada || '0'}</td>
          </tr>
        </tbody>
      </table>

      {/* ATIVIDADE */}
      <h4>📌 ATIVIDADE</h4>
      <table className="table table-bordered table-striped table-hover">
        <tbody>
          <tr>
            <th>Anotações feitas por utilizadores</th>
            <td>{stats.totalAnotacoes || '0'}</td>
          </tr>
          <tr>
            <th>Perguntas feitas ao ChatBot</th>
            <td>{stats.totalPerguntasLLM || '0'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Estatisticas;
