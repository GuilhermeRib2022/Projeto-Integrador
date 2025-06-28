import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';
import ProtectedRoute from './services/protectedRoute';

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
            <Routes>
              <Route path="*" element={<NotFound />} />
              <Route path="/admin/*" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/video/:id" element={<Video collapsed={collapsed} />} />
              <Route path="/disciplinas" element={<Disciplinas />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/disciplina" element={<SearchDisciplina />} />
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

