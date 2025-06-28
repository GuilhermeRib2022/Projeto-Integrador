import { useState } from 'react';
import './infobox.css'

function VideoInfoBox({ video }) {
    const [expanded, setExpanded] = useState(true);
    const [rating, setRating] = useState(0); // ou video.Nota se quiser usar valor vindo do back-end

    const toggleExpanded = () => {
        setExpanded(prev => !prev);
    };

    const handleStarClick = (index) => {
        setRating(index + 1);
        // Aqui você pode fazer POST da avaliação se quiser
    };

    return (
        <div className="video-info-box" >
            <div className="header" onClick={toggleExpanded}> 
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
                    </div>

                    <div className="rating-section">
                        <div className="stars">
                            {[5, 4, 3, 2, 1].map((num, index) => (
                                <span
                                    key={num}
                                    className={`star ${rating >= num ? 'filled' : ''}`}
                                    onClick={() => handleStarClick(num - 1)}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
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
