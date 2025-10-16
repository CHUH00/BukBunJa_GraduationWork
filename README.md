## 프로젝트 구조

lotto_dashboard/
├── client/                      # React + Vite 프론트엔드
│   ├── src/                     # 프론트엔드 소스코드
│   │   ├── assets/              # 이미지, 아이콘 등 정적 자원
│   │   ├── components/          # 재사용 가능한 UI 컴포넌트
│   │   ├── pages/               # 페이지 단위 컴포넌트
│   │   ├── utils/                # API 호출 등 공통 함수
│   │   ├── App.jsx               # 라우팅 및 전체 페이지 구성
│   │   └── main.jsx              # React 앱 진입점
│   ├── package.json              # 프론트엔드 의존성 및 스크립트
│   ├── vite.config.js            # Vite 설정 파일
│   └── ...                       # 환경설정 관련 파일(.eslintrc 등)
│
├── server/                       # FastAPI 백엔드
│   ├── app/                      # 서버 앱 로직
│   │   ├── routers/              # API 라우터(엔드포인트) 모음
│   │   ├── database.py           # DB 연결 설정
│   │   └── main.py               # FastAPI 진입점
│   ├── data/                     # CSV 데이터 파일 보관 위치
│   ├── scripts/                  # DB 초기화 및 적재 스크립트
│   │   └── setup_db.sh           # DB 생성 + CSV 적재 자동화
│   ├── schema.sql                # DB 테이블 스키마
│   ├── load_data.sql             # CSV → DB 적재 SQL
│   ├── requirements.txt          # 백엔드 의존성 패키지
│   ├── .env                      # (로컬 전용) 민감정보 환경변수
│   └── .env.example              # 환경변수 샘플 (비밀번호 제외)
│
├── .gitignore                    # Git에 포함하지 않을 파일 목록
├── README.md                     # 프로젝트 설명 문서
└── ...

## 환경 변수 관리

- `server/.env`에는 **DB 비밀번호(민감정보)**가 포함됨  
- `.gitignore`에 `server/.env`를 등록해 **Git에 올라가지 않도록 설정**해놓음  
- 대신 `server/.env.example` 파일을 만들어 **샘플 형식**만 제공  
- 팀원은 `.env.example`를 복사 후 본인 환경에 맞게 수정해야함  

### `.env` 생성 및 수정

```bash
cp server/.env.example server/.env
```

`server/.env`를 열어 DB_PASS를 본인 MySQL에서 생성할 lotto 계정 비밀번호로 변경  

예시  
```
DB_HOST=127.0.0.1  
DB_PORT=3306  
DB_NAME=lotto_db  
DB_USER=lotto  
DB_PASS=1234  ## 원하는 비밀번호  
```

1. root 비밀번호 → 스크립트 실행 중 MySQL에 접속해서 lotto 계정을 생성할 때 사용  
2. DB_PASS → 서버 실행 시 .env에서 읽어서 lotto 계정으로 DB에 접속할 때 사용  

## 1. MYSQL 준비, 백엔드 가상환경 세팅

```bash
cd server  
python3.11 -m venv .venv
source .venv/bin/activate  
pip install -r requirements.txt
```

`pip install -r requirements.txt`는 최초 세팅 시 또는 `requirements.txt` 변경 시만 실행함  

## 2. DB 초기화 및 CSV 데이터 적재

```bash
# chmod +x server/scripts/setup_db.sh  
# ./server/scripts/setup_db.sh
```

- 실행 중 MySQL root 비밀번호를 여러 번 입력하게 됨  
- `.env`에서 지정한 DB_PASS로 lotto 계정이 생성됨  
- `server/data/Cleaned_Lotto_601_1162.csv` 파일이 DB에 적재됨  

## 백엔드(FASTAPI) 실행

```bash
cd server  
source .venv/bin/activate
make run
```

## 프론트엔드 실행

```bash
cd client  
npm install
npm run dev
```

브라우저에서 http://localhost:5173 접속  

## API 테스트

```bash
curl http://localhost:8000/lotto/db-ping
curl http://localhost:8000/lotto/latest
curl "http://localhost:8000/lotto/history?limit=3"
```


