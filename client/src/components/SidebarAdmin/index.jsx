// components/AdminSidebar.jsx
import React, { useEffect, useState } from 'react';
import './style.css';

import { Link } from 'react-router-dom';
import { getUserFromToken } from '../../services/auth';


const AdminSidebar = () => {
  const [users, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const user = getUserFromToken();
    setUser(user);
    setLoading(false);
  }, []);

  return (
    <aside className="admin-sidebar">
      <img src="/Logo.svg" alt="TryLearn" height="40" />
      <br></br>
      <h2>Dashboard</h2>
        <div className="sidebar-section">
          <h3>Utilizadores</h3>
          <Link to="/admin/utilizador">👤 Gestão Utilizadores</Link>
          <Link to="/admin/cargo">👥 Gestão Cargos</Link>
        </div>

        <div className="sidebar-section">
          <h3>Videos</h3>
          <Link to="/admin/video">🎥 Gestão Vídeos</Link>
          <Link to="/admin/disciplina">📖 Gestão Disciplinas</Link>
          <Link to="/admin/comentario">💬 Gestão Comentários</Link>
          <Link to="/admin/anotacao">🗒️ Gestão Anotações</Link>
          <Link to="/admin/review">🔧 Gestão Reviews</Link>
        </div>

        <div className="sidebar-section">
          <h3>LLM</h3>
          <Link to="/admin/LLM">📦 Gestão Querys</Link>
        </div>

      <div className="sidebar-footer">
        <Link to="/">🏠 Página Inicial</Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
