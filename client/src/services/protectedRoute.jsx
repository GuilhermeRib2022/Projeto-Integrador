import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'; 
import {jwtDecode} from 'jwt-decode';

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decodedToken = jwtDecode(token); //Descodifica o token jwt.
    const currentTime = Date.now() / 1000; // Obtém o tempo atual em segundos
    return decodedToken.exp < currentTime; // Verifica se o token expirou, se o tempo do token for menor que o tempo atual, retorna true. Caso contrário, retorna false. 
  } catch (error) { //Ou seja, se o tempo atual for maior que o tempo do token, significa que o token expirou.
    console.error('Error decoding token:', error);
    return true;
  }
};

function ProtectedRoute({ children }) {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
      const token = localStorage.getItem('token'); // Obtém o Token do LocalStorage
      if (!token || isTokenExpired(token)){ //Verifica se o token existe ou está expirado
        localStorage.removeItem('token');
        navigate('/login'); // Redireciona para a página de login
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true); 
      }
    }, [navigate]);

    if(isAuthenticated === null) {
      return <div>Loading...</div>; // Show loading state while checking authentication
    }
    return children;
  }

  export default ProtectedRoute;