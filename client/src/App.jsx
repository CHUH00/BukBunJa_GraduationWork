// src/App.jsx
// 변경 사항:
// - [추가] auth-changed 이벤트 리스너
// - [유지] 부팅 시 restoreSession
// - [유지] ProtectedRoute에 user 전달

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Layout from "./pages/Layout/Layout";
import Dashboard from "./pages/Dashboard/Dashboard";
import AnalysisPage from "./pages/Compare/AnalysisPage";
import DrawsPage from "./pages/Compare/DrawsPage";
import ComparePage from "./pages/Compare/ComparePage";
import RecommendPage from "./pages/Recommend/RecommendPage";
import RetailersTopPage from "./pages/Retailers/TopPage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";
import LottoIntro from "./pages/Guide/LottoIntro";
import ProtectedRoute from "./components/ProtectedRoute";
import HistoryPage from "./pages/MyPage/HistoryPage";
import AccountPage from "./pages/MyPage/AccountPage";
import { restoreSession } from "./utils/auth";

export default function App() {
  const [authUser, setAuthUser] = useState(null);  // null: 로딩중, falsey: 비로그인, object: 로그인
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const u = await restoreSession();
      if (mounted) {
        setAuthUser(u);           // u: 로그인 시 유저객체, 아니면 null/undefined → 여기선 비로그인 처리 시 false로 바꾸고 싶다면 적절히 변환
        setBooting(false);
      }
    })();

    // [추가] 로그인/소셜콜백 직후 즉시 반영
    const onAuthChanged = (e) => {
      setAuthUser(e.detail || null);
    };
    window.addEventListener("auth-changed", onAuthChanged);

    return () => {
      mounted = false;
      window.removeEventListener("auth-changed", onAuthChanged);
    };
  }, []);

  if (booting) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout authUser={authUser} />}>
          <Route path="/" element={<Dashboard />} />

          {/* 공개 */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 보호: 마이페이지 */}
          <Route
            path="/mypage"
            element={
              <ProtectedRoute user={authUser}>
                <HistoryPage user={authUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mypage/account"
            element={
              <ProtectedRoute user={authUser}>
                <AccountPage user={authUser} />
              </ProtectedRoute>
            }
          />

          {/* 기타 */}
          <Route path="/compare/Analysis" element={<AnalysisPage />} />
          <Route path="/compare/Draws" element={<DrawsPage />} />
          <Route path="/compare/compare" element={<ComparePage />} />
          <Route path="/lotto/recommend" element={<RecommendPage />} />
          <Route path="/retailers/top" element={<RetailersTopPage />} />
          <Route path="/guide/intro" element={<LottoIntro />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}