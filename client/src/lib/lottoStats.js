// 순수 유틸: 어디서든 import해서 rows만 넣으면 stats 뽑아줌
const BALL_COLORS = [
  { key: "1-10",  range: [1, 10],  name: "1~10 (Yellow)", color: "#D4A700" },
  { key: "11-20", range: [11, 20], name: "11~20 (Blue)",  color: "#3566A8" },
  { key: "21-30", range: [21, 30], name: "21~30 (Red)",   color: "#B84040" },
  { key: "31-40", range: [31, 40], name: "31~40 (Gray)",  color: "#6E747D" },
  { key: "41-45", range: [41, 45], name: "41~45 (Green)", color: "#2F8059" }
];
const RANGE_BUCKETS = BALL_COLORS.map(({ key, range }) => ({ key, range }));

export const ACCENT = "#9C3D41";
export const BALL_COLOR_META = BALL_COLORS; // 외부에서 색상도 필요하면 사용

export function pickArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  if (data && typeof data === "object") {
    const firstArr = Object.values(data).find(Array.isArray);
    if (Array.isArray(firstArr)) return firstArr;
  }
  return null;
}

function inRange(n, [a, b]) { return n >= a && n <= b; }
function numList(row) { return [1,2,3,4,5,6].map(i => Number(row[`당첨번호_${i}`])); }
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
  for (let i=0; i<arr.length; i++) for (let j=i+1; j<arr.length; j++) out.push([arr[i], arr[j]]);
  return out;
}

/* ---------- 유연한 필드 추출 유틸 & 키 후보 ---------- */
function pickField(row, candidates, mapFn = v => v) {
  for (const k of candidates) {
    if (row[k] !== undefined && row[k] !== null && row[k] !== "") {
      const v = row[k];
      const n = typeof v === "string" ? v.replace(/[, ]/g, "") : v; // "12,345" → 12345
      const num = Number(n);
      return Number.isFinite(num) ? mapFn(num) : mapFn(v);
    }
  }
  return null;
}

const KEY_ROUND = ["회차", "round", "drawNo", "회번"];
const KEY_DATE  = ["추첨일", "drawDate", "추첨일자", "date", "날짜"];
const KEY_YEAR  = ["년도", "year"];
const KEY_WIN1  = ["1등당첨자수", "1등 당첨자 수", "1등_당첨자_수", "firstPrizeWinners", "1st_winners", "winners1", "당첨자수_1"];
const KEY_AMT1  = ["1등총당첨금", "1등 총 당첨금", "1등_총_당첨금", "firstPrizeAmount", "1st_prize_total", "amount1", "firstPrizePool", "당첨금액_1"];

/* ---------- 핵심: 통계를 계산해 리턴하는 순수 함수 ---------- */
export function computeLottoStats(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return null;

  const freq = Array.from({ length: 45 }, (_, i) => ({ num: i + 1, count: 0 }));
  const bonusFreq = Array.from({ length: 45 }, (_, i) => ({ num: i + 1, count: 0 }));
  const colorFreq = BALL_COLORS.map(({ key, name, color }) => ({ key, name, color, count: 0 }));
  const ymMap = new Map();                 // (기존) 월별 총합 (당첨번호 6개만)
  const monthNumMap = new Map();           // (신규) Map<"YYYY-MM", Map<num, count>>
  const rangeFreq = RANGE_BUCKETS.map(({ key }) => ({ key, count: 0 }));
  let odd = 0, even = 0;
  const sumCounts = new Map();
  const SUM_MIN = 21, SUM_MAX = 255, BIN = 10;
  const pairCounts = new Map();
  const gapCounts = new Map();

  /* 1등 관련 시리즈/집계 */
  const firstPrizeByRound = [];   // [{ round, date, winners, amount }]
  let firstPrizeWinnersTotal = 0;
  let firstPrizeAmountTotal  = 0;

  // 보너스를 월간 집계에 포함할지 여부 (필요하면 true로)
  const INCLUDE_BONUS_IN_MONTHLY = false;

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

    const { y, m } = toMonth(
      pickField(row, KEY_DATE, v => v),
      pickField(row, KEY_YEAR, v => v)
    );
    if (y && m) {
      const key = `${y}-${String(m).padStart(2, "0")}`;

      // 월별 총합(참고용)
      ymMap.set(key, (ymMap.get(key) || 0) + six.length);

      // 🔥 월별 번호별 출현수
      if (!monthNumMap.has(key)) monthNumMap.set(key, new Map());
      const numMap = monthNumMap.get(key);
      for (const n of six) numMap.set(n, (numMap.get(n) || 0) + 1);

      if (INCLUDE_BONUS_IN_MONTHLY) {
        const b = Number(row["보너스번호"]);
        if (b >= 1 && b <= 45) numMap.set(b, (numMap.get(b) || 0) + 1);
      }
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
    if (bonus >= 1 && bonus <= 45) bonusFreq[bonus - 1].count++;

    /* 1등 당첨자/금액 추출 */
    const round   = pickField(row, KEY_ROUND, v => Number(v));
    const winners = pickField(row, KEY_WIN1, v => Number(v));
    const amount  = pickField(row, KEY_AMT1, v => Number(v)); // 원 단위 숫자 기대
    const date    = pickField(row, KEY_DATE, v => v);

    if (round != null || winners != null || amount != null) {
      const w = Number(winners) || 0;
      const a = Number(amount)  || 0;
      firstPrizeByRound.push({ round, date, winners: w, amount: a });
      if (Number.isFinite(winners)) firstPrizeWinnersTotal += w;
      if (Number.isFinite(amount))  firstPrizeAmountTotal  += a;
    }
  }

  const freqData  = freq.map(d => ({ name: d.num, value: d.count }));
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
  const ymSeries = Array.from(ymMap.entries())
    .map(([k, v]) => {
      const [y, m] = k.split("-");
      return { name: `${y}-${m}`, value: v };
    })
    .sort((a,b)=> a.name.localeCompare(b.name));

  // ✅ 번호별 월간 시계열 (1~45)
  const monthsSorted = Array.from(monthNumMap.keys()).sort(); // "YYYY-MM"
  const monthlyNumberSeries = {};
  for (let num = 1; num <= 45; num++) {
    monthlyNumberSeries[num] = monthsSorted.map((mon) => {
      const cnt = monthNumMap.get(mon)?.get(num) || 0;
      return { name: mon, value: cnt };
    });
  }

  /* 1등 시각화용 시리즈 */
  const firstPrizeSorted = firstPrizeByRound
    .filter(d => d.round != null)
    .sort((a,b) => Number(a.round) - Number(b.round));

  const firstPrizeWinnersSeries = firstPrizeSorted.map(d => ({ name: String(d.round), value: d.winners }));
  const firstPrizeAmountSeries  = firstPrizeSorted.map(d => ({ name: String(d.round), value: d.amount }));

  const LAST_N = 20; // 최근 N회 (그래프용)
  const recentFirstPrizeWinners = firstPrizeWinnersSeries.slice(-LAST_N);
  const recentFirstPrizeAmount  = firstPrizeAmountSeries.slice(-LAST_N);

  return {
    // 기본 통계
    freqData, bonusData, colorData, rangeData, oddEvenData, sumData, pairData, gapData, ymSeries,
    // 1등 관련
    firstPrizeByRound: firstPrizeSorted,
    firstPrizeWinnersSeries, firstPrizeAmountSeries,
    recentFirstPrizeWinners, recentFirstPrizeAmount,
    firstPrizeWinnersTotal, firstPrizeAmountTotal,
    // 🔥 신규: 번호별 월간 시계열
    monthlyNumberSeries
  };
}