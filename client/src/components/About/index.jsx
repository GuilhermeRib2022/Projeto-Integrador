import React, { Component } from 'react';
import './style.css';
import { NavLink } from 'react-router-dom';

class About extends Component {
  render() {
    return (
      <>
        <h1 className='pag'>Sobre nós</h1>
        <hr></hr>
        <div className='contactos'>
          <div className='lista'>
            <br></br>
            <ul>
            <p>A Trylearn é um website de videos educadivos sediada na região de Lisboa, 
              destacando-se no mercado nacional pela sua colaboração com professores de excelência 
              e pela vasta gama de vídeos que disponibiliza, incluindo vídeos de matemática, programação, 
              redes de computadores e álgebra. O website atua num modelo de negócio direcionado exclusivamente
               para o utilizador final, através de uma plataforma que permite a
                visualização e publicação de vídeos.</p>
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

export default About;