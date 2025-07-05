import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { getUserFromToken } from '../../services/auth';
import { BASE_URL } from '../../components/url';

import './style.css';

const Header = () => {
  const navigate = useNavigate();
  const [users, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault(); // evita reload da página
    if (texto.trim() !== '') {
      navigate(`/search?texto=${encodeURIComponent(texto)}`);
    }
  };

  useEffect(() => {
    const user = getUserFromToken();
     console.log('User from token:', user);
    setUser(user);
    setLoading(false);

  }, []);

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
          <Link className="navbar-brand" to="/">
            <img src="/Logo.svg" alt="TryLearn" height="40" />
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
                <button className="btn-pesquisar btn my-2 my-sm-0" type="submit"><img src="/search.svg" alt="pesquisar" height="30" /></button>
              </form>
            </div>

            <ul className="navbar-nav">
              <li className="nav-item">
                {!loading && (users?.cargo == 3) &&
                  <NavLink className="nav-link" to="/admin">
                    <img
                      src="/admin.svg"
                      height="20"
                      style={{ marginRight: '5px', verticalAlign: 'middle' }}
                    />
                    Admin
                  </NavLink>
                }
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/criar">
                  <img
                    src="/criar.svg"
                    height="20"
                    style={{ marginRight: '5px', verticalAlign: 'middle' }}
                  />
                  Novo
                </NavLink>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <img src="/user.svg" height="20" style={{ marginRight: '5px', verticalAlign: 'middle' }} />
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