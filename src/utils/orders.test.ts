import assert from 'node:assert/strict';
import test from 'node:test';
import { groupOrderItems } from './orders';

test('agrupa itens repetidos somando quantidade e subtotal', () => {
  const items = [
    { product: '1', productName: 'Ração A', price: 59.9 },
    { product: '2', productName: 'Bola B', price: 27.9 },
    { product: '1', productName: 'Ração A', price: 59.9 },
  ];
  assert.deepEqual(groupOrderItems(items), [
    { name: 'Ração A', quantity: 2, subtotal: 119.8 },
    { name: 'Bola B', quantity: 1, subtotal: 27.9 },
  ]);
});

test('pedido vazio não gera grupos', () => {
  assert.deepEqual(groupOrderItems([]), []);
});
