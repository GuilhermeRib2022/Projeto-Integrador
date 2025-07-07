import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../components/url';
import './style.css'
import { Link } from 'react-router-dom';

const token = localStorage.getItem('token');

function getContrastingTextColor(hex) {
  if (!hex) return '#FFFFFF';

  const color = hex.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 128 ? '#000000' : '#000000';
}

function hexToRgba(hex, alpha = 0.7) {
  if (!hex) hex = '#000000';
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const Disciplinas = () => {
  const [disciplinas, setDisciplinas] = useState([]);
  const [userDisciplinas, setUserDisciplinas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // ajuste conforme quiser

  useEffect(() => {
    axios.get(`${BASE_URL}/disciplina`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setDisciplinas(res.data))
      .catch(err => console.error(err));

    fetchUserDisciplinas();
  }, [token]);

  const fetchUserDisciplinas = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/disciplina/utilizador`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserDisciplinas(res.data);
    } catch (error) {
      console.error("Erro ao buscar disciplinas do usuário:", error);
    }
  };

  const inscrever = async (disciplinaID) => {
    if (!token) return alert('Inicie sessão para fazer esta ação.');
    try {
      await axios.post(
        `${BASE_URL}/disciplina/utilizador/${disciplinaID}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUserDisciplinas();
    } catch (err) {
      console.error('Erro ao inscrever na disciplina:', err);
      alert('Erro ao inscrever na disciplina');
    }
  };

  const desinscrever = async (disciplinaID) => {
    if (!token) return;
    try {
      await axios.delete(
        `${BASE_URL}/disciplina/utilizador/${disciplinaID}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUserDisciplinas();
    } catch (err) {
      console.error('Erro ao desinscrever da disciplina:', err);
      alert('Erro ao desinscrever da disciplina');
    }
  };

  // Filtrar disciplinas pelo searchTerm
  const filteredDisciplinas = disciplinas.filter(d =>
    d.Nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.Descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDisciplinas = filteredDisciplinas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDisciplinas.length / itemsPerPage);

  return (
    <div>
            <div className="fixd d-flex justify-content-between align-items-center mb-3">
                <h1>📚 Disciplinas</h1>
                <div className="form-outline flex-grow-1 mx-3" data-mdb-input-init>
                    <input type="text" className="form-control" placeholder="Pesquisar disciplina..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);} } />
                </div>

            </div>

      <div className="disciplinas-grid">
        {currentDisciplinas.map((disciplina, index) => {
          const bgColor = disciplina.Cor || '#000000';
          const rgbaBg = hexToRgba(bgColor, 0.8);
          const rgbaLight = hexToRgba(bgColor, 0.3);
          const cardBg = `linear-gradient(to bottom, ${rgbaBg}, ${rgbaLight})`;
          const textColor = getContrastingTextColor(bgColor);
          const descBg = hexToRgba(bgColor, 0.7);

          const isInscrito = userDisciplinas.some(d => d.ID === disciplina.ID);

          return (
            <Link
              to={`/pesquisar/disciplina?disciplina=${encodeURIComponent(disciplina.Nome)}`}
              key={index}
              className="disciplina-card-link"
            >
              <div
                className="disciplina-card"
                style={{ background: cardBg, color: textColor }}
              >
                <h3>{disciplina.Nome}</h3>
                <p style={{ background: descBg }}>{disciplina.Descricao}</p>
                {!isInscrito && (
                  <button
                    className="subscribe-button"
                    style={{ backgroundColor: '#a10000', color: '#fff', border: `1px solid ${textColor}` }}
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        await inscrever(disciplina.ID);
                      } catch (error) {
                        console.error(error);
                        alert('Erro ao subscrever');
                      }
                    }}
                  >
                    Subscrever
                  </button>
                )}

                {isInscrito && (
                  <button
                    className="subscribe-button"
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        await desinscrever(disciplina.ID);
                      } catch (error) {
                        console.error(error);
                        alert('Erro ao desinscrever');
                      }
                    }}
                  >
                    Anular Subsc.
                  </button>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Paginação */}
      <div className="d-flex justify-content-center mt-4">
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
    </div>
  );
};

export default Disciplinas;
