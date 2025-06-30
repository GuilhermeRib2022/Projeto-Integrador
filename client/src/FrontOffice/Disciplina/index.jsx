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

  useEffect(() => {
    axios.get(`${BASE_URL}/disciplina`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setDisciplinas(res.data))
      .catch(err => console.error(err));
  }, []);


  return (
    <div className="disciplinas-grid">
      {disciplinas.map((disciplina, index) => {
        const bgColor = disciplina.Cor || '#000000';
        const rgbaBg = hexToRgba(bgColor, 0.8); // mais escuro com opacidade
        const rgbaLight = hexToRgba(bgColor, 0.3); // mais claro com opacidade
        const cardBg = `linear-gradient(to bottom, ${rgbaBg}, ${rgbaLight})`;
        const textColor = getContrastingTextColor(bgColor);
        const descBg = hexToRgba(bgColor, 0.7);


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
              <button
                className="subscribe-button"
                style={{
                  backgroundColor: descBg,
                  color: textColor,
                  border: `1px solid ${textColor}`
                }}
                onClick={(e) => {
                  e.preventDefault();
                  console.log(`Subscreveu em: ${disciplina.Nome}`);
                }}
              >
                Subscrever
              </button>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default Disciplinas;
