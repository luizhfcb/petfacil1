const assert = require('node:assert/strict');
const test = require('node:test');
const { answerQuestion, detectIntent, intentNeedsProducts } = require('../src/services/assistant');

// Catálogo DIFERENTE do seed, de propósito: prova que a Fifi usa o que vem do banco.
const products = [
  { name: 'Ração Sênior Premium', currentPrice: 100, promotionalPrice: 80, type: 'Ração', description: 'Ração para cães idosos com glucosamina.', expirationDate: '10/10/2028' },
  { name: 'Ração Gatinhos Mix', currentPrice: 50, promotionalPrice: 50, type: 'Ração', description: 'Alimento completo para gatos filhotes.', expirationDate: '01/05/2027' },
  { name: 'Corda Dental', currentPrice: 20, promotionalPrice: 15, type: 'Brinquedo', description: 'Corda resistente para cães.', expirationDate: 'Não se aplica' },
];
const ask = (question, extra = {}) => answerQuestion({ question, products, ...extra });

test('preço vem do produto do banco, não de texto fixo', () => {
  const answer = ask('Quanto custa a Corda Dental?');
  assert.match(answer, /Corda Dental/);
  assert.match(answer, /R\$\s?15,00/);
  assert.match(answer, /R\$\s?20,00/);
  assert.match(answer, /25% de desconto/);
});

test('mesma pergunta, outro banco: resposta muda', () => {
  const other = [{ ...products[2], promotionalPrice: 10 }];
  assert.match(answerQuestion({ question: 'Corda Dental', products: other }), /R\$\s?10,00/);
});

test('encontra por categoria e por plural/singular (filhote x filhotes)', () => {
  assert.match(ask('ração para filhotes'), /Gatinhos Mix/);
  assert.doesNotMatch(ask('ração para filhotes'), /Sênior/);
});

test('promoções listam só quem está em promoção, do maior desconto ao menor', () => {
  const answer = ask('Produtos em promoção');
  assert.match(answer, /Sênior Premium/);
  assert.match(answer, /Corda Dental/);
  assert.doesNotMatch(answer, /Gatinhos Mix/);
  assert.ok(answer.indexOf('Corda Dental') < answer.indexOf('Sênior Premium'));
});

test('sem nenhuma promoção, avisa em vez de inventar', () => {
  const noSale = products.map((p) => ({ ...p, promotionalPrice: p.currentPrice }));
  assert.match(answerQuestion({ question: 'tem promoção?', products: noSale }), /nenhum produto está com preço promocional/);
});

test('mais barato e mais caro, inclusive dentro de uma categoria', () => {
  assert.match(ask('qual o mais barato?'), /Corda Dental/);
  assert.match(ask('qual o mais caro?'), /Sênior Premium/);
  assert.match(ask('ração mais barata'), /Gatinhos Mix/);
});

test('validade só aparece quando perguntam, e trata "Não se aplica"', () => {
  assert.match(ask('qual a validade da Ração Sênior Premium?'), /10\/10\/2028/);
  assert.match(ask('validade da Corda Dental'), /não tem prazo de validade/);
  assert.doesNotMatch(ask('Ração Sênior Premium'), /Validade/);
});

test('catálogo e fallback usam categorias e produto reais', () => {
  assert.match(ask('quais produtos vocês têm?'), /Ração: Ração Sênior Premium, Ração Gatinhos Mix/);
  const fallback = ask('xyz qwerty');
  assert.match(fallback, /Ração, Brinquedo/);
  assert.match(fallback, /Ração Sênior Premium/);
});

test('catálogo vazio não inventa produtos', () => {
  assert.match(answerQuestion({ question: 'promoção', products: [] }), /nenhum produto/);
  assert.match(answerQuestion({ question: 'xyz', products: [] }), /catálogo está vazio/);
});

const user = { fullName: 'Maria Silva' };
const orders = [
  { createdAt: '2026-10-01T12:00:00Z', itemCount: 1, total: 15, status: 'Retirado', items: [{ productName: 'Corda Dental' }] },
  { createdAt: '2026-10-10T15:30:00Z', itemCount: 3, total: 175, status: 'Pronto para retirada', items: [{ productName: 'Corda Dental' }, { productName: 'Corda Dental' }, { productName: 'Ração Sênior Premium' }] },
];

test('último pedido vem do banco: itens agrupados, total, status e contagem', () => {
  const answer = ask('qual o status do meu último pedido?', { orders, user });
  assert.match(answer, /10\/10\/2026/);
  assert.match(answer, /3 itens/);
  assert.match(answer, /R\$\s?175,00/);
  assert.match(answer, /2× Corda Dental, 1× Ração Sênior Premium/);
  assert.match(answer, /Pronto para retirada/);
  assert.match(answer, /2 pedidos no histórico/);
});

test('pedidos: sem login pede para entrar; sem pedidos avisa', () => {
  assert.match(ask('meus pedidos', { user: null }), /entre na sua conta/);
  assert.match(ask('meus pedidos', { orders: [], user }), /ainda não fez nenhum pedido/);
});

test('“como finalizar o pedido?” continua sendo ajuda de uso, não consulta de pedidos', () => {
  assert.equal(detectIntent('Como finalizar?'), 'checkout');
  assert.equal(detectIntent('como faço um pedido'), 'checkout');
  assert.equal(detectIntent('meu pedido já está pronto?'), 'orders');
  assert.equal(detectIntent('como remover do carrinho'), 'cart');
});

test('saudação usa o nome do usuário logado', () => {
  assert.match(ask('oi', { user }), /Oi, Maria!/);
  assert.match(ask('Olá!'), /^Oi!/);
});

test('a rota só busca produtos quando a pergunta precisa deles', () => {
  assert.equal(intentNeedsProducts(detectIntent('meus pedidos')), false);
  assert.equal(intentNeedsProducts(detectIntent('promoções')), true);
});
