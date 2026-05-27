import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import { ChevronLeft, Save, Lock, Unlock } from "lucide-react";

export default function ChapterEditor() {
  const { id, chapterId } = useParams();
  const nav = useNavigate();
  const isEdit = Boolean(chapterId);
  const [form, setForm] = useState({ chapter_number: 1, title: "", content: "", is_premium: false });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/chapters/${chapterId}`).then((r) => {
      const c = r.data;
      setForm({
        chapter_number: c.chapter_number,
        title: c.title || "",
        content: c.content || "",
        is_premium: c.is_premium,
        novel_id: c.novel_id,
      });
    });
  }, [chapterId, isEdit]);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (isEdit) {
        await api.patch(`/chapters/${chapterId}`, form);
        toast.success("Chapter updated");
      } else {
        await api.post(`/novels/${id}/chapters`, form);
        toast.success("Chapter created");
        nav(`/novels/${id}/chapters`);
        return;
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const backTo = isEdit ? `/novels/${form.novel_id}/chapters` : `/novels/${id}/chapters`;

  return (
    <div data-testid="chapter-editor-page">
      <button onClick={() => nav(backTo)} className="text-cream-50/55 hover:text-cream-50 text-sm inline-flex items-center gap-1.5">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-3xl font-semibold tracking-tight mt-2">
        {isEdit ? "Edit chapter" : "New chapter"}
      </h1>

      <form onSubmit={submit} className="mt-6 grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 card p-6 space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <div className="label mb-1.5">Chapter #</div>
              <input
                type="number"
                min="1"
                className="input"
                value={form.chapter_number}
                onChange={(e) => set("chapter_number", parseInt(e.target.value || "1", 10))}
                data-testid="chapter-number-input"
              />
            </div>
            <div className="sm:col-span-2">
              <div className="label mb-1.5">Title</div>
              <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} data-testid="chapter-title-input" />
            </div>
          </div>
          <div>
            <div className="label mb-1.5">Content</div>
            <textarea
              className="input font-serif min-h-[420px] text-[15px] leading-[1.85]"
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              data-testid="chapter-content-input"
              placeholder="Sinhala or English content. No automatic truncation — paste it as you want it read."
            />
            <div className="text-[11px] text-cream-50/45 mt-1.5">{form.content.length} characters</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <div className="label">Access</div>
            <button
              type="button"
              onClick={() => set("is_premium", !form.is_premium)}
              className={`w-full px-3 py-2.5 rounded-xl border inline-flex items-center justify-center gap-2 text-sm transition ${
                form.is_premium
                  ? "bg-gold/12 text-gold border-gold/30"
                  : "btn-ghost"
              }`}
              data-testid="chapter-premium-toggle"
            >
              {form.is_premium ? <><Lock className="w-4 h-4" /> Premium chapter</> : <><Unlock className="w-4 h-4" /> Free chapter</>}
            </button>
            <p className="text-[12px] text-cream-50/50">
              Free chapters are visible to everyone. Premium chapters require an active subscription or a rewarded-ad unlock.
            </p>

            <button type="submit" disabled={busy} className="btn-gold w-full px-4 py-2.5 rounded-xl inline-flex items-center justify-center gap-2 disabled:opacity-60" data-testid="chapter-save-btn">
              <Save className="w-4 h-4" /> {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
