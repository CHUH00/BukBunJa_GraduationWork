import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import styles from "./Sidebar.module.css";
import logo from "../../assets/logo.png";

export default function Sidebar({ user, onLogout }) {
  const { pathname } = useLocation();
  const nav = useNavigate();

  const [openMenu, setOpenMenu] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));

  useEffect(() => {
    const onStorage = () => setToken(localStorage.getItem("access_token"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    setToken(localStorage.getItem("access_token"));
  }, [pathname]);

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem("access_token");
      setToken(null);
      nav("/login");
    }
  };

  const baseMenus = useMemo(
    () => ([
      { label: "메인 대시보드", path: "/" },
      { label: "AI 기반 추천", path: "/lotto/recommend" },
      { label: "당첨 판매점 조회", path: "/retailers/top" },
      {
        label: "로또 번호 분석",
        children: [
          { label: "번호 통계 분석", path: "/compare/Analysis" },
          { label: "회차별 당첨번호 조회", path: "/compare/Draws" },
          { label: "회차별 분석 결과 비교", path: "/compare/compare" },
        ],
      },
      { label: " 로또 가이드", path: "/guide/intro" }
    ]),
    []
  );

  const authMenu = useMemo(() => {
    if (!token) return { label: "로그인/회원가입", path: "/login" };
    return {
      label: "마이페이지",
      children: [
        { label: "분석 이력 조회", path: "/mypage" },
        { label: "계정 설정", path: "/mypage/account" },
        { label: "로그아웃", action: handleLogout },
      ],
    };
  }, [token]);

  const menus = useMemo(() => [baseMenus[0], authMenu, ...baseMenus.slice(1)], [authMenu, baseMenus]);

  const renderMenu = (menu) => {
    if (menu.children) {
      const isOpen = openMenu === menu.label;
      return (
        <div key={menu.label}>
          <div
            onClick={() => setOpenMenu(isOpen ? null : menu.label)}
            className={`${styles.menuHeader} ${isOpen ? styles.menuHeaderOpen : ""}`}
          >
            {isOpen ? "▼ " : "▶ "} {menu.label}
          </div>

          {isOpen && (
            <div className={styles.children}>
              {menu.children.map((sub) => {
                if (sub.action) {
                  return (
                    <button
                      key={`${menu.label}-action-${sub.label}`}
                      onClick={sub.action}
                      className={styles.actionBtn}
                    >
                      {sub.label}
                    </button>
                  );
                }
                return (
                  <NavLink
                    key={sub.path}
                    to={sub.path}
                    end={sub.path === "/mypage"}
                    className={({ isActive }) =>
                      `${styles.sublink} ${isActive ? styles.sublinkActive : ""}`
                    }
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

    return (
      <NavLink
        key={menu.path}
        to={menu.path}
        onClick={() => setOpenMenu(null)}
        className={({ isActive }) => `${styles.link} ${isActive ? styles.activeLink : ""}`}
      >
        {menu.label}
      </NavLink>
    );
  };

return (
  <aside className={styles.aside}>
    {/* 상단 로고 */}
    <div className={styles.logo} onClick={() => nav("/")}>
      <img src={logo} alt="로고" />
    </div>

    {/* 메뉴 */}
    <nav className={styles.nav}>
      {menus.map(renderMenu)}
    </nav>

    {/* 푸터 */}
    <div className={styles.footer}>
      © 2025 복권을 분석하는 자들.<br />
      All Right Reserved.
    </div>
  </aside>
);
}
