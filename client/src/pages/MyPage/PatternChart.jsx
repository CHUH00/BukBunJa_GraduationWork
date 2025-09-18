import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#FF8A00", "#2C3565", "#2A49D6", "#FF1FE0"];

function sliceLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  const RAD = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.62;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fill: "#fff", fontSize: 14, fontWeight: 800 }}
    >
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

export default function PatternChart({ data = [] }) {
  const norm = (data || []).map((d) => ({
    label: d?.label ?? "",
    value: Number(d?.value ?? 0),
  }));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        width: "100%",
      }}
    >
      <div style={{ flex: "0 0 56%", minWidth: 0 }}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
            <Tooltip />
            <Pie
              data={norm}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius="80%"
              paddingAngle={2}
              labelLine={false}
              label={sliceLabel}
              isAnimationActive={false}
              stroke="#fff"
              strokeWidth={6}
            >
              {norm.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul
        style={{
          flex: "0 0 40%",
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "grid",
          gridTemplateColumns: "1fr",
          rowGap: 6,
          fontSize: 12,
        }}
      >
        {norm.map((d, i) => (
          <li key={d.label || i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
                background: COLORS[i % COLORS.length],
                boxShadow: "0 0 0 1px rgba(0,0,0,.06) inset",
                flex: "0 0 10px",
              }}
            />
            <span style={{ fontWeight: 700 }}>{d.label || `항목 ${i + 1}`}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}