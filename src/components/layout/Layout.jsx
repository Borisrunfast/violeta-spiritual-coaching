// src/components/layout/Layout.jsx
import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

export default function Layout() {
  return (
    <div>
      <Header />
      <main className="min-h-[50vh] p-6">
        {/* Active route renders here */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
