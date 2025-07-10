import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './style.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import { BASE_URL } from '../../../components/url';

const Videos = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("QueryTime");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    axios.get(`${BASE_URL}/video`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar vídeos:", err);
        setError("Erro ao carregar vídeos.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>A carregar vídeos...</p>;
  if (error) return <p>{error}</p>;

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

      setData(prevData =>
        prevData.map(item =>
          item.ID === id ? { ...item, Estado: novoEstado } : item
        )
      );
    } catch (err) {
      console.error("Erro ao alterar estado:", err);
      alert("Erro ao alterar estado.");
    }
  };
  

  const filteredData = data.filter((video) =>
    video.Titulo?.toLowerCase().includes(search.toLowerCase()) ||
    video.Descricao?.toLowerCase().includes(search.toLowerCase()) ||
    video.Autor?.toLowerCase().includes(search.toLowerCase()) ||
    video.Disciplina?.toLowerCase().includes(search.toLowerCase())
  );

const sortedData = [...filteredData].sort((a, b) => {
  const valA = a[sortField];
  const valB = b[sortField];

  // Trata valores nulos ou indefinidos
  if (valA == null && valB == null) return 0;
  if (valA == null) return sortOrder === 'asc' ? 1 : -1;
  if (valB == null) return sortOrder === 'asc' ? -1 : 1;

  // Se ambos forem números
  if (!isNaN(valA) && !isNaN(valB)) {
    return sortOrder === 'asc' ? valA - valB : valB - valA;
  }

  // Se ambos forem datas válidas
  const dateA = new Date(valA);
  const dateB = new Date(valB);
  if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  }

  // Comparação como string (por último)
  const strA = String(valA);
  const strB = String(valB);
  return sortOrder === 'asc'
    ? strA.localeCompare(strB)
    : strB.localeCompare(strA);
});


  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const sortOptions = [
    { label: "ID", field: "ID", order: "desc" },
    { label: "Título", field: "Titulo", order: "asc" },
    { label: "Nota Média", field: "Nota", order: "desc" },
    { label: "Visualizações", field: "Views", order: "desc" },
    { label: "Data Criação", field: "DataPublicacao", order: "desc" },
  ];


  return (
    <>
      <div className="fixd d-flex justify-content-between align-items-center mb-3">
        <h1>Vídeos</h1>
        <div className="form-outline flex-grow-1 mx-3">
          <input type="search" className="form-control" placeholder="Pesquisar vídeos..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
        </div>
        <Link to="/admin" className="btn btn-outline-secondary">Voltar</Link>
      </div>
      <hr />
      <div className="table-container">
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
          <div className="d-flex justify-content-end align-items-center mt-3">
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
        <table className="table table-responsive table-hover table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Thumbnail</th>
              <th>Autor</th>
              <th>Título</th>
              <th>Descrição</th>
              <th>Disciplina</th>
              <th>Nota Média</th>
              <th>Visualizações</th>
              <th>Data de Criação</th>
              <th>Última edição</th>
              <th>Estado</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((video) => (
              <tr key={video.ID}>
                <td>{video.ID}</td>
                <td>
                  {video.Thumbnail ? (
                    <img
                      src={`${BASE_URL}/uploads/thumbnails/${video.Thumbnail}`}
                      alt="Thumbnail"
                      style={{ width: "60px", height: "40px", objectFit: "cover", borderRadius: "4px" }}
                    />
                  ) : (
                    <span className="text-muted">Sem imagem</span>
                  )}
                </td>
                <td>{video.Autor || 'N/A'}</td>
                <td>
                  <Link to={`/video/${video.ID}`} className="text-decoration-none text-primary">
                    {video.Titulo}
                  </Link>
                </td>
                <td>
                  <textarea
                    className="form-control"
                    rows={3}
                    readOnly
                    value={video.Descricao || 'Sem descrição'}
                    style={{ resize: 'both', backgroundColor: '#f8f9fa' }}
                  />
                </td>

                <td>
                  <span className="badge" style={{ backgroundColor: video.Cor || '#ccc', color: '#fff' }}>
                    {video.Disciplina || 'N/A'}
                  </span>
                </td>
                <td>{video.Nota ? Number(video.Nota).toFixed(1) : 'Sem avaliações'}</td>
                <td>{video.Views || video.Visualizacoes || 0}</td>
                <td>{new Date(video.DataPublicacao).toLocaleString()}</td>
                <td>{new Date(video.DataAlteracao).toLocaleString()}</td>
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
                  {video.ID ? (
                    <Link to={`/admin/video/edit/${video.ID}`} className="btn btn-outline-secondary btn-sm">Editar</Link>
                  ) : (
                    <span className="text-muted">Sem ID</span>
                  )}
                  {video.ID ? (
                    <Link to={`/admin/video/estatisticas/${video.ID}`} className="btn btn-outline-secondary btn-sm">Estatísticas</Link>
                  ) : (
                    <span className="text-muted">Sem ID</span>
                  )}

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <hr />
      <div className="d-flex justify-content-end align-items-center mt-3">
        <button className="btn btn-outline-primary mx-1" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>
          Prev
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button key={i} className={`btn mx-1 ${currentPage === i + 1 ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setCurrentPage(i + 1)}>
            {i + 1}
          </button>
        ))}

        <button className="btn btn-outline-primary mx-1" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>
          Next
        </button>
      </div>
    </>
  );
};

export default Videos;
