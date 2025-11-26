<?php
require_once __DIR__ . '/config.php';

try {
    $pdo = db();
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        respond(405, ['ok' => false, 'message' => 'Método não permitido']);
    }

    // Opcional: filtrar por nutricionista
    $nutri_id = isset($_GET['nutricionista_id']) ? (int)$_GET['nutricionista_id'] : null;

    if ($nutri_id) {
        $stmt = $pdo->prepare('SELECT grupo_id, nome FROM GrupoSubstituicao WHERE nutricionista_id = :nid');
        $stmt->execute(['nid' => $nutri_id]);
    } else {
        $stmt = $pdo->query('SELECT grupo_id, nome FROM GrupoSubstituicao');
    }

    $groups = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $out = [];
    foreach ($groups as $g) {
        $stmt = $pdo->prepare('SELECT a.alimento_id, a.nome, a.categoria FROM Alimento a INNER JOIN Alimento_Grupo ag ON ag.alimento_id = a.alimento_id WHERE ag.grupo_id = :gid');
        $stmt->execute(['gid' => $g['grupo_id']]);
        $foods = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $out[] = [
            'grupo_id' => (int)$g['grupo_id'],
            'nome' => $g['nome'],
            'alimentos' => $foods,
        ];
    }

    respond(200, ['ok' => true, 'data' => $out]);
} catch (Throwable $e) {
    respond(500, ['ok' => false, 'message' => 'Erro ao buscar grupos de substituição', 'error' => $e->getMessage()]);
}
