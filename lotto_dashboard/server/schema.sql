CREATE TABLE IF NOT EXISTS lotto_data (
  draw_no        INT NOT NULL,
  draw_date      DATE NOT NULL,
  winner_count   INT UNSIGNED DEFAULT NULL,
  winner_price   BIGINT UNSIGNED DEFAULT NULL,
  winning_no_1   INT NOT NULL,
  winning_no_2   INT NOT NULL,
  winning_no_3   INT NOT NULL,
  winning_no_4   INT NOT NULL,
  winning_no_5   INT NOT NULL,
  winning_no_6   INT NOT NULL,
  bonus_no       INT NOT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (draw_no),
  KEY idx_draw_date (draw_date),
  CONSTRAINT chk_nums_range CHECK (
    winning_no_1 BETWEEN 1 AND 45 AND winning_no_2 BETWEEN 1 AND 45 AND
    winning_no_3 BETWEEN 1 AND 45 AND winning_no_4 BETWEEN 1 AND 45 AND
    winning_no_5 BETWEEN 1 AND 45 AND winning_no_6 BETWEEN 1 AND 45 AND
    bonus_no BETWEEN 1 AND 45
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;