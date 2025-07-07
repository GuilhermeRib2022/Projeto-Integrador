import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../../components/url';

const UtilizadorEdit = () => {
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    descricao: '',
    cargo: '',
    fotoPerfil: null
  });

  const [currentFoto, setCurrentFoto] = useState(null);
  const [cargos, setCargos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Buscar dados do utilizador
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, cargosRes] = await Promise.all([
          axios.get(`${BASE_URL}/utilizador/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${BASE_URL}/cargo`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const user = userRes.data;
        setFormData({
          nome: user.Nome || '',
          email: user.Email || '',
          password: '',
          descricao: user.Descricao || '',
          cargo: user.CargoID || '',
          fotoPerfil: null
        });
        setCurrentFoto(user.FotoPerfil);
        setCargos(cargosRes.data);

      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar dados do utilizador.');
      }
    };

    fetchData();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'fotoPerfil') {
      setFormData(prev => ({ ...prev, fotoPerfil: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('nome', formData.nome);
      submitData.append('email', formData.email);
      if (formData.password) {
        submitData.append('password', formData.password);
      }
      submitData.append('descricao', formData.descricao);
      submitData.append('cargo', formData.cargo);
      if (formData.fotoPerfil) {
        submitData.append('fotoPerfil', formData.fotoPerfil);
      }

      await axios.patch(`${BASE_URL}/utilizador/${id}`, submitData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Utilizador atualizado com sucesso!');
      navigate('/admin/utilizador');

    } catch (err) {
      console.error('Erro ao atualizar utilizador:', err);
      setError(err.response?.data?.message || 'Erro ao atualizar utilizador.');
    }

    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Editar Utilizador</h1>
        <Link to="/admin/utilizador" className="btn btn-outline-secondary">Voltar</Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {currentFoto && (
          <div className="mb-3">
            <label>Foto Atual</label><br />
            <img
              src={`${BASE_URL}/uploads/fotosPerfil/${currentFoto}`}
              alt="Foto de perfil"
              style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '50%' }}
            />
          </div>
        )}

        <div className="mb-3">
          <label>Nova Foto Perfil</label>
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
          <label>Nova Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            value={formData.password}
            onChange={handleChange}
            placeholder="Deixe em branco para manter"
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
          <textarea
            name="descricao"
            className="form-control"
            value={formData.descricao}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </form>
    </div>
  );
};

export default UtilizadorEdit;
