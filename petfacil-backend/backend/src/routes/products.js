const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get('/', async (req, res, next) => {
  try {
    const { search, type } = req.query;
    const filter = {};

    if (type && type !== 'Todos') filter.type = type;
    if (search && String(search).trim()) {
      const regex = new RegExp(escapeRegex(String(search).trim()), 'i');
      filter.$or = [{ name: regex }, { type: regex }];
    }

    const products = await Product.find(filter).sort({ name: 1 });
    res.json({ count: products.length, products });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produto não encontrado.' });
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
