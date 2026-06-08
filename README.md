# Dentalkids Dashboard v2.0

Dashboard de Produção de alta performance para a clínica Dentalkids, agora reconstruído com **React** e **Node.js**.

## 🚀 Arquitetura Atualizada

- **Frontend**: [React v18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Backend**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **Autenticação**: Stateless com **JWT** (JSON Web Tokens) e segurança via **Bcrypt**
- **Banco de Dados**: [SQLite](https://www.sqlite.org/) (com suporte para **PostgreSQL** em produção)
- **Gráficos**: [Chart.js 4](https://www.chartjs.org/)

## 📂 Estrutura do Projeto

- `/client`: Aplicação Frontend (React)
- `/server`: API Backend (Node.js/Express)
- `/data`: Diretório onde o banco de dados SQLite (`users.db`) é armazenado
- `/legacy_backup`: Backup dos arquivos originais do sistema monolítico

## 🛠️ Como Executar

### Desenvolvimento Local

1. Instale as dependências na raiz (inclui client e server):
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

2. Inicie ambos os servidores simultaneamente:
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:3001`

### Produção

O sistema está configurado para o **EasyPanel**. O servidor Node.js serve os arquivos estáticos do React automaticamente em produção.

1. Build do Frontend:
   ```bash
   npm run build
   ```

2. Iniciar Servidor:
   ```bash
   npm start
   ```

## 🔒 Credenciais Padrão
- **Usuário**: `admin`
- **Senha**: `admin`

*Recomenda-se alterar a senha imediatamente após o primeiro login.*