import React, { useState, useMemo } from "react";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell, LineChart, Line, Brush, AreaChart, Area
} from "recharts";

import useLottoStats from "../../hooks/useLottoStats";
import { ACCENT, BALL_COLOR_META } from "../../lib/lottoStats";

// ---------- 스타일/툴팁/탭 (기존 그대로) ----------
const CARD = {
  wrap:{ background:"#fff", borderRadius:14, boxShadow:"0 2px 8px rgba(0,0,0,0.06)", padding:20, minHeight:320, display:"flex", flexDirection:"column" },
  title:{ fontSize:18, fontWeight:700, marginBottom:10 },
  subtitle:{ fontSize:12, color:"#cc6f6f", marginBottom:10 }
};
const GRID  = {
  page:{ background:"#fdecee", minHeight:"100vh", padding:"28px 20px" },
  inner:{ maxWidth:1200, margin:"0 auto" },
  header:{ marginBottom:18 },
  tabs:{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:18 },
  tag:{ padding:"8px 12px", borderRadius:10, background:"#fff", border:"1px solid #f3c6cb", fontSize:13, cursor:"pointer" },
  grid:{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:16 }
};

// ── “전체보기=카드 그리드”용 메타 ──
const TAB_META = [
  { key:"freq",     label:"숫자 출현 빈도",        icon:"📊", sub:"역대 많이 나온 번호 막대그래프" },
  { key:"color",    label:"색상별 출현 빈도",      icon:"🎨", sub:"공 색상 흐름이 신경 쓰인다면 추천!" },
  { key:"bonus",    label:"보너스 번호 출현 빈도", icon:"✨", sub:"보너스 번호까지 꼼꼼히 분석!" },
  { key:"ym",       label:"연도별·월별 출현 빈도", icon:"📈", sub:"요즘 잘 나오는 번호가 뭔지 확인!" },
  { key:"range",    label:"번호 구간별 출현 빈도", icon:"🧱", sub:"번호대별 출현 패턴을 한눈에!" },
  { key:"oddEven",  label:"번호 홀짝 비율",        icon:"⚖️", sub:"홀수/짝수 비율 체크!" },
  { key:"sum",      label:"번호 합 분포",          icon:"➕", sub:"총합 분포 히스토그램" },
  { key:"pair",     label:"자주 함께 등장한 번호쌍",icon:"🤝", sub:"붙어 다니는 번호 조합 Top" },
  { key:"gap",      label:"번호 간 간격 분석",      icon:"↔️", sub:"인접 번호 차이 분포" },
];

const COLOR_BY_KEY = Object.fromEntries(BALL_COLOR_META.map(m => [m.key, m.color]));
const PAD_V = 20;
const PAD_H = 30;
const HEADER_H = 44;
const PAGE  = { background:"#fdecee", height:"100vh", overflow:"hidden" };
const INNER = {
  maxWidth:1500, margin:"0 auto",
  height:`calc(100vh - ${PAD_V*2}px)`,
  display:"flex", flexDirection:"column",
  padding:`${PAD_V}px ${PAD_H}px`,
  boxSizing:"border-box"
};
const HEAD  = { marginBottom:18, flex:"0 0 auto", height:HEADER_H, display:"flex", flexDirection:"column", justifyContent:"center" };
const BODY  = { flex:"1 1 0", minHeight:0, overflow:"hidden" };

const SimpleTooltip = ({ active, payload, label }) => active && payload?.length ? (
  <div style={{ background:"rgba(255,255,255,0.95)", border:"1px solid #eee", padding:8, fontSize:12 }}>
    <div><b>{label}</b></div>
    {payload.map((p, idx) => (
      <div key={idx} style={{ display:"flex", gap:8 }}>
        <span style={{ width:10, height:10, background:p.color }} />
        <span>{p.name}: {p.value}</span>
      </div>
    ))}
  </div>
) : null;

