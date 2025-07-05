import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../../../components/url';
import './style.css';

const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
};

const ListarVideo = () => {
    const [videos, setVideos] = useState([]);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchVideos = async () => {
            console.log("Chamando API de vídeos...");
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setErro('Token de autenticação não encontrado. Por favor, faça login novamente.');
                    return;
                }
                const response = await axios.get(`${BASE_URL}/video/user`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log("Resposta da API:", response.data);
                setVideos(response.data);
            } catch (error) {
                console.error("Erro ao carregar vídeos:", error);
            }
        };

        fetchVideos();
    }, []);

        const filteredVideos = videos.filter(video =>
        video.Titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mt-4">
            <h2>Meus Vídeos</h2>
            <input
                type="text"
                placeholder="Pesquisar por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control mb-3"
                style={{ maxWidth: '400px' }}
            />
            <table className="table-videos table table-striped table-hover  centered-table mt-3 ">
                <thead>
                    <tr>
                        <th>Thumbnail</th>
                        <th>Título</th>
                        <th>Disciplina</th>
                        <th>Nota Média</th>
                        <th>Visualizações</th>
                        <th>Data</th>
                        <th>Descrição</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredVideos.map(video => (
                        <tr key={video.ID}>
                            <td>
                                <img
                                    src={`${BASE_URL}/uploads/thumbnails/${video.Thumbnail}`}
                                    alt="thumbnail"
                                    className="anotacoes-thumbnail"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/video/${video.ID}`);
                                    }}
                                    onError={(e) => { e.target.src = '/placeholder.png'; }}
                                />

                            </td>
                            <td>
                                {video.Titulo}</td>
                            <td>
                                <span className="badge" style={{ backgroundColor: video.Cor }}>
                                    {video.Disciplina}
                                </span>
                            </td>
                            <td>{video.Nota ? Number(video.Nota).toFixed(1) : "Sem nota"}</td>
                            <td>{video.Views ?? 0}</td>
                            <td>{video.DataPublicacao ? new Date(video.DataPublicacao).toLocaleDateString() : "Sem data"}</td>
                                                        <td>
                                <textarea
                                    readOnly
                                    value={video.Descricao || "Sem descrição"}
                                    className='video-description-list'
                                    rows={4}
                                    style={{ width: '100%', resize: 'none', border: 'none', backgroundColor: 'transparent', color: '#333', fontFamily: 'inherit' }}
                                    onClick={(e) => e.stopPropagation()} // evita que o clique no textarea dispare o onClick da linha
                                />
                            </td>
                            <td>
                                <button
                                    className="btn btn-sm btn-primary me-2"
                                    onClick={() => navigate(`editar/${video.ID}`)}
                                >
                                    Editar
                                </button>
                                <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => navigate(`estatisticas/${video.ID}`)}
                                >
                                    Estatísticas
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ListarVideo;
