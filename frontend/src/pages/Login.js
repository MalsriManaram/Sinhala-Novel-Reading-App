import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BookOpenText, ArrowRight } from "lucide-react";
import { useAuth } from "../lib/auth";

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("ruvinda@sinhalanovels.app");
  const [password, setPassword] = useState("Ruvinda@2026");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const u = await login(email, password);
      if (u.role !== "admin") {
        toast.error("Admin access required for this dashboard.");
        return;
      }
      toast.success(`Welcome, ${u.name || u.email}`);
      nav("/");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left poster */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1489846986031-7cea03ab8fd0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwxfHxteXN0ZXJ5JTIwdGhyaWxsZXIlMjBkYXJrJTIwY2luZW1hdGljJTIwcG9zdGVyfGVufDB8fHx8MTc3OTg3OTA2NXww&ixlib=rb-4.1.0&q=85"
          alt="cover"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(11,12,16,0.05) 0%, rgba(11,12,16,0.85) 100%)" }} />
        <div className="relative z-10 self-end p-14">
          <div className="text-[11px] tracking-[0.32em] text-gold/90 uppercase">A reading sanctuary</div>
          <div className="font-serif text-5xl leading-tight mt-3 max-w-md">
            <span className="italic">"</span>The geometry of silence<br />begins where the page ends.<span className="italic">"</span>
          </div>
          <div className="text-cream-50/60 mt-5 max-w-md">Curate, schedule and publish Sinhala &amp; English literature for thousands of readers.</div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-11 h-11 rounded-xl btn-gold flex items-center justify-center">
              <BookOpenText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[17px] font-semibold">Sinhala Novels</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-cream-50/40">Admin Console</div>
            </div>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">Welcome back.</h1>
          <p className="text-cream-50/55 mt-2 text-sm">Sign in with your administrator credentials to manage the library.</p>

          <form onSubmit={submit} className="mt-8 space-y-4" data-testid="admin-login-form">
            <div>
              <div className="label mb-1.5">Email</div>
              <input
                className="input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="admin-login-email"
                autoComplete="email"
              />
            </div>
            <div>
              <div className="label mb-1.5">Password</div>
              <input
                className="input"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="admin-login-password"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="btn-gold w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
              data-testid="admin-login-submit"
            >
              {busy ? "Signing in…" : (<>Sign in <ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>

          <div className="mt-7 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[12px] text-cream-50/55">
            <span className="badge badge-mocked mr-2">Seed</span>
            ruvinda@sinhalanovels.app · Ruvinda@2026
          </div>
        </div>
      </div>
    </div>
  );
}
