import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

const menus = [
    { label: "메인 대시보드", path: "/" },
    { label: "번호 통계 분석", path: "/lotto/analysis" },
    { label: "회차별 당첨번호 조회", path: "/lotto/draws" },
    { label: "회차별 분석 결과 비교", path: "/lotto/compare" },
    { label: "AI 기반 추천", path: "/lotto/recommend" },
    {
        label: "로또 판매점 조회",
        children: [
            { label: "당첨 판매점 조회", path: "/retailers/top" },
            { label: "위치 기반 판매점 추천", path: "/retailers/nearby" },
        ],
    },
    { label: "마이페이지", path: "/mypage" },
];

export default function Sidebar() {
    const { pathname } = useLocation();
    const [openMenu, setOpenMenu] = useState(null);

    const renderMenu = (menu) => {
        // 드롭다운 있는 메뉴
        if (menu.children) {
            const isOpen = openMenu === menu.label;
            return (
                <div key={menu.label}>
                    <div
                        onClick={() =>
                            setOpenMenu(isOpen ? null : menu.label)
                        }
                        style={{
                            cursor: "pointer",
                            padding: "10px 12px",
                            borderRadius: 8,
                            color: isOpen ? "#7a0e0e" : "#6b6b6b",
                            // background: isOpen ? "#ffe1e1" : "transparent",
                            fontWeight: isOpen ? 700 : 400,
                            userSelect: "none",
                        }}
                    >
                        {isOpen ? "▼ " : "▶ "} {menu.label}
                    </div>
                    {isOpen && (
                        <div style={{ marginLeft: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                            {menu.children.map((sub) => {
                                const active = pathname === sub.path;
                                return (
                                    <NavLink
                                        key={sub.path}
                                        to={sub.path}
                                        style={{
                                            textDecoration: "none",
                                            padding: "8px 12px",
                                            borderRadius: 8,
                                            color: active ? "#7a0e0e" : "#6b6b6b",
                                            background: active ? "#ffe1e1" : "transparent",
                                            fontWeight: active ? 700 : 400,
                                        }}
                                    >
                                        {sub.label}
                                    </NavLink>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }

        // 일반 메뉴
        const active = pathname === menu.path;
        return (
            <NavLink
                key={menu.path}
                to={menu.path}
                style={{
                    textDecoration: "none",
                    padding: "10px 12px",
                    borderRadius: 8,
                    color: active ? "#7a0e0e" : "#6b6b6b",
                    // background: active ? "#ffe1e1" : "transparent",
                    fontWeight: active ? 700 : 400,
                }}
            >
                {menu.label}
            </NavLink>
        );
    };

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
                {menus.map(renderMenu)}
            </nav>
        </aside>
    );
}