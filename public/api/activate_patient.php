<?php
// Capturar qualquer output indesejado
ob_start();

// Desabilitar exibição de erros HTML
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

require_once 'config.php';

// Limpar qualquer output que tenha vindo do config
ob_clean();

try {
    $pdo = db();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validar campos obrigatórios
        if (empty($data['codigo_ativacao'])) {
            http_response_code(400);
            echo json_encode([
                'ok' => false,
                'message' => 'Código de ativação é obrigatório'
            ]);
            exit;
        }
        
        $codigo = trim($data['codigo_ativacao']);
        
        // Buscar paciente pelo código de ativação
        // Assumindo que o código está armazenado temporariamente no campo email ou em uma tabela separada
        // Vou usar uma abordagem onde o código é o email temporário com formato específico
        $stmt = $pdo->prepare("
            SELECT u.usuario_id, u.email, p.paciente_id, p.nome
            FROM usuario u
            INNER JOIN paciente p ON p.paciente_id = u.usuario_id
            WHERE u.email = :codigo
            AND u.status = 'pendente'
            LIMIT 1
        ");
        
        $stmt->execute(['codigo' => $codigo]);
        $paciente = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$paciente) {
            http_response_code(404);
            echo json_encode([
                'ok' => false,
                'message' => 'Código de ativação inválido ou já utilizado'
            ]);
            exit;
        }
        
        // Retornar dados do paciente para criar senha
        http_response_code(200);
        echo json_encode([
            'ok' => true,
            'message' => 'Código validado com sucesso',
            'data' => [
                'paciente_id' => $paciente['paciente_id'],
                'nome' => $paciente['nome'],
                'codigo' => $codigo
            ]
        ]);
        
    } else {
        http_response_code(405);
        echo json_encode([
            'ok' => false,
            'message' => 'Método não permitido'
        ]);
    }
    
} catch (PDOException $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Erro ao validar código',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
} catch (Exception $e) {
    ob_clean();
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Erro inesperado',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}

ob_end_flush();
?>
