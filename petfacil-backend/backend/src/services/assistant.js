/**
 * Lógica da Fifi, a assistente do PetFacil.
 *
 * Este módulo é "puro": não acessa o banco nem o Express. Quem chama (a rota)
 * carrega produtos/pedidos reais do MongoDB e passa para `answerQuestion`.
 * Assim, nenhuma resposta traz preço, produto ou pedido escrito à mão.
 */

const STATUS_HINTS = {
  Registrado: 'Ele já foi registrado. O pagamento é feito no caixa da loja, na retirada.',
  'Pronto para retirada': 'Já está pronto! Você pode retirar na loja e pagar no caixa.',
  Retirado: 'Ele já foi retirado.',
  Cancelado: 'Ele foi cancelado.',
};

const STOPWORDS = new Set([
  'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na',
  'nos', 'nas', 'e', 'ou', 'para', 'pra', 'com', 'sem', 'por', 'que', 'qual', 'quais', 'quanto',
  'quanta', 'custa', 'custam', 'valor', 'valores', 'preco', 'precos', 'quero', 'queria', 'gostaria',
  'tem', 'tenho', 'voce', 'voces', 'vc', 'me', 'mim', 'sobre', 'ha', 'existe', 'ter', 'ser', 'esta',
  'estao', 'produto', 'produtos', 'item', 'itens', 'mostra', 'mostrar', 'mostre', 'ver', 'saber',
  'informacao', 'informacoes', 'alguma', 'algum', 'algo', 'ajuda', 'ajudar', 'fala', 'falar', 'vende',
  'vendem', 'pode', 'poderia', 'se', 'mais', 'menos', 'muito', 'oi', 'ola', 'fifi', 'eu', 'meu', 'minha',
  'como', 'onde', 'quando', 'seu', 'sua', 'loja', 'aqui', 'hoje', 'agora', 'tipo',
]);

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const money = (value) => BRL.format(value);

/** minúsculas, sem acento e sem pontuação: "Promoção?" -> "promocao" */
function normalize(text) {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** "filhotes" e "filhote" viram o mesmo token */
const stem = (token) => (token.length > 3 ? token.replace(/s$/, '') : token);

function questionTokens(normalized) {
  return normalized
    .split(' ')
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token))
    .map(stem);
}

const PATTERNS = {
  greeting: /^(oi+|ola|opa|e ai|bom dia|boa tarde|boa noite|hey|hello)( fifi)?$/,
  orderWord: /\b(pedidos?|compras?)\b/,
  orderMine: /\b(meus?|minhas?|ultim[oa]s?|historico|status|acompanh\w*|pronto)\b/,
  orderPast: /\b(historico|comprei)\b/,
  checkout: /\b(finaliz\w*|fechar|concluir|pagar|pagamento)\b|\b(como|onde)\b.*\b(comprar|pedido)\b/,
  cart: /\bcarrinho\b|\b(remover|remove|excluir|tirar|apagar)\b/,
  cheapest: /\b(mais barat[oa]s?|menor preco|mais em conta|mais economic[oa]s?)\b/,
  priciest: /\b(mais car[oa]s?|maior preco)\b/,
  promo: /\b(promo\w*|oferta\w*|desconto\w*|barat\w*|economiz\w*)\b/,
  expiry: /\b(validade|vence|vencimento|vencer|expira\w*)\b/,
  catalog: /\b(categorias?|catalogo|o que (voces )?(tem|vende\w*)|quais produtos|todos os produtos|produtos)\b/,
};

/**
 * Descobre o que a pessoa quer. A rota usa isso para decidir o que buscar no
 * banco (pedidos só são carregados quando a pergunta é sobre pedidos).
 */
function detectIntent(question) {
  const text = normalize(question);
  if (PATTERNS.greeting.test(text)) return 'greeting';
  if ((PATTERNS.orderWord.test(text) && PATTERNS.orderMine.test(text)) || PATTERNS.orderPast.test(text)) return 'orders';
  if (PATTERNS.checkout.test(text)) return 'checkout';
  if (PATTERNS.cart.test(text)) return 'cart';
  if (PATTERNS.cheapest.test(text)) return 'cheapest';
  if (PATTERNS.priciest.test(text)) return 'priciest';
  if (PATTERNS.promo.test(text)) return 'promo';
  return 'search';
}

