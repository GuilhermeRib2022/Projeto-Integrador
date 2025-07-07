import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../../../components/url';
import './style.css';

const EstatisticaVideo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videoInfo, setVideoInfo] = useState(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEstatisticas = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/video/estatisticas/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setVideoInfo(res.data);
      } catch (err) {
        setErro('Erro ao carregar estatísticas do vídeo.');
      } finally {
        setLoading(false);
      }
    };

    fetchEstatisticas();
  }, [id]);

  if (loading) return <p>A carregar estatísticas...</p>;
  if (erro) return <div className="erro">{erro}</div>;
  if (!videoInfo) return null;

  const {
    Titulo,
    Visualizacoes,
    OldVisualizacoes,
    TotalReviews,
    MediaAvaliacao,
    TotalComentarios,
    DataCriacao,
    DataAlteracao, 
  } = videoInfo;

  const diferencaViews = Visualizacoes - (OldVisualizacoes || 0);
  const diferencaCor = diferencaViews >= 0 ? 'green' : 'red';

  return (
    <div className="container mt-4 edit-video estatistica-video">
      <div className="fixd d-flex justify-content-between align-items-center mb-3">
        <h1>Estatísticas do Vídeo</h1>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Voltar</button>
      </div>
      <hr />

      <div className="table-container">
        <table className="table table-bordered table-striped table-hover">
          <tbody>
            <tr>
              <th>Título</th>
              <td>{Titulo}</td>
            </tr>
            <tr>
              <th>Publicado em</th>
              <td>{new Date(DataCriacao).toLocaleString()}</td>
            </tr>
            <tr>
  <th>Alterado Em</th>
  <td>{DataAlteracao ? new Date(DataAlteracao).toLocaleString() : 'N/A'}</td>
</tr>
            <tr>              
              <th>Visualizações totais</th>
              <td>{Visualizacoes}</td>
            </tr>
            <tr>
              <th>Visualizações (semana passada)</th>
              <td>{OldVisualizacoes || 0}</td>
            </tr>
            <tr>
              <th>Diferença</th>
              <td style={{ color: diferencaCor }}>
                {diferencaViews >= 0 ? '+' : ''}
                {diferencaViews}
              </td>
            </tr>
            <tr>
              <th>Total de Reviews</th>
              <td>{TotalReviews}</td>
            </tr>
            <tr>
              <th>Média de Avaliações</th>
              <td>{Number(MediaAvaliacao)?.toFixed(2) || 'N/A'}</td>
            </tr>
            <tr>
              <th>Total de Comentários</th>
              <td>{TotalComentarios}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EstatisticaVideo;
