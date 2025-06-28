import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiInfo, FiBook } from 'react-icons/fi';
import './style.css';

const Sidebar = ({ collapsed, setCollapsed }) => {
  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="btn-toggle" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          &#x2022;&#x2022;&#x2022;
        </button>
      </div>

      <nav className="sidebar-nav">
        
        <NavLink to="/" className="nav-link">
          <span className="icon">🏠</span>
          {<span className="link-text">Início</span>}
        </NavLink>
        <hr></hr>
        <NavLink to="/about" className="nav-link">
          <span className="icon">ℹ️</span>
          {<span className="link-text">Sobre nós</span>}
        </NavLink>

        <NavLink to="/contact" className="nav-link">
          <span className="icon">📞</span>
          {!collapsed && <span className="link-text">Contactos</span>}
        </NavLink>

        <NavLink to="/disciplinas" className="nav-link">
          <span className="icon"><FiBook /></span>
          {<span className="link-text">Disciplinas</span>}
        </NavLink>

        <hr></hr>
      </nav>

      <div className="sidebar-footer">
        {!collapsed && <span>© TryLearn 2025</span>}
      </div>
    </aside>
  );
};

export default Sidebar;
