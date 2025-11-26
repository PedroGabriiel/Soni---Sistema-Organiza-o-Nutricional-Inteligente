<?php
// public/api/config.php
// Ajuste as credenciais conforme seu ambiente XAMPP
// Em desenvolvimento, o XAMPP costuma usar usuário 'root' sem senha.

header('Content-Type: application/json; charset=utf-8');

// CORS básico para desenvolvimento (ajuste conforme necessário)
$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
$allowed_origins = [
    'http://localhost',
    'http://127.0.0.1',
    'http://localhost:5173', // Vite default
    'http://127.0.0.1:5173',
    'http://localhost:8080', // Vite config atual
    'http://127.0.0.1:8080',
    $origin,
];
if (in_array($origin, $allowed_origins) || $origin === '*') {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$DB_HOST_RAW = getenv('DB_HOST') ?: '127.0.0.1:3306';
$DB_NAME = getenv('DB_NAME') ?: 'soni';
$DB_USER = getenv('DB_USER') ?: 'root';
$DB_PASS = getenv('DB_PASS') ?: '';
$DB_PORT = getenv('DB_PORT') ?: null;

// Support DB_HOST with optional port (e.g. 127.0.0.1:3306) or separate DB_PORT
if ($DB_PORT === null) {
    if (strpos($DB_HOST_RAW, ':') !== false) {
        [$DB_HOST, $DB_PORT] = explode(':', $DB_HOST_RAW, 2);
    } else {
        $DB_HOST = $DB_HOST_RAW;
        $DB_PORT = '3306';
    }
} else {
    $DB_HOST = $DB_HOST_RAW;
}
$DB_CHARSET = 'utf8mb4';

function db() {
    static $pdo = null;
    global $DB_HOST, $DB_PORT, $DB_NAME, $DB_USER, $DB_PASS, $DB_CHARSET;
    if ($pdo === null) {
        $dsn = "mysql:host={$DB_HOST};port={$DB_PORT};dbname={$DB_NAME};charset={$DB_CHARSET}";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        try {
            $pdo = new PDO($dsn, $DB_USER, $DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['ok' => false, 'message' => 'Falha de conexão com o banco', 'error' => $e->getMessage()]);
            exit;
        }
    }
    return $pdo;
}

function jsonBody() {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    return is_array($data) ? $data : [];
}

function respond($status, $payload) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
