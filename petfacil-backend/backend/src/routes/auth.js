const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');
const { onlyDigits, validateSignUp } = require('../utils/validators');

const router = express.Router();

function signToken(user) {
  return jwt.sign({ sub: String(user._id) }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

router.post('/register', async (req, res, next) => {
  try {
    const { fullName, email, cpf, password, passwordConfirmation } = req.body;

    const errors = validateSignUp({ fullName, email, cpf, password, passwordConfirmation });
    if (Object.keys(errors).length) {
      return res.status(400).json({ message: 'Dados inválidos.', errors });
    }

    const login = String(email).trim().toLowerCase();
    const cleanCpf = onlyDigits(cpf);

    const exists = await User.exists({ $or: [{ login }, { cpf: cleanCpf }] });
    if (exists) {
      return res.status(409).json({ message: 'Já existe uma conta com este CPF ou e-mail.' });
    }

    const user = await User.create({
      fullName: String(fullName).trim(),
      login,
      cpf: cleanCpf,
      password,
    });

    res.status(201).json({ token: signToken(user), user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Já existe uma conta com este CPF ou e-mail.' });
    }
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { login, email, password } = req.body;
    const identifier = String(login ?? email ?? '').trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Preencha e-mail e senha para continuar.' });
    }

    const user = await User.findOne({ login: identifier }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'E-mail ou senha não conferem.' });
    }

    res.json({ token: signToken(user), user });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
