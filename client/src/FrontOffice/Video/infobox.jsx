import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../components/url';
import './infobox.css'

import Rating from 'react-rating';
import 'font-awesome/css/font-awesome.min.css';

function VideoInfoBox({ video }) {
    const [expanded, setExpanded] = useState(true);
    const [rating, setRating] = useState(0); // OBTER DE video.nota
    const token = localStorage.getItem('token');

    const toggleExpanded = () => {
        setExpanded(prev => !prev);
    };

    const handleRatingChange = async (value) => {
        setRating(value);
        if (!token) return alert('Necessário iniciar sessão para fazer esta ação.')

        try {
            await axios.post(`${BASE_URL}/review/video/${video.ID}`, {
                Nota: value * 2
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error("Erro ao atualizar review:", err);
            alert("Erro ao atualizar review.");
        }

    };

    useEffect(() => {
        if (!token) return;
        axios.get(`${BASE_URL}/review/video/${video.ID}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setRating(res.data.Nota / 2);
            })
            .catch(err => console.error(err));
    }, []);

    const handleDeleteRating = async () => {
        if (!token) return alert('Necessário iniciar sessão para fazer esta ação.')
        try {
            await axios.delete(`${BASE_URL}/review/video/${video.ID}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRating(0); // Clear rating on UI
            alert('Avaliação removida.');
        } catch (error) {
            console.error('Erro ao deletar review:', error);
            alert('Erro ao remover avaliação.');
        }
    };

    return (
        <div className="video-info-box" >
            <div className="header video-title" onClick={toggleExpanded}>
                <h2>{video.Titulo}</h2>
                <button className="toggle-button" >...</button>
            </div>

            {expanded && (
                <div className="video-info-details">
                    <div className="creator-info">
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {video.FotoPerfil ? (
                                <img
                                    src={`${BASE_URL}/uploads/fotosperfil/${video.FotoPerfil}`}
                                    alt="pfp"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%' }}
                                />
                            ) : (
                                <img src="/profile.png" alt="TryLearn" height="40" />
                            )}
                            <div className="nome-criador">
                                <a className="nome" href={`/perfil/${video.UtilizadorID}`}>
                                    <strong>{video.Autor}</strong>
                                </a>
                            </div>
                        </div>

                        <span className="disciplina" style={{ background: video.Cor }}>
                            {video.Disciplina}
                        </span>

                        <div className="video-date">
                            {new Date(video.DataPublicacao).toLocaleDateString('pt-PT')}
                        </div>
                    </div>


                    <div className="rating-section">
                        <Rating
                            initialRating={rating}
                            onChange={handleRatingChange}
                            emptySymbol="fa fa-star-o fa-2x"
                            fullSymbol="fa fa-star fa-2x"
                            fractions={10}
                        />
                        <button
                            className="delete-rating-btn"
                            onClick={handleDeleteRating}
                            aria-label="Delete rating"
                            style={{
                                marginLeft: '-300px',
                                cursor: 'pointer',
                                background: 'transparent',
                                border: 'none',
                                fontSize: '20px',
                                color: 'black',
                            }}
                        >
                            ✖
                        </button>
                        <span className="rating-percentage">
                            <i className="fa fa-star" style={{ background: 'transparent', border: 'none', fontSize: '25px', color: 'black', cursor: 'default', }}></i>
                            {Math.round(parseFloat(video.Nota) * 10)}%
                        </span>
                    </div>

                    <div className="description-section">
                        <strong>Descrição:</strong>
                        <textarea
                            readOnly
                            value={video.Descricao || "Sem descrição"}
                            className='video-description-list'
                            rows={4}
                            style={{ width: '100%', resize: 'none', border: 'none', backgroundColor: 'transparent', color: '#333', fontFamily: 'inherit' }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    {video.FontePath && (
                        <div className="fonte-section" style={{ marginTop: '10px' }}>
                            Transferir fonte do vídeo:{` `}
                            <a
                                href={`${BASE_URL}/uploads/fonte/${video.FontePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#007bff', textDecoration: 'underline' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {video.FontePath}
                            </a>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default VideoInfoBox;
