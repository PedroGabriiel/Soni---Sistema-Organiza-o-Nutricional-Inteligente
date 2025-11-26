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

    // Buscar medidas corporais com join nas avaliações físicas do paciente
    $stmt = $pdo->prepare("
        SELECT 
            m.medida_id,
            m.avaliacao_id,
            m.pescoco,
            m.ombro,
            m.peitoral,
            m.cintura,
            m.abdomen,
            m.quadril,
            m.braco_relaxado_d,
            m.braco_relaxado_e,
            m.braco_contraido_d,
            m.braco_contraido_e,
            m.antebraco_d,
            m.antebraco_e,
            m.coxa_proximal_d,
            m.coxa_proximal_e,
            m.panturrilha_d,
            m.panturrilha_e,
            m.dobra_tricipital,
            m.dobra_bicipital,
            m.dobra_subescapular,
            m.dobra_suprailiaca,
            m.dobra_abdominal,
            m.dobra_coxa,
            m.dobra_panturrilha
        FROM medidascorporais m
        INNER JOIN avaliacaofisica a ON a.avaliacao_id = m.avaliacao_id
        WHERE a.paciente_id = :paciente_id
        ORDER BY a.data ASC
    ");
    
    $stmt->execute(['paciente_id' => $paciente_id]);
    $medidas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Converter para números corretos
    foreach ($medidas as &$medida) {
        $medida['medida_id'] = (string)$medida['medida_id'];
        $medida['avaliacao_id'] = (string)$medida['avaliacao_id'];
        
        // Converter valores numéricos
        $campos_numericos = [
            'pescoco', 'ombro', 'peitoral', 'cintura', 'abdomen', 'quadril',
            'braco_relaxado_d', 'braco_relaxado_e', 'braco_contraido_d', 'braco_contraido_e',
            'antebraco_d', 'antebraco_e', 'coxa_proximal_d', 'coxa_proximal_e',
            'panturrilha_d', 'panturrilha_e', 'dobra_tricipital', 'dobra_bicipital',
            'dobra_subescapular', 'dobra_suprailiaca', 'dobra_abdominal',
            'dobra_coxa', 'dobra_panturrilha'
        ];
        
        foreach ($campos_numericos as $campo) {
            if (isset($medida[$campo]) && $medida[$campo] !== null) {
                $medida[$campo] = (float)$medida[$campo];
            }
        }
    }

    echo json_encode([
        'ok' => true,
        'data' => $medidas
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false, 
        'message' => 'Erro ao buscar medidas corporais', 
        'error' => $e->getMessage()
    ]);
}
