import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';  // Para pegar o id da URL
import { BASE_URL } from '../../components/url';
import './style.css';

const token = localStorage.getItem('token');

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
    
  } catch (e) {
    return null;
  }
};


const Perfil = () => {
  const { id } = useParams(); // Pega o id da URL
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('token');
  const userID = token ? parseJwt(token)?.id : null;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/utilizador/perfil/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPerfil(res.data[0]); 

        setLoading(false);
      } catch (err) {
        setError('Erro ao carregar perfil');
        setLoading(false);
      }
    };

    if (id) fetchPerfil();
  }, [id]);

  if (loading) return <div>Carregando perfil...</div>;
  if (error) return <div>{error}</div>;
  if (!perfil) return <div>Perfil não encontrado</div>;

return (
  <div className="perfil-container">
    {perfil.FotoPerfil ? (
      <img
        src={`${BASE_URL}/uploads/fotosperfil/${perfil.FotoPerfil}`}
        alt="pfp"
      />
    ) : (
            <img src="/profile.png" alt="TryLearn" />
        )}
        <div className="perfil-info">
            <h2>{perfil.nome}</h2>
            <p className="description">{perfil.Descricao}</p>
            <p className="date"><strong>Membro desde:</strong> {new Date(perfil.DataCriacao).toLocaleDateString()}</p>
            {userID == perfil.ID &&(
                <button
                    className="editarperfil-btn"
                    onClick={() => navigate('/perfil/editar')}
                    title="Editar perfil"
                >
                    &#8942;
                </button>
            )}
        </div>
    </div>
);
};

export default Perfil;
