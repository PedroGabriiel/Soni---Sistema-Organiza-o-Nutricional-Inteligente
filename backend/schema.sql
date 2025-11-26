-- Schema para sistema de pacientes/nutricionistas
-- Engine: InnoDB, Charset: utf8mb4

--create database soni;
--use soni;

SET FOREIGN_KEY_CHECKS = 0;

-- Tabela principal de usuários
CREATE TABLE IF NOT EXISTS Usuario (
  usuario_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL, -- guardar hash, ex: bcrypt
  status VARCHAR(50) DEFAULT 'ativo',
  data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Nutricionista (1:1 com Usuario)
CREATE TABLE IF NOT EXISTS Nutricionista (
  nutricionista_id INT UNSIGNED NOT NULL, -- PK e FK para Usuario.usuario_id
  nome VARCHAR(255) NOT NULL,
  crn VARCHAR(100) UNIQUE,
  especializacao TEXT,
  PRIMARY KEY (nutricionista_id),
  CONSTRAINT fk_nutricionista_usuario
    FOREIGN KEY (nutricionista_id) REFERENCES Usuario(usuario_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Paciente (1:1 com Usuario)
CREATE TABLE IF NOT EXISTS Paciente (
  paciente_id INT UNSIGNED NOT NULL, -- PK e FK para Usuario.usuario_id
  nome VARCHAR(255) NOT NULL,
  data_nascimento DATE,
  genero VARCHAR(20),
  objetivo TEXT,
  alergias_restricoes TEXT,
  PRIMARY KEY (paciente_id),
  CONSTRAINT fk_paciente_usuario
    FOREIGN KEY (paciente_id) REFERENCES Usuario(usuario_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Relacionamento Paciente <-> Nutricionista (Acompanhamento)
CREATE TABLE IF NOT EXISTS Acompanhamento (
  acompanhamento_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  data_inicio_acomp DATE,
  status_acomp VARCHAR(50),
  paciente_id INT UNSIGNED NOT NULL,
  nutricionista_id INT UNSIGNED NULL, -- permite NULL para suportar ON DELETE SET NULL
  PRIMARY KEY (acompanhamento_id),
  INDEX idx_acomp_paciente (paciente_id),
  INDEX idx_acomp_nutricionista (nutricionista_id),
  CONSTRAINT fk_acomp_paciente
    FOREIGN KEY (paciente_id) REFERENCES Paciente(paciente_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_acomp_nutricionista
    FOREIGN KEY (nutricionista_id) REFERENCES Nutricionista(nutricionista_id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Diário alimentar do paciente
CREATE TABLE IF NOT EXISTS DiarioAlimentar (
  diario_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  data_hora DATETIME NOT NULL,
  descricao TEXT,
  feedback TEXT,
  foto VARCHAR(1024),
  paciente_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (diario_id),
  INDEX idx_diario_paciente (paciente_id),
  CONSTRAINT fk_diario_paciente
    FOREIGN KEY (paciente_id) REFERENCES Paciente(paciente_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Avaliação física do paciente
CREATE TABLE IF NOT EXISTS AvaliacaoFisica (
  avaliacao_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  data DATE NOT NULL,
  peso_kg FLOAT,
  altura_cm FLOAT,
  medidas TEXT,
  observacoes TEXT,
  paciente_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (avaliacao_id),
  INDEX idx_avaliacao_paciente (paciente_id),
  CONSTRAINT fk_avaliacao_paciente
    FOREIGN KEY (paciente_id) REFERENCES Paciente(paciente_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Dietas criadas por nutricionistas
CREATE TABLE IF NOT EXISTS Dieta (
  dieta_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(255),
  data_inicio DATE,
  data_fim DATE,
  nutricionista_id INT UNSIGNED NULL, -- permite NULL para suportar ON DELETE SET NULL
  PRIMARY KEY (dieta_id),
  INDEX idx_dieta_nutri (nutricionista_id),
  CONSTRAINT fk_dieta_nutri
    FOREIGN KEY (nutricionista_id) REFERENCES Nutricionista(nutricionista_id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Refeições da dieta
CREATE TABLE IF NOT EXISTS Refeicao (
  refeicao_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(255),
  horario TIME,
  dieta_id INT UNSIGNED,
  PRIMARY KEY (refeicao_id),
  INDEX idx_refeicao_dieta (dieta_id),
  CONSTRAINT fk_refeicao_dieta
    FOREIGN KEY (dieta_id) REFERENCES Dieta(dieta_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Alimentos (catálogo)
CREATE TABLE IF NOT EXISTS Alimento (
  alimento_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL UNIQUE,
  calorias_100g FLOAT,
  proteinas_100g FLOAT,
  carboidratos_100g FLOAT DEFAULT 0,
  categoria VARCHAR(100) DEFAULT NULL,
  gorduras_100g FLOAT,
  fibras_100g FLOAT,
  PRIMARY KEY (alimento_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Itens de cada refeição (quantidades de alimentos)
CREATE TABLE IF NOT EXISTS ItensRefeicao (
  item_refeicao_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  quantidade VARCHAR(50),
  unidade_medida VARCHAR(50),
  refeicao_id INT UNSIGNED NOT NULL,
  alimento_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (item_refeicao_id),
  INDEX idx_item_refeicao_ref (refeicao_id),
  INDEX idx_item_refeicao_alim (alimento_id),
  CONSTRAINT fk_item_refeicao_refeicao
    FOREIGN KEY (refeicao_id) REFERENCES Refeicao(refeicao_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_item_refeicao_alimento
    FOREIGN KEY (alimento_id) REFERENCES Alimento(alimento_id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Metas nutricionais por dieta
CREATE TABLE IF NOT EXISTS MetasNutri (
  metas_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nutriente VARCHAR(255),
  valor_maximo FLOAT,
  valor_minimo FLOAT,
  dieta_id INT UNSIGNED,
  PRIMARY KEY (metas_id),
  INDEX idx_metas_dieta (dieta_id),
  CONSTRAINT fk_metas_dieta
    FOREIGN KEY (dieta_id) REFERENCES Dieta(dieta_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Grupo de substituição (criado por nutricionista)
CREATE TABLE IF NOT EXISTS GrupoSubstituicao (
  grupo_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(255),
  nutricionista_id INT UNSIGNED NULL, -- permite NULL para suportar ON DELETE SET NULL
  PRIMARY KEY (grupo_id),
  INDEX idx_grupo_nutri (nutricionista_id),
  CONSTRAINT fk_grupo_nutri
    FOREIGN KEY (nutricionista_id) REFERENCES Nutricionista(nutricionista_id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Associação N:M entre Alimento e GrupoSubstituicao
CREATE TABLE IF NOT EXISTS Alimento_Grupo (
  alimento_id INT UNSIGNED NOT NULL,
  grupo_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (alimento_id, grupo_id),
  INDEX idx_ag_alimento (alimento_id),
  INDEX idx_ag_grupo (grupo_id),
  CONSTRAINT fk_ag_alimento
    FOREIGN KEY (alimento_id) REFERENCES Alimento(alimento_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ag_grupo
    FOREIGN KEY (grupo_id) REFERENCES GrupoSubstituicao(grupo_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Associação N:M entre Paciente e Dieta
CREATE TABLE IF NOT EXISTS Paciente_Dieta (
  paciente_id INT UNSIGNED NOT NULL,
  dieta_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (paciente_id, dieta_id),
  INDEX idx_pd_paciente (paciente_id),
  INDEX idx_pd_dieta (dieta_id),
  CONSTRAINT fk_pd_paciente
    FOREIGN KEY (paciente_id) REFERENCES Paciente(paciente_id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pd_dieta
    FOREIGN KEY (dieta_id) REFERENCES Dieta(dieta_id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;