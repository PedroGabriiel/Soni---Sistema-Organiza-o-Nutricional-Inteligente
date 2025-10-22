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

    // Dietas vinculadas ao paciente
    $stmt = $pdo->prepare("SELECT d.dieta_id, d.nome, d.data_inicio, d.data_fim
      FROM paciente_dieta pd
      INNER JOIN dieta d ON d.dieta_id = pd.dieta_id
      WHERE pd.paciente_id = :id
      ORDER BY d.data_inicio DESC");
    $stmt->execute(['id' => $paciente_id]);
    $dietas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $resultado = [];
    foreach ($dietas as $d) {
        $dieta_id = (int)$d['dieta_id'];
        // Refeições
        $stmt = $pdo->prepare("SELECT refeicao_id, nome, horario FROM refeicao WHERE dieta_id = :dieta_id ORDER BY horario ASC");
        $stmt->execute(['dieta_id' => $dieta_id]);
        $refeicoes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $refeicoes_out = [];
        foreach ($refeicoes as $r) {
            $stmt = $pdo->prepare("SELECT ir.item_refeicao_id, ir.quantidade, ir.unidade_medida, a.nome AS alimento
              FROM itensrefeicao ir
              INNER JOIN alimento a ON a.alimento_id = ir.alimento_id
              WHERE ir.refeicao_id = :rid");
            $stmt->execute(['rid' => $r['refeicao_id']]);
            $itens = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $refeicoes_out[] = [
                'refeicao_id' => (int)$r['refeicao_id'],
                'nome' => $r['nome'],
                'horario' => $r['horario'],
                'itens' => $itens,
            ];
        }

        $resultado[] = [
            'dieta_id' => $dieta_id,
            'nome' => $d['nome'],
            'data_inicio' => $d['data_inicio'],
            'data_fim' => $d['data_fim'],
            'refeicoes' => $refeicoes_out,
        ];
    }

    echo json_encode(['ok' => true, 'data' => $resultado], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Erro ao buscar dieta do paciente', 'error' => $e->getMessage()]);
}
