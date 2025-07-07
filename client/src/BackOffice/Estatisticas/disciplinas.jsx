import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../components/url';
import { useNavigate } from 'react-router-dom';
import './style.css'; // opcional, se quiser estilizar

const EstatisticasDisciplina = () => {
    const [disciplinas, setDisciplinas] = useState([]); //Obtém dados do backend
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const navigate = useNavigate();


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
        const fetchEstatisticas = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${BASE_URL}/disciplina/estatisticas`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setDisciplinas(response.data);
            } catch (err) {
                console.error(err);
                setErro('Erro ao buscar estatísticas das disciplinas.');
            } finally {
                setLoading(false);
            }
        };

        fetchEstatisticas();
    }, []);

    const filteredData = disciplinas.filter((disciplina) =>
        disciplina.Nome.toLowerCase().includes(searchTerm.toLowerCase())
    );


    // Paginação
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    if (loading) return <p>🔄 A carregar estatísticas...</p>;
    if (erro) return <div className="erro">{erro}</div>;
    if (!disciplinas.length) return <p>Nenhuma estatística encontrada.</p>;

    return (
        <div className="container mt-4 estatisticas-disciplina">

            <div className="fixd d-flex justify-content-between align-items-center mb-3">
                <h1>📚 Estatísticas por Disciplina</h1>
                <div className="form-outline flex-grow-1 mx-3" data-mdb-input-init>
                    <input type="text" className="form-control" placeholder="Pesquisar disciplina..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);} } />
                </div>
                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Voltar</button>
            </div>

            <table className="table table-bordered table-striped table-hover">
                <thead className="thead-dark">
                    <tr>
                        <th>Disciplina</th>
                        <th>Total de Vídeos</th>
                        <th>Total de Visualizações</th>
                        <th>Média das Avaliações</th>
                        <th>Total de Inscrições</th>
                    </tr>
                </thead>
                <tbody>
                    {currentData.map((disciplina) => (
                        <tr key={disciplina.ID}>
                            <td> <span
                                style={{ backgroundColor: disciplina.Cor || '#ddd', color: getContrastingTextColor(disciplina.Cor), padding: '4px 8px', borderRadius: '4px', display: 'inline-block', fontWeight: 'bold' }}
                            >
                                {disciplina.Nome}
                            </span></td>
                            <td>{disciplina.TotalVideos || 0}</td>
                            <td>{disciplina.TotalViews || 0}</td>
                            <td>{disciplina.MediaReviews ? Number(disciplina.MediaReviews).toFixed(2) : '0.00'}</td>
                            <td>{disciplina.Inscricoes || 0}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="d-flex justify-content-end align-items-center mt-3">
                <button
                    className="btn btn-outline-primary mx-1"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                    Prev
                </button>

                {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i}
                        className={`btn mx-1 ${currentPage === i + 1 ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}

                <button
                    className="btn btn-outline-primary mx-1"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default EstatisticasDisciplina;