/** Intenções que precisam do catálogo vindo do banco. */
const intentNeedsProducts = (intent) => !['orders', 'checkout', 'cart'].includes(intent);

/**
 * Procura produtos cujo nome, tipo ou descrição combinem com a pergunta.
 * Nome/tipo valem mais que descrição. Devolve só os melhores resultados.
 */
function searchProducts(question, products) {
  const tokens = [...new Set(questionTokens(normalize(question)))];
  if (!tokens.length) return [];

  const scored = products
    .map((product) => {
      const strong = new Set(questionTokens(normalize(`${product.name} ${product.type}`)));
      const weak = new Set(questionTokens(normalize(product.description)));
      let matched = 0;
      let score = 0;
      for (const token of tokens) {
        const weight = strong.has(token) ? 3 : weak.has(token) ? 1 : 0;
        if (weight) matched += 1;
        score += weight;
      }
      return { product, matched, score };
    })
    .filter(({ matched }) => matched > 0)
    .sort((a, b) => b.matched - a.matched || b.score - a.score || a.product.name.localeCompare(b.product.name, 'pt-BR'));

  if (!scored.length) return [];
  // Quem casa com mais termos da pergunta vem primeiro; depois descarta os bem mais fracos.
  const best = scored.filter(({ matched }) => matched === scored[0].matched);
  return best.filter(({ score }) => score > best[0].score / 2).slice(0, 4).map(({ product }) => product);
}

const discountPercent = (product) =>
  product.currentPrice > 0 ? Math.round(((product.currentPrice - product.promotionalPrice) / product.currentPrice) * 100) : 0;

const hasPromotion = (product) => product.promotionalPrice < product.currentPrice;

function priceText(product) {
  if (!hasPromotion(product)) return money(product.promotionalPrice);
  return `de ${money(product.currentPrice)} por ${money(product.promotionalPrice)} (${discountPercent(product)}% de desconto)`;
}

function describeProduct(product, { withExpiry }) {
  const parts = [`${product.name}: ${priceText(product)}.`, product.description];
  if (withExpiry) {
    parts.push(
      product.expirationDate && normalize(product.expirationDate) !== 'nao se aplica'
        ? `Validade: ${product.expirationDate}.`
        : 'Este produto não tem prazo de validade.'
    );
  }
  return parts.join(' ');
}

function listLine(product) {
  return hasPromotion(product)
    ? `• ${product.name}: ${money(product.promotionalPrice)} (de ${money(product.currentPrice)})`
    : `• ${product.name}: ${money(product.promotionalPrice)}`;
}

function answerProducts(question, products) {
  const hits = searchProducts(question, products);
  if (!hits.length) return null;
  const withExpiry = PATTERNS.expiry.test(normalize(question));
  if (hits.length === 1) return describeProduct(hits[0], { withExpiry });
  return `Encontrei estes produtos:\n${hits.map(listLine).join('\n')}\nQuer detalhes de algum deles?`;
}

function answerPromotions(products) {
  const onSale = products.filter(hasPromotion).sort((a, b) => discountPercent(b) - discountPercent(a));
  if (!onSale.length) return 'No momento nenhum produto está com preço promocional.';
  const lines = onSale.slice(0, 6).map((p) => `• ${p.name}: de ${money(p.currentPrice)} por ${money(p.promotionalPrice)} (${discountPercent(p)}% off)`);
  return `Estas são as promoções do catálogo agora:\n${lines.join('\n')}\nO valor promocional é o que entra no carrinho.`;
}

