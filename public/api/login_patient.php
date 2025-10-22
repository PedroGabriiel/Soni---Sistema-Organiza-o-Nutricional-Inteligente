<?php
// Desabilitar exibição de erros HTML
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once 'config.php';

try {
    $pdo = db();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Validar campos obrigatórios
        if (empty($data['email']) || empty($data['senha'])) {
            http_response_code(400);
            echo json_encode([
                'ok' => false,
                'message' => 'Email e senha são obrigatórios'
            ]);
            exit;
        }
        
        $email = trim($data['email']);
        $senha = trim($data['senha']);
        
        // Buscar usuário + paciente
        $stmt = $pdo->prepare("
            SELECT 
                u.usuario_id,
                u.email,
                u.senha,
                u.status,
                p.paciente_id,
                p.nome,
                p.data_nascimento,
                p.genero,
                p.objetivo,
                p.alergias_restricoes
            FROM usuario u
            INNER JOIN paciente p ON p.paciente_id = u.usuario_id
            WHERE u.email = :email
            LIMIT 1
        ");
        
        $stmt->execute(['email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            http_response_code(401);
            echo json_encode([
                'ok' => false,
                'message' => 'Email ou senha incorretos'
            ]);
            exit;
        }
        
        // Verificar se conta está ativa
        if ($user['status'] !== 'ativo') {
            http_response_code(403);
            echo json_encode([
                'ok' => false,
                'message' => 'Conta pendente de ativação. Por favor, use o código de ativação fornecido.'
            ]);
            exit;
        }
        
        // Verificar senha
        if (!password_verify($senha, $user['senha'])) {
            http_response_code(401);
            echo json_encode([
                'ok' => false,
                'message' => 'Email ou senha incorretos'
            ]);
            exit;
        }
        
        // Remover senha da resposta
        unset($user['senha']);
        
        http_response_code(200);
        echo json_encode([
            'ok' => true,
            'message' => 'Login realizado com sucesso',
            'data' => $user
        ]);
        
    } else {
        http_response_code(405);
        echo json_encode([
            'ok' => false,
            'message' => 'Método não permitido'
        ]);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Erro ao realizar login',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Erro inesperado',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
?>
