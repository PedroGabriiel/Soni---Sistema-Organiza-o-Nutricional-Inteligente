<?php
require_once __DIR__ . '/config.php';
$pdo = db();

try {
    $data = jsonBody();
    $nome = trim($data['nome'] ?? '');
    $email = trim($data['email'] ?? '');
    $senha = (string)($data['senha'] ?? '');
    $crn = trim($data['crn'] ?? '');
    $especializacao = trim($data['especializacao'] ?? '');

    if ($nome === '' || $email === '' || $senha === '' || $crn === '') {
        respond(400, ['ok' => false, 'message' => 'Campos obrigatórios ausentes']);
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(400, ['ok' => false, 'message' => 'E-mail inválido']);
    }

    // Verifica se o e-mail já existe
    $stmt = $pdo->prepare('SELECT 1 FROM usuario WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        respond(409, ['ok' => false, 'message' => 'E-mail já cadastrado']);
    }

    $hash = password_hash($senha, PASSWORD_BCRYPT);

    $pdo->beginTransaction();
    // Insere usuário
    $stmt = $pdo->prepare('INSERT INTO usuario (email, senha, status) VALUES (?, ?, ?)');
    $stmt->execute([$email, $hash, 'ativo']);
    $usuarioId = (int)$pdo->lastInsertId();

    // Insere nutricionista (1:1 com Usuario)
    $stmt = $pdo->prepare('INSERT INTO nutricionista (nutricionista_id, nome, crn, especializacao) VALUES (?, ?, ?, ?)');
    $stmt->execute([$usuarioId, $nome, $crn, $especializacao]);

    $pdo->commit();

    respond(201, [
        'ok' => true,
        'message' => 'Cadastro realizado com sucesso',
        'usuario_id' => $usuarioId,
    ]);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    // Possível violação de unique em CRN
    if ((int)$e->errorInfo[1] === 1062) {
        respond(409, ['ok' => false, 'message' => 'CRN já cadastrado']);
    }
    respond(500, ['ok' => false, 'message' => 'Erro no servidor', 'error' => $e->getMessage()]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    respond(500, ['ok' => false, 'message' => 'Erro inesperado', 'error' => $e->getMessage()]);
}
