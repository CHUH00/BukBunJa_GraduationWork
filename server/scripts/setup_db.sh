#!/usr/bin/env bash
set -euo pipefail

# 경로 설정
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SCHEMA_SQL="$ROOT_DIR/server/schema.sql"
LOAD_SQL="$ROOT_DIR/server/load_data.sql"
ENV_FILE="$ROOT_DIR/server/.env"
CSV_PATH="$ROOT_DIR/server/data/lotto_data_for_db.csv"

# 파일 존재 확인
[[ -f "$SCHEMA_SQL" ]] || { echo "schema.sql not found: $SCHEMA_SQL" >&2; exit 1; }
[[ -f "$LOAD_SQL"   ]] || { echo "load_data.sql not found: $LOAD_SQL" >&2; exit 1; }
[[ -f "$ENV_FILE"   ]] || { echo ".env not found: $ENV_FILE" >&2; exit 1; }
[[ -f "$CSV_PATH"   ]] || { echo "CSV not found: $CSV_PATH" >&2; exit 1; }

# .env 로드
set -a
. "$ENV_FILE"
set +a

# 필수 변수 체크
: "${DB_NAME:?DB_NAME is required in .env}"
: "${DB_USER:?DB_USER is required in .env}"
: "${DB_PASS:?DB_PASS is required in .env}"

# 1. DB/계정/권한 세팅 및 스키마/데이터 적재 (root 비밀번호 한 번만 입력)
echo "✔ DB 초기화 및 사용자 권한 설정 중 (MySQL root 비밀번호를 입력하세요)"
mysql -u root -p <<SQL
CREATE DATABASE IF NOT EXISTS ${DB_NAME} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost'  IDENTIFIED BY '${DB_PASS}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1'  IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'127.0.0.1';
GRANT FILE ON *.* TO '${DB_USER}'@'localhost';
GRANT FILE ON *.* TO '${DB_USER}'@'127.0.0.1';
FLUSH PRIVILEGES;
SET GLOBAL local_infile = 1;
SQL

# 2. 스키마 및 데이터 적재 (DB_USER 계정으로 실행)
echo "✔ 스키마 적용 및 데이터 적재 중"
TMP_SQL="$(mktemp)"
sed "s|@CSV_ABS_PATH|$CSV_PATH|g" "$LOAD_SQL" > "$TMP_SQL"
mysql -u "$DB_USER" -p"${DB_PASS}" --local-infile=1 "${DB_NAME}" < "$SCHEMA_SQL"
mysql -u "$DB_USER" -p"${DB_PASS}" --local-infile=1 "${DB_NAME}" < "$TMP_SQL"
rm -f "$TMP_SQL"

echo "✔ DB 초기화/적재 완료"
echo "  - DB: ${DB_NAME}"
echo "  - User: ${DB_USER}"
echo "  - CSV: $CSV_PATH"