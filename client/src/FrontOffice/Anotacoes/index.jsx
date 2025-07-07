import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../components/url';
import './style.css';
import { jwtDecode } from 'jwt-decode';


const Anotacoes = () => {
    const [anotacoes, setAnotacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const token = localStorage.getItem('token');
    const userID = token ? jwtDecode(token)?.id : null;

    useEffect(() => {
        const fetchAnotacoes = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/anotacao/user`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAnotacoes(res.data);
            } catch {
                setError('Erro ao obter anotações');
            } finally {
                setLoading(false);
            }
        };

        if (userID) fetchAnotacoes();
    }, [userID, token]);

    const handleVideoClick = (videoID) => {
        navigate(`/video/${videoID}`);
    };

    if (loading) return <p>Carregando...</p>;
    if (error) return <p>{error}</p>;
    if (anotacoes.length === 0) return <p>Você ainda não tem anotações.</p>;

    const filteredAnotacoes = anotacoes.filter(anotacao =>
        anotacao.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        anotacao.Texto.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="anotacoes-container">
            <div className="search-header">
                <h1>Minhas Anotações</h1>
                <button className="btn btn-primary" onClick={() => navigate(-1)}> Voltar </button>
            </div>
            <input
                type="text"
                placeholder="Pesquisar por título ou anotação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control mb-3"
                style={{ maxWidth: '400px' }}
            />
            <table className="tabela-anotacoes">
                <thead>
                    <tr>
                        <th>Título do Vídeo</th>
                        <th>Texto da Anotação</th>
                        <th>Data</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAnotacoes.map((anotacao) => (
                        <tr
                            key={anotacao.ID}
                            className="linha-clicavel"
                            onClick={() => handleVideoClick(anotacao.VideoID)}
                            style={{ cursor: 'pointer' }}
                            title="Clique para ver o vídeo"
                        >
                            <td className="td-video video-title-anotacao" style={{ textDecoration: 'underline', color: '#007bff' }}>
                                <img
                                    src={`${BASE_URL}/uploads/thumbnails/${anotacao.Thumbnail}`}
                                    alt="thumbnail"
                                    className="anotacoes-thumbnail"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/video/${anotacao.VideoID}`);
                                    }}
                                    onError={(e) => { e.target.src = '/placeholder.png'; }}
                                />
                                {anotacao.titulo}</td>
                            <td>
                                <textarea
                                    readOnly
                                    value={anotacao.Texto}
                                    rows={4}
                                    style={{ width: '100%', resize: 'none', border: 'none', backgroundColor: 'transparent', color: '#333', fontFamily: 'inherit' }}
                                    onClick={(e) => e.stopPropagation()} // evita que o clique no textarea dispare o onClick da linha
                                />
                            </td>
                            <td>{new Date(anotacao.DataAlteracao).toLocaleString('pt-PT')}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Anotacoes;
