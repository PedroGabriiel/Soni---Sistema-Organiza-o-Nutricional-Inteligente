# Fluxo de Cadastro e Login de Pacientes

## Visão Geral

O sistema implementa um fluxo de ativação de conta para pacientes, onde o nutricionista cadastra o paciente e fornece um código de ativação único.

## Endpoints da API

### 1. Cadastro de Paciente pelo Nutricionista
**Endpoint:** `/api/register_patient.php`  
**Método:** POST  
**Descrição:** O nutricionista cadastra um novo paciente e recebe um código de ativação.

**Body:**
```json
{
  "nome": "João Silva",
  "nutricionista_id": 1,
  "data_nascimento": "1990-05-15",
  "genero": "masculino",
  "objetivo": "Ganho de massa muscular",
  "alergias_restricoes": "Intolerância à lactose"
}
```

**Resposta (201):**
```json
{
  "ok": true,
  "message": "Paciente cadastrado com sucesso",
  "data": {
    "paciente_id": 5,
    "nome": "João Silva",
    "codigo_ativacao": "SONI-A3F2-B7C9"
  }
}
```

---

### 2. Validação do Código de Ativação
**Endpoint:** `/api/activate_patient.php`  
**Método:** POST  
**Descrição:** O paciente valida o código de ativação fornecido pelo nutricionista.

**Body:**
```json
{
  "codigo_ativacao": "SONI-A3F2-B7C9"
}
```

**Resposta (200):**
```json
{
  "ok": true,
  "message": "Código validado com sucesso",
  "data": {
    "paciente_id": 5,
    "nome": "João Silva",
    "codigo": "SONI-A3F2-B7C9"
  }
}
```

---

### 3. Criação de Senha e Finalização
**Endpoint:** `/api/set_patient_password.php`  
**Método:** POST  
**Descrição:** O paciente define sua senha e email, ativando definitivamente a conta.

**Body:**
```json
{
  "codigo_ativacao": "SONI-A3F2-B7C9",
  "email": "joao.silva@email.com",
  "senha": "senha123"
}
```

**Resposta (200):**
```json
{
  "ok": true,
  "message": "Conta ativada com sucesso!",
  "data": {
    "paciente_id": 5,
    "nome": "João Silva",
    "email": "joao.silva@email.com"
  }
}
```

---

### 4. Login do Paciente
**Endpoint:** `/api/login_patient.php`  
**Método:** POST  
**Descrição:** Paciente faz login com email e senha.

**Body:**
```json
{
  "email": "joao.silva@email.com",
  "senha": "senha123"
}
```

**Resposta (200):**
```json
{
  "ok": true,
  "message": "Login realizado com sucesso",
  "data": {
    "usuario_id": 5,
    "email": "joao.silva@email.com",
    "status": "ativo",
    "paciente_id": 5,
    "nome": "João Silva",
    "data_nascimento": "1990-05-15",
    "genero": "masculino",
    "objetivo": "Ganho de massa muscular",
    "alergias_restricoes": "Intolerância à lactose"
  }
}
```

---

## Fluxo Frontend

### Rotas do Paciente

1. **Portal do Paciente:** `/paciente-portal`
   - Tela inicial com opções: "Ativar conta" ou "Fazer login"

2. **Ativação:** `/paciente-ativacao`
   - Paciente insere o código fornecido pelo nutricionista
   - Valida via `/api/activate_patient.php`
   - Redireciona para `/paciente-senha`

3. **Definir Senha:** `/paciente-senha`
   - Paciente informa email e senha
   - Finaliza via `/api/set_patient_password.php`
   - Redireciona para `/paciente-dashboard`

4. **Login:** `/paciente-login`
   - Paciente faz login com email e senha
   - Autentica via `/api/login_patient.php`
   - Redireciona para `/paciente-dashboard`

5. **Dashboard:** `/paciente-dashboard`
   - Área logada do paciente

---

## Estrutura do Banco de Dados

### Tabela: `usuario`
```sql
CREATE TABLE usuario (
  usuario_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'ativo',  -- 'pendente' ou 'ativo'
  data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: `paciente`
```sql
CREATE TABLE paciente (
  paciente_id INT UNSIGNED PRIMARY KEY,  -- FK para usuario.usuario_id
  nome VARCHAR(255) NOT NULL,
  data_nascimento DATE,
  genero VARCHAR(20),
  objetivo TEXT,
  alergias_restricoes TEXT,
  FOREIGN KEY (paciente_id) REFERENCES usuario(usuario_id) ON DELETE CASCADE
);
```

### Tabela: `acompanhamento`
```sql
CREATE TABLE acompanhamento (
  acompanhamento_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  data_inicio_acomp DATE,
  status_acomp VARCHAR(50),
  paciente_id INT UNSIGNED NOT NULL,
  nutricionista_id INT UNSIGNED NULL,
  FOREIGN KEY (paciente_id) REFERENCES paciente(paciente_id) ON DELETE CASCADE,
  FOREIGN KEY (nutricionista_id) REFERENCES nutricionista(nutricionista_id) ON DELETE SET NULL
);
```

---

## Estados do Usuário

### Status: `pendente`
- Usuário criado pelo nutricionista
- Campo `email` contém o código de ativação (ex: "SONI-A3F2-B7C9")
- Campo `senha` está vazio
- Não pode fazer login

### Status: `ativo`
- Paciente completou a ativação
- Campo `email` contém email real
- Campo `senha` contém hash bcrypt
- Pode fazer login normalmente

---

## Segurança

1. **Senhas:** Todas as senhas são armazenadas usando `password_hash()` com bcrypt
2. **Validação:** Senhas devem ter no mínimo 6 caracteres
3. **Códigos únicos:** Códigos de ativação são gerados usando hash MD5 de valores únicos
4. **Email único:** Validação para evitar emails duplicados
5. **Status:** Apenas usuários com status `ativo` podem fazer login

---

## Como Testar

### 1. Nutricionista cadastra paciente
```bash
curl -X POST http://localhost/Prototipo-.../public/api/register_patient.php \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","nutricionista_id":1}'
```

### 2. Paciente ativa com o código recebido
- Acesse: `http://localhost:8080/paciente-ativacao`
- Insira o código (ex: SONI-A3F2-B7C9)

### 3. Paciente define senha e email
- Preencha email e senha na tela seguinte

### 4. Paciente faz login
- Acesse: `http://localhost:8080/paciente-login`
- Use o email e senha cadastrados

---

## Links Importantes

- **Portal do Paciente:** http://localhost:8080/paciente-portal
- **Ativação:** http://localhost:8080/paciente-ativacao
- **Login:** http://localhost:8080/paciente-login
- **Dashboard:** http://localhost:8080/paciente-dashboard
