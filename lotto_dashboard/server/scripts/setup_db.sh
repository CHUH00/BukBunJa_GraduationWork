#!/usr/bin/env bash
# [변경] .env를 읽어 DB_NAME/DB_USER/DB_PASS 자동 반영 + CSV 적재 원클릭
set -euo pipefail

# 경로 설정
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CSV_PATH="$ROOT_DIR/server/data/Cleaned_Lotto_601_1162.csv"
SCHEMA_SQL="$ROOT_DIR/server/schema.sql"
LOAD_SQL="$ROOT_DIR/server/load_data.sql"
ENV_FILE="$ROOT_DIR/server/.env"

# 파일 존재 확인
[[ -f "$CSV_PATH"   ]] || { echo "CSV not found: $CSV_PATH" >&2; exit 1; }
[[ -f "$SCHEMA_SQL" ]] || { echo "schema.sql not found: $SCHEMA_SQL" >&2; exit 1; }
[[ -f "$LOAD_SQL"   ]] || { echo "load_data.sql not found: $LOAD_SQL" >&2; exit 1; }
[[ -f "$ENV_FILE"   ]] || { echo ".env not found: $ENV_FILE" >&2; exit 1; }

# [중요] .env 로드(환경변수 export)
set -a
. "$ENV_FILE"
set +a

# 필수 변수 체크
: "${DB_NAME:?DB_NAME is required in .env}"
: "${DB_USER:?DB_USER is required in .env}"
: "${DB_PASS:?DB_PASS is required in .env}"

# DB/계정/권한 세팅 (root 비밀번호 입력 프롬프트가 뜸)
mysql -u root -p <<SQL
CREATE DATABASE IF NOT EXISTS ${DB_NAME}
  DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost'  IDENTIFIED BY '${DB_PASS}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1'  IDENTIFIED BY '${DB_PASS}';

ALTER USER '${DB_USER}'@'localhost'  IDENTIFIED BY '${DB_PASS}';
ALTER USER '${DB_USER}'@'127.0.0.1'  IDENTIFIED BY '${DB_PASS}';

GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'127.0.0.1';
FLUSH PRIVILEGES;
SQL

# 스키마 적용
mysql -u root -p "${DB_NAME}" < "$SCHEMA_SQL"

# LOCAL INFILE 허용(필요 시)
mysql -u root -p -e "SET GLOBAL local_infile = 1;"

# load_data.sql의 경로 토큰 치환 후 실행
TMP_SQL="$(mktemp)"
sed "s|@CSV_ABS_PATH|$CSV_PATH|g" "$LOAD_SQL" > "$TMP_SQL"
mysql -u root -p --local-infile=1 "${DB_NAME}" < "$TMP_SQL"
rm -f "$TMP_SQL"

echo "✔ DB 초기화/적재 완료"
echo "  - DB: ${DB_NAME}"
echo "  - User: ${DB_USER} / Pass: (from .env)"
echo "  - CSV: $CSV_PATH"