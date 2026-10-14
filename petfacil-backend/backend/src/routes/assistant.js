const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { optionalAuth } = require('../middleware/auth');
const { answerQuestion, detectIntent, intentNeedsProducts } = require('../services/assistant');

const router = express.Router();

router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question || !String(question).trim()) {
      return res.status(400).json({ message: 'Envie uma pergunta.' });
    }

    // A Fifi só responde com o que está no banco: busca apenas o que a pergunta exige.
    const intent = detectIntent(question);
    const [products, orders] = await Promise.all([
      intentNeedsProducts(intent) ? Product.find().sort({ name: 1 }).lean() : [],
      intent === 'orders' && req.user ? Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean() : [],
    ]);

    res.json({ answer: answerQuestion({ question, products, orders, user: req.user ?? null }) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
