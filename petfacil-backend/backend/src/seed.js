require('dotenv').config();
const mongoose = require('mongoose');
const { connectDb } = require('./config/db');
const Product = require('./models/Product');
const User = require('./models/User');
const products = [
  { name: 'Ração Origem Filhotes', currentPrice: 72.9, promotionalPrice: 59.9, type: 'Ração', description: 'Nutrição completa para cães filhotes, com proteínas de alta qualidade e prebióticos.', expirationDate: '30/06/2027' },
  { name: 'Bola Mordedora Nuvem', currentPrice: 34.9, promotionalPrice: 27.9, type: 'Brinquedo', description: 'Borracha macia e resistente, ideal para gastar energia e cuidar da saúde bucal.', expirationDate: 'Não se aplica' },
  { name: 'Shampoo Banho de Sol', currentPrice: 29.9, promotionalPrice: 24.5, type: 'Higiene', description: 'Limpeza suave com pH balanceado e fragrância leve para cães e gatos.', expirationDate: '15/02/2028' },
  { name: 'Arranhador Girassol', currentPrice: 89.9, promotionalPrice: 74.9, type: 'Acessório', description: 'Arranhador compacto em sisal com base firme e brinquedo suspenso para gatos.', expirationDate: 'Não se aplica' },
  { name: 'Petisco Croc Frango', currentPrice: 18.9, promotionalPrice: 15.9, type: 'Ração', description: 'Biscoitos crocantes assados, indicados como agrado para cães adultos.', expirationDate: '20/11/2027' },
];

const demoUser = {
  fullName: 'Tutor PetFacil',
  cpf: '52998224725',
  login: 'tutor@petfacil.com',
  password: 'pet123',
};

async function seed() {
  await connectDb();

  for (const product of products) {
    await Product.updateOne({ name: product.name }, { $set: product }, { upsert: true });
  }
  console.log(`${products.length} produtos prontos`);

  if (!(await User.exists({ login: demoUser.login }))) {
    await User.create(demoUser);
    console.log(`Usuário demo criado: ${demoUser.login} / ${demoUser.password}`);
  }

  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
