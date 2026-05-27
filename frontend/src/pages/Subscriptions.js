import React, { useEffect, useState } from "react";
import { api } from "../lib/api";

const statusBadge = (s) => {
  if (s === "active") return "badge badge-status-published";
  if (s === "cancelled") return "badge badge-status-draft";
  if (s === "expired") return "badge badge-status-draft";
  return "badge";
};

export default function Subscriptions() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/admin/subscriptions").then((r) => setItems(r.data)); }, []);
  return (
    <div data-testid="subscriptions-page">
      <div className="text-[11px] uppercase tracking-[0.28em] text-gold/80">Revenue</div>
      <h1 className="text-3xl font-semibold tracking-tight mt-1">Subscriptions</h1>
      <p className="text-cream-50/55 mt-1.5">RevenueCat (international) &amp; Dialog Ideamart (Sri Lanka) — all in mock mode.</p>

      <div className="mt-7 card overflow-hidden">
        <table className="luxe">
          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Provider</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Started</th>
              <th>Expires</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id}>
                <td className="text-cream-50/60">{s.id}</td>
                <td>#{s.user_id}</td>
                <td className="capitalize">{s.provider} <span className="badge badge-mocked ml-1.5 text-[10px]">MOCKED</span></td>
                <td className="capitalize">{s.plan}</td>
                <td><span className={statusBadge(s.status)}>{s.status}</span></td>
                <td className="text-cream-50/60">{s.started_at ? new Date(s.started_at).toLocaleDateString() : "—"}</td>
                <td className="text-cream-50/60">{s.expires_at ? new Date(s.expires_at).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={7} className="text-center text-cream-50/50 py-10">No subscriptions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
