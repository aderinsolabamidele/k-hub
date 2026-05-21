import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "./lib/QueryClient";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import UserNotRegistered from "./components/UserNotRegistered";

import KhubLayout from "./components/KhubLayout";

import KhubHome from "./pages/KhubHome";
import KhubExplore from "./pages/KhubExplore";
import KhubPropertyDetail from "./pages/KhubPropertyDetail";
import KhubOwnerPortal from "./pages/KhubOwnerPortal";
import KhubAdmin from "./pages/KhubAdmin";
import KhubSaved from "./pages/KhubSaved";
import KhubAccount from "./pages/UserAccount";
import KhubCities from "./pages/KhubCities";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

/* ---------------- AUTH WRAPPER ---------------- */

const AuthenticatedApp = () => {
  const {
    isLoadingAuth,
    isLoadingPublicSettings,
    authError,
    navigateToLogin,
  } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === "user_not_registered") {
      return <UserNotRegistered />;
    }

    if (authError.type === "auth_required") {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* AUTH ROUTES */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* MAIN APP */}
      <Route element={<KhubLayout />}>
        <Route path="/" element={<KhubHome />} />
        <Route path="/apartments" element={<KhubExplore />} />
        <Route path="/apartments/:id" element={<KhubPropertyDetail />} />
        <Route path="/cities" element={<KhubCities />} />
        <Route path="/saved" element={<KhubSaved />} />
        <Route path="/account" element={<KhubAccount />} />
        <Route path="/owner" element={<KhubOwnerPortal />} />
        <Route path="/admin" element={<KhubAdmin />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

/* ---------------- APP ROOT ---------------- */

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router basename="/k-hub">
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;