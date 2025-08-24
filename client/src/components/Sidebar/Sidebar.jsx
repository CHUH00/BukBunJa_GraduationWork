import { NavLink, useLocation } from "react-router-dom";

const menus = [
  { label: "메인 대시보드", path: "/" },
  { label: "번호 통계 분석", path: "/lotto/analysis" },
  { label: "회차별 당첨번호 조회", path: "/lotto/draws" },
  { label: "회차별 분석 결과 비교", path: "/lotto/compare" },
  { label: "AI 기반 추천", path: "/lotto/recommend" },
  { label: "당첨 판매점 조회", path: "/retailers/top" },
  { label: "위치 기반 판매점 추천", path: "/retailers/nearby" },
  { label: "장소명 검색", path: "/retailers/search" },
  { label: "마이페이지", path: "/mypage" },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside
      style={{
        width: 240,
        flexShrink: 0,
        background: "#fff",
        borderRight: "1px solid #f0e0e0",
        padding: "20px 14px",
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 18, color: "#7a0e0e" }}>
        복권을 분석하는 자들
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {menus.map((m) => {
          const active = pathname === m.path;
          return (
            <NavLink
              key={m.path}
              to={m.path}
              style={{
                textDecoration: "none",
                padding: "10px 12px",
                borderRadius: 8,
                color: active ? "#7a0e0e" : "#6b6b6b",
                background: active ? "#ffe1e1" : "transparent",
                fontWeight: active ? 700 : 400,
              }}
            >
              {m.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}