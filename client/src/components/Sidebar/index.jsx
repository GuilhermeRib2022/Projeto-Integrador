import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FiInfo, FiBook } from 'react-icons/fi';
import axios from 'axios';
import { BASE_URL } from '../url';
import './style.css';



const Sidebar = ({ collapsed, setCollapsed }) => {
  let cargo = null;
  const [userDisciplinas, setUserDisciplinas] = useState([]);

  const toggleSidebar = () => setCollapsed(!collapsed);

  try {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      cargo = decoded.cargo;
    }
  } catch (err) {
    console.error("Erro ao decodificar o token:", err);
  }

  useEffect(() => {
    const fetchUserDisciplinas = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${BASE_URL}/disciplina/utilizador`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserDisciplinas(res.data);
      } catch (error) {
        console.error('Erro ao carregar disciplinas do utilizador:', error);
      }
    };

    fetchUserDisciplinas();

    const handleUpdate = () => {
      fetchUserDisciplinas();
    };

    window.addEventListener('disciplinasUpdated', handleUpdate);

    return () => {
      window.removeEventListener('disciplinasUpdated', handleUpdate);
    };
  }, []);



  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="btn-toggle" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          &#x2022;&#x2022;&#x2022;
        </button>
      </div>

      <nav className="sidebar-nav">


        <NavLink to="/" className="nav-link">
          <span className="icon"> <img src="/home.svg" alt="Estatísticas" style={{ width: 20, height: 20 }} /> </span>
          {<span className="link-text">Início</span>}
        </NavLink>
        <hr></hr>

        {(cargo === 2 || cargo === 3) && (
          <>
            <NavLink to="/videos" className="nav-link">
              <span className="icon"> <img src="/Videos.svg" alt="Estatísticas" style={{ width: 20, height: 20 }} /> </span>
              {<span className="link-text">Meus Vídeos</span>}
            </NavLink>

            <NavLink to="/estatisticas" className="nav-link">
              <span className="icon"> <img src="/Stats.svg" alt="Estatísticas" style={{ width: 20, height: 20 }} /> </span>
              {!collapsed && <span className="link-text">Estatísticas</span>}
            </NavLink>

          </>
        )}


        <NavLink to="/disciplinas" className="nav-link">
          <span className="icon"><FiBook /></span>
          {<span className="link-text">Disciplinas</span>}
        </NavLink>


        <hr></hr>
        {userDisciplinas.length > 0 && !collapsed && (
          <span className="section-title">Subscrições</span>
        )}

        {userDisciplinas.length > 0 && collapsed && (
          <span className="section-title-small">Subs</span>
        )}


        {userDisciplinas.length > 0 && (

          <div className="user-disciplinas-list">

            <ul className="disciplinas-list">
              {userDisciplinas.map((disciplina) => (
                <li key={disciplina.ID} className="disciplina-item">
                  <NavLink
                    to={`/pesquisar/disciplina?disciplina=${encodeURIComponent(disciplina.Nome)}`}
                    className="disciplina-link"
                  >
                    <span
                      className="disciplina-color"
                      style={{ backgroundColor: disciplina.Cor || '#000' }}
                    >{disciplina.Nome.slice(0, 2).toUpperCase()}</span>
                    {!collapsed && (
                      <span className="disciplina-name">{disciplina.Nome}</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}

        <hr></hr>
      </nav>

      <div className="sidebar-footer">
        {!collapsed && <span>© TryLearn 2025</span>}
      </div>
    </aside>
  );
};

export default Sidebar;
