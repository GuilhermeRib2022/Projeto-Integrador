import React, { Component, useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './style.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import { BASE_URL } from '../../../components/url';

const Cargo = () => {
  const [data, setData] = useState([]); //Obter dados do backend
  const [loading, setLoading] = useState(true); //Esperar dados carregarem
  const [error, setError] = useState(null); //Obter Erro
  const [search, setSearch] = useState(""); //Pesquisa Atual
  const [currentPage, setCurrentPage] = useState(1); //Página Atual


  const token = localStorage.getItem('token'); //Obter token do utilizador
  const decodedToken = JSON.parse(atob(token.split('.')[1])); //Dividir o token
  const alteradorID = decodedToken.id; //Obter o ID do token
  const itemsPerPage = 10; //Número de linhas por página

  useEffect(() => {
    axios.get(`${BASE_URL}/cargo`, {
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

  const filteredData = data.filter((cargo) =>
    cargo.Tipo?.toLowerCase().includes(search.toLowerCase()) 
  );

  const indexOfLastItem = currentPage * itemsPerPage; //Obter último valor da página (Página atual * Items por página)
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; //Obter primeiro valor da página (Último valor - Items por página)
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem); //Obter valores entre o primeiro e o último valor da página.

  const totalPages = Math.ceil(filteredData.length / itemsPerPage); //Obter número total de páginas. (Total valores/Items por página)

  return (
    <>
      <div className="fixd d-flex justify-content-between align-items-center mb-3">
        <h1>Cargos</h1>
        <div className="form-outline flex-grow-1 mx-3" data-mdb-input-init>
          <input type="search" id="form1" className="form-control" placeholder="Pesquisa" aria-label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Link to="/admin" className="btn btn-outline-secondary">Voltar</Link>
      </div>
      <hr></hr>
      <div className="table-container" >
        <table className="element table table-responsive table-hover table-striped utilizador-table">
          <thead>
            <tr>
              <th><strong>ID</strong></th>
              <th>Tipo</th>
              <th className="text-center align-middle"> <Link to="/admin/cargo/criar" className='btn btn-outline-primary button-sucess w-40 rounded-0'>NOVO</Link></th>
            </tr>
          </thead>
          <tbody className="element ">
            {currentData.map((cargo) => (
              <tr key={cargo.ID}>
                <td><strong>{cargo.ID}</strong></td>
                <td>{cargo.Tipo}</td>
                <td className="text-center align-middle"><Link to={`/admin/cargo/edit/${cargo.ID}`} className='btn btn-outline-secondary button-info w-40 rounded-0 '>Editar</Link></td>
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
export default Cargo;