import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./recommend.css";
import { api } from "../../api/client";

function ballColor(n) {
  const x = Number(n);
  if (x >= 1 && x <= 10) return "#fbc400";
  if (x >= 11 && x <= 20) return "#69c8f2";
  if (x >= 21 && x <= 30) return "#ff7272";
  if (x >= 31 && x <= 40) return "#aaaaaa";
  return "#b0d840";
}

async function getHistory(limit = 2000) {
  const { data } = await api.get(`/lotto/history?limit=${limit}`);
  return data;
}

export default function RecommendPage() {
  const [nick, setNick] = useState("비회원");
  const [latestDraw, setLatestDraw] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const { data: me } = await api.get("/auth/me");
        // prefer DB `name` column; fall back to other fields if present
        const userName = me?.name;
        setNick(userName ? userName : "비회원");
      } catch (err) {
        console.error("로그인 사용자 정보 불러오기 실패:", err);
        setNick("비회원");
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await getHistory();
        if (Array.isArray(data) && data.length > 0) {
          setLatestDraw(Number(data[0].draw_number));
          // Optional: store bonus for UI display
          setResult(prev => ({ ...prev, bonus: data[0].bonus_number }));
        } else {
          setLatestDraw(0);
        }
      } catch (err) {
        console.error("최근 회차 불러오기 실패:", err);
        setLatestDraw(0);
      }
    })();
  }, []);

  // 이하 기존 RecommendPage 코드 (설정/번호 생성/설명 등)
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
    if (nick === "비회원") {
      alert("해당 기능은 복분자 회원에게만 제공되는 기능입니다. 로그인 혹은 회원가입 후 생성 가능합니다.");
      return;
    }
    setLoading(true);
    try {
      // Prepare payload with keys in order of selection
      const payload = {};
      order.forEach(key => {
        switch(key) {
          case "freqBias":
            payload.freq_bias = settings.freqBias;
            break;
          case "trendYM":
            payload.trend_ym = settings.trendYM;
            break;
          case "bonusStats":
            payload.bonus_stats = settings.bonusStats;
            break;
          case "range":
            payload.range_even = settings.rangeEven;
            payload.range_wide = settings.rangeWide;
            break;
          case "parity":
            payload.parity = settings.parity;
            break;
          case "sumOn":
            payload.sum_on = settings.sumOn;
            break;
          case "pairOn":
            payload.pair_on = settings.pairOn;
            break;
          case "gapOn":
            payload.gap_on = settings.gapOn;
            break;
          case "colors":
            payload.colors = {
              yellow: settings.colors.yellow,
              blue: settings.colors.blue,
              red: settings.colors.red,
              gray: settings.colors.gray,
              green: settings.colors.green,
            };
            break;
          default:
            break;
        }
      });
      // Ensure to include all options even if not in order (for completeness)
      // But since the instruction is to send in order and include all selected, 
      // above loop covers selected options in order.

      console.log("Payload sent to /recommend:", payload);
      const { data } = await api.post("/recommend", payload);
      // Ensure result includes bonus
      setResult({
        numbers: data.numbers ?? [],
        bonus: data.bonus ?? null,
        score: data.score ?? null
      });
    } catch (err) {
      console.error("추천 번호 생성 실패:", err);
      setResult(null);
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

  const nextDraw = latestDraw + 1;

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

            <p className="rec-footnote">
              주의: ‘복분자’의 AI 기반 추천 기능으로 생성된 예상 로또 번호는 실제 로또6/45 당첨을 보장하지 않습니다.<br/>
              단순 참고용으로만 사용하시고 반드시 본인의 판단에 따라 신중히 선택하십시오.
            </p>
          </div>
        </section>

        {/* 오른쪽: 결과/설명 */}
        <section className="rec-right">
          <h2 className="res-title">
            <span style={{ color: "var(--brand)" }}>{nick}</span>님이 생성한{" "}
            <span style={{ color: "var(--brand)" }}>{nextDraw}</span>회차 당첨 예상 로또 번호
          </h2>

          <div className="res-balls">
            {(result?.numbers ?? [1,11,21,31,41,45]).map((n,i)=>(
              <span key={i} className="ball-pill" style={{background:ballColor(n)}}>{n}</span>
            ))}
            <span className="ball-plus">+</span>
            <span className="ball-pill bonus">{result?.bonus ?? "-"}</span>
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