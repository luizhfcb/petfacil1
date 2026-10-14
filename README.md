# PetFacil - Fase 1

Unifacisa

Alunos:

- Luiz Henrique Andrade da Silva
- Yan Rafael Andrade Barbosa
- Edinaldo Lima Pires Júnior

## Como rodar

O app (Expo) conversa com a API (`petfacil-backend/backend`), que usa MongoDB. Suba a API primeiro.

### 1. API

```bash
cd petfacil-backend/backend
npm install
cp .env.example .env     # ajuste MONGODB_URI e JWT_SECRET
npm run seed             # cria os produtos e o usuário demo
npm start                # http://localhost:3000
```

Sem MongoDB local, crie um cluster gratuito no MongoDB Atlas e use a string de conexão em `MONGODB_URI`.

### 2. App

```bash
# na raiz do projeto
npm install
npm start
```

O endereço da API é escolhido automaticamente:

| Onde o app roda | Endereço usado |
|---|---|
| Emulador Android | `http://10.0.2.2:3000` |
| iOS Simulator / navegador (`npm run web`) | `http://localhost:3000` |
| Celular físico (Expo Go) | defina o IP do computador, veja abaixo |

Celular físico (celular e computador na mesma rede Wi-Fi):

```bash
# Linux/macOS
EXPO_PUBLIC_API_URL=http://192.168.0.10:3000 npm start
# Windows (PowerShell)
$env:EXPO_PUBLIC_API_URL="http://192.168.0.10:3000"; npm start
```

Usuário de teste (criado pelo `npm run seed`): `tutor@petfacil.com` / `pet123`

## Apresentação

Veja o [guia para apresentar na faculdade](GUIA-APRESENTACAO.md) (hotspot, redes com bloqueio e roteiro de demonstração).

## Testes

```bash
npm test                              # app
cd petfacil-backend/backend && npm test   # API
```
