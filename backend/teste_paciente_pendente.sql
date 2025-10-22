-- Script de teste para cadastro de paciente
-- Execute este script no phpMyAdmin ou MySQL Workbench

-- 1. Criar um nutricionista de teste (se ainda não existir)
INSERT INTO usuario (email, senha, status)
VALUES ('nutricionista@teste.com', '$2y$10$YourHashedPasswordHere', 'ativo');

SET @nutricionista_id = LAST_INSERT_ID();

INSERT INTO nutricionista (nutricionista_id, nome, crn, especializacao)
VALUES (@nutricionista_id, 'Dr. Teste', 'CRN-123456', 'Nutrição Esportiva');

-- 2. Criar um paciente pendente de ativação
INSERT INTO usuario (email, senha, status)
VALUES ('SONI-TEST-1234', '', 'pendente');

SET @paciente_id = LAST_INSERT_ID();

INSERT INTO paciente (paciente_id, nome, data_nascimento, genero, objetivo, alergias_restricoes)
VALUES (@paciente_id, 'João da Silva', '1990-05-15', 'masculino', 'Ganho de massa muscular', 'Nenhuma');

-- 3. Criar acompanhamento
INSERT INTO acompanhamento (paciente_id, nutricionista_id, data_inicio_acomp, status_acomp)
VALUES (@paciente_id, @nutricionista_id, CURDATE(), 'ativo');

-- Verificar o cadastro
SELECT 
    u.usuario_id,
    u.email AS codigo_ativacao,
    u.status,
    p.nome AS paciente_nome
FROM usuario u
INNER JOIN paciente p ON p.paciente_id = u.usuario_id
WHERE u.status = 'pendente';
