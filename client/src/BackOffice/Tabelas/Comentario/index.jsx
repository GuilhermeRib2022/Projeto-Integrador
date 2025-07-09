import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './style.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../../../components/url';

const Comentarios = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("QueryTime");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja apagar este comentário?")) return;

    try {
      await axios.delete(`${BASE_URL}/comentario/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setData(prev => prev.filter(c => c.ID !== id));
    } catch (error) {
      alert("Erro ao apagar comentário.");
      console.error(error);
    }
  };

  useEffect(() => {
    axios.get(`${BASE_URL}/comentario`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar comentários:", err);
        setError("Erro ao carregar comentários.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>A carregar comentários...</p>;
  if (error) return <p>{error}</p>;

  const filteredData = data.filter((comentario) =>
    comentario.Texto?.toLowerCase().includes(search.toLowerCase()) ||
    comentario.nome?.toLowerCase().includes(search.toLowerCase()) ||
    comentario.ID.toString().includes(search) ||
    comentario.VideoID.toString().includes(search)
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
    { label: "Nome", field: "Disciplina", order: "asc" },
    { label: "Texto", field: "Texto", order: "asc" },
    { label: "ID do Video", field: "VideoID", order: "desc" },
    { label: "Publicação recente", field: "UploadTime", order: "desc" },
    { label: "Alteração Recente", field: "EditTime", order: "desc" },
  ];


  return (
    <>
      <div className="fixd d-flex justify-content-between align-items-center mb-3">
        <h1>Comentários</h1>
        <div className="form-outline flex-grow-1 mx-3">
          <input
            type="search"
            className="form-control"
            placeholder="Pesquisar comentários ou utilizador..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>
      <hr />
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
        <div className="table-container">
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
              <th>Utilizador</th>
              <th>Foto</th>
              <th>Texto</th>
              <th>Vídeo ID</th>
              <th>Data Criação</th>
              <th>Data Alteração</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((comentario) => (
              <tr key={comentario.ID}>
                <td>{comentario.ID}</td>
                <td>        <Link to={`/perfil/${comentario.UtilizadorID}`}>
                  {comentario.nome || 'N/A'}
                </Link></td>
                <td>
                  {comentario.FotoPerfil ? (
                    <img
                      src={`${BASE_URL}/uploads/fotosperfil/${comentario.FotoPerfil}`}
                      alt="perfil"
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <img src="/profile.png" alt="Perfil" height="40" />
                  )}
                </td>
                <td>
                  <textarea
                    readOnly
                    value={comentario.Texto || ''}
                    style={{ width: '100%', resize: 'both', border: 'none', backgroundColor: 'transparent' }}
                    rows={3}
                  />
                </td>
                <td>        <Link to={`/video/${comentario.VideoID}`}>
                  {comentario.VideoID}
                </Link></td>
                <td>{new Date(comentario.UploadTime).toLocaleString()}</td>
                <td>{comentario.EditTime ? new Date(comentario.EditTime).toLocaleString() : 'N/A'}</td>
                <td className="">
                  <Link to={`/admin/comentario/edit/${comentario.ID}`} className="btn btn-outline-secondary ">
                    Editar
                  </Link>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => handleDelete(comentario.ID)}
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
  );
};

export default Comentarios;
