import assert from 'node:assert/strict';
import test from 'node:test';
import { ApiError, createApiClient } from './apiClient';
import { Product } from '../types';

type Call = { url: string; init: RequestInit };

function fakeFetch(responses: Array<{ status?: number; body: unknown } | Error>) {
  const calls: Call[] = [];
  const impl = (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    const next = responses.shift();
    if (!next) throw new Error('sem resposta configurada');
    if (next instanceof Error) throw next;
    const status = next.status ?? 200;
    return { ok: status < 400, status, json: async () => next.body } as Response;
  }) as unknown as typeof fetch;
  return { impl, calls };
}

const product = (id: string): Product => ({ id, name: id, currentPrice: 10, promotionalPrice: 8, type: 'Ração', description: '', expirationDate: '' });

test('login guarda o token e o envia nas próximas chamadas', async () => {
  const { impl, calls } = fakeFetch([
    { body: { token: 'abc', user: { fullName: 'Tutor', cpf: '52998224725', login: 'tutor@petfacil.com', _id: 'x' } } },
    { body: { products: [] } },
  ]);
  const client = createApiClient('http://api', impl);
  const user = await client.login('tutor@petfacil.com', 'pet123');
  assert.deepEqual(user, { fullName: 'Tutor', cpf: '52998224725', login: 'tutor@petfacil.com' });
  await client.products();
  assert.equal(calls[0]?.url, 'http://api/api/auth/login');
  assert.equal((calls[1]?.init.headers as Record<string, string>).Authorization, 'Bearer abc');
});

test('erro da API vira ApiError com a mensagem do servidor', async () => {
  const { impl } = fakeFetch([{ status: 401, body: { message: 'E-mail ou senha não conferem.' } }]);
  const client = createApiClient('http://api', impl);
  await assert.rejects(client.login('a@b.com', 'x'), (error: unknown) => error instanceof ApiError && error.status === 401 && error.message === 'E-mail ou senha não conferem.');
});

test('servidor fora do ar gera mensagem amigável', async () => {
  const { impl } = fakeFetch([new TypeError('Network request failed')]);
  const client = createApiClient('http://api', impl);
  await assert.rejects(client.products(), (error: unknown) => error instanceof ApiError && error.status === 0);
});

test('pedido agrupa itens repetidos em quantidade', async () => {
  const { impl, calls } = fakeFetch([{ status: 201, body: { itemCount: 3, total: 147.7, order: {} } }]);
  const client = createApiClient('http://api', impl);
  const result = await client.createOrder([product('a'), product('b'), product('a')]);
  assert.deepEqual(result, { itemCount: 3, total: 147.7 });
  assert.deepEqual(JSON.parse(String(calls[0]?.init.body)), { items: [{ productId: 'a', quantity: 2 }, { productId: 'b', quantity: 1 }] });
});

test('orders devolve a lista de pedidos do usuário', async () => {
  const order = { id: '1', items: [], itemCount: 0, total: 0, status: 'Registrado', paymentMethod: 'Retirada na loja', purchaseDate: '2026-10-14T18:00:00.000Z' };
  const { impl, calls } = fakeFetch([{ body: { count: 1, orders: [order] } }]);
  const client = createApiClient('http://api', impl);
  assert.deepEqual(await client.orders(), [order]);
  assert.equal(calls[0]?.url, 'http://api/api/orders');
});
