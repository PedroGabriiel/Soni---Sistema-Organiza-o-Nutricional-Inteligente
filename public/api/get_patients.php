<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

require_once 'config.php';

try {
    $pdo = db();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Validar nutricionista_id
        $nutricionista_id = isset($_GET['nutricionista_id']) ? intval($_GET['nutricionista_id']) : 0;
        
        if (!$nutricionista_id) {
            http_response_code(400);
            echo json_encode([
                'ok' => false,
                'message' => 'ID do nutricionista é obrigatório'
            ]);
            exit;
        }
        
        // Buscar pacientes do nutricionista
        $stmt = $pdo->prepare("
            SELECT 
                p.paciente_id,
                p.nome,
                p.data_nascimento,
                p.genero,
                p.objetivo,
                p.alergias_restricoes,
                u.email,
                u.status,
                a.data_inicio_acomp,
                a.status_acomp
                FROM acompanhamento a
                INNER JOIN paciente p ON p.paciente_id = a.paciente_id
                INNER JOIN usuario u ON u.usuario_id = p.paciente_id
            WHERE a.nutricionista_id = :nutricionista_id
            ORDER BY p.nome ASC
        ");
        
        $stmt->execute(['nutricionista_id' => $nutricionista_id]);
        $pacientes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        http_response_code(200);
        echo json_encode([
            'ok' => true,
            'data' => $pacientes
        ], JSON_UNESCAPED_UNICODE);
        
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
        'message' => 'Erro ao buscar pacientes',
        'error' => $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Erro inesperado',
        'error' => $e->getMessage()
    ]);
}
?>
