import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import { logout } from "../../utils/auth";
import "./Layout.css";

export default function Layout({ authUser }) {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout(nav);
  };

  const noPaddingPaths = ["/mypage/account", "/login", "/register", "/retailers/top"];

  const mainClass = noPaddingPaths.includes(pathname)
    ? "layout-main nopadding"
    : "layout-main";

  return (
    <div className="layout-container">
      <Sidebar user={authUser} onLogout={handleLogout} />
      <main className={mainClass}>
        <Outlet />
      </main>
    </div>
  );
}