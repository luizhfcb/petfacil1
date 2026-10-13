const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'petfacil-backend' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/assistant', require('./routes/assistant'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
