import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { BASE_URL } from '../../../components/url';

const CargoEdit = () => {
  const [tipo, setTipo] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams(); // Obter ID da URL

  useEffect(() => {
    // Buscar o cargo atual pelo ID
    axios.get(`${BASE_URL}/cargo/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        setTipo(response.data.Tipo);
      })
      .catch(err => {
        setError('Erro ao buscar cargo.');
        console.error(err);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BASE_URL}/cargo/${id}`, 
        { Tipo: tipo }, 
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      navigate('/admin/cargo'); // Volta para a lista após salvar
    } catch (err) {
      setError('Erro ao atualizar cargo.');
      console.error(err);
    }
  };

  return (
    <div className="container mt-4">
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
                <div className="fixd d-flex justify-content-between align-items-center mb-3">
                  <h1>Editar Cargo</h1>
                  <div className="form-outline flex-grow-1 mx-3" data-mdb-input-init>
                  </div>
                  <Link to="/admin/cargo" className="btn btn-outline-secondary">Voltar</Link>
                </div>
          <input
            type="text"
            className="form-control"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
          />
        </div>
        <div className="mt-3 d-flex justify-content-between">
          <Link to="/admin/cargo" className="btn btn-secondary">Cancelar</Link>
          <button type="submit" className="btn btn-primary">Salvar</button>
        </div>
      </form>
    </div>
  );
};

export default CargoEdit;
