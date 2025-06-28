import jwt from 'jsonwebtoken';

function verificarJWT(token) {
  const secret = process.env.JWT_SECRET;

  try {
    const decoded = jwt.verify(token, secret);
    return { success: true, data: decoded };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export default verificarJWT;