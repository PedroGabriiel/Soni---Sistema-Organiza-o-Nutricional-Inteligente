<?php
require_once __DIR__ . '/config.php';

try {
    $pdo = db();
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        respond(405, ['ok' => false, 'message' => 'Método não permitido']);
    }

    $data = jsonBody();
    $grupo_id = isset($data['grupo_id']) ? (int)$data['grupo_id'] : 0;
    $nome = trim($data['nome'] ?? '');
    $alimentos = $data['alimentos'] ?? [];
    $nutricionista_id = isset($data['nutricionista_id']) ? (int)$data['nutricionista_id'] : null;

    if ($nome === '') respond(400, ['ok' => false, 'message' => 'Nome do grupo é obrigatório']);

    $pdo->beginTransaction();

    if ($grupo_id > 0) {
        $stmt = $pdo->prepare('UPDATE GrupoSubstituicao SET nome = :nome, nutricionista_id = :nid WHERE grupo_id = :gid');
        $stmt->execute(['nome' => $nome, 'nid' => $nutricionista_id, 'gid' => $grupo_id]);
    } else {
        $stmt = $pdo->prepare('INSERT INTO GrupoSubstituicao (nome, nutricionista_id) VALUES (:nome, :nid)');
        $stmt->execute(['nome' => $nome, 'nid' => $nutricionista_id]);
        $grupo_id = (int)$pdo->lastInsertId();
    }

    // Limpa associações antigas
    $stmt = $pdo->prepare('DELETE FROM Alimento_Grupo WHERE grupo_id = :gid');
    $stmt->execute(['gid' => $grupo_id]);

    // Adiciona alimentos (se não existir, cria)
    $selAl = $pdo->prepare('SELECT alimento_id FROM Alimento WHERE LOWER(nome) = LOWER(:nome) LIMIT 1');
    $insAl = $pdo->prepare('INSERT INTO Alimento (nome) VALUES (:nome)');
    $insAg = $pdo->prepare('INSERT INTO Alimento_Grupo (alimento_id, grupo_id) VALUES (:aid, :gid)');

    foreach ($alimentos as $a) {
        $aname = trim($a['nome'] ?? $a);
        if ($aname === '') continue;
        $selAl->execute(['nome' => $aname]);
        $aid = $selAl->fetchColumn();
        if (!$aid) {
            $insAl->execute(['nome' => $aname]);
            $aid = (int)$pdo->lastInsertId();
        }
        $insAg->execute(['aid' => $aid, 'gid' => $grupo_id]);
    }

    $pdo->commit();
    respond(200, ['ok' => true, 'message' => 'Grupo salvo', 'grupo_id' => $grupo_id]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    respond(500, ['ok' => false, 'message' => 'Erro ao salvar grupo', 'error' => $e->getMessage()]);
}
