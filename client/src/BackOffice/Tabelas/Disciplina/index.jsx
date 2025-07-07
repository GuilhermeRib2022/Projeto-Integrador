import React, { Component, useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './style.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import { BASE_URL } from '../../../components/url';

const Disciplina = () => {
  const [data, setData] = useState([]); //Obter dados do backend
  const [loading, setLoading] = useState(true); //Esperar dados carregarem
  const [error, setError] = useState(null); //Obter Erro
  const [search, setSearch] = useState(""); //Pesquisa Atual
  const [currentPage, setCurrentPage] = useState(1); //Página Atual
  const itemsPerPage = 10; //Número de linhas por página

const handleDelete = async (id) => {
  if (window.confirm("Tem certeza que deseja apagar esta disciplina?")) {
    try {
      await axios.delete(`${BASE_URL}/disciplina/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      setData(prevData => prevData.filter(d => d.ID !== id));
      alert('Disciplina apagada com sucesso.');
    } catch (err) {
      const backendMsg = err.response?.data?.message || "Erro ao apagar disciplina.";
      alert(`Não foi possível apagar: ${backendMsg}`);
    }
  }
};


  useEffect(() => {
    axios.get(`${BASE_URL}/disciplina`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao carregar dados:", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>A carregar dados...</p>;
  if (error) return <p>{error}</p>;

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

  const filteredData = data.filter((disciplina) =>
    disciplina.Nome?.toLowerCase().includes(search.toLowerCase()) ||
    disciplina.Descricao?.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage; //Obter último valor da página (Página atual * Items por página)
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; //Obter primeiro valor da página (Último valor - Items por página)
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem); //Obter valores entre o primeiro e o último valor da página.
  const totalPages = Math.ceil(filteredData.length / itemsPerPage); //Obter número total de páginas. (Total valores/Items por página)

  return (
    <>
      <div className="fixd d-flex justify-content-between align-items-center mb-3">
        <h1>Disciplinas</h1>
        <div className="form-outline flex-grow-1 mx-3" data-mdb-input-init>
          <input type="search" id="form1" className="form-control" placeholder="Pesquisa" aria-label="Search" value={search} onChange={(e) => {setSearch(e.target.value); setCurrentPage(1);} } />
        </div>
        <Link to="/admin" className="btn btn-outline-secondary">Voltar</Link>
      </div>
      <hr></hr>
      <div className="table-container" >
        <table className="disciplina-table element table table-responsive table-hover table-striped ">
          <thead>
            <tr>
              <th><strong>ID</strong></th>
              <th>Nome</th>
              <th>Descricao</th>
              <th>Cor</th>
              <th className="text-center align-middle"> <Link to="/admin/disciplina/criar" className='btn btn-outline-primary button-sucess w-40 rounded-0'>NOVO</Link></th>
            </tr>
          </thead>
          <tbody className="element ">
            {currentData.map((disciplina) => (
              <tr key={disciplina.ID}>
                <td><strong>{disciplina.ID}</strong></td>
                <td>{disciplina.Nome}</td>
                <td>{disciplina.Descricao}</td>
                <td style={{ backgroundColor: disciplina.Cor, color: getContrastingTextColor(disciplina.Cor), }}><strong>{disciplina.Cor}</strong></td>
                <td className="text-center align-middle"><Link to={`/admin/disciplina/edit/${disciplina.ID}`} className='btn btn-outline-secondary button-info w-40 rounded-0 '>Editar</Link>
                <button onClick={() => handleDelete(disciplina.ID)} className="btn btn-outline-danger button-delete w-40 rounded-0"> Apagar </button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <hr></hr>
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
export default Disciplina;