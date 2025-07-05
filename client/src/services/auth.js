import { jwtDecode } from 'jwt-decode';

export const getUserFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return {
      id: decoded.id,
      nome: decoded.nome,
      cargo: decoded.cargo,
    };
  } catch (error) {
    console.error('Failed to decode token:', error);
    localStorage.removeItem('token');
    return null;
  }
};

export const logoutUser = () => {
  localStorage.removeItem('token');
};
