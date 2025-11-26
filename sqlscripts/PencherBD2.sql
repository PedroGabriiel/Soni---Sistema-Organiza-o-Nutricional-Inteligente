USE soni;

-- --- LIMPEZA GERAL ---
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE Alimento_Grupo;
TRUNCATE TABLE Paciente_Dieta;
TRUNCATE TABLE ItensRefeicao;
TRUNCATE TABLE MetasNutri;
TRUNCATE TABLE GrupoSubstituicao;
TRUNCATE TABLE Refeicao;
TRUNCATE TABLE Dieta;
TRUNCATE TABLE MedidasCorporais;
TRUNCATE TABLE AvaliacaoFisica;
TRUNCATE TABLE DiarioAlimentar;
TRUNCATE TABLE Acompanhamento;
TRUNCATE TABLE Paciente;
TRUNCATE TABLE Nutricionista;
TRUNCATE TABLE Alimento;
TRUNCATE TABLE Usuario;
DROP TABLE IF EXISTS DiarioAlimentar;
SET FOREIGN_KEY_CHECKS = 1;

-- --- RECRIANDO TABELA DIÁRIO ---
CREATE TABLE `DiarioAlimentar` (
  `diario_id` int PRIMARY KEY AUTO_INCREMENT,
  `data_hora` datetime,
  `status_adesao` ENUM('Seguiu Totalmente', 'Seguiu Parcialmente', 'Não Seguiu') NOT NULL,
  `descricao` text,
  `feedback` text,
  `foto` varchar(255),
  `paciente_id` int,
  FOREIGN KEY (`paciente_id`) REFERENCES `Paciente` (`paciente_id`)
);

-- --- 1. CADASTROS BASE ---

INSERT INTO Usuario (usuario_id, email, senha, status, data_cadastro) VALUES 
(1, 'example@gmail.com', '$2y$10$UvQiBmxmgy58yeTdMkesZ.wttL4IRLLiPIYxhkpJuV57juolbUuB.', 'ativo', '2025-01-01 08:00:00');

INSERT INTO Nutricionista (nutricionista_id, nome, crn, especializacao) VALUES 
(1, 'Rafael', 'crn123456', 'Nutrição Esportiva e Clínica');

-- Alimentos (Valores baseados em 100g)
INSERT INTO Alimento (nome, calorias_100g, proteinas_100g, gorduras_100g, fibras_100g) VALUES 
('Arroz Branco Cozido', 130, 2.7, 0.3, 0.4),
('Arroz Integral Cozido', 110, 2.6, 1.0, 2.7),
('Batata Doce Cozida', 86, 1.6, 0.1, 3.0),
('Batata Inglesa Cozida', 77, 2.0, 0.1, 2.2),
('Aveia em Flocos', 389, 16.9, 6.9, 10.6),
('Pão Integral (Fatia)', 250, 9.0, 3.0, 6.0),
('Tapioca (Goma)', 336, 0.0, 0.0, 0.0),
('Macarrão Integral Cozido', 124, 5.3, 0.5, 2.8),
('Peito de Frango Grelhado', 165, 31.0, 3.6, 0.0),
('Carne Moída (Patinho) Refogada', 219, 35.9, 7.3, 0.0),
('Filé de Tilápia Grelhado', 128, 26.0, 2.7, 0.0),
('Ovo de Galinha Cozido', 155, 13.0, 11.0, 0.0),
('Clara de Ovo Cozida', 52, 11.0, 0.2, 0.0),
('Whey Protein Concentrado (Pó)', 400, 80.0, 5.0, 0.0),
('Queijo Minas Frescal', 264, 17.0, 20.0, 0.0),
('Iogurte Natural Desnatado', 41, 4.0, 0.1, 0.0),
('Feijão Carioca Cozido', 76, 4.8, 0.5, 8.5),
('Feijão Preto Cozido', 77, 4.5, 0.5, 8.4),
('Lentilha Cozida', 116, 9.0, 0.4, 7.9),
('Azeite de Oliva Extra Virgem', 884, 0.0, 100.0, 0.0),
('Abacate', 160, 2.0, 15.0, 7.0),
('Castanha do Pará', 656, 14.0, 66.0, 7.0),
('Pasta de Amendoim Integral', 588, 25.0, 50.0, 8.0),
('Banana Prata', 89, 1.1, 0.3, 2.6),
('Maçã Fuji (com casca)', 52, 0.3, 0.2, 2.4),
('Mamão Papaia', 43, 0.5, 0.1, 1.7),
('Morango', 32, 0.7, 0.3, 2.0),
('Abacaxi', 50, 0.5, 0.1, 1.4),
('Alface Americana', 14, 0.9, 0.1, 1.2),
('Brócolis Cozido', 35, 2.4, 0.4, 3.3),
('Tomate', 18, 0.9, 0.2, 1.2),
('Cenoura Crua', 41, 0.9, 0.2, 2.8);

