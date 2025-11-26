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

    $stmt = $pdo->prepare("
        SELECT 
            avaliacao_id,
            paciente_id,
            data as data_avaliacao,
            data,
            peso_kg,
            altura_cm,
            observacoes,
            ROUND(peso_kg / POWER(altura_cm / 100, 2), 1) as imc
        FROM avaliacaofisica
        WHERE paciente_id = :paciente_id
        ORDER BY data ASC
    ");
    
    $stmt->execute(['paciente_id' => $paciente_id]);
    $avaliacoes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Converter para números
    foreach ($avaliacoes as &$avaliacao) {
        $avaliacao['avaliacao_id'] = (string)$avaliacao['avaliacao_id'];
        $avaliacao['paciente_id'] = (string)$avaliacao['paciente_id'];
        $avaliacao['peso_kg'] = (float)$avaliacao['peso_kg'];
        $avaliacao['altura_cm'] = (float)$avaliacao['altura_cm'];
        $avaliacao['imc'] = (float)$avaliacao['imc'];
    }

    echo json_encode([
        'ok' => true,
        'data' => $avaliacoes
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false, 
        'message' => 'Erro ao buscar avaliações físicas', 
        'error' => $e->getMessage()
    ]);
}
