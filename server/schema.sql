-- <csv파일 넣을때 오류생기면, 워크벤치 끄고 터미널에 아래 코드>
-- open /Applications/MySQLWorkbench.app

-- <생성>
-- 0. 데이터베이스 생성 및 선택
CREATE DATABASE IF NOT EXISTS lotto_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
  
USE lotto_db;

-- 테이블 재생성을 위해 의존성이 있는 테이블부터 삭제
DROP TABLE IF EXISTS `PredictionNumber`;
DROP TABLE IF EXISTS `AnalysisLog`;
DROP TABLE IF EXISTS `Prediction`;
DROP TABLE IF EXISTS `SocialAccount`;
DROP TABLE IF EXISTS `User`;
DROP TABLE IF EXISTS `LottoDraw`;
DROP TABLE IF EXISTS `lotto_retailers`;


-- 1. User – 사용자 정보 테이블
CREATE TABLE IF NOT EXISTS `User` (
    `user_id` INT AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(100) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `phone` VARCHAR(20),
    `privacy_agree` BOOLEAN NOT NULL DEFAULT FALSE,
    `marketing_agree` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. SocialAccount – 소셜 로그인 사용자 정보 테이블
CREATE TABLE IF NOT EXISTS `SocialAccount` (
    `social_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `provider` ENUM('naver','kakao') NOT NULL,
    `provider_uid` VARCHAR(128) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uq_provider` (`provider`, `provider_uid`),
    FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB;
  
-- 3. LottoDraw – 회차별 당첨번호 및 당첨 정보 테이블
CREATE TABLE IF NOT EXISTS `LottoDraw` (
    `년도` INT,
    `회차` INT PRIMARY KEY,
    `추첨일` DATE,
    `당첨자수_1` INT, `당첨금액_1` BIGINT,
    `당첨자수_2` INT, `당첨금액_2` BIGINT,
    `당첨자수_3` INT, `당첨금액_3` BIGINT,
    `당첨자수_4` INT, `당첨금액_4` BIGINT,
    `당첨자수_5` INT, `당첨금액_5` BIGINT,
    `당첨번호_1` INT, `당첨번호_2` INT, `당첨번호_3` INT, `당첨번호_4` INT, `당첨번호_5` INT, `당첨번호_6` INT,
    `보너스번호` INT
) ENGINE=InnoDB;

-- 4. Prediction – AI 추천 요청 기록 테이블
CREATE TABLE IF NOT EXISTS `Prediction` (
    `prediction_id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `draw_number` INT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `settings` JSON NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `User`(`user_id`) ON DELETE CASCADE,
    FOREIGN KEY (`draw_number`) REFERENCES `LottoDraw`(`회차`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. PredictionNumber – 추천된 번호 목록 테이블
CREATE TABLE IF NOT EXISTS `PredictionNumber` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `prediction_id` INT NOT NULL,
    `numbers` JSON NOT NULL,
    `bonus_number` INT,
    FOREIGN KEY (`prediction_id`) REFERENCES `Prediction`(`prediction_id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. lotto_retailers - 로또 판매점 위치 정보 테이블
CREATE TABLE IF NOT EXISTS `lotto_retailers` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `상호명` VARCHAR(255),
    `소재지` VARCHAR(255),
    `위도(lat)` DOUBLE,
    `경도(lon)` DOUBLE,
    `count` INT DEFAULT 0
);

ALTER TABLE `User`
  ADD COLUMN `avatar` VARCHAR(255) NULL AFTER `name`;