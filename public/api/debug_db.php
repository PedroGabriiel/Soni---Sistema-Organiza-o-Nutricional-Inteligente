<?php
// Temporary debug endpoint to verify DB connectivity and list key tables.
// Remove in production.

try {
    require_once __DIR__ . '/config.php';
    $pdo = db();
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => true, 'tables' => $tables], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
} catch (Throwable $e) {
    http_response_code(500);
    @file_put_contents(__DIR__ . '/debug_db_error.log', date('c') . " - " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n\n", FILE_APPEND);
    echo json_encode(['ok' => false, 'message' => 'DB error', 'error' => $e->getMessage()]);
}
