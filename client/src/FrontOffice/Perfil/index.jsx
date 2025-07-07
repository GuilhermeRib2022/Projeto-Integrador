import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';  // Para pegar o id da URL
import { Link } from 'react-router-dom';
import { BASE_URL } from '../../components/url';
import './style.css';

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};


const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const formatViews = (views) => {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views;
};

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString();
};

const getContrastingTextColor = (bgColor) => {
  if (!bgColor) return '#000';
  const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? '#000' : '#fff';
};

const Perfil = () => {
  const { id } = useParams(); // Pega o id da URL
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);

  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  const userID = token ? parseJwt(token)?.id : null;
  const navigate = useNavigate();


  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/utilizador/perfil/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPerfil(res.data[0]);
        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar perfil');
        setLoading(false);
      }
    };

    if (id) fetchPerfil();
  }, [id]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/video/utilizador/${id}`);
        setVideos(res.data);
      } catch (err) {
        console.error('Erro ao carregar vídeos:', err);
      }
    };

    const fetchDisciplinas = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/disciplina/utilizador/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDisciplinas(res.data);
      } catch (err) {
        console.error('Erro ao carregar disciplinas:', err);
      }
    };

    if (id) {
      fetchVideos();
    }

    if (perfil?.CargoID === 2 || perfil?.CargoID === 3) {
      fetchDisciplinas();
    }
  }, [id, perfil?.CargoID]);

  if (loading) return <div>Carregando perfil...</div>;
  if (error) return <div>{error}</div>;
  if (!perfil) return <div>Perfil não encontrado</div>;

  return (
    <>
<div className="perfil-mount">
  <div className="perfil-container">
  {perfil.FotoPerfil ? (
    <img
      src={`${BASE_URL}/uploads/fotosperfil/${perfil.FotoPerfil}`}
      alt="pfp"
    />
  ) : (
    <img src="/profile.png" alt="TryLearn" />
  )}

  <div className="perfil-info">
    <h2>{perfil.nome}</h2>
    <p className="description">{perfil.Descricao}</p>
    <p className="date"><strong>Membro desde:</strong> {new Date(perfil.DataCriacao).toLocaleDateString()}</p>
    {userID === perfil.ID && (
      <button
        className="editarperfil-btn"
        onClick={() => navigate('/perfil/editar')}
        title="Editar perfil"
      >
        &#8942;
      </button>
    )}
  </div>
</div>
{(perfil.cargo !== 1) && (
  <>
    <strong style={{ fontSize: '20px' }}>Disciplinas</strong>
    <div className="disciplinas-container">
      {disciplinas.length > 0 ? (
        disciplinas.map((disciplina, index) => (
          <span
            key={index}
            className="disciplina-list"
            style={{
              backgroundColor: disciplina.Cor || '#ddd',
              color: getContrastingTextColor(disciplina.Cor),
            }}
          >
            {disciplina.Nome}
          </span>
        ))
      ) : (
        <p style={{ marginTop: '10px' }}>
          Este utilizador não tem disciplinas lecionadas.
        </p>
      )}
    </div>
  </>
)}
</div>




      <div className="perfil-section">
        <br></br>
        <h3>Vídeos Publicados</h3>
        <br></br>
        {videos.length > 0 ? (
          <div className="perfil-videos">
            {videos.map((video, index) => (
              <div className="video-card" key={index}>
                <div className="video-header" style={{ backgroundColor: video.Cor || '#d0e3ff' }}>
                  <span
                    style={{ color: getContrastingTextColor(video.Cor), cursor: 'pointer' }}
                    onClick={() =>
                      navigate(`/pesquisar/disciplina?disciplina=${encodeURIComponent(video.Disciplina)}`)
                    }
                    className="disciplina-profile"
                  >
                    <strong>{video.Disciplina}</strong>
                  </span>
                  <span
                    style={{ color: getContrastingTextColor(video.Cor) }}
                    className="rating"
                  >
                    ⭐ {Math.round(parseFloat(video.Nota) * 10)}%
                  </span>
                </div>

                <div className="video-thumbnail">
                  <img
                    src={`${BASE_URL}/uploads/thumbnails/${video.Thumbnail}`}
                    alt="thumbnail"
                    onClick={() => navigate(`/video/${video.ID}`)}
                    onError={(e) => { e.target.src = '/placeholder.png'; }}
                  />
                  <span className="duration">{formatDuration(video.Duracao)}</span>
                </div>

                <div className="video-info">
                  <Link to={`/video/${video.ID}`}>
                    <h4 className="title">{video.Titulo}</h4>
                  </Link>
                  <p className="meta">
                    {formatViews(video.Views)} visualizações • {formatDate(video.DataPublicacao)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Este utilizador ainda não publicou vídeos.</p>
        )}
      </div>
    </>
  );
};

export default Perfil;
