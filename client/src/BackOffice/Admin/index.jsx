import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Main from '../Main';
import NotFound from '../NotFound';
import AdminSidebar from '../../components/SidebarAdmin';

import Utilizador from '../Tabelas/Utilizador';
import UtilizadorCreate from '../Tabelas/Utilizador/create';
import UtilizadorEdit from '../Tabelas/Utilizador/edit';

import Cargo from '../Tabelas/Cargo';
import CargoCreate from '../Tabelas/Cargo/create';
import CargoEdit from '../Tabelas/Cargo/edit';

import Disciplina from '../Tabelas/Disciplina';
import DisciplinaCreate from '../Tabelas/Disciplina/create';
import DisciplinaEdit from '../Tabelas/Disciplina/edit';

import './style.css';

const Admin = () => {

  return (    
    
      <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
      <Routes>
        <Route path="" element={<Main />} />
        <Route path="*" element={<NotFound />} />
        <Route path="/utilizador" element={<Utilizador />} />
        <Route path="/utilizador/criar" element={<UtilizadorCreate />} />
        <Route path="/utilizador/edit/:id" element={<UtilizadorEdit />} />

        <Route path="/cargo" element={<Cargo />} />
        <Route path="/cargo/criar" element={<CargoCreate />} />
        <Route path="/cargo/edit/:id" element={<CargoEdit />} />~

        <Route path="/disciplina" element={<Disciplina />} />
        <Route path="/disciplina/criar" element={<DisciplinaCreate />} />
        <Route path="/disciplina/edit/:id" element={<DisciplinaEdit />} />
      </Routes>
      </div>
      </div>
  );
};

export default Admin;
