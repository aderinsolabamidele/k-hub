import { Outlet, useLocation } from "react-router-dom";
import KhubNavbar from "./KhubNavbar";
import KhubFooter from "./KhubFooter";

export default function KhubLayout() {
  const location = useLocation();
  const transparent = location.pathname === "/";
  return (
    <div className="min-h-screen flex flex-col">
      <KhubNavbar transparent={transparent} />
      <main className="flex-1"><Outlet /></main>
      <KhubFooter />
    </div>
  );
}