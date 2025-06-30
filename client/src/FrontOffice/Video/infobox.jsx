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
        console.log('New rating:', value * 2);

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
        axios.get(`${BASE_URL}/review/video/${video.ID}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setRating(res.data.Nota / 2);
            })
            .catch(err => console.error(err));
    }, []);

    const handleDeleteRating = async () => {
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
                        <img src={video.CriadorFotoPerfil} alt="Criador" className="creator-avatar" />
                        <div className="creator-text">
                            <strong>{video.Autor}</strong>
                            <span className="disciplina" style={{ background: video.Cor }}>
                                {video.Disciplina}
                            </span>
                        </div>
                        <span className="rating-section">
                            <i className="fa fa-star" style={{ color: 'black', marginRight: '4px' }}></i>
                            {Math.round(parseFloat(video.Nota) * 10)}%
                        </span>
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
                        <div className="video-date">
                            {new Date(video.DataPublicacao).toLocaleDateString('pt-PT')}
                        </div>
                    </div>

                    <div className="description-section">
                        <strong>Descrição:</strong>
                        <p>{video.Descricao}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VideoInfoBox;
