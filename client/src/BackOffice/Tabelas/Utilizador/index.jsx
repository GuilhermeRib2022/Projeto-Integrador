import React, { Component, useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './style.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import { BASE_URL } from '../../../components/url';

const Utilizador = () => {
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
    axios.get(`${BASE_URL}/utilizador`, {
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



  const toggleEstado = async (id, currentEstado) => {
    const novoEstado = currentEstado === 'ativo' ? 'inativo' : 'ativo';

    try {
      if (novoEstado === 'inativo') {
        await axios.delete(`${BASE_URL}/utilizador/${id}/desativar`, {
          data: { alteradorID },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
      } else {
        await axios.patch(`${BASE_URL}/utilizador/${id}/ativar`, { alteradorID }, {
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

  const filteredData = data.filter((utilizador) =>
    utilizador.Nome?.toLowerCase().includes(search.toLowerCase()) ||
    utilizador.Morada?.toLowerCase().includes(search.toLowerCase()) ||
    utilizador.Email?.toLowerCase().includes(search.toLowerCase()) ||
    utilizador.CriadorNome?.toLowerCase().includes(search.toLowerCase()) ||
    utilizador.AlteradorNome?.toLowerCase().includes(search.toLowerCase()) ||
    utilizador.ID.toString().includes(search)
  );

  const indexOfLastItem = currentPage * itemsPerPage; //Obter último valor da página (Página atual * Items por página)
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; //Obter primeiro valor da página (Último valor - Items por página)
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem); //Obter valores entre o primeiro e o último valor da página.

  const totalPages = Math.ceil(filteredData.length / itemsPerPage); //Obter número total de páginas. (Total valores/Items por página)

  return (
    <>
      <div className="fixd d-flex justify-content-between align-items-center mb-3">
        <h1>Utilizadores</h1>
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
              <th>Foto</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Cargo</th>
              <th>Password</th>
              <th>Descricao</th>
              <th>Data de Criação</th>
              <th>Última Alteração</th>
              <th>Estado</th>
              <th> <Link to="/admin/utilizador/criar" className='btn btn-outline-primary button-sucess w-40 rounded-0'>NOVO</Link></th>
            </tr>
          </thead>
          <tbody className="element ">
            {currentData.map((utilizador) => (
              <tr key={utilizador.ID}>
                <td><strong>{utilizador.ID}</strong></td>
                <td>
                  {utilizador.FotoPerfil ? (
                    <img src={`${BASE_URL}/uploads/fotosperfil/${utilizador.FotoPerfil}`} alt="pfp" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "50%" }}/>
                  ) : (
                    <img src="/profile.png" alt="TryLearn" height="40" />
                  )}
                </td>
                <td>{utilizador.Nome}</td>
                <td>{utilizador.Email}</td>
                <td>{utilizador.Cargo || "N/A"}</td>
                <td >{utilizador.Password || "N/A"}</td>
                <td>{utilizador.Descricao || "N/A"}</td>
                <td>{new Date(utilizador.DataCriacao).toLocaleString()}</td>
                <td >{new Date(utilizador.DataAlteracao).toLocaleString()}</td>
                <td className="text-center align-middle">
                  <button
                    className={`btn btn-sm ${utilizador.Estado === 'ativo' ? 'btn-success' : 'btn-danger'}`}
                    onClick={() => toggleEstado(utilizador.ID, utilizador.Estado)}
                    style={{ width: '90px' }}
                  >
                    {utilizador.Estado}
                  </button>
                </td>
                <td className="text-center align-middle"><Link to={`/admin/utilizador/edit/${utilizador.ID}`} className='btn btn-outline-secondary button-info w-40 rounded-0 '>Editar</Link></td>
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
export default Utilizador;