import os, re, random, warnings
import numpy as np
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split

warnings.filterwarnings("ignore")

# ---- .env에서 DB 정보 불러오기 ----
load_dotenv()
DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

DB_URI = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
engine = create_engine(DB_URI)

# ---- DB에서 전체 회차 데이터 불러오기 ----
with engine.connect() as conn:
    df = conn.execute(text("SELECT * FROM LottoDraw ORDER BY 회차 ASC")).fetchall()
    columns = conn.execute(text("SHOW COLUMNS FROM LottoDraw")).fetchall()
    cols = [c[0] for c in columns]
import pandas as pd
df = pd.DataFrame(df, columns=cols)

# ---- 번호 컬럼 탐지 ----
def find_number_columns_kor(df_):
    cand = [f'당첨번호_{i}' for i in range(1,7)]
    if all(c in df_.columns for c in cand):
        return cand
    pattern_cols = [c for c in df_.columns if re.search(r'당첨.?번호', str(c)) and '보너' not in str(c)]
    if pattern_cols:
        def trailing_num(name):
            m = re.search(r'(\d+)$', str(name))
            return int(m.group(1)) if m else 999
        pattern_cols.sort(key=trailing_num)
        if len(pattern_cols) >= 6:
            return pattern_cols[:6]
    raise ValueError("번호 컬럼 탐지 실패")

num_cols = find_number_columns_kor(df)
nums = df[num_cols].apply(pd.to_numeric, errors="coerce").dropna()
mask = nums.applymap(lambda x: 1 <= x <= 45).all(axis=1)
nums = nums[mask]
draws = nums.apply(lambda r: sorted(map(int, r.values)), axis=1, result_type="expand")
draws.columns = ["n1","n2","n3","n4","n5","n6"]

# ---- 유틸 함수 ----
def primes_upto(n=45):
    sieve=[True]*(n+1); sieve[0]=sieve[1]=False
    for i in range(2,int(n**0.5)+1):
        if sieve[i]:
            for j in range(i*i,n+1,i): sieve[j]=False
    return {i for i,v in enumerate(sieve) if v}
PRIMES = primes_upto(45)

def corpus_stats(df_draws):
    freq = np.zeros(46); last_seen = np.zeros(46)+9999
    for _,row in df_draws.reset_index(drop=True).iterrows():
        for x in row.values:
            freq[x]+=1; last_seen[x]=0
        last_seen[last_seen<9999]+=1
    freq = (freq - freq.mean())/(freq.std()+1e-6)
    last_seen = (last_seen - last_seen.mean())/(last_seen.std()+1e-6)
    return freq, last_seen

def combo_features(arr, freq, last_seen):
    arr = np.array(arr, dtype=int)
    odds = int(np.sum(arr%2==1))
    total = int(np.sum(arr))
    spread = int(arr[-1]-arr[0])
    consec = int(np.sum(np.diff(arr)==1))
    low_cnt = int(np.sum(arr<=22))
    primes = int(np.sum(np.isin(arr, list(PRIMES))))
    freq_sum = float(np.sum(freq[arr]))
    recency = float(np.sum(last_seen[arr]))
    return [odds,total,spread,consec,low_cnt,primes,freq_sum,recency]

freq, last_seen = corpus_stats(draws)

X_pos = [combo_features(np.sort(r.values), freq, last_seen) for _, r in draws.iterrows()]
y_pos = np.ones(len(X_pos), dtype=int)
win_set = {tuple(sorted(map(int, r.values))) for _,r in draws.iterrows()}

def rand_combo(): return tuple(sorted(random.sample(range(1,46),6)))
X_neg=[]
while len(X_neg) < len(X_pos)*3:
    c = rand_combo()
    if c in win_set: continue
    X_neg.append(combo_features(np.array(c), freq, last_seen))
y_neg = np.zeros(len(X_neg), dtype=int)

X = np.array(X_pos + X_neg, dtype=float)
y = np.concatenate([y_pos, y_neg])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

# ---- 모델 학습 ----
model = XGBClassifier(
    n_estimators=150, max_depth=5, learning_rate=0.09,
    subsample=0.9, colsample_bytree=0.8, random_state=42, eval_metric="logloss"
)
model.fit(X_train, y_train)

# ---- 추천 함수 ----
def recommend_numbers(settings=None, k=1000, topn=5):
    """
    settings: frontend JSON 옵션 그대로 dict 형태로 전달
    """
    default_weights = {
        "freq":0.5, "odd_even":0.5, "sum":0.5,
        "spread":0.5, "consec":0.5,
        "low_high":0.5, "recency":0.5,
        "bonus":0.5
    }
    weights = default_weights.copy()
    if settings:
        if settings.get("freq_bias"): weights["freq"] += 0.2
        if settings.get("parity"): weights["odd_even"] += 0.2
        if settings.get("sum_on"): weights["sum"] += 0.2
        if settings.get("spread_on"): weights["spread"] += 0.2
        if settings.get("consec_on"): weights["consec"] += 0.2
        if settings.get("low_high"): weights["low_high"] += 0.2
        if settings.get("recency_on"): weights["recency"] += 0.2
        if settings.get("bonus_stats"): weights["bonus"] += 0.2

    def weight_score(arr):
        f = combo_features(arr[:6], freq, last_seen)
        score = 0.0
        score += weights["freq"] * f[6]
        score -= weights["odd_even"] * abs(f[0]-3)
        score -= weights["sum"] * abs(f[1]-135)
        score -= weights["consec"] * f[3]
        score -= weights["low_high"] * abs(f[4]-3)
        score += weights["recency"] * f[7]
        score += weights["spread"] * (f[2]/44.0)
        if settings and settings.get("bonus_stats"):
            bonus_num = arr[6]
            score += weights["bonus"] * (freq[bonus_num] + last_seen[bonus_num])
        return score

    seen=set(); out=[]
    while len(out)<k:
        main_nums = tuple(sorted(random.sample(range(1,46),6)))
        bonus_candidates = [n for n in range(1,46) if n not in main_nums]
        best_bonus, best_score = None, -float('inf')
        for b in bonus_candidates:
            candidate = np.array(list(main_nums)+[b])
            sc = weight_score(candidate)
            if sc > best_score:
                best_score = sc
                best_bonus = b
        c7 = tuple(sorted(main_nums)+[best_bonus])
        if c7 in seen: continue
        seen.add(c7)
        out.append((c7, best_score))
    out.sort(key=lambda x:x[1], reverse=True)

    feats = [combo_features(np.array(c[:6]), freq, last_seen) for c,_ in out]
    probs = model.predict_proba(np.array(feats))[:,1]
    ranked = sorted(zip([c for c,_ in out], probs, [score for _,score in out]), key=lambda x:x[1], reverse=True)

    best = ranked[:topn]
    choice = random.choice(best)
    return {"numbers": list(choice[0][:6]), "bonus": choice[0][6], "score": float(choice[2])}

if __name__=="__main__":
    print(recommend_numbers())