-- --- 2. PACIENTE 1: MARIA (Ajustada para bater ~1600kcal) ---

INSERT INTO Usuario (usuario_id, email, senha, status, data_cadastro) VALUES 
(2, 'maria.silva@email.com', 'senha123', 'ativo', '2025-07-10 09:00:00');

INSERT INTO Paciente (paciente_id, nome, data_nascimento, genero, objetivo, alergias_restricoes) VALUES 
(2, 'Maria Silva', '1992-05-20', 'Feminino', 'Emagrecimento', 'Nenhuma');

INSERT INTO Acompanhamento (data_inicio_acomp, status_acomp, paciente_id, nutricionista_id) VALUES 
('2025-07-10', 'Ativo', 2, 1);

INSERT INTO AvaliacaoFisica (avaliacao_id, data, peso_kg, altura_cm, observacoes, paciente_id) VALUES 
(1, '2025-07-15', 82.0, 165, 'Início do tratamento.', 2),
(2, '2025-08-25', 79.5, 165, 'Boa resposta inicial.', 2),
(3, '2025-10-10', 78.0, 165, 'Paciente relatou ansiedade e furos na dieta.', 2),
(4, '2025-11-25', 73.0, 165, 'Ótima recuperação. Meta quase atingida.', 2);

INSERT INTO MedidasCorporais (avaliacao_id, pescoco, ombro, peitoral, cintura, abdomen, quadril, braco_relaxado_d, braco_relaxado_e, coxa_proximal_d, coxa_proximal_e) VALUES 
(1, 36, 105, 98, 85, 95, 110, 32, 32, 65, 65),
(2, 35, 104, 97, 82, 92, 108, 31.5, 31.5, 64, 64),
(3, 35, 103, 96, 80, 89, 107, 31, 31, 63, 63),
(4, 34, 101, 94, 74, 82, 104, 29, 29, 60, 60);

INSERT INTO Dieta (dieta_id, nome, data_inicio, data_fim, nutricionista_id) VALUES 
(1, 'Protocolo Definição', '2025-11-01', '2025-12-01', 1);

INSERT INTO Paciente_Dieta (paciente_id, dieta_id) VALUES (2, 1);

INSERT INTO MetasNutri (nutriente, valor_maximo, valor_minimo, dieta_id) VALUES 
('Calorias', 1650, 1550, 1), -- Ajustei levemente para refletir a realidade
('Proteínas', 150, 130, 1);

-- Refeições Maria
INSERT INTO Refeicao (refeicao_id, nome, horario, dieta_id) VALUES 
(1, 'Café da Manhã', '07:30:00', 1),
(2, 'Almoço', '12:30:00', 1),
(3, 'Lanche', '16:00:00', 1),
(4, 'Jantar', '20:00:00', 1);

