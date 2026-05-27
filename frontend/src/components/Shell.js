import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users as UsersIcon,
  CreditCard,
  Bell,
  LogOut,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../lib/auth";

const navItems = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true, testid: "nav-overview" },
  { to: "/novels", label: "Novels", icon: BookOpen, testid: "nav-novels" },
  { to: "/users", label: "Users", icon: UsersIcon, testid: "nav-users" },
  { to: "/subscriptions", label: "Subscriptions", icon: CreditCard, testid: "nav-subscriptions" },
  { to: "/push", label: "Push (Mocked)", icon: Bell, testid: "nav-push" },
  { to: "/mobile", label: "Mobile Preview", icon: Smartphone, testid: "nav-mobile" },
];

export default function Shell() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 h-screen sticky top-0 glass-strong border-r border-white/[0.06] flex flex-col" data-testid="admin-sidebar">
        <div className="px-6 pt-7 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl btn-gold flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[15px] font-semibold tracking-tight">Sinhala Novels</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-cream-50/40">Admin Console</div>
            </div>
          </div>
        </div>

        <nav className="px-3 mt-2 space-y-1 flex-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              data-testid={item.testid}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] transition ${
                  isActive
                    ? "bg-gold/12 text-gold border border-gold/30 shadow-[0_0_24px_-12px_rgba(199,146,62,0.7)]"
                    : "text-cream-50/70 hover:bg-white/[0.04] hover:text-cream-50"
                }`
              }
              style={({ isActive }) => isActive ? { background: "rgba(199,146,62,0.12)" } : undefined}
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/[0.06]">
          <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <div className="text-[11px] uppercase tracking-[0.16em] text-cream-50/40">Signed in</div>
            <div className="text-[13px] mt-0.5 truncate" data-testid="admin-user-name">{user?.name || user?.email}</div>
          </div>
          <button
            onClick={async () => { await logout(); nav("/login"); }}
            className="btn-ghost mt-3 w-full px-3 py-2 rounded-xl flex items-center justify-center gap-2 text-[13px]"
            data-testid="admin-logout-btn"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0">
        <div className="max-w-[1400px] mx-auto px-8 py-8 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
