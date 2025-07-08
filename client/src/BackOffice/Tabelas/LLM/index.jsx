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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startPage = Math.max(1, currentPage - pageNeighbors);
  const endPage = Math.min(totalPages, currentPage + pageNeighbors);
  const pagesToShow = [];
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
      <div className="table-container">
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
                <td>
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
