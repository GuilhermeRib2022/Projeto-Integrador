import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  } catch (error) {
    console.error('Erro ao decodificar token:', error);
    return true;
  }
};

//3 é Admin, 2 é Professor, 1 é Aluno
function RoleRoute({ children, allowedRoles = [1, 2, 3] }) {
  const token = localStorage.getItem('token');

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // Verifica se o campo 'cargo' existe e é um dos permitidos
    if (!allowedRoles.includes(decoded.cargo)) {
      return <Navigate to="/unauthorized" replace />; // ou outra rota se quiser
    }

    return children;
  } catch (err) {
    console.error('Erro ao validar cargo no token:', err);
    return <Navigate to="/login" replace />;
  }
}

export default RoleRoute;
