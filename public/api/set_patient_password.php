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
        if (empty($data['codigo_ativacao']) || empty($data['senha']) || empty($data['email'])) {
            http_response_code(400);
            echo json_encode([
                'ok' => false,
                'message' => 'Código, email e senha são obrigatórios'
            ]);
            exit;
        }
        
        $codigo = trim($data['codigo_ativacao']);
        $senha = trim($data['senha']);
        $email = trim($data['email']);
        
        // Validar força da senha
        if (strlen($senha) < 6) {
            http_response_code(400);
            echo json_encode([
                'ok' => false,
                'message' => 'A senha deve ter no mínimo 6 caracteres'
            ]);
            exit;
        }
        
        // Validar email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode([
                'ok' => false,
                'message' => 'Email inválido'
            ]);
            exit;
        }
        
        // Verificar se o email já está em uso
        $stmt = $pdo->prepare("SELECT usuario_id FROM usuario WHERE email = :email AND email != :codigo");
        $stmt->execute(['email' => $email, 'codigo' => $codigo]);
        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode([
                'ok' => false,
                'message' => 'Este email já está em uso'
            ]);
            exit;
        }
        
        // Buscar paciente pelo código
        $stmt = $pdo->prepare("
            SELECT u.usuario_id, p.paciente_id, p.nome
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
        
        // Atualizar usuário com senha e email real
        $senhaHash = password_hash($senha, PASSWORD_BCRYPT);
        
        $stmt = $pdo->prepare("
            UPDATE usuario
            SET email = :email,
                senha = :senha,
                status = 'ativo'
            WHERE usuario_id = :usuario_id
        ");
        
        $success = $stmt->execute([
            'email' => $email,
            'senha' => $senhaHash,
            'usuario_id' => $paciente['usuario_id']
        ]);
        
        if ($success) {
            http_response_code(200);
            echo json_encode([
                'ok' => true,
                'message' => 'Conta ativada com sucesso!',
                'data' => [
                    'paciente_id' => $paciente['paciente_id'],
                    'nome' => $paciente['nome'],
                    'email' => $email
                ]
            ]);
        } else {
            throw new Exception('Falha ao atualizar o usuário');
        }
        
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
        'message' => 'Erro ao ativar conta',
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
?>
