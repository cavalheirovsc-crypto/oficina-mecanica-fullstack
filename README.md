# Oficina Mecânica — Node.js + React Native Expo + NativeWind

## Estrutura
- `backend/`: API Express com 15 rotas e validações.
- `frontend/`: aplicativo Expo Router com **15 telas de operações** (5 para cada entidade), além da tela inicial.
- `imagens-telas/`: prévias ilustrativas das telas (mockups, não capturas do aplicativo executado).

## 1. Abrir no VS Code (Windows)
Extraia o ZIP. No VS Code, escolha **Arquivo > Abrir Pasta** e selecione `oficina-mecanica`.

## 2. Iniciar backend (Terminal 1)
```powershell
cd backend
npm install
npm start
```
Abra `http://localhost:3000` no navegador. O terminal deve mostrar `API rodando em http://localhost:3000`.

## 3. Iniciar frontend (Terminal 2, novo terminal no VS Code)
```powershell
cd frontend
npm install
npx expo start --clear
```
Se o terminal novo abrir dentro de `backend`, use `cd ..` antes de `cd frontend`.
Para testar no navegador, pressione `w` no Expo. Para Expo Go, leia abaixo.

## 4. Usar celular com Expo Go
O celular e o computador devem estar na mesma rede Wi-Fi. Execute `ipconfig` no terminal do Windows e encontre o **Endereço IPv4** da conexão Wi-Fi. No arquivo `frontend/src/api.ts`, substitua `http://localhost:3000` por `http://SEU_IP:3000`, por exemplo `http://192.168.1.10:3000`. Depois reinicie Expo e leia o QR code. Para emulador Android use `http://10.0.2.2:3000`. O túnel do Expo não expõe automaticamente a API local do backend; o celular ainda precisa alcançar o IP do computador. Se necessário, permita Node.js no firewall.

## 5. Como usar
Primeiro cadastre um **cliente**. Copie o ID exibido na tela de consulta do cliente e use-o em `clienteId` para cadastrar um **veículo**. Depois copie o ID do veículo para `veiculoId` e crie uma **ordem de serviço**. É possível editar e excluir nos detalhes.

## 6. Rotas
Cada entidade (`clientes`, `veiculos`, `ordens-servico`) possui `GET /`, `GET /:id`, `POST /`, `PUT /:id` e `DELETE /:id`. As telas ficam nas rotas Expo Router: `app/[tipo]/index.tsx` (listar), `app/[tipo]/[id]/index.tsx` (consultar), `app/[tipo]/novo.tsx` (cadastrar), `app/[tipo]/[id]/editar.tsx` (editar) e botão excluir com confirmação na tela de detalhes. Assim há uma tela dedicada para cada operação de cada entidade, reutilizando componentes para facilitar a manutenção.

## Observações
- Os dados ficam **em memória**: reiniciar o backend apaga cadastros.
- A pasta de imagens contém **mockups ilustrativos**, não prints de um app rodando.
- Dependências precisam de internet para `npm install`; não foram instaladas nem testadas neste ambiente.
- Para ambientes com incompatibilidade de versões, rode `npx expo install --fix` dentro de `frontend` após instalar dependências.
