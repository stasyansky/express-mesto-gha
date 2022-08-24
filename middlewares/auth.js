const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/unauthorized-err');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError('Необходима авторизация');
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new UnauthorizedError('Некорректный токен');
  }
  req.user = payload;
  next();
};
