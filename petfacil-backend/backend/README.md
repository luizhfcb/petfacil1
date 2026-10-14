# PetFacil – Backend

API em **Node.js + Express** com banco **MongoDB** (Mongoose), para o app React Native do PetFacil.

## Como rodar

```bash
cd petfacil-backend/backend
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
| POST | `/api/assistant` | Opcional (Bearer) | Assistente Fifi: responde com produtos e pedidos reais do banco |

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

## Assistente Fifi

A Fifi não tem respostas escritas à mão: a cada pergunta a API consulta o MongoDB e monta a resposta.

| Pergunta de exemplo | O que é lido no banco |
|---|---|
| "Produtos em promoção" | `products` (desconto = preço atual × promocional) |
| "Quanto custa o shampoo?" / "Validade do arranhador" | `products` (nome, tipo, descrição, preços, validade) |
| "Qual o mais barato?" / "Ração mais cara" | `products` |
| "Quais produtos vocês têm?" | `products`, agrupados por tipo |
| "Qual o status do meu último pedido?" | `orders` do usuário logado (exige o token; sem ele a Fifi pede para entrar) |

Perguntas de uso do app ("Como finalizar?", "Como remover do carrinho?") continuam com instruções fixas, pois não dependem de dados.
A lógica fica em `src/services/assistant.js` (sem acesso a banco, fácil de testar) e a rota em `src/routes/assistant.js`.

## Conectando o app

O app já consome esta API (veja `src/services/` na raiz do projeto).
No emulador Android ele usa `http://10.0.2.2:3000`; em celular físico, defina `EXPO_PUBLIC_API_URL` com o IP da máquina (ex.: `http://192.168.0.10:3000`).

## Testes

```bash
npm test
```
