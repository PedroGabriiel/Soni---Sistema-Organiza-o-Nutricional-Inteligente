<?php
require_once __DIR__ . '/config.php';
$pdo = db();

try {
    $data = jsonBody();
    $email = trim($data['email'] ?? '');
    $senha = (string)($data['senha'] ?? '');

    if ($email === '' || $senha === '') {
        respond(400, ['ok' => false, 'message' => 'Email e senha são obrigatórios']);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(400, ['ok' => false, 'message' => 'E-mail inválido']);
    }

    // Busca usuário pelo email
    $stmt = $pdo->prepare('
        SELECT u.usuario_id, u.email, u.senha, u.status, 
               n.nutricionista_id, n.nome, n.crn, n.especializacao
        FROM usuario u
        INNER JOIN nutricionista n ON n.nutricionista_id = u.usuario_id
        WHERE u.email = ?
        LIMIT 1
    ');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        respond(401, ['ok' => false, 'message' => 'Credenciais inválidas']);
    }

    // Verifica senha
    if (!password_verify($senha, $user['senha'])) {
        respond(401, ['ok' => false, 'message' => 'Credenciais inválidas']);
    }

    // Verifica status
    if ($user['status'] !== 'ativo') {
        respond(403, ['ok' => false, 'message' => 'Usuário inativo']);
    }

    // Retorna dados do nutricionista (sem a senha)
    respond(200, [
        'ok' => true,
        'message' => 'Login realizado com sucesso',
        'user' => [
            'usuario_id' => (int)$user['usuario_id'],
            'nutricionista_id' => (int)$user['nutricionista_id'],
            'email' => $user['email'],
            'nome' => $user['nome'],
            'crn' => $user['crn'],
            'especializacao' => $user['especializacao'],
        ],
    ]);
} catch (PDOException $e) {
    respond(500, ['ok' => false, 'message' => 'Erro no servidor', 'error' => $e->getMessage()]);
} catch (Exception $e) {
    respond(500, ['ok' => false, 'message' => 'Erro inesperado', 'error' => $e->getMessage()]);
}
