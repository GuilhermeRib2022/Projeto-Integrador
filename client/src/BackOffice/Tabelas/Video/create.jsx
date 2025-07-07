import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../../components/url';

const UtilizadorCreate = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [cargos, setCargos] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    descricao: '',
    cargo: '',
    fotoPerfil: null
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Buscar cargos disponíveis
  useEffect(() => {
    axios.get(`${BASE_URL}/cargo`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setCargos(res.data))
      .catch(err => console.error('Erro ao buscar cargos:', err));
  }, [token]);

  // Atualizar estado do formulário
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'fotoPerfil') {
      setFormData(prev => ({ ...prev, fotoPerfil: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Enviar formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.nome || !formData.email || !formData.password || !formData.cargo) {
      setError('Preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('nome', formData.nome);
      submitData.append('email', formData.email);
      submitData.append('password', formData.password);
      submitData.append('descricao', formData.descricao);
      submitData.append('cargo', formData.cargo);
      if (formData.fotoPerfil) {
        submitData.append('fotoPerfil', formData.fotoPerfil);
      }

      await axios.post(`${BASE_URL}/utilizador/`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Utilizador criado com sucesso!');
      navigate('/admin/utilizador');

    } catch (err) {
      console.error('Erro ao criar utilizador:', err);
      setError(err.response?.data?.error || 'Erro ao criar utilizador.');
    }

    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Criar Novo Utilizador</h1>
        <Link to="/admin/utilizador" className="btn btn-outline-secondary">Voltar</Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label>Foto Perfil</label>
          <input
            type="file"
            name="fotoPerfil"
            accept="image/*"
            className="form-control"
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label>Nome *</label>
          <input
            type="text"
            name="nome"
            className="form-control"
            value={formData.nome}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Password *</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label>Cargo *</label>
          <select
            name="cargo"
            className="form-select"
            value={formData.cargo}
            onChange={handleChange}
            required
          >
            <option value="">-- Selecionar Cargo --</option>
            {cargos.map(cargo => (
              <option key={cargo.ID} value={cargo.ID}>{cargo.Tipo}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label>Descrição</label>
          <input
            type="textarea"
            name="descricao"
            className="form-control"
            value={formData.descricao}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-success" disabled={loading}>
          {loading ? 'A enviar...' : 'Criar'}
        </button>
      </form>
    </div>
  );
};

export default UtilizadorCreate;
