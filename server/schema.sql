-- <생성>

-- 0. 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS lotto_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lotto_db;

-- 1. User – 사용자 정보
CREATE TABLE IF NOT EXISTS User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    marketing_agree BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. LottoDraw – 회차별 당첨번호 및 당첨 정보
CREATE TABLE IF NOT EXISTS LottoDraw (
    년도 INT,
    회차 INT PRIMARY KEY,
    추첨일 DATE,
    `1등_당첨자수` INT,
    `1등_당첨금액` BIGINT,
    `2등_당첨자수` INT,
    `2등_당첨금액` BIGINT,
    `3등_당첨자수` INT,
    `3등_당첨금액` BIGINT,
    `4등_당첨자수` INT,
    `4등_당첨금액` BIGINT,
    `5등_당첨자수` INT,
    `5등_당첨금액` BIGINT,
    `당첨번호_1` INT,
    `당첨번호_2` INT,
    `당첨번호_3` INT,
    `당첨번호_4` INT,
    `당첨번호_5` INT,
    `당첨번호_6` INT,
    보너스번호 INT
) ENGINE=InnoDB;

-- 3. Prediction – AI 추천 설정값
CREATE TABLE IF NOT EXISTS Prediction (
    prediction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    draw_number INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    use_frequency BOOLEAN DEFAULT FALSE,
    use_color BOOLEAN DEFAULT FALSE,
    use_trend BOOLEAN DEFAULT FALSE,
    use_bonus BOOLEAN DEFAULT FALSE,
    use_range BOOLEAN DEFAULT FALSE,
    use_odd_even VARCHAR(10),
    use_sum BOOLEAN DEFAULT FALSE,
    use_pair BOOLEAN DEFAULT FALSE,
    use_gap BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (draw_number) REFERENCES LottoDraw(회차) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. PredictionNumber – 추천된 번호 목록
CREATE TABLE IF NOT EXISTS PredictionNumber (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prediction_id INT NOT NULL,
    pnum1 INT NOT NULL,
    pnum2 INT NOT NULL,
    pnum3 INT NOT NULL,
    pnum4 INT NOT NULL,
    pnum5 INT NOT NULL,
    pnum6 INT NOT NULL,
    pbonus_number INT,
    FOREIGN KEY (prediction_id) REFERENCES Prediction(prediction_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. AnalysisLog – 분석 이력
CREATE TABLE IF NOT EXISTS AnalysisLog (
    analysis_id INT AUTO_INCREMENT PRIMARY KEY,
    prediction_id INT NOT NULL,
    user_id INT NOT NULL,
    draw_number INT NOT NULL,
    analysis_result TEXT,
    FOREIGN KEY (prediction_id) REFERENCES Prediction(prediction_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (draw_number) REFERENCES LottoDraw(회차) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. RetailerInfo – 회차별 판매점 정보
CREATE TABLE IF NOT EXISTS RetailerInfo (
    retailer_id INT AUTO_INCREMENT PRIMARY KEY,
    draw_number INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    method ENUM('수동', '자동', '반자동') NOT NULL,
    location VARCHAR(200),
    first_prize_count INT DEFAULT 0,
    second_prize_count INT DEFAULT 0,
    FOREIGN KEY (draw_number) REFERENCES LottoDraw(회차) ON DELETE CASCADE
) ENGINE=InnoDB;