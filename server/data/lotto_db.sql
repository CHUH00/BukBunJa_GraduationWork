-- <csv파일 넣을때 오류생기면, 워크벤치 끄고 터미널에 아래 코드>
-- open /Applications/MySQLWorkbench.app

-- <생성>

-- 0. 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS lotto_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
  
drop database lotto_db;

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
    `당첨자수_1` INT,
    `당첨금액_1` BIGINT,
    `당첨자수_2` INT,
    `당첨금액_2` BIGINT,
    `당첨자수_3` INT,
    `당첨금액_3` BIGINT,
    `당첨자수_4` INT,
    `당첨금액_4` BIGINT,
    `당첨자수_5` INT,
    `당첨금액_5` BIGINT,
    `당첨번호_1` INT,
    `당첨번호_2` INT,
    `당첨번호_3` INT,
    `당첨번호_4` INT,
    `당첨번호_5` INT,
    `당첨번호_6` INT,
    보너스번호 INT
) ENGINE=InnoDB;

INSERT INTO LottoDraw
(년도, 회차, 추첨일,
 `당첨자수_1`, `당첨금액_1`,
 `당첨자수_2`, `당첨금액_2`,
 `당첨자수_3`, `당첨금액_3`,
 `당첨자수_4`, `당첨금액_4`,
 `당첨자수_5`, `당첨금액_5`,
 `당첨번호_1`, `당첨번호_2`, `당첨번호_3`,
 `당첨번호_4`, `당첨번호_5`, `당첨번호_6`,
 보너스번호)
VALUES
(2025,1187,'2025-08-30',11,2619380012,79,60787300,3147,1525961,152448,50000,2557090,5000,5,13,26,29,37,40,42),
(2025,1186,'2025-08-23',14,1985676911,89,52058946,3226,1436221,162707,50000,2628810,5000,2,8,13,16,23,28,35),
(2025,1185,'2025-08-16',12,2388695125,79,60473295,2903,1645674,153798,50000,2566276,5000,6,17,22,28,29,32,38);

select * from LottoDraw;

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

-- 7. lotto_retailers - 로또 판매점 위치 정보 -> wizard시, 상호명이 id로 자동설정되는데 상호명으로 수정
CREATE TABLE lotto_retailers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    상호명 VARCHAR(255),
    소재지 VARCHAR(255),
    `위도(lat)` DOUBLE,
    `경도(lon)` DOUBLE,
    count INT DEFAULT 0
);
select * from lotto_retailers;
drop table lotto_retailers;