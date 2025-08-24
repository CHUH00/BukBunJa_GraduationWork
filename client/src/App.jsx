import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout/Layout";
import Dashboard from "./pages/Dashboard/Dashboard";

import AnalysisPage from "./pages/Analysis/AnalysisPage";
import DrawsPage from "./pages/Draws/DrawsPage";
import ComparePage from "./pages/Compare/ComparePage";
import RecommendPage from "./pages/Recommend/RecommendPage";
import RetailersSearchPage from "./pages/Retailers/SearchPage";
import RetailersTopPage from "./pages/Retailers/TopPage";
import RetailersNearbyPage from "./pages/Retailers/NearbyPage";
import MyPage from "./pages/MyPage/MyPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 변경: 모든 페이지는 공통 레이아웃 하위로 렌더링 */}
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/lotto/analysis" element={<AnalysisPage />} />
          <Route path="/lotto/draws" element={<DrawsPage />} />
          <Route path="/lotto/compare" element={<ComparePage />} />
          <Route path="/lotto/recommend" element={<RecommendPage />} />
          <Route path="/retailers/search" element={<RetailersSearchPage />} />
          <Route path="/retailers/top" element={<RetailersTopPage />} />
          <Route path="/retailers/nearby" element={<RetailersNearbyPage />} />
          <Route path="/mypage" element={<MyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}