require('dotenv').config();
const app = require('./app');
const { connectDb } = require('./config/db');

const PORT = process.env.PORT || 3000;

async function start() {
  if (!process.env.JWT_SECRET) throw new Error('Defina JWT_SECRET no arquivo .env');
  await connectDb();
  app.listen(PORT, () => console.log(`PetFacil API rodando na porta ${PORT}`));
}

start().catch((error) => {
  console.error('Falha ao iniciar o servidor:', error.message);
  process.exit(1);
});
