import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { BASE_URL } from '../../../components/url';

const CriarCargo = () => {
  const [tipo, setTipo] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/cargo`,
        { Tipo: tipo },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      navigate('/admin/cargo'); // Voltar à lista de cargos
    } catch (err) {
      setError('Erro ao criar cargo. Verifique os dados.');
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      <div className="fixd d-flex justify-content-between align-items-center mb-3">
        <h1>Criar Novo Cargo</h1>
        <div className="form-outline flex-grow-1 mx-3" data-mdb-input-init>
        </div>
        <Link to="/admin/cargo" className="btn btn-outline-secondary">Voltar</Link>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Tipo de Cargo</label>
          <input
            type="text"
            className="form-control"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary mt-3">Criar</button>
      </form>
    </div>
  );
};

export default CriarCargo;
