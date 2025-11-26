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

    // Buscar a dieta ativa do paciente
    $stmt = $pdo->prepare("
        SELECT d.dieta_id
        FROM dieta d
        INNER JOIN paciente_dieta pd ON d.dieta_id = pd.dieta_id
        WHERE pd.paciente_id = :paciente_id
        LIMIT 1
    ");
    
    $stmt->execute(['paciente_id' => $paciente_id]);
    $dieta = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$dieta) {
        echo json_encode([
            'ok' => true,
            'data' => [
                'calorias' => 0,
                'proteinas' => 0,
                'gorduras' => 0,
                'fibras' => 0
            ],
            'message' => 'Paciente sem dieta ativa'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Calcular totais nutricionais da dieta completa (todas as refeições do dia)
    $stmt = $pdo->prepare("
        SELECT 
            SUM(
                (ir.quantidade / 100.0) * a.calorias_100g
            ) as total_calorias,
            SUM(
                (ir.quantidade / 100.0) * a.proteinas_100g
            ) as total_proteinas,
            SUM(
                (ir.quantidade / 100.0) * a.gorduras_100g
            ) as total_gorduras,
            SUM(
                (ir.quantidade / 100.0) * a.fibras_100g
            ) as total_fibras
        FROM itensrefeicao ir
        INNER JOIN refeicao r ON ir.refeicao_id = r.refeicao_id
        INNER JOIN alimento a ON ir.alimento_id = a.alimento_id
        WHERE r.dieta_id = :dieta_id
    ");
    
    $stmt->execute(['dieta_id' => $dieta['dieta_id']]);
    $totais = $stmt->fetch(PDO::FETCH_ASSOC);

    // Retornar valores calculados
    echo json_encode([
        'ok' => true,
        'data' => [
            'calorias' => round((float)$totais['total_calorias'], 1),
            'proteinas' => round((float)$totais['total_proteinas'], 1),
            'gorduras' => round((float)$totais['total_gorduras'], 1),
            'fibras' => round((float)$totais['total_fibras'], 1)
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false, 
        'message' => 'Erro ao calcular ingestão diária', 
        'error' => $e->getMessage()
    ]);
}
