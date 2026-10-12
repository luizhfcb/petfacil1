const express = require('express');

const router = express.Router();

const answers = [
  { terms: ['filhote', 'filhotes', 'ração'], answer: 'Para filhotes, procure uma ração específica para a fase de crescimento. No catálogo, a Origem Filhotes é uma opção. Se houver restrição alimentar, confirme com o veterinário.' },
  { terms: ['promoção', 'promoções', 'oferta'], answer: 'Todos os itens do catálogo exibem o preço atual e o promocional. O valor em verde é o que entra no carrinho.' },
  { terms: ['finalizar', 'pedido', 'pagamento'], answer: 'Abra o carrinho, confira os itens e toque em “Finalizar pedido”. O pagamento será feito no caixa da loja quando você retirar a compra.' },
  { terms: ['remover', 'excluir', 'carrinho'], answer: 'No carrinho, toque no ícone de lixeira ao lado do item que deseja remover.' },
];

const fallback = 'Posso ajudar com rações para filhotes, promoções, carrinho e finalização do pedido. Tente perguntar sobre um desses assuntos.';

function getAnswer(question) {
  const normalized = String(question).toLocaleLowerCase('pt-BR');
  return answers.find(({ terms }) => terms.some((term) => normalized.includes(term)))?.answer ?? fallback;
}

// POST /api/assistant   body: { question }
router.post('/', (req, res) => {
  const { question } = req.body;
  if (!question || !String(question).trim()) {
    return res.status(400).json({ message: 'Envie uma pergunta.' });
  }
  res.json({ answer: getAnswer(question) });
});

module.exports = router;
module.exports.getAnswer = getAnswer;
