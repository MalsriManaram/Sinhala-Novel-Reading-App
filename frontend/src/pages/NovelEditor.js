import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { ChevronLeft, Save } from "lucide-react";

const CATEGORIES = ["General", "Romance", "Mystery", "Thriller", "Hard Science Fiction", "Historical Fiction", "Fantasy", "Drama"];
const STATUSES = ["draft", "upcoming", "published"];

export default function NovelEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({
    title: "",
    author: "",
    synopsis: "",
    cover_url: "",
    category: "General",
    status: "draft",
    release_at: "",
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/novels/${id}`).then((r) => {
      const n = r.data;
      setForm({
        title: n.title || "",
        author: n.author || "",
        synopsis: n.synopsis || "",
        cover_url: n.cover_url || "",
        category: n.category || "General",
        status: n.status || "draft",
        release_at: n.release_at ? new Date(n.release_at).toISOString().slice(0, 16) : "",
      });
    });
  }, [id, isEdit]);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form };
      if (payload.release_at) {
        payload.release_at = new Date(payload.release_at).toISOString();
      } else {
        payload.release_at = null;
      }
      if (isEdit) {
        await api.patch(`/novels/${id}`, payload);
        toast.success("Novel updated");
      } else {
        const r = await api.post("/novels", payload);
        toast.success("Novel created");
        nav(`/novels/${r.data.id}/edit`);
        return;
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div data-testid="novel-editor-page">
      <button onClick={() => nav(-1)} className="text-cream-50/55 hover:text-cream-50 text-sm inline-flex items-center gap-1.5" data-testid="novel-editor-back">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-3xl font-semibold tracking-tight mt-2">{isEdit ? "Edit novel" : "New novel"}</h1>

      <form onSubmit={submit} className="mt-7 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6 space-y-4">
          <div>
            <div className="label mb-1.5">Title</div>
            <input className="input" required value={form.title} onChange={(e) => set("title", e.target.value)} data-testid="novel-title-input" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="label mb-1.5">Author</div>
              <input className="input" required value={form.author} onChange={(e) => set("author", e.target.value)} data-testid="novel-author-input" />
            </div>
            <div>
              <div className="label mb-1.5">Category</div>
              <select className="input" value={form.category} onChange={(e) => set("category", e.target.value)} data-testid="novel-category-select">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div className="label mb-1.5">Synopsis</div>
            <textarea
              className="input min-h-[160px] font-serif"
              value={form.synopsis}
              onChange={(e) => set("synopsis", e.target.value)}
              data-testid="novel-synopsis-input"
              placeholder="A short, evocative description shown on the cover screen…"
            />
          </div>
          <div>
            <div className="label mb-1.5">Cover URL</div>
            <input className="input" value={form.cover_url} onChange={(e) => set("cover_url", e.target.value)} data-testid="novel-cover-input" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <div>
              <div className="label mb-1.5">Status</div>
              <select className="input" value={form.status} onChange={(e) => set("status", e.target.value)} data-testid="novel-status-select">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {form.status === "upcoming" && (
              <div>
                <div className="label mb-1.5">Release at</div>
                <input
                  type="datetime-local"
                  className="input"
                  value={form.release_at}
                  onChange={(e) => set("release_at", e.target.value)}
                  data-testid="novel-release-input"
                />
              </div>
            )}
            <button type="submit" disabled={busy} className="btn-gold w-full px-4 py-2.5 rounded-xl inline-flex items-center justify-center gap-2 disabled:opacity-60" data-testid="novel-save-btn">
              <Save className="w-4 h-4" /> {busy ? "Saving…" : "Save"}
            </button>
          </div>
          {form.cover_url && (
            <div className="card overflow-hidden">
              <div className="aspect-[3/4]">
                <img src={form.cover_url} alt="preview" className="w-full h-full object-cover" />
              </div>
              <div className="p-3 text-[11px] uppercase tracking-[0.18em] text-cream-50/45 text-center">Live cover preview</div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
