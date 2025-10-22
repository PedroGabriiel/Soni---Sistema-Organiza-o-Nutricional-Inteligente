<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);
require_once 'config.php';

try {
    $pdo = db();

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'message' => 'Método não permitido']);
        exit;
    }

    $data = jsonBody();
    $nutricionista_id = isset($data['nutricionista_id']) ? (int)$data['nutricionista_id'] : 0;
    if (!$nutricionista_id) {
        respond(400, ['ok' => false, 'message' => 'nutricionista_id é obrigatório']);
    }

    $nome = trim($data['nome'] ?? '');
    $email = trim($data['email'] ?? '');
    $crn = trim($data['crn'] ?? '');
    $especializacao = trim($data['especializacao'] ?? '');
    $senha = $data['senha'] ?? '';

    if ($email && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(400, ['ok' => false, 'message' => 'Email inválido']);
    }

    $pdo->beginTransaction();

    // Atualiza tabela nutricionista
    $stmt = $pdo->prepare("UPDATE nutricionista SET nome = :nome, crn = :crn, especializacao = :esp WHERE nutricionista_id = :id");
    $stmt->execute(['nome' => $nome, 'crn' => $crn, 'esp' => $especializacao, 'id' => $nutricionista_id]);

    // Atualiza email (usuario)
    if ($email) {
        $stmt = $pdo->prepare("UPDATE usuario SET email = :email WHERE usuario_id = :id");
        $stmt->execute(['email' => $email, 'id' => $nutricionista_id]);
    }

    // Atualiza senha se enviada
    if ($senha && strlen($senha) >= 6) {
        $hash = password_hash($senha, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare("UPDATE usuario SET senha = :senha WHERE usuario_id = :id");
        $stmt->execute(['senha' => $hash, 'id' => $nutricionista_id]);
    }

    $pdo->commit();

    respond(200, ['ok' => true, 'message' => 'Perfil atualizado com sucesso']);

} catch (Throwable $e) {
    if ($pdo && $pdo->inTransaction()) $pdo->rollBack();
    respond(500, ['ok' => false, 'message' => 'Erro ao atualizar perfil', 'error' => $e->getMessage()]);
}
