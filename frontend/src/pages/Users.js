import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Shield, Sparkles } from "lucide-react";

export default function Users() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/admin/users").then((r) => setItems(r.data)); }, []);

  return (
    <div data-testid="users-page">
      <div className="text-[11px] uppercase tracking-[0.28em] text-gold/80">Readers</div>
      <h1 className="text-3xl font-semibold tracking-tight mt-1">Users</h1>
      <p className="text-cream-50/55 mt-1.5">All accounts across local, phone-OTP, Google and Apple providers.</p>

      <div className="mt-7 card overflow-hidden">
        <table className="luxe">
          <thead>
            <tr>
              <th>User</th>
              <th>Provider</th>
              <th>Country</th>
              <th>Role</th>
              <th>Premium</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {items.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="font-medium">{u.name || u.email || u.phone}</div>
                  <div className="text-[11px] text-cream-50/45">{u.email || u.phone}</div>
                </td>
                <td className="capitalize">{u.provider}</td>
                <td>{u.country_code || "—"}</td>
                <td>
                  {u.role === "admin"
                    ? <span className="badge badge-gold"><Shield className="w-3 h-3" /> Admin</span>
                    : <span className="badge">User</span>}
                </td>
                <td>
                  {u.premium_status
                    ? <span className="badge badge-gold"><Sparkles className="w-3 h-3" /> Premium</span>
                    : <span className="text-cream-50/45 text-[12px]">Free</span>}
                </td>
                <td className="text-cream-50/60">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} className="text-center text-cream-50/50 py-10">No users yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
