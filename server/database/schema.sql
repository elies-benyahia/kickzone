-- KickZone — schéma de base de données
-- Encodage : utf8mb4 (support emoji et caractères spéciaux)

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
  id         INT          AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(100),
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       ENUM('ADMIN','USER') NOT NULL DEFAULT 'USER',
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des articles
CREATE TABLE IF NOT EXISTS articles (
  id           INT          AUTO_INCREMENT PRIMARY KEY,
  slug         VARCHAR(255) NOT NULL UNIQUE,
  title        VARCHAR(500) NOT NULL,
  summary      TEXT,
  content      LONGTEXT,
  image_url    VARCHAR(1000),
  category     ENUM('TRANSFERT','ACTU','ANALYSE','INTERVIEW','RESULTATS') NOT NULL DEFAULT 'ACTU',
  author       VARCHAR(255),
  views        INT          NOT NULL DEFAULT 0,
  published_at DATETIME,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des pronostics
CREATE TABLE IF NOT EXISTS pronostics (
  id           INT      AUTO_INCREMENT PRIMARY KEY,
  fixture_id   INT,
  home_team    VARCHAR(255) NOT NULL,
  away_team    VARCHAR(255) NOT NULL,
  home_team_id INT,
  away_team_id INT,
  prediction   TEXT         NOT NULL,
  score_home   INT,
  score_away   INT,
  result       ENUM('CORRECT','RATE','EN_ATTENTE') NOT NULL DEFAULT 'EN_ATTENTE',
  confidence   INT          NOT NULL DEFAULT 50,
  league       VARCHAR(255),
  match_date   DATETIME     NOT NULL,
  user_id      INT          NOT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pronostics_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index pour les performances
CREATE INDEX idx_articles_category  ON articles(category);
CREATE INDEX idx_articles_published ON articles(published_at);
CREATE INDEX idx_pronos_match_date  ON pronostics(match_date);
CREATE INDEX idx_pronos_result      ON pronostics(result);
CREATE INDEX idx_pronos_user        ON pronostics(user_id);
