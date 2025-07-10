import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../../../components/url';
import './style.css';

const ListarVideo = () => {
    const [data, setData] = useState([]);
    const [videos, setVideos] = useState([]);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    setErro('Token de autenticação não encontrado. Por favor, faça login novamente.');
                    return;
                }
                const response = await axios.get(`${BASE_URL}/video/user`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setVideos(response.data);
            } catch (error) {
                console.error("Erro ao carregar vídeos:", error);
            }
        };

        fetchVideos();
    }, []);
    

        const toggleEstado = async (id, currentEstado) => {
    const novoEstado = currentEstado === 'ativo' ? 'inativo' : 'ativo';

    try {
      if (novoEstado === 'inativo') {
        await axios.delete(`${BASE_URL}/video/${id}/desativar`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      } else {
        await axios.patch(`${BASE_URL}/video/${id}/ativar`, { }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      }

      setVideos(prevVideos  =>
        prevVideos.map(video =>
          video.ID === id ? { ...video, Estado: novoEstado } : video
        )
      );
    } catch (err) {
      console.error("Erro ao alterar estado:", err);
      alert("Erro ao alterar estado.");
    }
  };

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
            <hr></hr>
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
                        <th>Estado</th>
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
                                    style={{
                                        aspectRatio: '16 / 9',
                                    }}
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
                            <td className="text-center align-middle">
                                <button
                                    className={`btn btn-sm ${video.Estado === 'ativo' ? 'btn-success' : 'btn-danger'}`}
                                    onClick={() => toggleEstado(video.ID, video.Estado)}
                                    style={{ width: '90px' }}
                                >
                                    {video.Estado}
                                </button>
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
            <hr></hr>
        </div>
    );
};

export default ListarVideo;
