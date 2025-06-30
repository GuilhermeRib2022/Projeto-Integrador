import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../components/url';
import { Link } from 'react-router-dom';
import SearchForm from './SearchForm';
import './style.css'

const SearchResults = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const query = new URLSearchParams(useLocation().search);
    const texto = query.get('texto');
    const disciplina = query.get('disciplina') || '';

    function getContrastingTextColor(hex) {
        // Remove "#" if present
        const color = hex.replace('#', '');

        // Parse r, g, b values
        const r = parseInt(color.substr(0, 2), 16);
        const g = parseInt(color.substr(2, 2), 16);
        const b = parseInt(color.substr(4, 2), 16);

        // Calculate luminance (simple brightness formula)
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        // Return black for light backgrounds, white for dark ones
        return brightness > 128 ? '#000000' : '#FFFFFF';
    }

    useEffect(() => {
        if (!texto && !disciplina) {
            setVideos([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        // Monta URL com os parâmetros que existem
        let url = `${BASE_URL}/video/search?`;
        if (texto) url += `texto=${encodeURIComponent(texto)}&`;
        if (disciplina) url += `disciplina=${encodeURIComponent(disciplina)}&`;

        axios.get(url)
            .then(res => {
                setVideos(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });

    }, [texto, disciplina]);

    if (loading) return <p>Carregando...</p>;


    return (
        <div className="SearchResults">
            <div className="video-top">
                <SearchForm />
            </div>

            {loading && <p>Carregando...</p>}

            {!loading && videos.length === 0 && (
                <div className="search-header">
                    <h1>Nenhum vídeo encontrado para "{texto || disciplina}"</h1>
                    <button className="btn-voltar" onClick={() => navigate(`/`)}> Voltar </button>
                </div>
            )}

            {!loading && videos.length > 0 && (
                <>
                    <div className="search-header">
                        <h1>Resultados para "{texto || disciplina}"</h1>

                        <button className="btn-voltar" onClick={() => navigate(-1)}> Voltar </button>
                    </div>
                    <div className="video-list">
                        {videos.map((video, index) => (
                            <div className="video-card" key={index}>
                                <div className="video-header" style={{ backgroundColor: video.Cor || '#d0e3ff' }}>
                                    <span style={{ color: getContrastingTextColor(video.Cor), cursor: 'pointer' }} className={video.disciplina} onClick={() => navigate(`/pesquisar/disciplina?disciplina=${encodeURIComponent(video.Disciplina)}`)}><strong>{video.Disciplina}</strong></span>
                                    <span style={{ color: getContrastingTextColor(video.Cor) }} className={video.rating}>⭐ {Math.round(parseFloat(video.Nota) * 10)}%</span>
                                </div>

                                <div className="video-thumbnail">
                                    <img
                                        src={`${BASE_URL}/uploads/thumbnails/${video.Thumbnail}`}
                                        alt="thumbnail"
                                        onError={(e) => { e.target.src = '/placeholder.png'; }}
                                    />
                                    <span className="duration">{formatDuration(video.Duracao)}</span>
                                </div>

                                <div className="video-info">
                                    <Link to={`/video/${video.ID}`} className="video-card" key={index}>
                                        <h4 className="title">{video.Titulo}</h4>
                                    </Link>

                                    <p className="meta">
                                        {formatViews(video.Views)} visualizações • {formatDate(video.DataPublicacao)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// Helpers
const formatViews = (n) => n.toLocaleString('pt-PT');
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('pt-PT');
const formatDuration = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
};

export default SearchResults;
