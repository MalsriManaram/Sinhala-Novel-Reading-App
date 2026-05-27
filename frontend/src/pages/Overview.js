import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { BookOpenText, Users as UsersIcon, Star, CreditCard, Sparkles, Clock, MoveUpRight, Film } from "lucide-react";

const cards = [
  { key: "users_total", label: "Total Users", icon: UsersIcon, accent: "from-purple-300/30 to-purple-500/10" },
  { key: "users_premium", label: "Premium Users", icon: Sparkles, accent: "from-gold/40 to-gold/10" },
  { key: "novels_published", label: "Published Novels", icon: BookOpenText, accent: "from-emerald-300/30 to-emerald-500/10" },
  { key: "novels_upcoming", label: "Upcoming Novels", icon: Clock, accent: "from-blue-300/30 to-blue-500/10" },
  { key: "chapters_total", label: "Chapters", icon: MoveUpRight, accent: "from-cyan-300/30 to-cyan-500/10" },
  { key: "ratings_total", label: "Ratings", icon: Star, accent: "from-amber-300/30 to-amber-500/10" },
  { key: "subscriptions_active", label: "Active Subscriptions", icon: CreditCard, accent: "from-pink-300/30 to-pink-500/10" },
  { key: "ad_unlocks_24h", label: "Ad Unlocks (24h)", icon: Film, accent: "from-rose-300/30 to-rose-500/10" },
];

export default function Overview() {
  const [stats, setStats] = useState(null);
  useEffect(() => {
    api.get("/admin/analytics/overview").then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div data-testid="overview-page">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-gold/80">Dashboard</div>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">Today at a glance.</h1>
          <p className="text-cream-50/55 mt-1.5">The pulse of your reading platform — readers, releases, and revenue.</p>
        </div>
        <div className="text-[12px] text-cream-50/50">
          Avg. Rating: <span className="text-gold font-semibold" data-testid="overview-avg-rating">{stats?.avg_rating ?? "—"}</span> / 5.0
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
        {cards.map((c, idx) => (
          <div
            key={c.key}
            className="card p-5 relative overflow-hidden animate-fade-up"
            style={{ animationDelay: `${idx * 60}ms` }}
            data-testid={`stat-${c.key}`}
          >
            <div className={`absolute inset-0 opacity-50 bg-gradient-to-br ${c.accent}`} style={{ pointerEvents: "none" }} />
            <div className="relative">
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-[0.18em] text-cream-50/50">{c.label}</div>
                <c.icon className="w-4 h-4 text-cream-50/40" />
              </div>
              <div className="font-display font-semibold text-[34px] mt-3 leading-none">
                {stats?.[c.key] ?? "—"}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-5">
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Library health</h3>
            <span className="badge badge-gold">Live</span>
          </div>
          <p className="text-cream-50/60 mt-2 text-sm max-w-xl">
            Curate at least one Sinhala-language Featured pick per week to keep retention strong.
            The "Worth the Wait" feed converts ~3× better than the home grid for new releases.
          </p>
          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-white/[0.06] p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-cream-50/50">Premium %</div>
              <div className="font-display text-2xl mt-1">
                {stats && stats.users_total ? Math.round((stats.users_premium / stats.users_total) * 100) : 0}%
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.06] p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-cream-50/50">Chapters / Novel</div>
              <div className="font-display text-2xl mt-1">
                {stats && stats.novels_total ? (stats.chapters_total / Math.max(stats.novels_total, 1)).toFixed(1) : 0}
              </div>
            </div>
            <div className="rounded-xl border border-white/[0.06] p-4">
              <div className="text-[11px] uppercase tracking-[0.18em] text-cream-50/50">Ratings / User</div>
              <div className="font-display text-2xl mt-1">
                {stats && stats.users_total ? (stats.ratings_total / Math.max(stats.users_total, 1)).toFixed(2) : 0}
              </div>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold">Integrations</h3>
          <p className="text-cream-50/55 text-sm mt-1">All third-party integrations run in mock mode for this build.</p>
          <ul className="mt-4 space-y-2 text-sm">
            {["RevenueCat (Intl.)", "Dialog Ideamart (LK)", "Google AdMob", "OneSignal Push", "Google Auth", "Apple Login"].map((s) => (
              <li key={s} className="flex items-center justify-between border border-white/[0.06] rounded-lg px-3 py-2">
                <span>{s}</span>
                <span className="badge badge-mocked">MOCKED</span>
              </li>
            ))}
            <li className="flex items-center justify-between border border-gold/30 rounded-lg px-3 py-2 bg-gold/[0.06]">
              <span>OpenAI TTS (Sinhala)</span>
              <span className="badge badge-gold">LIVE</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
