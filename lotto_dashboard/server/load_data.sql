LOAD DATA LOCAL INFILE '@CSV_ABS_PATH'
INTO TABLE lotto_data
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(@year,
 @draw_no,
 @draw_date,
 @first_cnt,
 @first_price,
 @second_cnt,   @second_price,
 @third_cnt,    @third_price,
 @fourth_cnt,   @fourth_price,
 @fifth_cnt,    @fifth_price,
 @num1, @num2, @num3, @num4, @num5, @num6,
 @bonus)
SET
  draw_no   = NULLIF(@draw_no, ''),
  draw_date = STR_TO_DATE(NULLIF(@draw_date, ''), '%Y.%c.%e'),
  winner_count = NULLIF(REPLACE(@first_cnt, ',', ''), ''),
  winner_price = NULLIF(REPLACE(REPLACE(@first_price, '원', ''), ',', ''), ''),
  winning_no_1 = NULLIF(@num1, ''),
  winning_no_2 = NULLIF(@num2, ''),
  winning_no_3 = NULLIF(@num3, ''),
  winning_no_4 = NULLIF(@num4, ''),
  winning_no_5 = NULLIF(@num5, ''),
  winning_no_6 = NULLIF(@num6, ''),
  bonus_no     = NULLIF(@bonus, ''),
  created_at   = NOW();