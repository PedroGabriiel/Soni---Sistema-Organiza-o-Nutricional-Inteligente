<?php
require_once __DIR__ . '/config.php';

try {
    $pdo = db();
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        respond(405, ['ok' => false, 'message' => 'Método não permitido']);
    }

    $data = jsonBody();
    $paciente_id = isset($data['paciente_id']) ? (int)$data['paciente_id'] : 0;
    $descricao = isset($data['descricao']) ? trim($data['descricao']) : null;
    $feedback = isset($data['feedback']) ? trim($data['feedback']) : null;
    $foto = isset($data['foto']) ? trim($data['foto']) : null;
    $data_hora = isset($data['data_hora']) ? $data['data_hora'] : date('Y-m-d H:i:s');

    if (!$paciente_id) respond(400, ['ok' => false, 'message' => 'paciente_id é obrigatório']);

    $stmt = $pdo->prepare('INSERT INTO DiarioAlimentar (data_hora, descricao, feedback, foto, paciente_id) VALUES (:dh, :desc, :fb, :foto, :pid)');
    $stmt->execute(['dh' => $data_hora, 'desc' => $descricao, 'fb' => $feedback, 'foto' => $foto, 'pid' => $paciente_id]);
    $id = (int)$pdo->lastInsertId();

    respond(200, ['ok' => true, 'message' => 'Relatório salvo', 'diario_id' => $id]);
} catch (Throwable $e) {
    respond(500, ['ok' => false, 'message' => 'Erro ao salvar relatório', 'error' => $e->getMessage()]);
}
