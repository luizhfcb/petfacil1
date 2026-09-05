import assert from 'node:assert/strict';
import test from 'node:test';
import { formatCpf, isValidCpf, validateSignUp } from './validators';

test('aceita CPF com dígitos verificadores válidos', () => {
  assert.equal(isValidCpf('529.982.247-25'), true);
});

test('rejeita CPF inválido e sequências repetidas', () => {
  assert.equal(isValidCpf('529.982.247-24'), false);
  assert.equal(isValidCpf('111.111.111-11'), false);
});

test('formata CPF enquanto o usuário digita', () => {
  assert.equal(formatCpf('52998224725'), '529.982.247-25');
});

test('valida todos os campos do cadastro', () => {
  const errors = validateSignUp({
    fullName: 'A',
    email: 'invalido',
    cpf: '123',
    password: 'abc',
    passwordConfirmation: 'xyz',
  });
  assert.deepEqual(Object.keys(errors).sort(), ['cpf', 'email', 'fullName', 'passwordConfirmation']);
});
