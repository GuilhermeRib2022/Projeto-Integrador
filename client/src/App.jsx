import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import ProtectedRoute from './services/protectedRoute';
import RoleRoute from './services/roleRoute';

import Home from './FrontOffice/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import NotFound from './components/NotFound';
import Contact from './components/Contact';
import About from './components/About';
import Sidebar from './components/Sidebar';
import Login from './FrontOffice/Auth/Login';
import Register from './FrontOffice/Auth/Register';
import Admin from './BackOffice/Admin';
import Video from './FrontOffice/Video';
import Disciplinas from './FrontOffice/Disciplina';
import SearchResults from './FrontOffice/Home/SearchResults';
import SearchDisciplina from './FrontOffice/SearchDisciplina/SearchDisciplina';
import ScrollToTop from './services/ScrollToTop';
import Perfil from './FrontOffice/Perfil';
import EditPerfil from './FrontOffice/Perfil/EditPerfil';

import Anotacoes from './FrontOffice/Anotacoes';

import PublicarVideo from './FrontOffice/Professor/ProfVideo/PublicarVideo';
import ListarVideo from './FrontOffice/Professor/ProfVideo/ListarVideo';
import EditarVideo from './FrontOffice/Professor/ProfVideo/EditarVideo';

import './App.css'

function AppIn() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="app-container d-flex flex-column min-vh-100">
      <div className="app-container d-flex flex-column min-vh-100">
        {!isAdminRoute && <Header />}
        <div className="flex-grow-1 d-flex">
          {!isAdminRoute && <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />}
          <main className={`flex-grow-1 p-3 ${collapsed ? 'main-collapsed' : 'main-expanded'}`}>
            <ScrollToTop/>
            <Routes>
              <Route path="*" element={<NotFound />} />
              <Route path="/admin/*" element={<RoleRoute allowedRoles={[2,3]}><Admin /></RoleRoute>} />
              <Route path="/videos" element={<RoleRoute allowedRoles={[2,3]}><ListarVideo /></RoleRoute>} />
              <Route path="/videos/editar/:id" element={<RoleRoute allowedRoles={[2,3]}><EditarVideo /></RoleRoute>} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/video/:id" element={<Video collapsed={collapsed} />} />
              <Route path="/disciplinas" element={<Disciplinas />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/pesquisar/disciplina" element={<SearchDisciplina />} />
              <Route path="/perfil/:id" element={<Perfil />} />
              <Route path="/perfil/editar" element={<ProtectedRoute><EditPerfil /></ProtectedRoute>} />
              <Route path="/criar" element={<RoleRoute allowedRoles={[2,3]}><PublicarVideo /></RoleRoute>} />
              <Route path="/anotacoes" element={<ProtectedRoute><Anotacoes /></ProtectedRoute>} />
              <Route path="/" element={<Home />} />
              
              
            </Routes>
          </main>
        </div>

      </div>
      <Footer />
    </div>

  );
}

const App = () => {
  return (
    <BrowserRouter>
      <AppIn />
    </BrowserRouter>
  );
};

export default App;

