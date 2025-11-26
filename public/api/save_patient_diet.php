<?php
// Enable verbose reporting temporarily for debugging 500 errors
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
ini_set('log_errors', 1);
error_reporting(E_ALL);

try {
    // load helpers (config.php defines db(), respond(), jsonBody())
    require_once __DIR__ . '/config.php';
    $pdo = db();

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['ok' => false, 'message' => 'Método não permitido']);
        exit;
    }

    $data = jsonBody();
    $paciente_id = isset($data['paciente_id']) ? (int)$data['paciente_id'] : 0;
    $dieta_id = isset($data['dieta_id']) ? (int)$data['dieta_id'] : 0;
    $nome = trim($data['nome'] ?? '');
    $data_inicio = $data['data_inicio'] ?? null;
    $data_fim = $data['data_fim'] ?? null;
    $refeicoes = $data['refeicoes'] ?? [];

    if (!$paciente_id) {
        respond(400, ['ok' => false, 'message' => 'paciente_id é obrigatório']);
    }
    if ($nome === '') {
        respond(400, ['ok' => false, 'message' => 'Nome da dieta é obrigatório']);
    }
    if (!is_array($refeicoes) || count($refeicoes) === 0) {
        respond(400, ['ok' => false, 'message' => 'Informe pelo menos uma refeição']);
    }

    // Verifica se paciente existe
    $stmt = $pdo->prepare('SELECT 1 FROM paciente WHERE paciente_id = :id');
    $stmt->execute(['id' => $paciente_id]);
    if (!$stmt->fetchColumn()) {
        respond(404, ['ok' => false, 'message' => 'Paciente não encontrado']);
    }

    $pdo->beginTransaction();

    if ($dieta_id > 0) {
        // Confirma se a dieta pertence ao paciente
        $stmt = $pdo->prepare('SELECT 1 FROM paciente_dieta WHERE paciente_id = :pid AND dieta_id = :did');
        $stmt->execute(['pid' => $paciente_id, 'did' => $dieta_id]);
        if (!$stmt->fetchColumn()) {
            $pdo->rollBack();
            respond(404, ['ok' => false, 'message' => 'Dieta não encontrada para este paciente']);
        }

        // Atualiza dados base da dieta
        $stmt = $pdo->prepare('UPDATE dieta SET nome = :nome, data_inicio = :di, data_fim = :df WHERE dieta_id = :id');
        $stmt->execute(['nome' => $nome, 'di' => $data_inicio, 'df' => $data_fim, 'id' => $dieta_id]);

        // Remove refeições e itens anteriores (recriaremos abaixo)
        $stmt = $pdo->prepare('SELECT refeicao_id FROM refeicao WHERE dieta_id = :id');
        $stmt->execute(['id' => $dieta_id]);
        $ref_ids = $stmt->fetchAll(PDO::FETCH_COLUMN, 0);
        if ($ref_ids && count($ref_ids) > 0) {
            $in = implode(',', array_fill(0, count($ref_ids), '?'));
            $pdo->prepare("DELETE FROM itensrefeicao WHERE refeicao_id IN ($in)")->execute($ref_ids);
        }
        $stmt = $pdo->prepare('DELETE FROM refeicao WHERE dieta_id = :id');
        $stmt->execute(['id' => $dieta_id]);
    } else {
        // Cria nova dieta
        $stmt = $pdo->prepare('INSERT INTO dieta (nome, data_inicio, data_fim) VALUES (:nome, :di, :df)');
        $stmt->execute(['nome' => $nome, 'di' => $data_inicio, 'df' => $data_fim]);
        $dieta_id = (int)$pdo->lastInsertId();

        // Vincula ao paciente
        $stmt = $pdo->prepare('INSERT INTO paciente_dieta (paciente_id, dieta_id) VALUES (:pid, :did)');
        $stmt->execute(['pid' => $paciente_id, 'did' => $dieta_id]);
    }

    // Insere refeições e itens
    $insRef = $pdo->prepare('INSERT INTO refeicao (dieta_id, nome, horario) VALUES (:did, :nome, :horario)');
    $selAl = $pdo->prepare('SELECT alimento_id FROM alimento WHERE LOWER(nome) = LOWER(:nome) LIMIT 1');

    // Detectar colunas opcionais na tabela `alimento` para evitar SQL errors
    $colsStmt = $pdo->query("SHOW COLUMNS FROM alimento");
    $cols = $colsStmt->fetchAll(PDO::FETCH_COLUMN, 0);
    $has_proteinas_col = in_array('proteinas_100g', $cols);
    $has_carbo_col = in_array('carboidratos_100g', $cols);
    $has_categoria_col = in_array('categoria', $cols);

    // Monta INSERT dinâmico conforme colunas existentes
    $alCols = ['nome'];
    $alParams = [':nome'];
    if ($has_proteinas_col) { $alCols[] = 'proteinas_100g'; $alParams[] = ':proteinas'; }
    if ($has_carbo_col) { $alCols[] = 'carboidratos_100g'; $alParams[] = ':carboidratos'; }
    if ($has_categoria_col) { $alCols[] = 'categoria'; $alParams[] = ':categoria'; }

    $insAlSql = sprintf('INSERT INTO alimento (%s) VALUES (%s)', implode(', ', $alCols), implode(', ', $alParams));
    $insAl = $pdo->prepare($insAlSql);

    $insItem = $pdo->prepare('INSERT INTO itensrefeicao (refeicao_id, alimento_id, quantidade, unidade_medida) VALUES (:rid, :aid, :qtd, :um)');

    foreach ($refeicoes as $r) {
        $rnome = trim($r['nome'] ?? '');
        if ($rnome === '') continue;
        $rhorario = $r['horario'] ?? null;
        $insRef->execute(['did' => $dieta_id, 'nome' => $rnome, 'horario' => $rhorario]);
        $refeicao_id = (int)$pdo->lastInsertId();

        $itens = $r['itens'] ?? [];
        foreach ($itens as $it) {
            $alimento_nome = trim($it['alimento'] ?? '');
            if ($alimento_nome === '') continue;
            $selAl->execute(['nome' => $alimento_nome]);
            $aid = $selAl->fetchColumn();
            if (!$aid) {
                // Optional extra fields
                $proteinas = isset($it['proteinas']) ? floatval($it['proteinas']) : null;
                $carbo = isset($it['carboidratos']) ? floatval($it['carboidratos']) : null;
                $categoria = isset($it['categoria']) ? trim($it['categoria']) : null;

                $params = ['nome' => $alimento_nome];
                if ($has_proteinas_col) $params['proteinas'] = $proteinas;
                if ($has_carbo_col) $params['carboidratos'] = $carbo;
                if ($has_categoria_col) $params['categoria'] = $categoria;

                $insAl->execute($params);
                $aid = (int)$pdo->lastInsertId();
            } else {
                // se existir mas categoria/proteinas foram enviadas, tente atualizar meta (não obrigatório)
                $categoria = isset($it['categoria']) ? trim($it['categoria']) : null;
                $proteinas = isset($it['proteinas']) ? floatval($it['proteinas']) : null;
                $carbo = isset($it['carboidratos']) ? floatval($it['carboidratos']) : null;
                if (($has_categoria_col && $categoria !== null) || ($has_proteinas_col && $proteinas !== null) || ($has_carbo_col && $carbo !== null)) {
                    $updates = [];
                    $params = ['nome' => $alimento_nome];
                    if ($has_categoria_col && $categoria !== null) { $updates[] = 'categoria = :categoria'; $params['categoria'] = $categoria; }
                    if ($has_proteinas_col && $proteinas !== null) { $updates[] = 'proteinas_100g = :proteinas'; $params['proteinas'] = $proteinas; }
                    if ($has_carbo_col && $carbo !== null) { $updates[] = 'carboidratos_100g = :carboidratos'; $params['carboidratos'] = $carbo; }
                    if (count($updates) > 0) {
                        $sql = 'UPDATE alimento SET ' . implode(', ', $updates) . ' WHERE LOWER(nome) = LOWER(:nome)';
                        $pdo->prepare($sql)->execute($params);
                    }
                }
            }
            $qtd = (string)($it['quantidade'] ?? '');
            $um = $it['unidade_medida'] ?? null;
            $insItem->execute(['rid' => $refeicao_id, 'aid' => $aid, 'qtd' => $qtd, 'um' => $um]);
        }
    }

    $pdo->commit();

    respond(200, ['ok' => true, 'message' => 'Dieta salva com sucesso', 'data' => ['dieta_id' => $dieta_id]]);
} catch (Throwable $e) {
    // attempt rollback if in transaction
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) $pdo->rollBack();

    // log to local file for developer inspection
    try {
        @file_put_contents(__DIR__ . '/save_patient_diet_error.log', date('c') . " - " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n\n", FILE_APPEND);
    } catch (Exception $ex) {
        // ignore logging failure
    }

    $payload = ['ok' => false, 'message' => 'Erro ao salvar dieta', 'error' => $e->getMessage()];
    if (function_exists('respond')) {
        respond(500, $payload);
    } else {
        // fallback if config.php failed to load
        http_response_code(500);
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
}
