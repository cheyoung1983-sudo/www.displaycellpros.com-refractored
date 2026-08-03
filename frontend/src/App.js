import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import MainSite from "./pages/MainSite";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import PaymentResult from "./pages/PaymentResult";
import AuthCallback from "./pages/AuthCallback";
import "./App.css";

function AppRouter() {
  const location = useLocation();
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  if (location.hash?.includes("session_id=")) return <AuthCallback />;
  return (
    <Routes>
      <Route path="/" element={<MainSite />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/payment/success" element={<PaymentResult ok />} />
      <Route path="/payment/cancel" element={<PaymentResult ok={false} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
