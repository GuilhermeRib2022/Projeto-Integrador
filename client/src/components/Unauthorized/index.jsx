import React, { Component } from 'react';
import './style.css';

class Unauthorized extends Component {
  render() {
    return (
      <div className="noAuth">
        <h1>
          401 <small>Sem autorização</small>
        </h1>
        <p>Você não possui autorização para entrar na página.</p>
      </div>
    )
  }
}

export default Unauthorized;