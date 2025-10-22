<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);
require_once 'config.php';

try {
    $pdo = db();

    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'message' => 'Método não permitido']);
        exit;
    }

    $paciente_id = isset($_GET['paciente_id']) ? (int)$_GET['paciente_id'] : 0;
    if (!$paciente_id) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'message' => 'paciente_id é obrigatório']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT 
        p.paciente_id,
        p.nome,
        p.data_nascimento,
        p.genero,
        p.objetivo,
        p.alergias_restricoes,
        u.email,
        u.status
      FROM paciente p
      INNER JOIN usuario u ON u.usuario_id = p.paciente_id
      WHERE p.paciente_id = :id
      LIMIT 1");
    $stmt->execute(['id' => $paciente_id]);
    $paciente = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$paciente) {
        http_response_code(404);
        echo json_encode(['ok' => false, 'message' => 'Paciente não encontrado']);
        exit;
    }

    // Número de dietas vinculadas
    $stmt = $pdo->prepare("SELECT COUNT(*) AS total FROM paciente_dieta WHERE paciente_id = :id");
    $stmt->execute(['id' => $paciente_id]);
    $dietas = $stmt->fetch(PDO::FETCH_ASSOC);

    // Última avaliação (se existir)
    $stmt = $pdo->prepare("SELECT * FROM avaliacaofisica WHERE paciente_id = :id ORDER BY data DESC LIMIT 1");
    $stmt->execute(['id' => $paciente_id]);
    $avaliacao = $stmt->fetch(PDO::FETCH_ASSOC) ?: null;

    echo json_encode([
        'ok' => true,
        'data' => [
            'paciente' => $paciente,
            'resumo' => [
                'dietas_total' => (int)($dietas['total'] ?? 0),
                'ultima_avaliacao' => $avaliacao,
            ]
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Erro ao buscar paciente', 'error' => $e->getMessage()]);
}
