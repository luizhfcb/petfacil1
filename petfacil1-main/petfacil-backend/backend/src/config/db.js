const mongoose = require('mongoose');

async function connectDb(uri = process.env.MONGODB_URI) {
  if (!uri) throw new Error('Defina MONGODB_URI no arquivo .env');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB conectado');
}

module.exports = { connectDb };
