-- DesignX Studio Pro — MySQL Schema
CREATE DATABASE IF NOT EXISTS designx_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE designx_db;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  email       VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  subscription_type ENUM('FREE','PRO','VIP') NOT NULL DEFAULT 'FREE',
  avatar_url  VARCHAR(500),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id         VARCHAR(64) PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Designs
CREATE TABLE IF NOT EXISTS designs (
  id          CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id     INT UNSIGNED NOT NULL,
  name        VARCHAR(200) NOT NULL DEFAULT 'Untitled',
  canvas_data LONGTEXT COMMENT 'Fabric.js JSON',
  width       INT DEFAULT 320,
  height      INT DEFAULT 420,
  thumbnail   VARCHAR(500),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Templates
CREATE TABLE IF NOT EXISTS templates (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  category     VARCHAR(80) NOT NULL,
  thumbnail    VARCHAR(500),
  canvas_data  LONGTEXT,
  available_for ENUM('FREE','PRO','VIP') NOT NULL DEFAULT 'FREE',
  rating       DECIMAL(3,1) DEFAULT 4.5,
  use_count    INT DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL UNIQUE,
  plan       ENUM('FREE','PRO','VIP') NOT NULL DEFAULT 'FREE',
  stripe_id  VARCHAR(200),
  status     ENUM('active','canceled','past_due') DEFAULT 'active',
  renews_at  TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- AI Credits
CREATE TABLE IF NOT EXISTS ai_credits (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL UNIQUE,
  balance      INT NOT NULL DEFAULT 5,
  refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Exports log
CREATE TABLE IF NOT EXISTS exports (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  design_id  CHAR(36),
  format     ENUM('png','jpg','pdf','svg') NOT NULL,
  file_url   VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed demo user (password: demo123)
INSERT IGNORE INTO users (name, email, password_hash, subscription_type)
VALUES ('Demo User', 'demo@designx.pro', '$2y$12$demoHashReplaceMeWithRealHash', 'FREE');

-- Seed templates
INSERT IGNORE INTO templates (name, category, available_for, rating, use_count) VALUES
('Royal Brand Kit','Poster','PRO', 4.9, 12000),
('Neon Social Pack','Social','FREE', 4.7, 8000),
('Product Launch','Banner','PRO', 4.8, 5000),
('Event Flyer Pro','Flyer','PRO', 4.6, 3000),
('Minimal Logo','Logo','FREE', 4.5, 15000),
('Business Card','Card','FREE', 4.4, 9000),
('Glow Poster','Poster','VIP', 5.0, 2000),
('Deck Master','Presentation','PRO', 4.8, 4000);
