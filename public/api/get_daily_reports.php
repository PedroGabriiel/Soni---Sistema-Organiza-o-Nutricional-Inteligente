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
    $dias_limite = isset($_GET['dias']) ? (int)$_GET['dias'] : 30; // Padrão: 30 dias

    // Buscar registros do diário com status de aderência
    // Usamos JOIN para pegar o status_adesao mais recente de cada dia
    $stmt = $pdo->prepare("
        SELECT 
            DATE(d1.data_hora) as data,
            COUNT(*) as registros,
            GROUP_CONCAT(d1.descricao SEPARATOR ' | ') as descricoes,
            MAX(d1.status_adesao) as status_adesao
        FROM diarioalimentar d1
        WHERE d1.paciente_id = :paciente_id
        AND d1.data_hora >= DATE_SUB(NOW(), INTERVAL :dias DAY)
        GROUP BY DATE(d1.data_hora)
        ORDER BY data DESC
    ");
    
    $stmt->execute([
        'paciente_id' => $paciente_id,
        'dias' => $dias_limite
    ]);
    
    $dailyReports = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Transformar dados em formato compatível com frontend
    $reports = [];
    foreach ($dailyReports as $report) {
        // Mapear status_adesao do banco para formato do frontend
        $adherence = 'none';
        $status = strtolower($report['status_adesao'] ?? '');
        
        if (strpos($status, 'totalmente') !== false || strpos($status, 'completo') !== false) {
            $adherence = 'complete';
        } elseif (strpos($status, 'parcial') !== false) {
            $adherence = 'partial';
        } elseif (strpos($status, 'não') !== false || strpos($status, 'nao') !== false) {
            $adherence = 'none';
        }

        $reports[] = [
            'id' => $report['data'], // Usar data como ID único
            'patientId' => (string)$paciente_id,
            'date' => $report['data'],
            'adherence' => $adherence,
            'notes' => $report['descricoes'] ?: '',
            'registros' => (int)$report['registros'],
            'substitutions' => [] // Pode ser expandido no futuro
        ];
    }

    echo json_encode([
        'ok' => true,
        'data' => $reports
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false, 
        'message' => 'Erro ao buscar relatórios diários', 
        'error' => $e->getMessage()
    ]);
}
