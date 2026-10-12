function notFound(req, res) {
  res.status(404).json({ message: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(error, _req, res, _next) {
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Identificador inválido.' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: 'Dados inválidos.', details: error.message });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'JSON malformado.' });
  }
  console.error(error);
  res.status(500).json({ message: 'Erro interno do servidor.' });
}

module.exports = { notFound, errorHandler };
