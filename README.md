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

Os usuários são armazenados em um banco de dados. Para produção no EasyPanel, use PostgreSQL configurado na plataforma (DATABASE_URL será fornecida automaticamente). Para desenvolvimento local, usa SQLite (`users.db`).

Para garantir persistência, use um banco de dados gerenciado no EasyPanel.

- Admin padrão: usuário `admin`, senha `admin`