import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import MainSite from "./pages/MainSite";
import "./App.css";

const AdminLogin = React.lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const PaymentResult = React.lazy(() => import("./pages/PaymentResult"));
const AuthCallback = React.lazy(() => import("./pages/AuthCallback"));

const Loading = () => (
  <div className="min-h-screen bg-void grid place-items-center font-mono text-xs tracking-widest text-[color:var(--cyan)] animate-pulse">
    LOADING…
  </div>
);

function AppRouter() {
  const location = useLocation();
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  if (location.hash?.includes("session_id=")) {
    return (
      <React.Suspense fallback={<Loading />}>
        <AuthCallback />
      </React.Suspense>
    );
  }
  return (
    <React.Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/payment/success" element={<PaymentResult ok />} />
        <Route path="/payment/cancel" element={<PaymentResult ok={false} />} />
      </Routes>
    </React.Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
