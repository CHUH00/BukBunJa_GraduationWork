import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend, Brush, AreaChart, Area
} from "recharts";
import useLottoStats from "../../hooks/useLottoStats";
import { ACCENT } from "../../lib/lottoStats";
import aiImg from "../../assets/image/5.png";

const GAP = 15;
const PAD_V = 20;
const PAD_H = 30;
const HEADER_H = 44;

const PAGE = { background: "#fdecee", height: "100vh", overflow: "hidden", padding: `${PAD_V}px ${PAD_H}px`, boxSizing: "border-box" };
const INNER = { maxWidth: 1400, margin: "0 auto", height: `calc(100vh - ${PAD_V * 2}px)`, display: "flex", flexDirection: "column", overflow: "hidden" };
const HEADER = { height: HEADER_H, display: "flex", alignItems: "center", marginBottom: GAP };
const ROWS = { height: `calc(100% - ${HEADER_H + GAP}px)`, display: "grid", gridTemplateRows: "repeat(3, minmax(0, 1fr))", gap: GAP, overflow: "hidden" };
const GRID3 = { display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: GAP, minHeight: 0 };
const CARD  = { background: "#fff", borderRadius: 12, boxShadow: "0 2px 6px rgba(0,0,0,0.06)", padding: 12, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" };
const TITLE = { fontSize: 15, fontWeight: 800, margin: 0, marginBottom: 6, color: "#2e0c0c" };
const SUB   = { fontSize: 11, color: "#a04d51", margin: "0 0 8px" };

const RESULT = {
  wrap: { display: "flex", flexDirection: "column", gap: 10 },
  title: { fontSize: 22, fontWeight: 900, color: "#2b0d0e", letterSpacing: -0.3, margin: 8 },
  date:  { fontSize: 14, color: "#a1696d", marginTop: 2 },
  bar: {
    background: "#7e2e32", color: "#fff", borderRadius: 16, padding: "25px 25px",
    display: "flex", gap: 20, alignItems: "center", justifyContent: "center", width: "100%", boxSizing: "border-box"
  },
  plus: { fontSize: 24, fontWeight: 900, margin: "0 6px" }
};

const fmtMonth = (s) => {
  if (!s) return "";
  const [y, m] = String(s).split("-");
  return `${y}-${m}`;
};

function ballSkin(hex) {
  return {
    width: 100, height: 60, borderRadius: "50%", display: "inline-flex",
    alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 18, letterSpacing: -0.5,
    background: `radial-gradient(65% 65% at 30% 30%, #ffffff66, transparent 70%), linear-gradient(180deg, ${hex} 5%, ${hex}CC 100%)`,
    boxShadow: "inset 0 -6px 10px rgba(0,0,0,0.18), inset 0 2px 4px rgba(255,255,255,0.35), 0 6px 12px rgba(0,0,0,0.12)",
    border: "1px solid rgba(0,0,0,0.05)"
  };
}
function ballColor(n) {
  if (n >= 1 && n <= 10)  return "#F2C600";
  if (n >= 11 && n <= 20) return "#2F7FD9";
  if (n >= 21 && n <= 30) return "#D64545";
  if (n >= 31 && n <= 40) return "#8B8F98";
  return "#3AA76D";
}
function sixNums(row) { return [1,2,3,4,5,6].map(i => Number(row[`당첨번호_${i}`])).filter(Boolean); }
function latestRow(rows) {
  if (!rows?.length) return null;
  const byRound = [...rows].filter(r => r["회차"]).sort((a,b)=> Number(b["회차"])-Number(a["회차"]));
  if (byRound.length) return byRound[0];
  const byDate = [...rows].filter(r => r["추첨일"]).sort((a,b)=> new Date(b["추첨일"])-new Date(a["추첨일"]));
  return byDate[0] || rows[0];
}
function formatDateDot(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()}. ${d.getMonth()+1}. ${d.getDate()}.`;
}
function eok(nWon) { return Math.round(Number(nWon || 0) / 100_000_000); }

export default function MainPage() {
  const { rows, stats, loading, error } = useLottoStats({ fetchUrl: "/lotto/draws" });
  const [selNum, setSelNum] = useState(1);
  const monthlyData = useMemo(
    () => stats?.monthlyNumberSeries?.[selNum] ?? [],
    [stats, selNum]
  );
  const latest = useMemo(() => latestRow(rows), [rows]);
  const latestSix = useMemo(() => (latest ? sixNums(latest) : []), [latest]);
  const latestBonus = latest ? Number(latest["보너스번호"]) : null;

  const firstPrizeList = useMemo(() => {
    const src = stats?.firstPrizeByRound ?? [];
    // 최신 6개만, 최신이 위로 오도록 역순 정렬
    return src.slice(-30).reverse().map(r => {
      // amount가 1인당 금액일 수도 있고 총액일 수도 있음 → winners가 있으면 총액 추정
      const total = r.winners && r.amount ? r.amount * r.winners : (r.amount || 0);
      const per   = r.winners ? Math.round(total / r.winners) : 0;
      return { round: r.round, totalEok: eok(total), winners: r.winners || 0, perEok: eok(per) };
    });
  }, [stats]);

  const recentRounds = useMemo(() => {
    return [...rows]
      .filter(r => r["회차"])
      .sort((a,b)=> Number(b["회차"]) - Number(a["회차"]))
      .slice(0, 50)
      .map(r => ({
        round: r["회차"],
        date: formatDateDot(r["추첨일"]),
        numbers: sixNums(r),
        bonus: Number(r["보너스번호"] || 0),
      }));
  }, [rows]);

  const recentFirstWinners = useMemo(() => {
    const data = stats?.recentFirstPrizeWinners ?? [];
    const total = data.reduce((s, d) => s + (d.value || 0), 0);
    return { data, total };
  }, [stats]);

  if (loading) return <div style={{ padding: 20 }}>데이터 불러오는 중…</div>;
  if (error)   return <div style={{ padding: 20, color: "crimson" }}>오류: {error}</div>;
  if (!stats)  return <div style={{ padding: 20 }}>데이터 없음</div>;

  const top5 = [...stats.freqData].sort((a,b)=>b.value-a.value).slice(0,5);
  const bottom5 = [...stats.freqData].sort((a,b)=>a.value-b.value).slice(0,5);
  const PIE_COLORS = (stats.colorData || []).map(d => d.color);

  return (
    <div style={PAGE}>
      <div style={INNER}>
        <div style={HEADER}>
          <h1 style={{ fontSize: "40px", fontWeight:800}}>복권을 분석하는 자들</h1>

        </div>

        <div style={ROWS}>
          {/* 1행 */}
          <div style={GRID3}>
            <div style={CARD}>
              <div style={RESULT.wrap}>
                <h3 style={RESULT.title}>
                  {latest?.["회차"] ? `${latest["회차"]}회차 로또6/45 당첨 결과` : "최신 당첨 결과"}
                </h3>
                <div style={RESULT.date}>
                  {latest?.["추첨일"] ? new Date(latest["추첨일"]).toLocaleDateString() + " 추첨된 번호입니다." : ""}
                </div>
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", minHeight: 0 }}>
                <div style={RESULT.bar}>
                  {latestSix.map(n => <span key={n} style={ballSkin(ballColor(n))}>{n}</span>)}
                  {latestBonus ? (
                  <>
                    <span style={RESULT.plus}>+</span>
                    <span style={ballSkin(ballColor(latestBonus))}>{latestBonus}</span>
                  </>
                  ) : null}
                </div>
              </div>
            </div>

            <div style={CARD}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#24304a" }}>최근 1등 당첨자 수 통계</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#24304a" }}>
                  {recentFirstWinners.total}<span style={{ fontSize: 13, color: "#8b93a6", marginLeft: 4 }}>명</span>
                </div>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={recentFirstWinners.data} margin={{ top: 6, right: 8, left: 0, bottom: 4 }}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT} stopOpacity={1} />
                        <stop offset="100%" stopColor={ACCENT} stopOpacity={0.25} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={CARD}>
              <div style={TITLE}>회차별 1등 총 당첨금</div>
              <div style={{ border: "1px solid #f3c6cb", background: "#fff7f8", borderRadius: 10, padding: 6, flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", fontSize: 11, fontWeight: 700, color: "#8b6c6e", padding: "4px 6px" }}>
                  <div>회차</div><div>금액</div>
                </div>
                <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                  {firstPrizeList.map(r => (
                    <div key={r.round} style={{ display: "grid", gridTemplateColumns: "1fr 2fr", padding: "6px", borderTop: "1px solid #f3e1e3", alignItems: "center" }}>
                      <div style={{ fontWeight: 800, color: "#331314" }}>{r.round}</div>
                      <div style={{ fontWeight: 700, color: "#7d2a2f" }}>
                        {r.totalEok}억원
                        <span style={{ color: "#9a6b6e", fontWeight: 600 }}> ( {r.winners}명 / {r.perEok}억 )</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2행 — 합친 카드 + 색상 파이 */}
          <div style={GRID3}>
            <div style={CARD}>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#2b0d0e", marginBottom: 2 }}>번호 통계 분석</div>
              <div style={{ fontSize: 12, color: "#a04d51", marginBottom: 8 }}>전체 데이터 기준</div>
              <div style={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: "#fff8f8", borderRadius: 12, padding: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#4b0f12", marginBottom: 15 }}>자주 등장한 번호 TOP5</div>
                  <div style={{ height: "calc(100% - 24px)" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={top5}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" name="출현" fill={ACCENT} radius={[6,6,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div style={{ background: "#fff8f8", borderRadius: 12, padding: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#4b0f12", marginBottom: 15 }}>거의 등장하지 않은 번호 TOP5</div>
                  <div style={{ height: "calc(100% - 24px)" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bottom5}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" name="출현" fill={ACCENT} radius={[6,6,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            <div style={CARD}>
              <div style={TITLE}>번호 색상별 분포</div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip />
                    <Legend 
                        verticalAlign="bottom" 
                        height={30} 
                        wrapperStyle={{ fontSize: 11 }}
                    />
                    <Pie
                        data={stats.colorData}
                        dataKey="value"
                        nameKey="name"   // 색상 글자 포함 그대로 유지
                        outerRadius={80}
                        paddingAngle={2}
                        label={false}      // 파이 조각 숫자 라벨 제거
                        labelLine={false}  // 라벨 가이드 라인 제거
                        >
                        {(stats.colorData || []).map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={CARD}>
              <div style={TITLE}>최근 회차</div>
              <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
              {recentRounds.map((it, idx) => (
                  <div
                    key={it.round}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "75px 1fr",   // ← 2열: 왼쪽(회차+날짜), 오른쪽(번호)
                      alignItems: "center",
                      gap: 0,
                      padding: "8px 0",
                      borderTop: idx === 0 ? "none" : "1px solid #f1d0d4"
                    }}
                  >
                    {/* 왼쪽: 회차(위) + 날짜(아래) */}
                    <div>
                      <div style={{ fontWeight: 900, color: "#7f1d1d", fontSize: 16 }}>
                        {it.round}<span style={{ fontSize: 12 }}>회</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#7a6a6a", marginTop: 6 }}>
                        {it.date}
                      </div>
                    </div>

                    {/* 오른쪽: 번호 + 보너스 */}
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                      {it.numbers.map(n => (
                        <span
                          key={n}
                          style={{
                            width: 24, height: 24, borderRadius: "50%",
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontWeight: 800, background: ballColor(n), fontSize: 11
                          }}
                        >
                          {n}
                        </span>
                      ))}
                      <span style={{ display: "inline-flex", alignItems: "center", marginLeft: 6 }}>
                        <span style={{ color: "#8b0e13", fontWeight: 800, marginRight: 4, fontSize: 12 }}>+</span>
                        <span
                          style={{
                            width: 24, height: 24, borderRadius: "50%",
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontWeight: 800, fontSize: 11,
                            background: ballColor(it.bonus)
                          }}
                        >
                          {it.bonus}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3행 */}
          <div style={GRID3}>
            <div style={CARD}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ ...TITLE, marginBottom: 0 }}>월별 출현 추이</div>
                  <div style={SUB}>선택한 번호의 월별 출현수</div>
                </div>
                {/* 번호 선택 드롭다운 */}
                <select
                  value={selNum}
                  onChange={(e) => setSelNum(Number(e.target.value))}
                  style={{
                    padding: "6px 10px", borderRadius: 8, border: "1px solid #e6c4c7",
                    fontWeight: 800, color: "#7d2a2f", background: "#fff"
                  }}
                >
                  {Array.from({ length: 45 }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n}번</option>
                  ))}
                </select>
              </div>

              <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart
                     data={monthlyData}
                     margin={{ top: 10, right: 10, left: 0, bottom: 20 }} // 브러시 공간 확보
                   >
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis
                       dataKey="name"
                       tick={{ fontSize: 10 }}
                       tickFormatter={fmtMonth}
                       interval="preserveStartEnd"
                       minTickGap={20}
                     />
                     <YAxis allowDecimals={false} domain={[0, 'dataMax+1']} />
                     <Tooltip
                       formatter={(v) => [`${v}회`, `${selNum}번`]}
                       labelFormatter={(label) => fmtMonth(label)}
                     />
                     <Line
                       type="monotone"
                       dataKey="value"
                       name={`${selNum}번`}
                       dot={false}
                       activeDot={{ r: 3 }}
                       stroke={ACCENT}
                       strokeWidth={2}
                     />
                     <Brush
                       dataKey="name"
                       height={30}
                       stroke={ACCENT}
                       fill="rgba(156,61,65,0.09)"        // 브러시 영역 배경
                       travellerWidth={12}                 // 핸들 넓이
                       tickFormatter={fmtMonth}
                       startIndex={Math.max(0, monthlyData.length - 24)}  // 기본: 최근 24개월
                       endIndex={monthlyData.length - 1}
                     >
                       <AreaChart data={monthlyData}>
                         <defs>
                           <linearGradient id="miniGrad" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="0%" stopColor={ACCENT} stopOpacity="0.55" />
                             <stop offset="100%" stopColor={ACCENT} stopOpacity="0.05" />
                           </linearGradient>
                         </defs>
                         <Area type="monotone" dataKey="value" stroke={ACCENT} fill="url(#miniGrad)" />
                       </AreaChart>
                     </Brush>
                   </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={CARD}>
              <div style={TITLE}>AI 기반 로또 번호 추천</div>
              <p style={{ color: "#7a6a6a", marginTop: 0, marginBottom: 12 }}>
                다음 회차를 위한 추천 번호를 받아보세요.
              </p>

              <div
                style={{
                  position: "relative",
                  borderRadius: 12,
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  marginBottom: 8,
                }}
              >
                <img
                  src={aiImg}
                  alt="AI 추천 일러스트"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                  }}
                />

                <button
                  type="button"
                  onClick={() => alert("추천 로직 연결 필요")}
                  style={{
                    position: "absolute",
                    top: "35%",     // ← 막대 왼쪽 대각선 위에 맞춰 조정
                    left: "20%",    // ← 좌표 조절
                    transform: "translate(-50%, -50%)",
                    padding: "10px 16px",
                    borderRadius: 12,
                    background: "#8b1d1d",
                    color: "#fff",
                    fontWeight: 800,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 6px 18px rgba(139,29,29,0.25)"
                  }}
                >
                  AI 추천
                </button>
              </div>
            </div>

            <div style={CARD}>
              <div style={TITLE}>커뮤니티</div>
              <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                {["흑우진스", "윤혁시치", "경민"].map((name, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f1d0d4" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#f5d3d6" }} />
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: "#1f2937" }}>{name}</div>
                        <div style={{ fontSize: 11, color: "#7a6a6a" }}>@user_{idx + 1}</div>
                      </div>
                    </div>
                    <button style={{ border: "1px solid #e7c0c5", background: "#fff", borderRadius: 10, padding: "6px 10px", cursor: "pointer", fontWeight: 700 }}>
                      프로필
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}