-- Itens Maria (Reforçados)
INSERT INTO ItensRefeicao (quantidade, unidade_medida, refeicao_id, alimento_id) VALUES 
-- Café: 2 fatias pão (50g) + 2 Ovos
(100, 'g', 1, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Pão Integral%' LIMIT 1)),
(2, 'unidades', 1, (SELECT alimento_id FROM Alimento WHERE nome = 'Ovo de Galinha Cozido' LIMIT 1)),

-- Almoço: 100g Arroz + 100g Feijão + 150g Frango + Salada + 1 colher azeite (13g)
(150, 'g', 2, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Arroz Integral%' LIMIT 1)),
(100, 'g', 2, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Feijão Carioca%' LIMIT 1)),
(150, 'g', 2, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Peito de Frango%' LIMIT 1)),
(1, 'prato', 2, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Alface%' LIMIT 1)),
(13, 'ml', 2, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Azeite%' LIMIT 1)), -- Adicionado para calorias

-- Lanche: Iogurte + Maçã + 30g Aveia (para dar sustância)
(1, 'unidade', 3, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Iogurte%' LIMIT 1)),
(1, 'unidade', 3, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Maçã%' LIMIT 1)),
(50, 'g', 3, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Aveia%' LIMIT 1)), -- Adicionado

-- Jantar: 150g Tilápia + 100g Brócolis + Azeite
(260, 'g', 4, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Filé de Tilápia%' LIMIT 1)),
(100, 'g', 4, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Brócolis%' LIMIT 1)),
(15, 'ml', 4, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Azeite%' LIMIT 1));


INSERT INTO GrupoSubstituicao (grupo_id, nome, nutricionista_id) VALUES 
(1, 'Substituição de Carboidratos (Almoço)', 1);

INSERT INTO Alimento_Grupo (alimento_id, grupo_id) VALUES 
((SELECT alimento_id FROM Alimento WHERE nome LIKE 'Arroz Integral%' LIMIT 1), 1),
((SELECT alimento_id FROM Alimento WHERE nome LIKE 'Batata Doce%' LIMIT 1), 1),
((SELECT alimento_id FROM Alimento WHERE nome LIKE 'Batata Inglesa%' LIMIT 1), 1),
((SELECT alimento_id FROM Alimento WHERE nome LIKE 'Macarrão Integral%' LIMIT 1), 1);

-- Diário Maria
INSERT INTO DiarioAlimentar (data_hora, status_adesao, descricao, feedback, paciente_id) VALUES 
('2025-11-20 20:00:00', 'Seguiu Totalmente', 'Todas as refeições pesadas corretamente.', 'Me senti muito bem disposta hoje. Sem fome.', 2),
('2025-11-21 21:00:00', 'Seguiu Totalmente', 'Fiz uma substituição no almoço: Troquei Arroz Integral por Batata Doce.', 'Amei a opção de trocar pela batata doce, estava enjoada de arroz.', 2),
('2025-11-22 22:30:00', 'Seguiu Parcialmente', 'Segui bem até a tarde, mas no jantar fui em um aniversário e comi salgadinhos.', 'Me senti um pouco culpada, mas amanhã retomo o foco.', 2),
('2025-11-23 20:00:00', 'Seguiu Totalmente', 'Domingo de preparação de marmitas.', 'Foco total para a pesagem da semana que vem.', 2),
('2025-11-24 19:00:00', 'Seguiu Totalmente', 'Substituição no almoço: Macarrão Integral.', 'O treino rendeu muito hoje.', 2),
('2025-11-25 20:00:00', 'Seguiu Totalmente', 'Reta final.', 'Ansiosa para ver os resultados na avaliação amanhã!', 2);

-- --- 3. PACIENTE 2: JOÃO (Dieta Completa para bater 3200kcal) ---

INSERT INTO Usuario (usuario_id, email, senha, status, data_cadastro) VALUES 
(3, 'joao.muscle@email.com', 'senha123', 'ativo', '2025-07-20 14:00:00');

INSERT INTO Paciente (paciente_id, nome, data_nascimento, genero, objetivo, alergias_restricoes) VALUES 
(3, 'João Costa', '1998-03-10', 'Masculino', 'Hipertrofia Agressiva', 'Nenhuma');

INSERT INTO Acompanhamento (data_inicio_acomp, status_acomp, paciente_id, nutricionista_id) VALUES 
('2025-07-20', 'Ativo', 3, 1);

INSERT INTO AvaliacaoFisica (avaliacao_id, data, peso_kg, altura_cm, observacoes, paciente_id) VALUES 
(5, '2025-07-20', 65.0, 178, 'Paciente ectomorfo, dificuldade em ganhar peso.', 3),
(6, '2025-09-05', 67.5, 178, 'Ótima resposta ao treino de força.', 3),
(7, '2025-10-15', 69.2, 178, 'Aumento de carga nos treinos.', 3),
(8, '2025-11-25', 71.0, 178, 'Paciente atingiu a meta de 6kg em 4 meses com qualidade.', 3);

INSERT INTO MedidasCorporais (avaliacao_id, pescoco, ombro, peitoral, cintura, abdomen, quadril, braco_relaxado_d, braco_relaxado_e, coxa_proximal_d, coxa_proximal_e) VALUES 
(5, 36, 110, 92, 78, 80, 95, 29, 29, 52, 52),
(6, 37, 112, 95, 79, 81, 96, 31, 31, 54, 54),
(7, 37.5, 115, 98, 80, 82, 98, 32.5, 32.5, 56, 56),
(8, 38, 118, 102, 80, 81, 99, 34, 34, 58, 58);

INSERT INTO Dieta (dieta_id, nome, data_inicio, data_fim, nutricionista_id) VALUES 
(2, 'Bulking Limpo', '2025-11-01', '2026-02-01', 1);

INSERT INTO Paciente_Dieta (paciente_id, dieta_id) VALUES (3, 2);

INSERT INTO MetasNutri (nutriente, valor_maximo, valor_minimo, dieta_id) VALUES 
('Calorias', 3200, 3000, 2),
('Proteínas', 220, 190, 2);

-- Refeições Completas do João (6 Refeições para bater meta)
INSERT INTO Refeicao (refeicao_id, nome, horario, dieta_id) VALUES 
(5, 'Café da Manhã', '07:00:00', 2),
(6, 'Almoço', '12:00:00', 2),
(7, 'Lanche da Tarde', '15:30:00', 2),
(8, 'Pré-Treino', '18:00:00', 2),
(9, 'Pós-Treino', '20:00:00', 2),
(10, 'Jantar', '21:30:00', 2);

INSERT INTO ItensRefeicao (quantidade, unidade_medida, refeicao_id, alimento_id) VALUES 
-- 1. Café: 4 ovos + 100g Aveia + 2 Bananas (~800kcal)
(5, 'unidades', 5, (SELECT alimento_id FROM Alimento WHERE nome = 'Ovo de Galinha Cozido' LIMIT 1)),
(100, 'g', 5, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Aveia%' LIMIT 1)),
(2, 'unidades', 5, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Banana%' LIMIT 1)),

-- 2. Almoço: 250g Arroz + 150g Feijão + 150g Carne Moida (~850kcal)
(250, 'g', 6, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Arroz Branco%' LIMIT 1)),
(150, 'g', 6, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Feijão Carioca%' LIMIT 1)),
(200, 'g', 6, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Carne Moída%' LIMIT 1)),

-- 3. Lanche: 2 Fatias Pão + Pasta de Amendoim (30g) (~400kcal)
(50, 'g', 7, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Pão Integral%' LIMIT 1)),
(30, 'g', 7, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Pasta de Amendoim%' LIMIT 1)),

-- 4. Pré-Treino: 300g Batata + 150g Frango (~500kcal)
(300, 'g', 8, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Batata Doce%' LIMIT 1)),
(200, 'g', 8, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Peito de Frango%' LIMIT 1)),

-- 5. Pós-Treino: 30g Whey + 2 Bananas (~300kcal)
(35, 'g', 9, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Whey%' LIMIT 1)),
(2, 'unidades', 9, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Banana%' LIMIT 1)),

-- 6. Jantar: 150g Tapioca + 4 Ovos (ou Frango) (~500kcal)
(150, 'g', 10, (SELECT alimento_id FROM Alimento WHERE nome LIKE 'Tapioca%' LIMIT 1)),
(6, 'unidades', 10, (SELECT alimento_id FROM Alimento WHERE nome = 'Ovo de Galinha Cozido' LIMIT 1));


-- Diário João
INSERT INTO DiarioAlimentar (data_hora, status_adesao, descricao, feedback, paciente_id) VALUES 
('2025-11-20 22:00:00', 'Seguiu Totalmente', 'Comi tudo.', 'É muita comida! Quase não consegui terminar o pós-treino, mas bati a meta.', 3),
('2025-11-21 22:00:00', 'Seguiu Totalmente', 'Dieta seguida.', 'Treino de perna foi insano. A comida ajudou na recuperação.', 3),
('2025-11-22 14:00:00', 'Seguiu Parcialmente', 'Acordei muito tarde e pulei o Café da Manhã.', 'Tentei compensar nas outras refeições mas não consegui bater os macros.', 3),
('2025-11-23 20:00:00', 'Seguiu Totalmente', 'Domingo tranquilo.', 'Tudo certo.', 3),
('2025-11-24 21:00:00', 'Seguiu Totalmente', 'Treino e dieta ok.', 'Me sentindo maior. A camisa está apertando no braço.', 3),
('2025-11-25 21:30:00', 'Seguiu Totalmente', 'Pré-Avaliação.', 'Pronto para bater a meta de 71kg.', 3);