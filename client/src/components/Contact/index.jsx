import React, { Component } from 'react';
import './style.css';
import { NavLink } from 'react-router-dom';

class Contact extends Component {
  render() {
    return (
      <>
        <h1 className='pag'>Contactos</h1>
        <hr></hr>
        <div className='contactos'>
          <h5>Caso tenha alguma dúvida ou precise de ajuda contacte-nos através das seguintes formas:</h5>
          <div className='lista'>
            <br></br>
            <ul>

            <li>+351 123456789</li>
            <br></br>
            <li>Trylearn@trylearn.com</li>
            <br></br>
            </ul>
          </div>
        </div>
        <NavLink className="nav-link-contactos" to="/"> Página Inicial </NavLink>
        <hr></hr>
      </>
    )
  }
}

export default Contact;