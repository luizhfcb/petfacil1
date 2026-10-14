const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Faça login para continuar.' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);
    if (!user) return res.status(401).json({ message: 'Sessão inválida. Entre novamente.' });

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Sessão expirada. Entre novamente.' });
    }
    next(error);
  }
}

/**
 * Igual ao requireAuth, mas não bloqueia: se não houver token (ou ele for
 * inválido/expirado) a requisição segue sem `req.user`. Usado em rotas públicas
 * que ficam mais completas para quem está logado, como a assistente Fifi.
 */
async function optionalAuth(req, _res, next) {
  try {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme === 'Bearer' && token) {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.sub);
      if (user) req.user = user;
    }
  } catch (error) {
    if (error.name !== 'JsonWebTokenError' && error.name !== 'TokenExpiredError') return next(error);
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
