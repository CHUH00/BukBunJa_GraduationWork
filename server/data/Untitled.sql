-- <csv파일 넣을때 오류생기면, 워크벤치 끄고 터미널에 아래 코드>
-- open /Applications/MySQLWorkbench.app

-- <생성>

-- 0. 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS lotto_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
  
USE lotto_db;


-- 1-1. User – 사용자 정보
CREATE TABLE IF NOT EXISTS User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    marketing_agree BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
select * from User;

-- 1-1-1) 개인정보 수집 및 이용 동의 컬럼 추가
ALTER TABLE `User`
  ADD COLUMN `privacy_agree` TINYINT(1) NOT NULL DEFAULT 0 AFTER `phone`;

-- 1-1-2) 바뀔 대상 확인
SELECT user_id, email FROM `User`
WHERE email LIKE '%@placeholder.local';

-- 1-1-3) 세션에서만 끄기
SET SQL_SAFE_UPDATES = 0;

-- 1-1-4) 업데이트 실행
UPDATE `User`
SET email = REPLACE(email, '@placeholder.local', '@noreply.social')
WHERE email LIKE '%@placeholder.local';

-- 1-1-5) 다시 켜기(선택)
SET SQL_SAFE_UPDATES = 1;



-- 1-2.네이버, 카카오 사용자 정보 테이블 추가 생성
CREATE TABLE IF NOT EXISTS SocialAccount (
    social_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    provider ENUM('naver','kakao') NOT NULL,
    provider_uid VARCHAR(128) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_provider (provider, provider_uid),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;
select * from SocialAccount;


  
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
select * from LottoDraw;



-- 추가사항
-- 1. 외래키 먼저 제거 (PredictionNumber, AnalysisLog)
ALTER TABLE PredictionNumber DROP FOREIGN KEY `predictionnumber_ibfk_1`;
ALTER TABLE AnalysisLog DROP FOREIGN KEY `analysislog_ibfk_1`;
-- 2. 기존 테이블 삭제
DROP TABLE IF EXISTS PredictionNumber;
DROP TABLE IF EXISTS AnalysisLog;
DROP TABLE IF EXISTS Prediction;
-- 



-- 3. Prediction – AI 추천 설정값 (JSON 기반으로 수정)
CREATE TABLE Prediction (
    prediction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    draw_number INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    settings JSON NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (draw_number) REFERENCES LottoDraw(회차) ON DELETE CASCADE
) ENGINE=InnoDB;
select * from Prediction;



-- 4. PredictionNumber – 추천된 번호 목록 (JSON 기반으로 수정)
CREATE TABLE PredictionNumber (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prediction_id INT NOT NULL,
    numbers JSON NOT NULL,
    bonus_number INT NOT NULL,
    FOREIGN KEY (prediction_id) REFERENCES Prediction(prediction_id) ON DELETE CASCADE
) ENGINE=InnoDB;
select * from PredictionNumber;



-- 5. AnalysisLog – 분석 이력 (JSON 기반으로 수정)
CREATE TABLE AnalysisLog (
    analysis_id INT AUTO_INCREMENT PRIMARY KEY,
    prediction_id INT NOT NULL,
    user_id INT NOT NULL,
    draw_number INT NOT NULL,
    analysis_result JSON,
    FOREIGN KEY (prediction_id) REFERENCES Prediction(prediction_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (draw_number) REFERENCES LottoDraw(회차) ON DELETE CASCADE
) ENGINE=InnoDB;
select * from AnalysisLog;


-- 6. lotto_retailers - 로또 판매점 위치 정보 -> wizard시, 상호명이 id로 자동설정되는데 상호명으로 수정
CREATE TABLE lotto_retailers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    상호명 VARCHAR(255),
    소재지 VARCHAR(255),
    `위도(lat)` DOUBLE,
    `경도(lon)` DOUBLE,
    count INT DEFAULT 0
);
select * from lotto_retailers;


-- <생성>

-- 0. 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS lotto_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
  
USE lotto_db;


-- 1-1. User – 사용자 정보
CREATE TABLE IF NOT EXISTS User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    marketing_agree BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
select * from User;

-- 1-1-1) 개인정보 수집 및 이용 동의 컬럼 추가
ALTER TABLE `User`
  ADD COLUMN `privacy_agree` TINYINT(1) NOT NULL DEFAULT 0 AFTER `phone`;

-- 1-1-2) 바뀔 대상 확인
SELECT user_id, email FROM `User`
WHERE email LIKE '%@placeholder.local';

-- 1-1-3) 세션에서만 끄기
SET SQL_SAFE_UPDATES = 0;

-- 1-1-4) 업데이트 실행
UPDATE `User`
SET email = REPLACE(email, '@placeholder.local', '@noreply.social')
WHERE email LIKE '%@placeholder.local';

-- 1-1-5) 다시 켜기(선택)
SET SQL_SAFE_UPDATES = 1;



-- 1-2.네이버, 카카오 사용자 정보 테이블 추가 생성
CREATE TABLE IF NOT EXISTS SocialAccount (
    social_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    provider ENUM('naver','kakao') NOT NULL,
    provider_uid VARCHAR(128) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_provider (provider, provider_uid),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;
select * from SocialAccount;


  
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
select * from LottoDraw;



-- 추가사항
-- 1. 외래키 먼저 제거 (PredictionNumber, AnalysisLog)
ALTER TABLE PredictionNumber DROP FOREIGN KEY `predictionnumber_ibfk_1`;
ALTER TABLE AnalysisLog DROP FOREIGN KEY `analysislog_ibfk_1`;
-- 2. 기존 테이블 삭제
DROP TABLE IF EXISTS PredictionNumber;
DROP TABLE IF EXISTS AnalysisLog;
DROP TABLE IF EXISTS Prediction;
-- 



-- 3. Prediction – AI 추천 설정값 (JSON 기반으로 수정)
CREATE TABLE Prediction (
    prediction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    draw_number INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    settings JSON NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (draw_number) REFERENCES LottoDraw(회차) ON DELETE CASCADE
) ENGINE=InnoDB;
select * from Prediction;



-- 4. PredictionNumber – 추천된 번호 목록 (JSON 기반으로 수정)
CREATE TABLE PredictionNumber (
    id INT AUTO_INCREMENT PRIMARY KEY,
    prediction_id INT NOT NULL,
    numbers JSON NOT NULL,
    bonus_number INT NOT NULL,
    FOREIGN KEY (prediction_id) REFERENCES Prediction(prediction_id) ON DELETE CASCADE
) ENGINE=InnoDB;
select * from PredictionNumber;



-- 5. AnalysisLog – 분석 이력 (JSON 기반으로 수정)
CREATE TABLE AnalysisLog (
    analysis_id INT AUTO_INCREMENT PRIMARY KEY,
    prediction_id INT NOT NULL,
    user_id INT NOT NULL,
    draw_number INT NOT NULL,
    analysis_result JSON,
    FOREIGN KEY (prediction_id) REFERENCES Prediction(prediction_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (draw_number) REFERENCES LottoDraw(회차) ON DELETE CASCADE
) ENGINE=InnoDB;
select * from AnalysisLog;


-- 6. lotto_retailers - 로또 판매점 위치 정보 -> wizard시, 상호명이 id로 자동설정되는데 상호명으로 수정
CREATE TABLE lotto_retailers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    상호명 VARCHAR(255),
    소재지 VARCHAR(255),
    `위도(lat)` DOUBLE,
    `경도(lon)` DOUBLE,
    count INT DEFAULT 0
);
select * from lotto_retailers;
