import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../components/url';
import { useNavigate } from 'react-router-dom';
import './style.css'; // opcional, se quiser estilizar

const EstatisticasUtilizador = () => {
    const [utilizadores, setUtilizadores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState("QueryTime");
    const [sortOrder, setSortOrder] = useState("desc"); 
    const itemsPerPage = 10;
    const navigate = useNavigate();



    useEffect(() => {
        const fetchEstatisticas = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${BASE_URL}/utilizador/estatisticas`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUtilizadores(response.data);
            } catch (err) {
                console.error(err);
                setErro('Erro ao buscar estatísticas dos utilizadores.');
            } finally {
                setLoading(false);
            }
        };

        fetchEstatisticas();
    }, []);

    const filteredData = utilizadores.filter((user) =>
        user.Nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedData = [...filteredData].sort((a, b) => {
        const valA = a[sortField] ?? 0;
        const valB = b[sortField] ?? 0;

        if (sortField === "counter") {
            // Ordenar por counter primeiro
            if (valB !== valA) return valB - valA;

            // Segundo critério: Embedding
            if (a.Embedding && !b.Embedding) return -1;
            if (!a.Embedding && b.Embedding) return 1;
            return 0;
        }

        if (typeof valA === 'string') {
            return sortOrder === 'asc'
                ? valA.localeCompare(valB)
                : valB.localeCompare(valA);
        }

        return sortOrder === 'asc'
            ? valA - valB
            : valB - valA;
    });

    // Paginação
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentData = sortedData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const sortOptions = [
        { label: "ID", field: "ID", order: "asc" },
        { label: "Nome", field: "Nome", order: "desc" },
        { label: "Anotações", field: "TotalAnotacoes", order: "desc" },
        { label: "Queries", field: "TotalQueryLLM", order: "desc" },
        { label: "Avaliações", field: "TotalReviews", order: "desc" },
        { label: "Comentários", field: "TotalComentarios", order: "desc" },
        { label: "Subscrições", field: "TotalSubscricoes", order: "desc" },
    ];

    if (loading) return <p>🔄 A carregar estatísticas...</p>;
    if (erro) return <div className="erro">{erro}</div>;
    if (!utilizadores.length) return <p>Nenhuma estatística encontrada.</p>;

    return (
        <div className="container mt-4 estatisticas-utilizador">

            <div className="fixd d-flex justify-content-between align-items-center mb-3">
                <h1>👤 Estatísticas por Utilizador</h1>
                <div className="form-outline flex-grow-1 mx-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Pesquisar utilizador..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    />
                </div>

                <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Voltar</button>
            </div>
            <hr></hr>
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                <div className="d-flex gap-2 flex-wrap">
                    {sortOptions.map(({ label, field, order }) => (
                        <button
                            key={field}
                            className={`btn btn-sm ${sortField === field ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => {
                                setSortField(field);
                                setSortOrder(order);
                                setCurrentPage(1);
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                <div className="d-flex align-items-center">
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
            <table className="table table-bordered table-striped table-hover">
                <thead className="thead-dark">
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Anotações</th>
                        <th>QueryLLM</th>
                        <th>Reviews</th>
                        <th>Comentários</th>
                        <th>Subscrições</th>
                    </tr>
                </thead>
                <tbody>
                    {currentData.map((user) => (
                        <tr key={user.ID}>
                            <td>{user.ID}</td>
                            <td>{user.Nome}</td>
                            <td>{user.TotalAnotacoes || 0}</td>
                            <td>{user.TotalQueryLLM || 0}</td>
                            <td>{user.TotalReviews || 0}</td>
                            <td>{user.TotalComentarios || 0}</td>
                            <td>{user.TotalSubscricoes || 0}</td>
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

export default EstatisticasUtilizador;
