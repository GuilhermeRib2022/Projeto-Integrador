import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../../components/url';

const DisciplinaCreate = () => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cor, setCor] = useState('#ffffff'); // default HEX
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${BASE_URL}/disciplina`, {
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
      if (err.response && err.response.status === 409) {
        setError('Nome ou Cor da disciplina já existe.');
      } else {
        setError('Erro ao criar disciplina. Verifique os dados.');
      }
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <div className="fixd d-flex justify-content-between align-items-center mb-3">
        <h1>Criar nova Disciplina</h1>
        <Link to="/admin/disciplina" className="btn btn-outline-secondary">Voltar</Link>
      </div>
      <hr />
      {error && <div className="alert alert-danger">{error}</div>}
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
            maxLength="360"
            onChange={(e) => setDescricao(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="mb-3">
          <label htmlFor="cor" className="form-label">Cor (HEX)</label>
          <input
            type="color"
            className="form-control form-control-color"
            id="cor"
            value={cor}
            onChange={(e) => setCor(e.target.value)}
            title="Escolha uma cor"
          />
        </div>

        <button type="submit" className="btn btn-primary">Criar</button>
        <Link to="/admin/disciplina" className="btn btn-secondary ms-2">Cancelar</Link>
      </form>
    </div>
  );
};

export default DisciplinaCreate;
