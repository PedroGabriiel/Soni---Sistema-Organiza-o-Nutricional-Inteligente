CREATE DATABASE soni;

USE soni;

CREATE TABLE `Usuario` (
  `usuario_id` int PRIMARY KEY AUTO_INCREMENT,
  `email` varchar(255) UNIQUE NOT NULL,
  `senha` varchar(255) NOT NULL,
  `status` varchar(255),
  `data_cadastro` datetime
);

CREATE TABLE `Nutricionista` (
  `nutricionista_id` int PRIMARY KEY,
  `nome` varchar(255) NOT NULL,
  `crn` varchar(255) UNIQUE,
  `especializacao` text
);

CREATE TABLE `Paciente` (
  `paciente_id` int PRIMARY KEY,
  `nome` varchar(255) NOT NULL,
  `data_nascimento` date,
  `genero` varchar(255),
  `objetivo` text,
  `alergias_restricoes` text
);

CREATE TABLE `Acompanhamento` (
  `acompanhamento_id` int PRIMARY KEY AUTO_INCREMENT,
  `data_inicio_acomp` date,
  `status_acomp` varchar(255),
  `paciente_id` int,
  `nutricionista_id` int
);

CREATE TABLE `DiarioAlimentar` (
  `diario_id` int PRIMARY KEY AUTO_INCREMENT,
  `data_hora` datetime,
  `descricao` text,
  `feedback` text,
  `foto` varchar(255),
  `paciente_id` int
);

CREATE TABLE `AvaliacaoFisica` (
  `avaliacao_id` int PRIMARY KEY AUTO_INCREMENT,
  `data` date,
  `peso_kg` float,
  `altura_cm` float,
  `medidas` text,
  `observacoes` text,
  `paciente_id` int
);

CREATE TABLE `Dieta` (
  `dieta_id` int PRIMARY KEY AUTO_INCREMENT,
  `nome` varchar(255),
  `data_inicio` date,
  `data_fim` date,
  `nutricionista_id` int
);

CREATE TABLE `Refeicao` (
  `refeicao_id` int PRIMARY KEY AUTO_INCREMENT,
  `nome` varchar(255),
  `horario` time,
  `dieta_id` int
);

CREATE TABLE `Alimento` (
  `alimento_id` int PRIMARY KEY AUTO_INCREMENT,
  `nome` varchar(255) UNIQUE,
  `calorias_100g` float,
  `proteinas_100g` float,
  `gorduras_100g` float,
  `fibras_100g` float
);

CREATE TABLE `ItensRefeicao` (
  `item_refeicao_id` int PRIMARY KEY AUTO_INCREMENT,
  `quantidade` float,
  `unidade_medida` varchar(255),
  `refeicao_id` int,
  `alimento_id` int
);

CREATE TABLE `MetasNutri` (
  `metas_id` int PRIMARY KEY AUTO_INCREMENT,
  `nutriente` varchar(255),
  `valor_maximo` float,
  `valor_minimo` float,
  `dieta_id` int
);

CREATE TABLE `GrupoSubstituicao` (
  `grupo_id` int PRIMARY KEY AUTO_INCREMENT,
  `nome` varchar(255),
  `nutricionista_id` int
);

CREATE TABLE `Alimento_Grupo` (
  `alimento_id` int,
  `grupo_id` int,
  PRIMARY KEY (`alimento_id`, `grupo_id`)
);

CREATE TABLE `Paciente_Dieta` (
  `paciente_id` int,
  `dieta_id` int,
  PRIMARY KEY (`paciente_id`, `dieta_id`)
);

ALTER TABLE `Acompanhamento` ADD FOREIGN KEY (`paciente_id`) REFERENCES `Paciente` (`paciente_id`);

ALTER TABLE `Acompanhamento` ADD FOREIGN KEY (`nutricionista_id`) REFERENCES `Nutricionista` (`nutricionista_id`);

ALTER TABLE `DiarioAlimentar` ADD FOREIGN KEY (`paciente_id`) REFERENCES `Paciente` (`paciente_id`);

