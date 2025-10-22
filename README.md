# SONI - Sistema de Organização Nutricional Inteligente

Sistema web para gestão de nutricionistas e pacientes, desenvolvido com React + TypeScript (frontend) e PHP + MySQL (backend).

## 📋 Pré-requisitos

- **XAMPP** (ou Apache + PHP 7.4+ + MySQL 5.7+)
- **Node.js** 16+ e npm
- **Git** (opcional)

## 🚀 Configuração do Ambiente

### 1. Configurar o Banco de Dados

1. **Inicie o XAMPP** e ative os módulos **Apache** e **MySQL**

2. **Acesse o phpMyAdmin**: `http://localhost/phpmyadmin`

3. **Crie o banco de dados**:
   - Clique em "Novo" (New)
   - Nome: `soni`
   - Collation: `utf8mb4_unicode_ci`
   - Clique em "Criar"

4. **Execute o schema SQL**:
   - Selecione o banco `soni`
   - Vá na aba "SQL"
   - Copie e cole todo o conteúdo do arquivo `backend/schema.sql`
   - Clique em "Executar"

### 2. Configurar o Backend PHP

O backend PHP já está configurado em `public/api/`. Por padrão, ele usa:

- **Host**: `127.0.0.1`
- **Banco**: `soni`
- **Usuário**: `root`
- **Senha**: (vazia)

Se suas credenciais forem diferentes, edite o arquivo `public/api/config.php`:

```php
$DB_HOST = '127.0.0.1';
$DB_NAME = 'soni';
$DB_USER = 'root';
$DB_PASS = ''; // Sua senha aqui
```

### 3. Instalar Dependências do Frontend

Abra o terminal na raiz do projeto e execute:

```bash
npm install
```

### 4. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

O projeto será iniciado em: **http://localhost:8080**

## 📁 Estrutura do Projeto

```
Prototipo-Soni-Sistema-de-Organização-Nutricional-Inteligente/
├── backend/
│   └── schema.sql              # Schema do banco de dados
├── public/
│   └── api/
│       ├── config.php          # Configuração PDO e CORS
│       ├── register_nutricionista.php
│       └── login_nutricionista.php
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx       # Página inicial
│   │   ├── NutritionistLoginConfirm.tsx  # Login nutricionista
│   │   ├── NutritionistSignup.tsx        # Cadastro nutricionista
│   │   └── NutritionistDashboard.tsx     # Dashboard
│   └── components/             # Componentes UI
└── vite.config.ts             # Configuração Vite com proxy
```

## 🔄 Fluxo de Navegação

1. **Página Inicial** (`/`)
   - Botão "Entrar como Nutricionista" → Login
   - Botão "Cadastrar Nutricionista" → Cadastro

2. **Cadastro** (`/nutricionista/cadastro`)
   - Formulário: nome, email, senha, CRN, especialização
   - Backend: `POST /api/register_nutricionista.php`
   - Após sucesso → Redireciona para login

3. **Login** (`/nutricionista/confirmacao`)
   - Formulário: email, senha
   - Backend: `POST /api/login_nutricionista.php`
   - Após sucesso → Armazena dados no `sessionStorage` → Redireciona para dashboard

4. **Dashboard** (`/nutricionista`)
   - Painel do nutricionista

## 🔧 Endpoints da API

### `POST /api/register_nutricionista.php`

Cadastra um novo nutricionista.

**Body**:
```json
{
  "nome": "Dr. João Silva",
  "email": "joao@exemplo.com",
  "senha": "senha123",
  "crn": "CRN12345",
  "especializacao": "Nutrição Esportiva"
}
```

**Resposta** (201):
```json
{
  "ok": true,
  "message": "Cadastro realizado com sucesso",
  "usuario_id": 1
}
```

### `POST /api/login_nutricionista.php`

Autentica um nutricionista.

**Body**:
```json
{
  "email": "joao@exemplo.com",
  "senha": "senha123"
}
```

**Resposta** (200):
```json
{
  "ok": true,
  "message": "Login realizado com sucesso",
  "user": {
    "usuario_id": 1,
    "email": "joao@exemplo.com",
    "nome": "Dr. João Silva",
    "crn": "CRN12345",
    "especializacao": "Nutrição Esportiva"
  }
}
```

## ⚠️ Troubleshooting

### Erro de CORS

Se você receber erros de CORS, verifique se o arquivo `public/api/config.php` inclui sua origem:

```php
$allowed_origins = [
    'http://localhost:8080',  // Porta do Vite
    'http://127.0.0.1:8080',
    // adicione outras se necessário
];
```

### API retorna 404

Certifique-se de que:
1. O Apache do XAMPP está rodando
2. O projeto está na pasta `htdocs` do XAMPP
3. O caminho está correto: `http://localhost/Prototipo-Soni-Sistema-de-Organização-Nutricional-Inteligente/public/api/...`

### Conexão com banco falha

Verifique:
1. MySQL do XAMPP está ativo
2. Credenciais em `public/api/config.php` estão corretas
3. Banco `soni` foi criado
4. Schema foi executado com sucesso

## 📦 Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend**: PHP 7.4+, PDO, MySQL
- **Validação**: Zod, React Hook Form
- **Notificações**: Sonner (toast)
- **Roteamento**: React Router DOM

## 📝 Licença

Este projeto é um protótipo acadêmico.

---

**Desenvolvido com ❤️ para facilitar a gestão nutricional**
