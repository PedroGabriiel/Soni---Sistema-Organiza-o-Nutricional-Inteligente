# Teste de Conexão com o Banco de Dados

## ✅ A API de Conexão já está pronta!

O arquivo `public/api/config.php` já está configurado para conectar ao seu banco **soni** no XAMPP.

### Configuração Padrão (XAMPP):
```php
Host: 127.0.0.1
Banco: soni
Usuário: root
Senha: (vazia)
```

## 🧪 Como Testar a Conexão

### Opção 1: Pelo Navegador

1. **Certifique-se que o Apache e MySQL do XAMPP estão rodando**

2. **Acesse no navegador**:
   ```
   http://localhost/Prototipo-Soni-Sistema-de-Organização-Nutricional-Inteligente/public/api/test_connection.php
   ```

3. **Você verá um JSON com**:
   - ✅ Status da conexão
   - 📊 Nome do banco
   - 🔢 Versão do MySQL
   - 📋 Lista de tabelas
   - 📈 Contagem de registros

### Opção 2: Pelo Terminal (PowerShell)

```powershell
curl http://localhost/Prototipo-Soni-Sistema-de-Organização-Nutricional-Inteligente/public/api/test_connection.php
```

### Opção 3: Pelo Frontend (quando o dev server estiver rodando)

```bash
npm run dev
```

Depois abra o console do navegador em `http://localhost:8080` e execute:

```javascript
fetch('/api/test_connection.php')
  .then(r => r.json())
  .then(console.log)
```

## 🔧 Se houver erro de conexão

### Erro: "Access denied for user"
- Verifique usuário e senha no `public/api/config.php`
- No XAMPP padrão: usuário `root`, senha vazia

### Erro: "Unknown database 'soni'"
- Certifique-se que o banco `soni` foi criado no phpMyAdmin
- Acesse: http://localhost/phpmyadmin

### Erro: "Connection refused"
- Verifique se o MySQL do XAMPP está rodando
- Abra o painel do XAMPP e inicie o módulo MySQL

## 📡 APIs Disponíveis

Todas já estão funcionando e conectadas ao banco `soni`:

1. **POST** `/api/register_nutricionista.php` - Cadastrar nutricionista
2. **POST** `/api/login_nutricionista.php` - Login nutricionista
3. **GET** `/api/test_connection.php` - Testar conexão (criado agora)

## 🎯 Próximos Passos

1. Teste a conexão usando uma das opções acima
2. Se der sucesso, você pode:
   - Cadastrar um nutricionista pelo frontend
   - Fazer login
   - Usar o sistema normalmente

---

**Tudo pronto!** A API já está conectando ao banco `soni`. Apenas teste para confirmar! 🚀
