# PetFacil – Backend

API em **Node.js + Express** com banco **MongoDB** (Mongoose), para o app React Native do PetFacil.

## Como rodar

```bash
cd backend
npm install
cp .env.example .env     # ajuste MONGODB_URI e JWT_SECRET
npm run seed             # cria os 5 produtos e o usuário demo
npm start                # http://localhost:3000
```

Usuário demo (igual ao do app): `tutor@petfacil.com` / `pet123`

> Sem MongoDB local? Crie um cluster gratuito no MongoDB Atlas e cole a string de conexão em `MONGODB_URI`.

## Endpoints

| Método | Rota | Auth | Uso no app |
|---|---|---|---|
| GET | `/api/health` | – | Teste de vida |
| POST | `/api/auth/register` | – | Tela "Criar conta" |
| POST | `/api/auth/login` | – | Tela "Entrar" |
| GET | `/api/auth/me` | Bearer | Usuário logado |
| GET | `/api/products?search=&type=` | – | Catálogo (busca e categorias) |
| GET | `/api/products/:id` | – | Detalhe do produto |
| POST | `/api/orders` | Bearer | "Finalizar pedido" |
| GET | `/api/orders` | Bearer | Histórico de compras |
| GET | `/api/orders/:id` | Bearer | Detalhe de um pedido |
| POST | `/api/assistant` | – | Assistente Fifi |

### Exemplos

```bash
# Cadastro
curl -X POST localhost:3000/api/auth/register -H 'Content-Type: application/json' \
  -d '{"fullName":"Maria Silva","email":"maria@email.com","cpf":"529.982.247-25","password":"abc123","passwordConfirmation":"abc123"}'

# Login -> retorna { token, user }
curl -X POST localhost:3000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"login":"tutor@petfacil.com","password":"pet123"}'

# Finalizar pedido (use o token e um id de produto vindo de GET /api/products)
curl -X POST localhost:3000/api/orders -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"items":[{"productId":"<ID>"},{"productId":"<ID>","quantity":2}]}'
# -> { "itemCount": 3, "total": 123.45, "order": {...} }
```

## Regras de negócio

- CPF validado com dígitos verificadores (mesma regra do app) e armazenado só com números.
- E-mail e CPF são únicos; duplicado retorna `409`.
- Senhas são criptografadas com bcrypt; a sessão usa JWT (`Authorization: Bearer <token>`).
- O preço do pedido é sempre o **preço promocional** lido do banco, nunca enviado pelo cliente.
- Pagamento no caixa, na retirada (sem gateway de pagamento).

## Conectando o app

No app, troque o `AppContext` (hoje em memória) por chamadas `fetch` para esta API.
No emulador Android use `http://10.0.2.2:3000`; em celular físico, o IP da máquina na rede (ex.: `http://192.168.0.10:3000`).

## Testes

```bash
npm test
```
