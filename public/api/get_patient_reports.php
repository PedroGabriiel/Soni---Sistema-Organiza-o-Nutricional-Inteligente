<?php
require_once __DIR__ . '/config.php';

try {
    $pdo = db();
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        respond(405, ['ok' => false, 'message' => 'Método não permitido']);
    }

    $paciente_id = isset($_GET['paciente_id']) ? (int)$_GET['paciente_id'] : 0;
    if (!$paciente_id) respond(400, ['ok' => false, 'message' => 'paciente_id é obrigatório']);

    $stmt = $pdo->prepare('SELECT diario_id, data_hora, descricao, feedback, foto FROM DiarioAlimentar WHERE paciente_id = :pid ORDER BY data_hora DESC');
    $stmt->execute(['pid' => $paciente_id]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    respond(200, ['ok' => true, 'data' => $rows]);
} catch (Throwable $e) {
    respond(500, ['ok' => false, 'message' => 'Erro ao buscar relatórios', 'error' => $e->getMessage()]);
}
