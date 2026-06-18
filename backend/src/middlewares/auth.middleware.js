const jwt = require('jsonwebtoken');

const verificarAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Acceso denegado: Token faltante" });

    // AQUÍ ESTABA EL BUG: La clave por defecto debe ser 'supersecreto123'
    jwt.verify(token, process.env.JWT_SECRET || 'supersecreto123', (err, user) => {
        if (err) return res.status(403).json({ error: "Acceso denegado: Token inválido" });
        req.user = user;
        next();
    });
};

module.exports = verificarAdmin;