function answerExtreme(question, products, kind) {
  const scoped = searchProducts(question, products);
  const pool = scoped.length ? scoped : products;
  if (!pool.length) return 'O catálogo está vazio no momento.';
  const sorted = [...pool].sort((a, b) => a.promotionalPrice - b.promotionalPrice);
  const product = kind === 'cheapest' ? sorted[0] : sorted[sorted.length - 1];
  const label = kind === 'cheapest' ? 'mais barato' : 'mais caro';
  const scope = scoped.length ? 'entre os que encontrei' : 'do catálogo';
  return `O produto ${label} ${scope} é ${product.name}, por ${money(product.promotionalPrice)}.`;
}

function answerCatalog(products) {
  if (!products.length) return 'O catálogo está vazio no momento.';
  const byType = new Map();
  for (const product of products) byType.set(product.type, [...(byType.get(product.type) ?? []), product.name]);
  const lines = [...byType].map(([type, names]) => `• ${type}: ${names.join(', ')}`);
  return `Hoje temos ${products.length} produtos no catálogo:\n${lines.join('\n')}`;
}

function answerFallback(products) {
  if (!products.length) return 'O catálogo está vazio no momento, então ainda não consigo ajudar com produtos.';
  const types = [...new Set(products.map((p) => p.type))].join(', ');
  const example = products[0].name;
  return `Não encontrei isso no catálogo. Posso ajudar com preços, promoções, validade, categorias (${types}) e com os seus pedidos. Por exemplo: “quanto custa ${example}?”`;
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const day = date.toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' });
  const time = date.toLocaleTimeString('pt-BR', { timeZone: 'America/Fortaleza', hour: '2-digit', minute: '2-digit' });
  return `${day} às ${time}`;
}

function answerOrders(orders, user) {
  if (!user) return 'Para consultar seus pedidos, entre na sua conta.';
  if (!orders.length) return 'Você ainda não fez nenhum pedido. Quando finalizar um, ele aparece aqui.';

  const [latest] = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const grouped = new Map();
  for (const item of latest.items) grouped.set(item.productName, (grouped.get(item.productName) ?? 0) + 1);
  const items = [...grouped].map(([name, quantity]) => `${quantity}× ${name}`).join(', ');
  const plural = latest.itemCount === 1 ? 'item' : 'itens';

  const lines = [
    `Seu último pedido foi em ${formatDateTime(latest.createdAt)}: ${latest.itemCount} ${plural}, total de ${money(latest.total)}.`,
    `Itens: ${items}.`,
    `Status: ${latest.status}. ${STATUS_HINTS[latest.status] ?? ''}`.trim(),
  ];
  if (orders.length > 1) lines.push(`Você tem ${orders.length} pedidos no histórico.`);
  return lines.join('\n');
}

/**
 * @param {object} input
 * @param {string} input.question
 * @param {Array}  input.products  produtos reais do banco
 * @param {Array}  input.orders    pedidos reais do usuário logado ([] se não logado)
 * @param {object|null} input.user usuário logado, se houver
 */
function answerQuestion({ question, products = [], orders = [], user = null }) {
  switch (detectIntent(question)) {
    case 'greeting': {
      const firstName = user?.fullName?.trim().split(/\s+/)[0];
      return `Oi${firstName ? `, ${firstName}` : ''}! Sou a Fifi. Posso falar de produtos, preços, promoções e dos seus pedidos.`;
    }
    case 'orders':
      return answerOrders(orders, user);
    case 'checkout':
      return 'Abra o carrinho, confira os itens e toque em “Finalizar pedido”. O pagamento é feito no caixa da loja quando você retirar a compra.';
    case 'cart':
      return 'No carrinho, toque no ícone de lixeira ao lado do item que deseja remover.';
    case 'cheapest':
      return answerExtreme(question, products, 'cheapest');
    case 'priciest':
      return answerExtreme(question, products, 'priciest');
    case 'promo':
      return answerPromotions(products);
    default: {
      const found = answerProducts(question, products);
      if (found) return found;
      return PATTERNS.catalog.test(normalize(question)) ? answerCatalog(products) : answerFallback(products);
    }
  }
}

module.exports = { answerQuestion, detectIntent, intentNeedsProducts, searchProducts, normalize };
