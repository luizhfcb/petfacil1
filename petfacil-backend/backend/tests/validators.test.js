const assert = require('node:assert/strict');
const test = require('node:test');
const { isValidCpf, validateSignUp } = require('../src/utils/validators');
const { getAnswer } = require('../src/routes/assistant');

test('aceita CPF com dígitos verificadores válidos', () => {
  assert.equal(isValidCpf('529.982.247-25'), true);
});

test('rejeita CPF inválido e sequências repetidas', () => {
  assert.equal(isValidCpf('529.982.247-24'), false);
  assert.equal(isValidCpf('111.111.111-11'), false);
});

test('valida todos os campos do cadastro', () => {
  const errors = validateSignUp({ fullName: 'A', email: 'invalido', cpf: '123', password: 'abc', passwordConfirmation: 'xyz' });
  assert.deepEqual(Object.keys(errors).sort(), ['cpf', 'email', 'fullName', 'passwordConfirmation']);
});

test('cadastro válido não gera erros', () => {
  const errors = validateSignUp({ fullName: 'Maria Silva', email: 'maria@email.com', cpf: '529.982.247-25', password: 'abc123', passwordConfirmation: 'abc123' });
  assert.deepEqual(errors, {});
});

test('assistente responde por palavra-chave e tem resposta padrão', () => {
  assert.match(getAnswer('Quero ração para filhotes'), /Origem Filhotes/);
  assert.match(getAnswer('xyz'), /Posso ajudar/);
});
