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

    // Parâmetro opcional para limitar os últimos N dias
    $dias_limite = isset($_GET['dias']) ? (int)$_GET['dias'] : 90; // Padrão: 90 dias

    $stmt = $pdo->prepare("
        SELECT 
            diario_id,
            paciente_id,
            data_hora,
            descricao,
            feedback,
            foto
        FROM diarioalimentar
        WHERE paciente_id = :paciente_id
        AND data_hora >= DATE_SUB(NOW(), INTERVAL :dias DAY)
        ORDER BY data_hora DESC
    ");
    
    $stmt->execute([
        'paciente_id' => $paciente_id,
        'dias' => $dias_limite
    ]);
    
    $diario = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Converter IDs para string
    foreach ($diario as &$entrada) {
        $entrada['diario_id'] = (string)$entrada['diario_id'];
        $entrada['paciente_id'] = (string)$entrada['paciente_id'];
    }

    echo json_encode([
        'ok' => true,
        'data' => $diario
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false, 
        'message' => 'Erro ao buscar diário alimentar', 
        'error' => $e->getMessage()
    ]);
}
