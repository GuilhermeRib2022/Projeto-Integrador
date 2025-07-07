import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getUserFromToken } from '../../services/auth';
import { FiSun, FiMoon } from 'react-icons/fi';
import AdminIcon from '../../assets/admin.svg?react';
import CriarIcon from '../../assets/criar.svg?react';
import UserIcon from '../../assets/user.svg?react';
import Search from '../../assets/search.svg?react';
import Logo from '../../assets/Logo.svg?react';
import { useTheme } from '../../services/themeContext.jsx';
import { useLocation } from 'react-router-dom';
import { BASE_URL } from '../../components/url';

import './style.css';

const Header = () => {
  const navigate = useNavigate();
  const [users, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
const [texto, setTexto] = useState(() => {
  const params = new URLSearchParams(location.search);
  return params.get('texto') || '';
});
  const { theme, setTheme } = useTheme();



  const handleSubmit = async (e) => {
    e.preventDefault(); // evita reload da página
    if (texto.trim() !== '') {
      navigate(`/search?texto=${encodeURIComponent(texto)}`);
    }
  };


  useEffect(() => {
    const user = getUserFromToken();
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
    window.dispatchEvent(new Event('themeChange'));
    setUser(user);
    setLoading(false);

  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = () => {
    localStorage.clear(); // Limpa o local storage
    setUser(null); //Reseta o estado do utilizador.
    navigate('/login'); //Volta para a página de login
    window.location.reload();
  };


  return (
    <header>
      <nav className="navbar bg-vini navbar-expand-md navbar-dark fixed-top">
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center" to="/">
            <Logo style={{ height: '40px', margin: 0, padding: 0, display: 'block', color:'black', paddingRight: '100', marginRight:'-100'}} />
          </Link>


          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarCollapse">

            <ul className="navbar-nav me-auto mb-2 mb-md-0">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">
                  Início
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/about">
                  Sobre nós
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/contact">
                  Contactos
                </NavLink>
              </li>
            </ul>

            <div className="col d-flex justify-content-start">
              <form className="form-inline d-flex my-2 my-lg-0" onSubmit={handleSubmit}>
                <input className="pesquisar form-control me-0" type="search" placeholder="Pesquisar" aria-label="Pesquisar" style={{ width: '400px' }} value={texto} onChange={e => setTexto(e.target.value)} />
                <button className="btn-pesquisar btn my-2 my-sm-0" type="submit"><Search height="30"/></button>
              </form>
            </div>

            <ul className="navbar-nav">
              <NavLink
                className="btn btn-theme-toggle mode"
                onClick={toggleTheme}
                aria-label="Alternar tema claro/escuro"
                style={{
                  marginLeft: '15px',
                  border: 'none',
                  background: 'transparent',
                  
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >
                <li className="">
                {theme === 'light' ? <FiSun size={24}/> : <FiMoon size={24} />}
                </li>
              </NavLink>
              <li className="nav-item">
                {!loading && (users?.cargo == 3) &&
                  <NavLink className="nav-link" to="/admin">
                    <AdminIcon height="20" style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                    Admin
                  </NavLink>
                }
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/criar">
                  <CriarIcon height="20" style={{ marginRight: '5px', verticalAlign: 'middle' }}/>
                  Novo
                </NavLink>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <UserIcon height="20" style={{ marginRight: '5px', verticalAlign: 'middle' }}/>
                  Conta
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  {!users && (
                    <>
                      <li><NavLink className="dropdown-item" to="/login">Login</NavLink></li>
                      <li><NavLink className="dropdown-item" to="/register">Register</NavLink></li>
                    </>
                  )}

                  {users && (
                    <>
                      <li><NavLink className="dropdown-item" to={`/perfil/${users.id}`}>Perfil</NavLink></li>
                      <li><NavLink className="dropdown-item" to="/anotacoes">Anotacoes</NavLink></li>
                      <li>  <a href="#" className="dropdown-item" onClick={handleLogout}>Logout</a></li>
                    </>
                  )}
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Header;