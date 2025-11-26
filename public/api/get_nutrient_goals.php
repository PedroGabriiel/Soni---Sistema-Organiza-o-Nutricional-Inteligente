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

    // Buscar a dieta ativa do paciente e suas metas nutricionais
    $stmt = $pdo->prepare("
        SELECT 
            m.metas_id,
            m.nutriente,
            m.valor_minimo as minimo,
            m.valor_maximo as maximo,
            m.dieta_id
        FROM metasnutri m
        INNER JOIN paciente_dieta pd ON pd.dieta_id = m.dieta_id
        WHERE pd.paciente_id = :paciente_id
        ORDER BY m.dieta_id DESC
        LIMIT 10
    ");
    
    $stmt->execute(['paciente_id' => $paciente_id]);
    $metas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Se não houver metas, retornar array vazio
    if (empty($metas)) {
        echo json_encode([
            'ok' => true,
            'data' => [],
            'message' => 'Nenhuma meta nutricional encontrada para este paciente'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Converter valores numéricos
    foreach ($metas as &$meta) {
        $meta['metas_id'] = (string)$meta['metas_id'];
        $meta['dieta_id'] = (string)$meta['dieta_id'];
        $meta['minimo'] = (float)$meta['minimo'];
        $meta['maximo'] = (float)$meta['maximo'];
    }

    echo json_encode([
        'ok' => true,
        'data' => $metas
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false, 
        'message' => 'Erro ao buscar metas nutricionais', 
        'error' => $e->getMessage()
    ]);
}