// ---------- 재사용 가능한 “표시 전용” 컴포넌트 ----------
export function LottoCharts({ stats, active, setActive }) {
  const { freqData, bonusData, colorData, rangeData, oddEvenData, sumData, pairData, gapData, ymSeries, monthlyNumberSeries } = stats;
  const PIE_COLORS = colorData.map(d => d.color);
  const ODD_EVEN_COLORS = ['#3D7B9C', '#9C3D41'];
  const CHART_H = 420; // 단일 차트 화면에서의 높이 (스타일 변경 금지)
  const [selNum, setSelNum] = useState(1);

  // 월별 데이터 관련
  const monthlyData = useMemo(
    () => monthlyNumberSeries?.[selNum] ?? [],
    [monthlyNumberSeries, selNum]
  );
  const fmtMonth = (s) => {
    if (!s) return "";
    const [y, m] = String(s).split("-");
    return `${y}-${m}`;
  };
  const [brushRange, setBrushRange] = useState({ startIndex: 0, endIndex: Math.max(0, monthlyData.length - 1) });
  React.useEffect(() => {
    setBrushRange({ startIndex: Math.max(0, monthlyData.length - 24), endIndex: Math.max(0, monthlyData.length - 1) });
  }, [monthlyData]);
  const setPreset = (months) => {
    if (!monthlyData?.length) return;
    const end = monthlyData.length - 1;
    const start = Math.max(0, end - (months - 1));
    setBrushRange({ startIndex: start, endIndex: end });
  };

  const tagStyle = (k) => ({ ...GRID.tag, border: active === k ? "2px solid #e0949b" : "1px solid #f3c6cb", fontWeight: active === k ? 700 : 500 });

  // ── 전체보기 카드 그리드 (차트 미노출) ──
  if (!active) {
    return (
      <>
        <div style={GRID.tabs}>
          <button type="button" style={tagStyle(null)} onClick={() => setActive(null)}>전체보기</button>
          {TAB_META.map(t => (
            <button key={t.key} type="button" style={tagStyle(t.key)} onClick={() => setActive(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ ...GRID.grid, gridTemplateColumns:"repeat(3, 1fr)", gridAutoRows:"150px" }}>
          {TAB_META.map((t) => (
            <div
              key={t.key}
              onClick={() => setActive(t.key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e)=> (e.key === "Enter" || e.key === " ") && setActive(t.key)}
              style={{
                ...CARD.wrap,
                minHeight:0, height:"70%",
                cursor:"pointer",
                display:"grid",
                gridTemplateColumns:"56px 1fr 24px",
                alignItems:"center",
                columnGap:12
              }}
            >
              <div style={{ fontSize:28, textAlign:"center" }}>{t.icon}</div>
              <div>
                <div style={{ ...CARD.title, marginBottom:6 }}>{t.label}</div>
                <div style={{ ...CARD.subtitle, marginBottom:0, color:"#9a3c40" }}>{t.sub}</div>
              </div>
              <div style={{ fontSize:20, color:"#d08a92", justifySelf:"end" }}>➜</div>
            </div>
          ))}
        </div>
      </>
    );
  }

  // ── 특정 차트 단일 화면 ──
  return (
    <>
      {/* 탭 */}
      <div style={GRID.tabs}>
        <button type="button" style={tagStyle(null)} onClick={() => setActive(null)}>전체보기</button>
        {TAB_META.map(t => (
          <button key={t.key} type="button" style={tagStyle(t.key)} onClick={() => setActive(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 숫자 출현 빈도 */}
      {active === "freq" && (
        <div style={{ ...CARD.wrap, minHeight:0, height:"100%" }}>
          <div style={CARD.title}>숫자 출현 빈도</div>
          <div style={CARD.subtitle}>역대 많이 나온 번호 막대그래프</div>
          <div style={{ flex:1 }}>
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart data={freqData} margin={{ top: 50 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={25} />
                <YAxis />
                <Tooltip formatter={(v) => [`${v}회`, "출현 횟수"]} />
                <Bar dataKey="value">
                  {freqData.map((d, idx) => (
                    <Cell key={idx} fill={idx < 45 ? ACCENT : "#ccc"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 색상별 출현 빈도 */}
      {active === "color" && (
        <div style={{ ...CARD.wrap, minHeight:0, height:"100%" }}>
          <div style={CARD.title}>색상별 출현 빈도</div>
          <div style={CARD.subtitle}>공 색상 기준(1~10 노랑, 11~20 파랑, 21~30 빨강, 31~40 회색, 41~45 초록)</div>
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Legend verticalAlign="top" height={10} wrapperStyle={{ marginTop: 70 }} />
                <Pie
                  data={colorData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={170}
                  innerRadius={90}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  {colorData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 보너스 번호 출현 빈도 */}
      {active === "bonus" && (
        <div style={{ ...CARD.wrap, minHeight:0, height:"100%" }}>
          <div style={CARD.title}>보너스 번호 출현 빈도</div>
          <div style={CARD.subtitle}>보너스만 별도 집계</div>
          <div style={{ flex:1 }}>
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart data={bonusData} margin={{ top: 50 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} height={25} />
                <YAxis />
                <Tooltip content={<SimpleTooltip />} />
                <Bar name="보너스 출현" dataKey="value" fill={ACCENT} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 연/월별 출현 추이 */}
      {active === "ym" && (
        <div style={{ ...CARD.wrap, minHeight:0, height:"100%" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
            <div>
              <div style={CARD.title}>월별 출현 추이</div>
              <div style={CARD.subtitle}>선택한 번호의 월별 출현수</div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <select
                value={selNum}
                onChange={(e) => setSelNum(Number(e.target.value))}
                style={{ padding:"6px 10px", borderRadius:8, border:"1px solid #e6c4c7", fontWeight:700, color:"#7d2a2f", background:"#fff" }}
              >
                {Array.from({ length: 45 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n}번</option>
                ))}
              </select>
              <div style={{ display:"flex", gap:6 }}>
                <button type="button" onClick={() => setPreset(12)}  style={{ padding:"6px 10px", borderRadius:8, border:"1px solid #e6c4c7", background:"#fff", cursor:"pointer" }}>최근 12개월</button>
                <button type="button" onClick={() => setPreset(24)}  style={{ padding:"6px 10px", borderRadius:8, border:"1px solid #e6c4c7", background:"#fff", cursor:"pointer" }}>최근 24개월</button>
                <button type="button" onClick={() => setPreset(60)}  style={{ padding:"6px 10px", borderRadius:8, border:"1px solid #e6c4c7", background:"#fff", cursor:"pointer" }}>최근 60개월</button>
                <button type="button" onClick={() => setPreset(9999)} style={{ padding:"6px 10px", borderRadius:8, border:"1px solid #e6c4c7", background:"#fff", cursor:"pointer" }}>전체</button>
              </div>
            </div>
          </div>

          <div style={{ flex:1, minHeight:0 }}>
            <ResponsiveContainer width="100%" height={CHART_H}>
              <LineChart data={monthlyData} margin={{ top: 50 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize:10 }} tickFormatter={fmtMonth} interval="preserveStartEnd" minTickGap={20} />
                <YAxis allowDecimals={false} domain={[0, 'dataMax+1']} />
                <Tooltip />
                <Line type="monotone" dataKey="value" name="월별 출현수" dot={false} stroke={ACCENT} strokeWidth={2} activeDot={{ r:3 }} />
                <Brush
                  dataKey="name"
                  height={30}
                  stroke={ACCENT}
                  fill="rgba(156,61,65,0.09)"
                  travellerWidth={12}
                  tickFormatter={fmtMonth}
                  startIndex={brushRange.startIndex}
                  endIndex={brushRange.endIndex}
                  onChange={(range) => {
                    if (!range) return;
                    const { startIndex, endIndex } = range;
                    if (typeof startIndex === "number" && typeof endIndex === "number") {
                      setBrushRange({ startIndex, endIndex });
                    }
                  }}
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
      )}

      {/* 번호 구간별 출현 빈도 */}
      {active === "range" && (
        <div style={{ ...CARD.wrap, minHeight:0, height:"100%" }}>
          <div style={CARD.title}>번호 구간별 출현 빈도</div>
          <div style={CARD.subtitle}>1~10 / 11~20 / 21~30 / 31~40 / 41~45</div>
          <div style={{ flex:1 }}>
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart data={rangeData} margin={{ top: 50 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<SimpleTooltip />} />
                <Bar dataKey="value" name="출현">
                  {rangeData.map((d, idx) => (
                    <Cell key={idx} fill={COLOR_BY_KEY[d.name] || ACCENT} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 번호 홀짝 비율 */}
      {active === "oddEven" && (
        <div style={{ ...CARD.wrap, minHeight:0, height:"100%" }}>
          <div style={CARD.title}>번호 홀짝 비율</div>
          <div style={CARD.subtitle}>전체 번호 기준</div>

          {(() => {
            const total = oddEvenData.reduce((sum, d) => sum + d.value, 0);
            return (
              <div style={{ textAlign:"right", fontWeight:700, marginBottom:16, marginRight:170 }}>
                {oddEvenData.map((d, idx) => {
                  const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : 0;
                  return (
                    <span key={idx} style={{ color: ODD_EVEN_COLORS[idx], margin:"0 8px" }}>
                      {d.name} {d.value}개 ({pct}%)
                    </span>
                  );
                })}
              </div>
            );
          })()}

          <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", gap:2, minHeight:0 }}>
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart data={oddEvenData} margin={{ top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="출현 횟수">
                  {oddEvenData.map((_, idx) => (
                    <Cell key={idx} fill={ODD_EVEN_COLORS[idx]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <ResponsiveContainer width="100%" height={CHART_H}>
              <PieChart>
                <Tooltip />
                <Legend verticalAlign="bottom" height={27} wrapperStyle={{ marginTop: 12 }} />
                <Pie data={oddEvenData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={50} label>
                  {oddEvenData.map((_, idx) => (
                    <Cell key={idx} fill={ODD_EVEN_COLORS[idx]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 번호 합 분포 */}
      {active === "sum" && (
        <div style={{ ...CARD.wrap, minHeight:0, height:"100%" }}>
          <div style={CARD.title}>번호 합 분포</div>
          <div style={CARD.subtitle}>6개 합계의 히스토그램(폭 10)</div>
          <div style={{ flex:1 }}>
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart data={sumData} margin={{ top: 50 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<SimpleTooltip />} />
                <Bar name="회수" dataKey="value" fill={ACCENT} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 자주 함께 등장한 번호쌍 */}
      {active === "pair" && (
        <div style={{ ...CARD.wrap, minHeight:0, height:"100%" }}>
          <div style={CARD.title}>자주 함께 등장한 번호쌍</div>
          <div style={CARD.subtitle}>Top 20 조합</div>
          <div style={{ flex:1 }}>
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart data={pairData} margin={{ top: 50 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="pair" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip content={<SimpleTooltip />} />
                <Bar name="동시 출현" dataKey="value" fill={ACCENT} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 번호 간 간격 분석 */}
      {active === "gap" && (
        <div style={{ ...CARD.wrap, minHeight:0, height:"100%" }}>
          <div style={CARD.title}>번호 간 간격 분석</div>
          <div style={CARD.subtitle}>정렬 후 인접 번호 차이 분포</div>
          <div style={{ flex:1 }}>
            <ResponsiveContainer width="100%" height={CHART_H}>
              <AreaChart data={gapData} margin={{ top: 50 }}>
                <defs>
                  <linearGradient id="gapGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ACCENT} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={ACCENT} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="gap" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip content={<SimpleTooltip />} />
                <Area type="monotone" dataKey="value" stroke={ACCENT} fill="url(#gapGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  );
}

export default function AnalysisPage({ fetchUrl = "/lotto/draws", rows }) {
  const { stats, loading, error } = useLottoStats({ fetchUrl, rows });
  const [active, setActive] = useState(null);

  if (loading) return <div style={{ padding: 20 }}>데이터 불러오는 중…</div>;
  if (error)   return <div style={{ padding: 20, color: "crimson" }}>오류: {error}</div>;
  if (!stats)  return <div style={{ padding: 20 }}>데이터 없음</div>;

  return (
    <div style={PAGE}>
      <div style={INNER}>
        <div style={HEAD}>
          
          <h1 style={{ margin:0, fontSize: "40px", fontWeight:800 }}>
            번호 통계 분석
          </h1>
          <p style={{ margin:"6px 0 0 0", color:"#7f1d1d", fontSize:13 }}>
            9가지 기준으로 로또 번호 데이터를 분석한 대시보드
          </p>
        </div>
        <div style={BODY}>
          <LottoCharts stats={stats} active={active} setActive={setActive} />
        </div>
      </div>
    </div>
  );
}

export { default as useLottoStats } from "../../hooks/useLottoStats";
export { computeLottoStats, pickArray, BALL_COLOR_META as BALL_COLORS } from "../../lib/lottoStats";