ALTER TABLE `AvaliacaoFisica` ADD FOREIGN KEY (`paciente_id`) REFERENCES `Paciente` (`paciente_id`);

ALTER TABLE `Dieta` ADD FOREIGN KEY (`nutricionista_id`) REFERENCES `Nutricionista` (`nutricionista_id`);

ALTER TABLE `Refeicao` ADD FOREIGN KEY (`dieta_id`) REFERENCES `Dieta` (`dieta_id`);

ALTER TABLE `ItensRefeicao` ADD FOREIGN KEY (`refeicao_id`) REFERENCES `Refeicao` (`refeicao_id`);

ALTER TABLE `ItensRefeicao` ADD FOREIGN KEY (`alimento_id`) REFERENCES `Alimento` (`alimento_id`);

ALTER TABLE `MetasNutri` ADD FOREIGN KEY (`dieta_id`) REFERENCES `Dieta` (`dieta_id`);

ALTER TABLE `GrupoSubstituicao` ADD FOREIGN KEY (`nutricionista_id`) REFERENCES `Nutricionista` (`nutricionista_id`);

ALTER TABLE `Alimento_Grupo` ADD FOREIGN KEY (`alimento_id`) REFERENCES `Alimento` (`alimento_id`);

ALTER TABLE `Alimento_Grupo` ADD FOREIGN KEY (`grupo_id`) REFERENCES `GrupoSubstituicao` (`grupo_id`);

ALTER TABLE `Paciente_Dieta` ADD FOREIGN KEY (`paciente_id`) REFERENCES `Paciente` (`paciente_id`);

ALTER TABLE `Paciente_Dieta` ADD FOREIGN KEY (`dieta_id`) REFERENCES `Dieta` (`dieta_id`);

ALTER TABLE `Nutricionista` ADD FOREIGN KEY (`nutricionista_id`) REFERENCES `Usuario` (`usuario_id`);

ALTER TABLE `Paciente` ADD FOREIGN KEY (`paciente_id`) REFERENCES `Usuario` (`usuario_id`);

-- Remove a coluna de texto antiga
ALTER TABLE `AvaliacaoFisica` DROP COLUMN `medidas`;

CREATE TABLE `MedidasCorporais` (
  `medida_id` int PRIMARY KEY AUTO_INCREMENT,
  `avaliacao_id` int NOT NULL UNIQUE, -- Garante relação 1 pra 1
  
  -- --- TRONCO (cm) ---
  `pescoco` float,
  `ombro` float,
  `peitoral` float,
  `cintura` float,     -- Importante para risco cardiovascular
  `abdomen` float,     -- Circunferência abdominal (umbigo)
  `quadril` float,
  
  -- --- MEMBROS SUPERIORES (cm) ---
  -- Direito (D) e Esquerdo (E) separados para monitorar simetria
  `braco_relaxado_d` float,
  `braco_relaxado_e` float,
  `braco_contraido_d` float, -- Opcional, mas comum em nutrição esportiva
  `braco_contraido_e` float,
  `antebraco_d` float,
  `antebraco_e` float,
  
  -- --- MEMBROS INFERIORES (cm) ---
  `coxa_proximal_d` float,
  `coxa_proximal_e` float, -- Parte superior da coxa
  `panturrilha_d` float,
  `panturrilha_e` float,
  
  -- --- DOBRAS CUTÂNEAS (mm) ---
  -- Adicionei aqui pois nutricionistas usam para calcular % de gordura
  -- Se não for usar adipômetro agora, pode ignorar estas colunas
  `dobra_tricipital` float,
  `dobra_bicipital` float,
  `dobra_subescapular` float,
  `dobra_suprailiaca` float,
  `dobra_abdominal` float,
  `dobra_coxa` float,
  `dobra_panturrilha` float,
  
  -- Chave Estrangeira ligando à avaliação principal
  FOREIGN KEY (`avaliacao_id`) REFERENCES `AvaliacaoFisica` (`avaliacao_id`) 
  ON DELETE CASCADE -- Se apagar a avaliação, apaga as medidas automaticamente
);