
import verificarJWT from './verificarJWT.js'; 

export default function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) { 
        return res.sendStatus(401); // Sem token, não autorizado
    }

    const result = verificarJWT(token); //Verificar validade do token 


    if (!result.success) {
     return res.status(403).json({ error: result.error }); //Caso não seja válido, retorna erro
    }

    req.user = result.data;
    next();
}

