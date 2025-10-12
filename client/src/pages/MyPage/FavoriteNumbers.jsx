<<<<<<< HEAD
import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, LabelList, Cell
} from "recharts";

const ACCENT = "#7e2e32";
const SOFT   = "rgba(36,52,90,0.10)";
const SOFT_STROKE = "rgba(0,0,0,0.10)";

export default function FavoriteNumbers({ data = [] }) {
  const rows = useMemo(
    () => (data || []).map(d => ({ name: String(d.num), value: Number(d.count || 0) })),
    [data]
  );
  const maxVal = useMemo(() => rows.reduce((m, d) => Math.max(m, d.value), 0), [rows]);

  const defaultIdx = rows.findIndex(d => d.value === maxVal);
  const [selectedIdx, setSelectedIdx] = useState(defaultIdx >= 0 ? defaultIdx : 0);

  const SelectedOnlyLabel = (props) => {
    const { x, y, width, index, value } = props;
    if (index !== selectedIdx) return null;
    const cx = x + width / 2;
    return (
      <text x={cx} y={y - 8} textAnchor="middle" style={{ fill: "#24304a", fontSize: 12, fontWeight: 800 }}>
        {`${value}회`}
      </text>
    );
  };

  if (!rows.length) return null;

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 180, transform: "translate(-20px, 8px)"}}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={rows} margin={{ top: 18, right: 8, bottom: 10, left: 0 }} className="fav-chart">
          <CartesianGrid strokeDasharray="3 3" stroke={SOFT_STROKE} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#4767b2", fontWeight: 700 }}
            tickLine={false}
            axisLine={{ stroke: SOFT_STROKE }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "rgba(0,0,0,0.6)" }}
            tickLine={false}
            axisLine={{ stroke: SOFT_STROKE }}
          />
          <Tooltip formatter={(v) => [`${v}회`, "선호도"]} cursor={{ fill: "rgba(126,46,50,0.05)" }} />

          <Bar
            dataKey="value"
            radius={[8, 8, 8, 8]}
            isAnimationActive={false}
            onClick={(_, i) => setSelectedIdx(i)}
          >
            {rows.map((d, i) => (
              <Cell
                key={i}
                fill={i === selectedIdx ? ACCENT : SOFT}
                cursor="pointer"
                tabIndex={0}
                role="button"
                aria-label={`${rows[i].name}번, ${rows[i].value}회`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedIdx(i); }
                }}
              />
            ))}
            <LabelList dataKey="value" content={<SelectedOnlyLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
||||||| empty tree
=======
import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, LabelList, Cell
} from "recharts";

const ACCENT = "#7e2e32";
const SOFT   = "rgba(36,52,90,0.10)";
const SOFT_STROKE = "rgba(0,0,0,0.10)";

export default function FavoriteNumbers({ data = [] }) {
  const rows = useMemo(
    () => (data || []).map(d => ({ name: String(d.num), value: Number(d.count || 0) })),
    [data]
  );
  const maxVal = useMemo(() => rows.reduce((m, d) => Math.max(m, d.value), 0), [rows]);

  const defaultIdx = rows.findIndex(d => d.value === maxVal);
  const [selectedIdx, setSelectedIdx] = useState(defaultIdx >= 0 ? defaultIdx : 0);

  const SelectedOnlyLabel = (props) => {
    const { x, y, width, index, value } = props;
    if (index !== selectedIdx) return null;
    const cx = x + width / 2;
    return (
      <text x={cx} y={y - 8} textAnchor="middle" style={{ fill: "#24304a", fontSize: 12, fontWeight: 800 }}>
        {`${value}회`}
      </text>
    );
  };

  if (!rows.length) return null;

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 180, transform: "translate(-20px, 8px)"}}>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={rows} margin={{ top: 18, right: 8, bottom: 10, left: 0 }} className="fav-chart">
          <CartesianGrid strokeDasharray="3 3" stroke={SOFT_STROKE} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: "#4767b2", fontWeight: 700 }}
            tickLine={false}
            axisLine={{ stroke: SOFT_STROKE }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "rgba(0,0,0,0.6)" }}
            tickLine={false}
            axisLine={{ stroke: SOFT_STROKE }}
          />
          <Tooltip formatter={(v) => [`${v}회`, "선호도"]} cursor={{ fill: "rgba(126,46,50,0.05)" }} />

          <Bar
            dataKey="value"
            radius={[8, 8, 8, 8]}
            isAnimationActive={false}
            onClick={(_, i) => setSelectedIdx(i)}
          >
            {rows.map((d, i) => (
              <Cell
                key={i}
                fill={i === selectedIdx ? ACCENT : SOFT}
                cursor="pointer"
                tabIndex={0}
                role="button"
                aria-label={`${rows[i].name}번, ${rows[i].value}회`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedIdx(i); }
                }}
              />
            ))}
            <LabelList dataKey="value" content={<SelectedOnlyLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
>>>>>>> coolmean
