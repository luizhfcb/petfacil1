const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

const round2 = (value) => Math.round(value * 100) / 100;

// POST /api/orders   (botão "Finalizar pedido" do carrinho)
// body: { items: [{ productId, quantity? }] }  -> o carrinho do app é uma lista de produtos
router.post('/', async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'O carrinho está vazio.' });
    }

    const ids = [...new Set(items.map((item) => String(item.productId)))];
    const products = await Product.find({ _id: { $in: ids } });
    const byId = new Map(products.map((product) => [String(product._id), product]));

    const orderItems = [];
    for (const item of items) {
      const product = byId.get(String(item.productId));
      if (!product) {
        return res.status(400).json({ message: `Produto não encontrado: ${item.productId}` });
      }
      const quantity = Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : 1;
      for (let i = 0; i < quantity; i += 1) {
        // O preço vem sempre do banco (promocional), nunca do cliente
        orderItems.push({ product: product._id, productName: product.name, price: product.promotionalPrice });
      }
    }

    const total = round2(orderItems.reduce((sum, item) => sum + item.price, 0));
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      itemCount: orderItems.length,
      total,
    });

    // Mesmo formato que a tela OrderSuccess espera: { itemCount, total }
    res.status(201).json({ itemCount: order.itemCount, total: order.total, order });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders   (histórico de compras do usuário)
router.get('/', async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ count: orders.length, orders });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:id
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: 'Pedido não encontrado.' });
    res.json({ order });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
