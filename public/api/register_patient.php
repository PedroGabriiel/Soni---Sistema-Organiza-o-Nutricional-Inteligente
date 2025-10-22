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
        if (empty($data['nome']) || empty($data['nutricionista_id'])) {
            http_response_code(400);
            echo json_encode([
                'ok' => false,
                'message' => 'Nome do paciente e ID do nutricionista são obrigatórios'
            ]);
            exit;
        }
        
        $nome = trim($data['nome']);
        $nutricionista_id = intval($data['nutricionista_id']);
        $data_nascimento = !empty($data['data_nascimento']) ? $data['data_nascimento'] : null;
        $genero = !empty($data['genero']) ? trim($data['genero']) : null;
        $objetivo = !empty($data['objetivo']) ? trim($data['objetivo']) : null;
        $alergias_restricoes = !empty($data['alergias_restricoes']) ? trim($data['alergias_restricoes']) : null;
        
        // Gerar código único de ativação (formato: SONI-XXXX-XXXX)
        $codigo = 'SONI-' . strtoupper(substr(md5(uniqid(rand(), true)), 0, 4)) . '-' . strtoupper(substr(md5(uniqid(rand(), true)), 0, 4));
        
        // Verificar se o código já existe (improvável, mas por segurança)
        $stmt = $pdo->prepare("SELECT usuario_id FROM usuario WHERE email = :codigo");
        $stmt->execute(['codigo' => $codigo]);
        if ($stmt->fetch()) {
            // Regenerar se por acaso já existir
            $codigo = 'SONI-' . strtoupper(substr(md5(uniqid(rand(), true)), 0, 4)) . '-' . strtoupper(substr(md5(uniqid(rand(), true)), 0, 4));
        }
        
        // Iniciar transação
        $pdo->beginTransaction();
        
        try {
            // 1. Criar usuário com status pendente (código como email temporário, sem senha)
            $stmt = $pdo->prepare("
                INSERT INTO usuario (email, senha, status)
                VALUES (:email, '', 'pendente')
            ");
            
            $stmt->execute(['email' => $codigo]);
            $usuario_id = $pdo->lastInsertId();
            
            // 2. Criar paciente
            $stmt = $pdo->prepare("
                INSERT INTO paciente (paciente_id, nome, data_nascimento, genero, objetivo, alergias_restricoes)
                VALUES (:paciente_id, :nome, :data_nascimento, :genero, :objetivo, :alergias_restricoes)
            ");
            
            $stmt->execute([
                'paciente_id' => $usuario_id,
                'nome' => $nome,
                'data_nascimento' => $data_nascimento,
                'genero' => $genero,
                'objetivo' => $objetivo,
                'alergias_restricoes' => $alergias_restricoes
            ]);
            
            // 3. Criar acompanhamento com o nutricionista
            $stmt = $pdo->prepare("
                INSERT INTO acompanhamento (paciente_id, nutricionista_id, data_inicio_acomp, status_acomp)
                VALUES (:paciente_id, :nutricionista_id, CURDATE(), 'ativo')
            ");
            
            $stmt->execute([
                'paciente_id' => $usuario_id,
                'nutricionista_id' => $nutricionista_id
            ]);
            
            // Commit da transação
            $pdo->commit();
            
            http_response_code(201);
            echo json_encode([
                'ok' => true,
                'message' => 'Paciente cadastrado com sucesso',
                'data' => [
                    'paciente_id' => $usuario_id,
                    'nome' => $nome,
                    'codigo_ativacao' => $codigo
                ]
            ]);
            
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
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
        'message' => 'Erro ao cadastrar paciente',
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
