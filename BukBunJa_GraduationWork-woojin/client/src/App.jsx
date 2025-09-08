import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./pages/Layout/Layout";

import Dashboard from "./pages/Dashboard/Dashboard";

import AnalysisPage from "./pages/Compare/AnalysisPage";
import DrawsPage from "./pages/Compare/DrawsPage";
import ComparePage from "./pages/Compare/ComparePage";

import RecommendPage from "./pages/Recommend/RecommendPage";
import RetailersTopPage from "./pages/Retailers/TopPage";
import RetailersNearbyPage from "./pages/Retailers/NearbyPage";

import MyPage from "./pages/MyPage/MyPage";

import LottoIntro from "./pages/Guide/LottoIntro";
import Purchase from "./pages/Guide/Purchase";
import HowToBuy from "./pages/Guide/HowToBuy";
import DrawInfo from "./pages/Guide/DrawInfo";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 모든 페이지는 공통 레이아웃 하위 */}
        <Route element={<Layout />}>
          {/* 메인 대시보드 */}
          <Route path="/" element={<Dashboard />} />

          {/* 마이페이지 */}
          <Route path="/mypage" element={<MyPage />} />

          {/* 로또 번호 분석 */}
          <Route path="/compare/Analysis" element={<AnalysisPage />} />
          <Route path="/compare/Draws" element={<DrawsPage />} />
          <Route path="/compare/compare" element={<ComparePage />} />

          {/* AI 기반 추천 */}
          <Route path="/lotto/recommend" element={<RecommendPage />} />

          {/* 로또 판매점 조회 */}
          <Route path="/retailers/top" element={<RetailersTopPage />} />
          <Route path="/retailers/nearby" element={<RetailersNearbyPage />} />

          {/* 로또 가이드 */}
          <Route path="/guide/intro" element={<LottoIntro />} />
          <Route path="/guide/purchase" element={<Purchase />} />
          <Route path="/guide/how-to-buy" element={<HowToBuy />} />
          <Route path="/guide/draw-info" element={<DrawInfo />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}