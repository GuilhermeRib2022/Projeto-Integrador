import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../assets/Logo.svg?react';
import './style.css';

class NotFound extends Component {
  render() {

    return (

      <div className="not-found-container">
      <Logo className="logo-error"></Logo>
        <h1>
          <strong>404 <small>ERRO :(</small></strong>
        </h1>
        <p>Algum erro ocorreu ou a página não existe.</p>
        <Link className="voltarmenu btn btn-link" to="/">Voltar para o menu</Link>

      </div>
    )
  }
}

export default NotFound;