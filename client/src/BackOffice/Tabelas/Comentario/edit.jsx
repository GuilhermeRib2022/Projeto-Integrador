import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BASE_URL } from '../../../components/url';

const ComentarioEdit = () => {
  const { id } = useParams(); // ID do comentário
  const navigate = useNavigate();

  const [texto, setTexto] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Buscar comentário pelo ID
  useEffect(() => {
    axios.get(`${BASE_URL}/comentario/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        setTexto(response.data.Texto || '');
        setLoading(false);
      })
      .catch(error => {
        console.error("Erro ao carregar comentário:", error);
        setError('Erro ao carregar comentário.');
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${BASE_URL}/comentario/${id}`, {
        Texto: texto
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      navigate('/admin/comentario');
    } catch (err) {
      setError('Erro ao atualizar comentário. Verifique os dados.');
      console.error(err);
    }
  };

  if (loading) return <p>A carregar comentário...</p>;

  return (
    <div className="container mt-4">
      <div className="fixd d-flex justify-content-between align-items-center mb-3">
        <h1>Editar Comentário</h1>
        <Link to="/admin/comentario" className="btn btn-outline-secondary">Voltar</Link>
      </div>
      <hr />
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="texto" className="form-label">Texto</label>
          <textarea
            className="form-control"
            id="texto"
            rows="5"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            required
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary">Salvar</button>
        <Link to="/admin/comentario" className="btn btn-secondary ms-2">Cancelar</Link>
      </form>
    </div>
  );
};

export default ComentarioEdit;
