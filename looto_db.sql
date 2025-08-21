--
-- <생성>
--

-- 0. 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS lotto_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE lotto_db;

-- 1. User – 사용자 정보
CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    marketing_agree BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. LottoDraw – 회차별 당첨번호
CREATE TABLE LottoDraw (
    draw_number INT PRIMARY KEY,
    draw_date DATE NOT NULL,
    num1 INT NOT NULL,
    num2 INT NOT NULL,
    num3 INT NOT NULL,
    num4 INT NOT NULL,
    num5 INT NOT NULL,
    num6 INT NOT NULL,
    bonus_number INT NOT NULL
) ENGINE=InnoDB;

-- 3. Prediction – AI 추천 설정값
CREATE TABLE Prediction (
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
    FOREIGN KEY (draw_number) REFERENCES LottoDraw(draw_number) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. PredictionNumber – 추천된 번호 목록
CREATE TABLE PredictionNumber (
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
CREATE TABLE AnalysisLog (
    analysis_id INT AUTO_INCREMENT PRIMARY KEY,
    prediction_id INT NOT NULL,
    user_id INT NOT NULL,
    draw_number INT NOT NULL,
    analysis_result TEXT,
    FOREIGN KEY (prediction_id) REFERENCES Prediction(prediction_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE,
    FOREIGN KEY (draw_number) REFERENCES LottoDraw(draw_number) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. RetailerInfo – 회차별 판매점 정보
CREATE TABLE RetailerInfo (
    retailer_id INT AUTO_INCREMENT PRIMARY KEY,
    draw_number INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    method ENUM('수동', '자동', '반자동') NOT NULL,
    location VARCHAR(200),
    first_prize_count INT DEFAULT 0,
    second_prize_count INT DEFAULT 0,
    FOREIGN KEY (draw_number) REFERENCES LottoDraw(draw_number) ON DELETE CASCADE
) ENGINE=InnoDB;

--
-- <테스트>
--

-- 0. db사용
USE lotto_db;

-- 1. User 테이블 테스트
INSERT INTO User (email, password, name, phone, marketing_agree)
VALUES ('test1@example.com', 'hashed_pw_123', '홍길동', '010-1234-5678', TRUE);

SELECT * FROM User;

DELETE FROM User WHERE email = 'test1@example.com';


-- 2. LottoDraw 테이블 테스트
INSERT INTO LottoDraw (draw_number, draw_date, num1, num2, num3, num4, num5, num6, bonus_number)
VALUES (1, '2025-08-20', 3, 11, 15, 23, 28, 40, 7);

SELECT * FROM LottoDraw;

DELETE FROM LottoDraw WHERE draw_number = 1;


-- 3. Prediction 테이블 테스트
-- (먼저 User와 LottoDraw 데이터가 필요 → 다시 추가)
INSERT INTO User (email, password, name, phone, marketing_agree)
VALUES ('test2@example.com', 'hashed_pw_456', '김철수', '010-9876-5432', FALSE);

INSERT INTO LottoDraw (draw_number, draw_date, num1, num2, num3, num4, num5, num6, bonus_number)
VALUES (2, '2025-08-21', 5, 9, 14, 22, 30, 41, 18);

-- (Prediction 넣기)
INSERT INTO Prediction (user_id, draw_number, use_frequency, use_color, use_trend, use_bonus, use_range, use_odd_even, use_sum, use_pair, use_gap)
VALUES (LAST_INSERT_ID(), 2, TRUE, FALSE, TRUE, FALSE, TRUE, '3:3', TRUE, FALSE, TRUE);

SELECT * FROM Prediction;

DELETE FROM Prediction WHERE prediction_id = LAST_INSERT_ID();
DELETE FROM LottoDraw WHERE draw_number = 2;
DELETE FROM User WHERE email = 'test2@example.com';


-- 4. PredictionNumber 테이블 테스트
-- (다시 Prediction 하나 넣고 테스트)
INSERT INTO User (email, password, name, phone, marketing_agree)
VALUES ('test3@example.com', 'hashed_pw_789', '이영희', '010-5555-6666', TRUE);

INSERT INTO LottoDraw (draw_number, draw_date, num1, num2, num3, num4, num5, num6, bonus_number)
VALUES (3, '2025-08-22', 7, 12, 16, 25, 32, 38, 9);

INSERT INTO Prediction (user_id, draw_number, use_frequency, use_color)
VALUES (LAST_INSERT_ID(), 3, TRUE, TRUE);

SET @pid = LAST_INSERT_ID();

INSERT INTO PredictionNumber (prediction_id, pnum1, pnum2, pnum3, pnum4, pnum5, pnum6, pbonus_number)
VALUES (@pid, 2, 8, 19, 24, 33, 42, 5);

SELECT * FROM PredictionNumber;

DELETE FROM PredictionNumber WHERE prediction_id = @pid;
DELETE FROM Prediction WHERE prediction_id = @pid;
DELETE FROM LottoDraw WHERE draw_number = 3;
DELETE FROM User WHERE email = 'test3@example.com';


-- 5. AnalysisLog 테이블 테스트
INSERT INTO User (email, password, name, phone, marketing_agree)
VALUES ('test4@example.com', 'hashed_pw_000', '박민수', '010-2222-3333', FALSE);

INSERT INTO LottoDraw (draw_number, draw_date, num1, num2, num3, num4, num5, num6, bonus_number)
VALUES (4, '2025-08-23', 1, 6, 17, 20, 29, 37, 13);

INSERT INTO Prediction (user_id, draw_number, use_frequency, use_trend)
VALUES (LAST_INSERT_ID(), 4, TRUE, TRUE);

SET @pid2 = LAST_INSERT_ID();

INSERT INTO AnalysisLog (prediction_id, user_id, draw_number, analysis_result)
VALUES (@pid2, 4, 4, '{"result":"패턴 분석 완료","score":87}');

SELECT * FROM AnalysisLog;

DELETE FROM AnalysisLog WHERE prediction_id = @pid2;
DELETE FROM Prediction WHERE prediction_id = @pid2;
DELETE FROM LottoDraw WHERE draw_number = 4;
DELETE FROM User WHERE email = 'test4@example.com';


-- 6. RetailerInfo 테이블 테스트
INSERT INTO LottoDraw (draw_number, draw_date, num1, num2, num3, num4, num5, num6, bonus_number)
VALUES (5, '2025-08-24', 4, 10, 19, 27, 33, 44, 12);

INSERT INTO RetailerInfo (draw_number, name, method, location, first_prize_count, second_prize_count)
VALUES (5, '행운복권방', '자동', '서울 강남구 어딘가', 1, 0);

SELECT * FROM RetailerInfo;

DELETE FROM RetailerInfo WHERE name = '행운복권방';
DELETE FROM LottoDraw WHERE draw_number = 5;
