# Dentalkids Dashboard

Dashboard de Produção para a clínica Dentalkids.

## Como executar

1. Instale as dependências:
   ```
   npm install
   ```

2. Execute o servidor:
   ```
   npm start
   ```

3. Abra o navegador em `http://localhost:3000`

## Funcionalidades

- Login e gerenciamento de usuários
- Visualização de dados de produção (carregados do Google Sheets)
- Gráficos e KPIs

## Usuários

Os usuários são armazenados em um banco SQLite (`users.db`) no servidor, garantindo persistência em qualquer dispositivo que acesse o dashboard.

- Admin padrão: usuário `admin`, senha `admin`