import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BASE_URL } from '../../../components/url';

const DisciplinaEdit = () => {
  const { id } = useParams(); // Get ID from URL
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cor, setCor] = useState('#ffffff');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch disciplina by ID
  useEffect(() => {
    axios.get(`${BASE_URL}/disciplina/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        const { Nome, Descricao, Cor } = response.data;
        setNome(Nome);
        setDescricao(Descricao);
        setCor(Cor);
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao carregar disciplina:", error);
        setError('Erro ao carregar disciplina.');
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${BASE_URL}/disciplina/${id}`, {
        Nome: nome,
        Descricao: descricao,
        Cor: cor,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      navigate('/admin/disciplina');
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar a disciplina.');
    }
  };

  if (loading) return <p>A carregar dados...</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
          <div className="fixd d-flex justify-content-between align-items-center mb-3">
            <h1>Editar Disciplina</h1>
            <Link to="/admin/disciplina" className="btn btn-outline-secondary">Voltar</Link>
          </div>
      <hr />
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="nome" className="form-label">Nome</label>
          <input
            type="text"
            className="form-control"
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="descricao" className="form-label">Descrição</label>
          <textarea
            className="form-control"
            id="descricao"
            rows="3"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="mb-3">
          <label htmlFor="cor" className="form-label">Cor</label>
          <input
            type="color"
            className="form-control form-control-color"
            id="cor"
            value={cor}
            onChange={(e) => setCor(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary">Salvar</button>
        <Link to="/admin/disciplina" className="btn btn-secondary ms-2">Cancelar</Link>
      </form>
    </div>
  );
};

export default DisciplinaEdit;
