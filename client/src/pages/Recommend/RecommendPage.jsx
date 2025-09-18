import React, { useEffect, useMemo, useState } from "react";
import "./recommend.css";
import { api } from "../../api/client";

function ballColor(n) {
  const x = Number(n);
  if (x >= 1 && x <= 10) return "#F2C600";
  if (x >= 11 && x <= 20) return "#2F7FD9";
  if (x >= 21 && x <= 30) return "#D64545";
  if (x >= 31 && x <= 40) return "#8B8F98";
  return "#3AA76D";
}

function mulberry32(seed) {
  let t = seed + 0x6D2B79F5;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function generateNumbers(settings) {
  const seed = JSON.stringify(settings).split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const rnd = mulberry32(seed + Math.floor(Date.now() / 1000));

  const pool = Array.from({ length: 45 }, (_, i) => i + 1);
  const ranges = { yellow:[1,10], blue:[11,20], red:[21,30], gray:[31,40], green:[41,45] };
  const anyColor = Object.values(settings.colors).some(Boolean);

  let weighted = [];
  if (anyColor) {
    Object.entries(settings.colors).forEach(([k,on])=>{
      if(!on) return;
      const [a,b]=ranges[k]; for(let n=a;n<=b;n++) weighted.push(n);
    });
    if (weighted.length < 6) weighted = pool.slice();
  } else {
    weighted = pool.slice();
  }

  const pickUnique = (cnt, src) => {
    const s = new Set();
    while (s.size < cnt && s.size < src.length) {
      s.add(src[Math.floor(rnd() * src.length)]);
    }
    return Array.from(s);
  };

  let arr = pickUnique(6, weighted).sort((a,b)=>a-b);

  if (settings.parity !== "none") {
    const [oddT, evenT] = settings.parity.split("-").map(Number);
    let odds = arr.filter(n=>n%2===1);
    let evens= arr.filter(n=>n%2===0);

    const addFrom = wantOdd => {
      for(let i=0;i<300;i++){
        const c = weighted[Math.floor(rnd()*weighted.length)];
        if((c%2===1)===wantOdd && !odds.includes(c) && !evens.includes(c)) return c;
      }
      return null;
    };

    while(odds.length>oddT){ evens.push(odds.pop()); }
    while(evens.length>evenT){ odds.push(evens.pop()); }
    while(odds.length<oddT){ const p=addFrom(true);  if(p==null)break; odds.push(p); }
    while(evens.length<evenT){ const p=addFrom(false); if(p==null)break; evens.push(p); }

    arr = odds.concat(evens).slice(0,6).sort((a,b)=>a-b);
  }

  let bonus = weighted[Math.floor(rnd()*weighted.length)];
  while(arr.includes(bonus)){ bonus = weighted[Math.floor(rnd()*weighted.length)]; }
  return { numbers: arr, bonus };
}

export default function RecommendPage() {
  const [nick, setNick] = useState("회원님");
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setUserLoading(true);
        const { data: me } = await api.get("/auth/me");
        if (!alive) return;
        const next = me?.nickname || me?.name || me?.email || "회원님";
        setNick(next);
      } catch {
        setNick("회원님");
      } finally {
        if (alive) setUserLoading(false);
      }
    })();

    const onAuthChanged = (e) => {
      const me = e?.detail || {};
      const next = me?.nickname || me?.name || me?.email || "회원님";
      setNick(next);
    };
    window.addEventListener("auth-changed", onAuthChanged);
    return () => {
      alive = false;
      window.removeEventListener("auth-changed", onAuthChanged);
    };
  }, []);

  const [settings, setSettings] = useState({
    freqBias: false,        // 출현 빈도
    trendYM: false,         // 연/월 트렌드
    bonusStats: false,      // 보너스 통계
    rangeEven: false,       // 구간: 고르게
    rangeWide: false,       // 구간: 퍼지게
    parity: "none",         // 홀짝 비율
    sumOn: false,           // 번호합
    pairOn: false,          // 번호 페어
    gapOn: false,           // 번호 간격
    colors: { yellow:false, blue:false, red:false, gray:false, green:false },
  });

  const [order, setOrder] = useState([]);

  const setActiveInOrder = (key, on) => {
    setOrder(prev => {
      if (on) {
        return prev.includes(key) ? prev : [...prev, key];
      }
      return prev.filter(k => k !== key);
    });
  };

  const flip = (key) => {
    setSettings(s => {
      const next = { ...s, [key]: !s[key] };
      setActiveInOrder(key, next[key]);
      return next;
    });
  };

  const toggleColor = (k) => {
    setSettings(s => {
      const nextColors = { ...s.colors, [k]: !s.colors[k] };
      const next = { ...s, colors: nextColors };
      const any = Object.values(nextColors).some(Boolean);
      setActiveInOrder("colors", any);
      return next;
    });
  };

  const toggleRange = (key) => {
    setSettings(s => {
      const next = { ...s, [key]: !s[key] };
      const on = (key === "rangeEven" ? !s[key] : next.rangeEven) || (key === "rangeWide" ? !s[key] : next.rangeWide);
      setActiveInOrder("range", on);
      return next;
    });
  };

  const changeParity = (val) => {
    setSettings(s => ({ ...s, parity: val }));
    setActiveInOrder("parity", val !== "none");
  };

  const resetAll = () => {
    setSettings({
      freqBias: false,
      trendYM: false,
      bonusStats: false,
      rangeEven: false,
      rangeWide: false,
      parity: "none",
      sumOn: false,
      pairOn: false,
      gapOn: false,
      colors: { yellow:false, blue:false, red:false, gray:false, green:false },
    });
    setOrder([]);
    setResult(null);
  };

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const fake = generateNumbers(settings);
      setResult(fake);
    } finally {
      setLoading(false);
    }
  };

  const anyColor = useMemo(() => Object.values(settings.colors).some(Boolean), [settings.colors]);
  const rangeOn = settings.rangeEven || settings.rangeWide;

  const activeMap = {
    freqBias: settings.freqBias,
    colors: anyColor,
    trendYM: settings.trendYM,
    bonusStats: settings.bonusStats,
    range: rangeOn,
    parity: settings.parity !== "none",
    sumOn: settings.sumOn,
    pairOn: settings.pairOn,
    gapOn: settings.gapOn,
  };

  const detailByKey = (k) => {
    switch (k) {
      case "freqBias":
        return { title: "출현 빈도", lines: ["자주 나온 번호에 가중치 부여"] };
      case "colors": {
        const lines = [];
        if (settings.colors.yellow) lines.push("노랑 (1~10)");
        if (settings.colors.blue)   lines.push("파랑 (11~20)");
        if (settings.colors.red)    lines.push("빨강 (21~30)");
        if (settings.colors.gray)   lines.push("회색 (31~40)");
        if (settings.colors.green)  lines.push("초록 (41~45)");
        return { title: "색상 분포", lines: lines.length ? lines : ["선택된 색상 없음"] };
      }
      case "trendYM":
        return { title: "연/월별 트렌드", lines: ["최근 회차 트렌드 반영"] };
      case "bonusStats":
        return { title: "보너스 번호 통계", lines: ["상대적으로 빈도가 높은 범위 우선"] };
      case "range": {
        const tags = [];
        if (settings.rangeEven) tags.push("고르게");
        if (settings.rangeWide) tags.push("퍼지게");
        return { title: "구간 분포", lines: [tags.length ? `${tags.join(" & ")} 분포 적용` : "선택된 옵션 없음"] };
      }
      case "parity":
        return { title: "홀짝 비율", lines: [settings.parity.replace("-", " : ")] };
      case "sumOn":
        return { title: "번호합", lines: ["극단값 회피"] };
      case "pairOn":
        return { title: "번호 페어", lines: ["동반 출현 조합 고려"] };
      case "gapOn":
        return { title: "번호 간격", lines: ["연속/좁은 간격 완화"] };
      default:
        return null;
    }
  };

  const orderedDetails = order
    .filter(k => activeMap[k])
    .map(k => ({ key: k, ...detailByKey(k) }))
    .filter(Boolean);

  return (
    <div className="rec-page">
      <div className="rec-inner">
        {/* 왼쪽: 설정 */}
        <section className="rec-left">
          <div className="rec-left-top">
            <h1 className="rec-title">AI 로또 설정</h1>
            <p className="rec-sub">선택한 가중치에 따라 추천 번호가 달라집니다.</p>
          </div>

          <div className="rec-body">
            {/* 출현 빈도 */}
            <div className="ctl-row">
              <div className="ctl-label">
                <div className="ctl-title">출현 빈도</div>
                <div className="ctl-desc">자주 등장한 번호를 더 반영해 추천해요</div>
              </div>
              <button className={`sw ${settings.freqBias?"on":""}`} onClick={()=>flip("freqBias")} aria-pressed={settings.freqBias}><span/></button>
            </div>

            {/* 색상 분포 */}
            <div className="ctl-row">
              <div className="ctl-label">
                <div className="ctl-title">색상 분포</div>
                <div className="ctl-desc">원하는 공 색상 비율에 맞춰 조절해요</div>
              </div>
              <div className="color-pills" role="group" aria-label="색상 분포">
                {[
                  ["yellow","노랑"],["blue","파랑"],["red","빨강"],["gray","회색"],["green","초록"],
                ].map(([key,label])=>(
                  <label key={key} className={`color-pill ${settings.colors[key]?"on":""}`}>
                    <input type="checkbox" checked={!!settings.colors[key]} onChange={()=>toggleColor(key)} />
                    <span className={`dot ${key}`} aria-hidden="true" />
                    <span className="name">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 연/월 트렌드 */}
            <div className="ctl-row">
              <div className="ctl-label">
                <div className="ctl-title">연도/월별 트렌드</div>
                <div className="ctl-desc">최근 회차에서 많이 나온 번호를 반영해요</div>
              </div>
              <button className={`sw ${settings.trendYM?"on":""}`} onClick={()=>flip("trendYM")} aria-pressed={settings.trendYM}><span/></button>
            </div>

            {/* 보너스 통계 */}
            <div className="ctl-row">
              <div className="ctl-label">
                <div className="ctl-title">보너스 번호 통계</div>
                <div className="ctl-desc">보너스 번호로 자주 나온 숫자도 고려해요</div>
              </div>
              <button className={`sw ${settings.bonusStats?"on":""}`} onClick={()=>flip("bonusStats")} aria-pressed={settings.bonusStats}><span/></button>
            </div>

            {/* 구간 분포 */}
            <div className="ctl-row">
              <div className="ctl-label">
                <div className="ctl-title">구간 분포</div>
                <div className="ctl-desc">번호가 고르게/퍼지도록 구간을 나눠 추천해요</div>
              </div>
              <div className="chip-group">
                <button type="button" className={`chip ${settings.rangeEven?"on":""}`} onClick={()=>toggleRange("rangeEven")}>고르게</button>
                <button type="button" className={`chip ${settings.rangeWide?"on":""}`} onClick={()=>toggleRange("rangeWide")}>퍼지게</button>
              </div>
            </div>

            {/* 홀짝 비율 */}
            <div className="ctl-row">
              <div className="ctl-label">
                <div className="ctl-title">홀짝 비율</div>
                <div className="ctl-desc">홀/짝 개수를 균형있게 맞춰요</div>
              </div>
              <select className="sel" value={settings.parity} onChange={(e)=>changeParity(e.target.value)}>
                <option value="none">Option</option>
                <option value="0-6">홀 0개, 짝 6개</option>
                <option value="1-5">홀 1개, 짝 5개</option>
                <option value="2-4">홀 2개, 짝 4개</option>
                <option value="3-3">홀 3개, 짝 3개</option>
                <option value="4-2">홀 4개, 짝 2개</option>
                <option value="5-1">홀 5개, 짝 1개</option>
                <option value="6-0">홀 6개, 짝 0개</option>
              </select>
            </div>

            {/* 번호합 */}
            <div className="ctl-row">
              <div className="ctl-label">
                <div className="ctl-title">번호합</div>
                <div className="ctl-desc">추천 번호들의 합이 적당한 범위에 있도록 조정해요</div>
              </div>
              <button className={`sw ${settings.sumOn?"on":""}`} onClick={()=>flip("sumOn")} aria-pressed={settings.sumOn}><span/></button>
            </div>

            {/* 번호 페어 */}
            <div className="ctl-row">
              <div className="ctl-label">
                <div className="ctl-title">번호 페어</div>
                <div className="ctl-desc">자주 같이 나오는 번호쌍을 고려해요</div>
              </div>
              <button className={`sw ${settings.pairOn?"on":""}`} onClick={()=>flip("pairOn")} aria-pressed={settings.pairOn}><span/></button>
            </div>

            {/* 번호 간격 */}
            <div className="ctl-row">
              <div className="ctl-label">
                <div className="ctl-title">번호 간격</div>
                <div className="ctl-desc">번호 간 거리 차이가 너무 좁지 않게 조정해요</div>
              </div>
              <button className={`sw ${settings.gapOn?"on":""}`} onClick={()=>flip("gapOn")} aria-pressed={settings.gapOn}><span/></button>
            </div>

            {/* 액션: 생성 / 초기화 */}
            <div className="rec-actions">
              <button type="button" className="rec-reset" onClick={resetAll}>
                초기화
              </button>
              <button type="button" className="rec-generate" onClick={handleGenerate} disabled={loading}>
                {loading ? "생성 중..." : "번호 생성"}
              </button>
            </div>

            <p className="rec-footnote">주의: 최적화 AI 번호 생성 서비스는 향후 제공 예정입니다.</p>
          </div>
        </section>

        {/* 오른쪽: 결과/설명 */}
        <section className="rec-right">
          <h2 className="res-title">
            {userLoading ? (
              "불러오는 중…"
            ) : (
              <>
                <span style={{ color: "var(--brand)" }}>{nick}</span>님이 생성한{" "}
                <span style={{ color: "var(--brand)" }}>1167회차</span> 당첨 예상 로또 번호
              </>
            )}
          </h2>

          <div className="res-balls">
            {(result?.numbers ?? [11,17,25,36,39,45]).map((n,i)=>(
              <span key={i} className="ball-pill" style={{background:ballColor(n)}}>{n}</span>
            ))}
            <span className="ball-plus">+</span>
            <span className="ball-pill bonus">{result?.bonus ?? 3}</span>
          </div>

          <div className="res-sections">
            {order.filter(k => activeMap[k]).length === 0 ? (
              <div className="res-placeholder">왼쪽에서 가중치를 선택하면, 선택한 순서대로 설명이 표시됩니다.</div>
            ) : (
              order
                .filter(k => activeMap[k])
                .map((k, idx) => {
                  const info = detailByKey(k);
                  if (!info) return null;
                  return (
                    <article key={k} className="res-item">
                      <div className="num-badge">{idx + 1}</div>
                      <div className="res-item-body">
                        <h3 className="res-item-title">{info.title}</h3>
                        <ul className="res-lines">
                          {info.lines.map((t,i)=><li key={i}>{t}</li>)}
                        </ul>
                      </div>
                    </article>
                  );
                })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}