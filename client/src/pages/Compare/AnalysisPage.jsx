// client/src/pages/Compare/AnalysisPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

/**
 * - 9개 차트(3x3) + 탭 클릭 시 해당 차트만 집중보기
 * - 기본 fetchUrl: "/lotto/draws"
 */

const ACCENT = "#9C3D41";

// ----- 스타일 -----
const CARD = {
  wrap: {
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    padding: 20,
    minHeight: 320,
    display: "flex",
    flexDirection: "column"
  },
  title: { fontSize: 18, fontWeight: 700, marginBottom: 10 },
  subtitle: { fontSize: 12, color: "#cc6f6f", marginBottom: 10 }
};

const GRID = {
  page: {
    background: "#fdecee",
    minHeight: "100vh",
    padding: "28px 20px"
  },
  inner: {
    maxWidth: 1200,
    margin: "0 auto"
  },
  header: {
    marginBottom: 18
  },
  tabs: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 18
  },
  tag: {
    padding: "8px 12px",
    borderRadius: 10,
    background: "#fff",
    border: "1px solid #f3c6cb",
    fontSize: 13,
    cursor: "pointer"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16
  }
};

// ----- 유틸/상수 -----
const BALL_COLORS = [
  { key: "1-10",  range: [1, 10],  name: "1~10 (Yellow)", color: "#F2C600" },
  { key: "11-20", range: [11, 20], name: "11~20 (Blue)",  color: "#2F7FD9" },
  { key: "21-30", range: [21, 30], name: "21~30 (Red)",   color: "#D64545" },
  { key: "31-40", range: [31, 40], name: "31~40 (Gray)",  color: "#8B8F98" },
  { key: "41-45", range: [41, 45], name: "41~45 (Green)", color: "#3AA76D" }
];

const RANGE_BUCKETS = BALL_COLORS.map(({ key, range }) => ({ key, range }));

function inRange(n, [a, b]) { return n >= a && n <= b; }
function numList(row) {
  return [1,2,3,4,5,6].map(i => Number(row[`당첨번호_${i}`]));
}
function toMonth(dateStr, yearFallback) {
  try {
    const d = dateStr ? new Date(dateStr) : null;
    const y = d ? d.getFullYear() : Number(yearFallback);
    const m = d ? (d.getMonth() + 1) : null;
    return { y, m };
  } catch {
    return { y: Number(yearFallback), m: null };
  }
}
function comboPairs(arr) {
  const out = [];
  for (let i=0; i<arr.length; i++) {
    for (let j=i+1; j<arr.length; j++) out.push([arr[i], arr[j]]);
  }
  return out;
}

const SimpleTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "rgba(255,255,255,0.95)", border: "1px solid #eee", padding: 8, fontSize: 12 }}>
        <div><b>{label}</b></div>
        {payload.map((p, idx) => (
          <div key={idx} style={{ display: "flex", gap: 8 }}>
            <span style={{ width: 10, height: 10, background: p.color }}></span>
            <span>{p.name}: {p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// 탭 정의
const TABS = [
  { key: "freq",     label: "숫자 출현 빈도" },
  { key: "color",    label: "색상별 출현 빈도" },
  { key: "bonus",    label: "보너스 번호 출현 빈도" },
  { key: "ym",       label: "연도별·월별 출현 빈도" },
  { key: "range",    label: "번호 구간별 출현 빈도" },
  { key: "oddEven",  label: "번호 홀짝 비율" },
  { key: "sum",      label: "번호 합 분포" },
  { key: "pair",     label: "자주 함께 등장한 번호쌍" },
  { key: "gap",      label: "번호 간 간격 분석" },
];

// ----- 메인 컴포넌트 -----
function LottoNumberStats({ fetchUrl = "/lotto/draws", rows: rowsProp }) {
  const hasExternalRows = Array.isArray(rowsProp) && rowsProp.length > 0;
  const [rows, setRows] = useState(hasExternalRows ? rowsProp : []);
  const [loading, setLoading] = useState(!hasExternalRows);
  const [error, setError] = useState(null);
  const [active, setActive] = useState(null); // null=전체보기

  const pickArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.rows)) return data.rows;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.result)) return data.result;
    if (data && typeof data === "object") {
      const firstArr = Object.values(data).find(Array.isArray);
      if (Array.isArray(firstArr)) return firstArr;
    }
    return null;
  };

  useEffect(() => {
    const hasExternalRowsNow = Array.isArray(rowsProp) && rowsProp.length > 0;
    if (hasExternalRowsNow) return;

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(fetchUrl, { validateStatus: () => true });
        if (!mounted) return;

        if (res.status !== 200) {
          setError(`HTTP ${res.status} (${res.headers?.["content-type"] || ""})`);
          setRows([]);
          return;
        }
        const arr = pickArray(res.data);
        if (!arr) {
          setError("JSON 배열 아님(응답 래핑/키 확인 필요).");
          setRows([]);
          return;
        }
        setRows(arr);
      } catch (e) {
        setError(e?.message || "데이터 로드 실패");
      } finally {
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [fetchUrl, rowsProp]);

  const stats = useMemo(() => {
    if (!rows?.length) return null;

    const freq = Array.from({ length: 45 }, (_, i) => ({ num: i + 1, count: 0 }));
    const bonusFreq = Array.from({ length: 45 }, (_, i) => ({ num: i + 1, count: 0 }));
    const colorFreq = BALL_COLORS.map(({ key, name, color }) => ({ key, name, color, count: 0 }));
    const ymMap = new Map();
    const rangeFreq = RANGE_BUCKETS.map(({ key }) => ({ key, count: 0 }));
    let odd = 0, even = 0;
    const sumCounts = new Map();
    const SUM_MIN = 21, SUM_MAX = 255, BIN = 10;
    const pairCounts = new Map();
    const gapCounts = new Map();

    for (const row of rows) {
      const six = numList(row).sort((a,b)=>a-b);

      let sum = 0;
      for (const n of six) {
        sum += n;
        freq[n - 1].count++;

        const colorIdx = BALL_COLORS.findIndex(({ range }) => inRange(n, range));
        if (colorIdx >= 0) colorFreq[colorIdx].count++;

        const rIdx = RANGE_BUCKETS.findIndex(({ range }) => inRange(n, range));
        if (rIdx >= 0) rangeFreq[rIdx].count++;

        if (n % 2 === 0) even += 1; else odd += 1;
      }

      const binStart = Math.floor((Math.max(SUM_MIN, Math.min(SUM_MAX, sum)) - SUM_MIN) / BIN) * BIN + SUM_MIN;
      const label = `${binStart}-${binStart + BIN - 1}`;
      sumCounts.set(label, (sumCounts.get(label) || 0) + 1);

      const { y, m } = toMonth(row["추첨일"], row["년도"]);
      if (y && m) {
        const key = `${y}-${String(m).padStart(2, "0")}`;
        ymMap.set(key, (ymMap.get(key) || 0) + six.length);
      }

      for (const [a, b] of comboPairs(six)) {
        const key = `${a}-${b}`;
        pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
      }

      for (let i=1; i<six.length; i++) {
        const g = six[i] - six[i-1];
        gapCounts.set(g, (gapCounts.get(g) || 0) + 1);
      }

      const bonus = Number(row["보너스번호"]);
      if (bonus >= 1 && bonus <= 45) {
        bonusFreq[bonus - 1].count++;
      }
    }

    const freqData = freq.map(d => ({ name: d.num, value: d.count }));
    const bonusData = bonusFreq.filter(d => d.count > 0).map(d => ({ name: d.num, value: d.count }));
    const colorData = colorFreq.map(d => ({ name: d.name, value: d.count, color: d.color }));
    const rangeData = rangeFreq.map(d => ({ name: d.key, value: d.count }));
    const oddEvenData = [{ name: "홀수", value: odd }, { name: "짝수", value: even }];
    const sumData = Array.from(sumCounts.entries())
      .sort((a,b)=>Number(a[0].split("-")[0])-Number(b[0].split("-")[0]))
      .map(([name, value]) => ({ name, value }));
    const pairData = Array.from(pairCounts.entries())
      .map(([k, v]) => ({ pair: k, value: v }))
      .sort((a,b)=>b.value-a.value)
      .slice(0, 20);
    const gapData = Array.from(gapCounts.entries())
      .map(([g, v]) => ({ gap: String(g), value: v }))
      .sort((a,b)=>Number(a.gap)-Number(b.gap));
    const ymDataRaw = Array.from(ymMap.entries())
      .map(([k, v]) => {
        const [y, m] = k.split("-");
        return { year: Number(y), month: Number(m), count: v };
      })
      .sort((a,b)=> a.year===b.year ? a.month-b.month : a.year-b.year);
    const ymSeries = ymDataRaw.map(d => ({ name: `${d.year}-${String(d.month).padStart(2,"0")}`, value: d.count }));

    return { freqData, bonusData, colorData, rangeData, oddEvenData, sumData, pairData, gapData, ymSeries };
  }, [rows]);

  if (loading) return <div style={{ padding: 20 }}>데이터 불러오는 중…</div>;
  if (error)   return <div style={{ padding: 20, color: "crimson", whiteSpace: "pre-wrap" }}>오류: {error}</div>;
  if (!stats)  return <div style={{ padding: 20 }}>데이터 없음</div>;

  const { freqData, bonusData, colorData, rangeData, oddEvenData, sumData, pairData, gapData, ymSeries } = stats;

  const PIE_COLORS = colorData.map(d => d.color);
  const ODD_EVEN_COLORS = ["#D64545", "#2F7FD9"];

  // 집중보기일 때는 높이를 크게
  const CHART_H = active ? 420 : 260;

  // 그리드/카드 크기
  const gridStyle = { ...GRID.grid, gridTemplateColumns: active ? "1fr" : "repeat(3, 1fr)" };
  const cardStyle = active ? { ...CARD.wrap, minHeight: 540 } : CARD.wrap;

  const tagStyle = (k) => ({
    ...GRID.tag,
    border: active === k ? "2px solid #e0949b" : "1px solid #f3c6cb",
    fontWeight: active === k ? 700 : 500
  });

  return (
    <div style={GRID.page}>
      <div style={GRID.inner}>
        <div style={GRID.header}>
          <h2 style={{ margin: 0, fontWeight: 800 }}>
            🎯 번호 통계 분석{active ? ` · ${TABS.find(t=>t.key===active)?.label} 집중보기` : ""}
          </h2>
          <p style={{ margin: "6px 0 0 0", color: "#7f1d1d", fontSize: 13 }}>
            9가지 기준으로 로또 번호 데이터를 분석한 대시보드
          </p>
        </div>

        {/* 탭 */}
        <div style={GRID.tabs}>
          <button type="button" style={tagStyle(null)} onClick={() => setActive(null)}>전체보기</button>
          {TABS.map(t => (
            <button key={t.key} type="button" style={tagStyle(t.key)} onClick={() => setActive(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={gridStyle}>
          {/* 1 숫자 출현 빈도 */}
          <div style={{ display: active && active !== "freq" ? "none" : "block" }}>
            <div style={cardStyle}>
              <div style={CARD.title}>숫자 출현 빈도</div>
              <div style={CARD.subtitle}>역대 많이 나온 번호 막대그래프</div>
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height={CHART_H}>
                  <BarChart data={freqData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip content={<SimpleTooltip />} />
                    <Bar name="출현 횟수" dataKey="value" fill={ACCENT} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 2 색상별 출현 빈도 (파이) */}
          <div style={{ display: active && active !== "color" ? "none" : "block" }}>
            <div style={cardStyle}>
              <div style={CARD.title}>색상별 출현 빈도</div>
              <div style={CARD.subtitle}>공 색상 기준(1~10 노랑, 11~20 파랑, 21~30 빨강, 31~40 회색, 41~45 초록)</div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ResponsiveContainer width="100%" height={CHART_H}>
                  <PieChart>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                    <Pie data={colorData} dataKey="value" nameKey="name" outerRadius={active ? 150 : 90} label>
                      {colorData.map((entry, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 3 보너스 번호 출현 빈도 */}
          <div style={{ display: active && active !== "bonus" ? "none" : "block" }}>
            <div style={cardStyle}>
              <div style={CARD.title}>보너스 번호 출현 빈도</div>
              <div style={CARD.subtitle}>보너스만 별도 집계</div>
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height={CHART_H}>
                  <BarChart data={bonusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip content={<SimpleTooltip />} />
                    <Bar name="보너스 출현" dataKey="value" fill={ACCENT} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 4 연도·월별 출현 빈도 (라인) */}
          <div style={{ display: active && active !== "ym" ? "none" : "block" }}>
            <div style={cardStyle}>
              <div style={CARD.title}>연도별·월별 출현 빈도</div>
              <div style={CARD.subtitle}>추첨일 기준 월별 총 출현 개수(6개/회 × 회차수)</div>
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height={CHART_H}>
                  <LineChart data={ymSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" name="월별 합계" dot={false} stroke={ACCENT} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 5 번호 구간별 출현 빈도 */}
          <div style={{ display: active && active !== "range" ? "none" : "block" }}>
            <div style={cardStyle}>
              <div style={CARD.title}>번호 구간별 출현 빈도</div>
              <div style={CARD.subtitle}>1~10 / 11~20 / 21~30 / 31~40 / 41~45</div>
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height={CHART_H}>
                  <BarChart data={rangeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<SimpleTooltip />} />
                    <Bar name="출현" dataKey="value" fill={ACCENT} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 6 홀짝 비율 (파이) */}
          <div style={{ display: active && active !== "oddEven" ? "none" : "block" }}>
            <div style={cardStyle}>
              <div style={CARD.title}>번호 홀짝 비율</div>
              <div style={CARD.subtitle}>전체 번호 기준</div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ResponsiveContainer width="100%" height={CHART_H}>
                  <PieChart>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                    <Pie data={oddEvenData} dataKey="value" nameKey="name" outerRadius={active ? 150 : 90} label>
                      {oddEvenData.map((_, idx) => <Cell key={idx} fill={ODD_EVEN_COLORS[idx]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 7 번호 합 분포 */}
          <div style={{ display: active && active !== "sum" ? "none" : "block" }}>
            <div style={cardStyle}>
              <div style={CARD.title}>번호 합 분포</div>
              <div style={CARD.subtitle}>6개 합계의 히스토그램(폭 10)</div>
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height={CHART_H}>
                  <BarChart data={sumData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<SimpleTooltip />} />
                    <Bar name="회수" dataKey="value" fill={ACCENT} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 8 자주 함께 등장한 번호쌍 Top 20 */}
          <div style={{ display: active && active !== "pair" ? "none" : "block" }}>
            <div style={cardStyle}>
              <div style={CARD.title}>자주 함께 등장한 번호쌍</div>
              <div style={CARD.subtitle}>Top 20 조합</div>
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height={CHART_H}>
                  <BarChart data={pairData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="pair" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={60} />
                    <YAxis />
                    <Tooltip content={<SimpleTooltip />} />
                    <Bar name="동시 출현" dataKey="value" fill={ACCENT} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 9 번호 간 간격 분석 */}
          <div style={{ display: active && active !== "gap" ? "none" : "block" }}>
            <div style={cardStyle}>
              <div style={CARD.title}>번호 간 간격 분석</div>
              <div style={CARD.subtitle}>정렬 후 인접 번호 차이 분포</div>
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height={CHART_H}>
                  <BarChart data={gapData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="gap" />
                    <YAxis />
                    <Tooltip content={<SimpleTooltip />} />
                    <Bar name="빈도" dataKey="value" fill={ACCENT} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ----- 페이지 기본 내보내기 -----
export default function AnalysisPage() {
  return <LottoNumberStats fetchUrl="/lotto/draws" />;
}