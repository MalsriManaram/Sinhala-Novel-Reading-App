import React, { useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { Bell, Send } from "lucide-react";

const SEGMENTS = [
  { id: "all", label: "All users" },
  { id: "premium", label: "Premium only" },
  { id: "lk", label: "Sri Lanka" },
  { id: "intl", label: "International" },
];

export default function Push() {
  const [title, setTitle] = useState("New chapter just dropped");
  const [message, setMessage] = useState("Resume where you left off — your story has a new turn.");
  const [segment, setSegment] = useState("all");
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);

  const send = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const r = await api.post("/admin/push/compose", { title, message, segment });
      if (r.data.sent) {
        toast.success("Mock push delivered");
        setHistory((s) => [{ ...r.data, id: Date.now() }, ...s].slice(0, 8));
      } else toast.error(r.data.error || "Failed");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div data-testid="push-page">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-gold/80">
        OneSignal <span className="badge badge-mocked">MOCKED</span>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight mt-1">Push composer</h1>
      <p className="text-cream-50/55 mt-1.5">Behavioral and broadcast pushes. All sends are mock-routed for this build.</p>

      <div className="mt-7 grid lg:grid-cols-3 gap-6">
        <form onSubmit={send} className="lg:col-span-2 card p-6 space-y-4">
          <div>
            <div className="label mb-1.5">Title</div>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} data-testid="push-title-input" />
          </div>
          <div>
            <div className="label mb-1.5">Message</div>
            <textarea className="input min-h-[120px]" value={message} onChange={(e) => setMessage(e.target.value)} data-testid="push-message-input" />
          </div>
          <div>
            <div className="label mb-1.5">Segment</div>
            <div className="flex flex-wrap gap-2">
              {SEGMENTS.map((s) => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setSegment(s.id)}
                  className={`px-3 py-2 rounded-lg text-[12px] border ${
                    segment === s.id
                      ? "bg-gold/12 text-gold border-gold/30"
                      : "border-white/[0.06] text-cream-50/60 hover:text-cream-50 hover:border-white/[0.16]"
                  }`}
                  data-testid={`push-segment-${s.id}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={sending} className="btn-gold px-4 py-2.5 rounded-xl inline-flex items-center gap-2 disabled:opacity-60" data-testid="push-send-btn">
            <Send className="w-4 h-4" /> {sending ? "Sending…" : "Send (Mocked)"}
          </button>
        </form>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Live preview</h3>
            <Bell className="w-4 h-4 text-cream-50/40" />
          </div>
          <div className="mt-4 rounded-2xl p-4 bg-black/55 border border-white/[0.08]">
            <div className="text-[11px] uppercase tracking-[0.18em] text-cream-50/45">Sinhala Novels</div>
            <div className="font-semibold mt-1.5">{title || "Notification title"}</div>
            <div className="text-cream-50/70 text-sm mt-1">{message || "Notification body…"}</div>
          </div>

          <h4 className="mt-7 text-[12px] uppercase tracking-[0.16em] text-cream-50/50">Recent (this session)</h4>
          <ul className="mt-2 space-y-2 max-h-[260px] overflow-y-auto scrollbar-thin">
            {history.map((h) => (
              <li key={h.id} className="rounded-lg border border-white/[0.06] p-2.5">
                <div className="text-[13px] font-medium">{h.title}</div>
                <div className="text-[11px] text-cream-50/55">{h.segment} · {new Date(h.delivered_at).toLocaleTimeString()}</div>
              </li>
            ))}
            {history.length === 0 && <li className="text-[12px] text-cream-50/45">Nothing sent yet.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
