import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../components/url';
import { Link } from 'react-router-dom';
import SearchForm from './SearchForm';
import './style.css'

const SearchResults = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortField, setSortField] = useState("FatorCrescimento");
    const [sortOrder, setSortOrder] = useState("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const texto = searchParams.get('texto') || '';
    const disciplina = searchParams.get('disciplina') || '';

    function getContrastingTextColor(hex) {
        const color = hex.replace('#', '');
        const r = parseInt(color.substr(0, 2), 16);
        const g = parseInt(color.substr(2, 2), 16);
        const b = parseInt(color.substr(4, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
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

    }, [searchParams]);

    if (loading) return <p>A carregar...</p>;

const sortedVideos = [...videos].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];

    const numA = parseFloat(valA);
    const numB = parseFloat(valB);

    const isNumA = !isNaN(numA);
    const isNumB = !isNaN(numB);

    // Se estiver ordenando por número
    if (sortField === 'Nota' || sortField === 'FatorCrescimento' || sortField === 'Views') {
        if (!isNumA && !isNumB) return 0;
        if (!isNumA) return 1; // sempre empurra A para o fim
        if (!isNumB) return -1; // sempre empurra B para o fim
        return sortOrder === 'asc' ? numA - numB : numB - numA;
    }

    // Se for data
    if (sortField === 'DataPublicacao') {
        const dateA = new Date(valA);
        const dateB = new Date(valB);

        const isValidDateA = !isNaN(dateA.getTime());
        const isValidDateB = !isNaN(dateB.getTime());

        if (!isValidDateA && !isValidDateB) return 0;
        if (!isValidDateA) return sortOrder === 'asc' ? 1 : -1;
        if (!isValidDateB) return sortOrder === 'asc' ? -1 : 1;

        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    }

    // Por padrão, ordena como string
    const strA = String(valA);
    const strB = String(valB);
    return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
});

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const paginatedVideos = sortedVideos.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(sortedVideos.length / itemsPerPage);


    return (
        <div className="SearchResults">
            <div className="video-top">
                <SearchForm />
            </div>

            {!loading && videos.length === 0 && (
                <div className="search-header">
                    <h1>Nenhum vídeo encontrado para "{texto || disciplina}"</h1>
                    <button className="btn btn-primary" onClick={() => navigate(`/`)}> Voltar </button>
                </div>
            )}

            {!loading && videos.length > 0 && (
                <>
                    <div className="search-header">
                        <h1>Resultados para "{texto || disciplina}"</h1>
                        <button className="btn btn-primary" onClick={() => navigate(-1)}> Voltar </button>
                    </div>

                    <hr className="barreira"></hr>


                    <div className="d-flex justify-content-between align-items-center flex-wrap mb-3">
                        <div className="d-flex flex-wrap gap-2">
                            {[
                                { label: "Relevante", field: "FatorCrescimento", order: "desc" },
                                { label: "Mais Recentes", field: "DataPublicacao", order: "desc" },
                                { label: "Melhor Avaliados", field: "Nota", order: "desc" },
                                { label: "Mais Vistos", field: "Views", order: "desc" },
                            ].map(({ label, field, order }) => (
                                <button
                                    key={field}
                                    className={`btn btn-sm ${sortField === field && sortOrder === order ? 'btn-primary' : 'btn-outline-primary'}`}
                                    onClick={() => {
                                        setSortField(field);
                                        setSortOrder(order);
                                    }}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="d-flex align-items-center ms-auto mt-2 mt-sm-0">
                            <button
                                className="btn btn-outline-primary mx-1"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
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
                                onClick={() => setCurrentPage(prev => prev + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>

                    <div className="video-list">
                        {paginatedVideos.map((video, index) => (
                            <div className="video-card col-12 col-sm-6 col-md-4 col-lg-3" key={index}>
                                <div className="video-header" style={{ backgroundColor: video.Cor || '#d0e3ff' }}>
                                    <span
                                        style={{ color: getContrastingTextColor(video.Cor), cursor: 'pointer' }}
                                        onClick={() => navigate(`/pesquisar/disciplina?disciplina=${encodeURIComponent(video.Disciplina)}`)}
                                    >
                                        <strong>{video.Disciplina}</strong>
                                    </span>
                                     <span style={{color: getContrastingTextColor(video.Cor)}}>⭐ {video.Nota? Math.round(parseFloat(video.Nota) * 10)+"%" : ""}</span>
                                </div>

                                <div className="video-thumbnail">
                                    <img
                                        src={`${BASE_URL}/uploads/thumbnails/${video.Thumbnail}`}
                                        alt="thumbnail"
                                        onClick={() => navigate(`/video/${(video.ID)}`)}
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

                    <div className="d-flex justify-content-end mt-3">
                        <button
                            className="btn btn-outline-primary mx-1"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
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
                            onClick={() => setCurrentPage(prev => prev + 1)}
                        >
                            Next
                        </button>
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
