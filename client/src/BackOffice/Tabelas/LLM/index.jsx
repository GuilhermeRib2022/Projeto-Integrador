import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './style.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../../../components/url';
import e from 'cors';

const Querys = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState("QueryTime");
  const [sortOrder, setSortOrder] = useState("desc");

  const itemsPerPage = 10;
  const pageNeighbors = 2;




  useEffect(() => {
    axios.get(`${BASE_URL}/query`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar querys:", err);
        setError("Erro ao carregar querys.");
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja apagar esta query?")) {
      try {
        await axios.delete(`${BASE_URL}/query/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setData((prevData) => prevData.filter((item) => item.ID !== id));
      } catch (error) {
        console.error("Erro ao apagar query:", error);
        alert("Erro ao apagar query.");
      }
    }
  };


  if (loading) return <p>A carregar queries...</p>;
  if (error) return <p>{error}</p>;

  const filteredData = data.filter((q) =>
    q.Pergunta?.toLowerCase().includes(search.toLowerCase()) ||
    q.Resposta?.toLowerCase().includes(search.toLowerCase()) ||
    q.Nome?.toLowerCase().includes(search.toLowerCase()) ||
    q.Titulo?.toLowerCase().includes(search.toLowerCase()) ||
    q.ID.toString().includes(search) ||
    q.VideoID.toString().includes(search)
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startPage = Math.max(1, currentPage - pageNeighbors);
  const endPage = Math.min(totalPages, currentPage + pageNeighbors);
  const pagesToShow = [];
  const sortOptions = [
    { label: "ID", field: "ID", order: "asc" },
    { label: "Mais Recentes", field: "QueryTime", order: "desc" },
    { label: "Vezes Perguntado", field: "counter", order: "desc" },
  ];
  for (let i = startPage; i <= endPage; i++) {
    pagesToShow.push(i);
  }

  return (
    <>
      <div className="fixd d-flex justify-content-between align-items-center mb-3">
        <h1>Queries LLM</h1>
        <div className="form-outline flex-grow-1 mx-3">
          <input
            type="search"
            className="form-control"
            placeholder="Pesquisar perguntas, utilizador ou vídeo..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      <hr />
      <div className="gap-2 mb-3d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
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
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Prev
            </button>

            {pagesToShow.map((page) => (
              <button
                key={page}
                className={`btn mx-1 ${currentPage === page ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="btn btn-outline-primary mx-1"
              disabled={currentPage === endPage}
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
              <th>Utilizador</th>
              <th>Vídeo</th>
              <th>Pergunta</th>
              <th>Resposta</th>
              <th>Data da Pergunta</th>
              <th>Tempo do Vídeo</th>
              <th>Vezes Perguntado</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((q) => (
              <tr key={q.ID}>
                <td>{q.ID}</td>
                <td>
                  <Link to={`/perfil/${q.UtilizadorID}`}>
                    {q.Nome || 'N/A'}
                  </Link>
                </td>
                <td>
                  <Link to={`/video/${q.VideoID}`}>
                    {q.Titulo || q.VideoID}
                  </Link>
                </td>
                < td>
                  <textarea
                    readOnly
                    value={q.Pergunta || ''}
                    style={{ width: '100%', resize: 'none', border: 'none', backgroundColor: 'transparent' }}
                    rows={2}
                  />
                </td>
                <td>
                  <textarea
                    readOnly
                    value={q.Resposta || ''}
                    style={{ width: '100%', resize: 'both', border: 'none', backgroundColor: 'transparent' }}
                    rows={3}
                  />
                </td>
                <td>{new Date(q.QueryTime).toLocaleString()}</td>
                <td>{q.VideoTime?.toFixed(2) ?? '0.00'}s</td>
                <td>{q.Embedding ? q.counter : "--"}</td>
                <td>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(q.ID)}
                  >
                    Apagar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <hr />
      <div className="d-flex justify-content-end align-items-center mt-3">
        <button
          className="btn btn-outline-primary mx-1"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(prev => prev - 1)}
        >
          Prev
        </button>

        {pagesToShow.map((page) => (
          <button
            key={page}
            className={`btn mx-1 ${currentPage === page ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}

        <button
          className="btn btn-outline-primary mx-1"
          disabled={currentPage === endPage}
          onClick={() => setCurrentPage(prev => prev + 1)}
        >
          Next
        </button>
      </div>
    </>
  );
};

export default Querys;
