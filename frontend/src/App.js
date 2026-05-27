import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./lib/auth";
import Login from "./pages/Login";
import Shell from "./components/Shell";
import Overview from "./pages/Overview";
import Novels from "./pages/Novels";
import NovelEditor from "./pages/NovelEditor";
import Chapters from "./pages/Chapters";
import ChapterEditor from "./pages/ChapterEditor";
import Users from "./pages/Users";
import Subscriptions from "./pages/Subscriptions";
import Push from "./pages/Push";
import MobilePreview from "./pages/MobilePreview";

function Protected({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-cream-50/60" data-testid="auth-loading">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const bootstrap = useAuth((s) => s.bootstrap);
  React.useEffect(() => { bootstrap(); }, [bootstrap]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected adminOnly>
            <Shell />
          </Protected>
        }
      >
        <Route index element={<Overview />} />
        <Route path="novels" element={<Novels />} />
        <Route path="novels/new" element={<NovelEditor />} />
        <Route path="novels/:id/edit" element={<NovelEditor />} />
        <Route path="novels/:id/chapters" element={<Chapters />} />
        <Route path="novels/:id/chapters/new" element={<ChapterEditor />} />
        <Route path="chapters/:chapterId/edit" element={<ChapterEditor />} />
        <Route path="users" element={<Users />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="push" element={<Push />} />
        <Route path="mobile" element={<MobilePreview />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
