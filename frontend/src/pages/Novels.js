import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { Plus, Star, Pencil, Trash2, BookOpen, Search } from "lucide-react";
import toast from "react-hot-toast";

function StatusBadge({ status }) {
  const cls =
    status === "published"
      ? "badge-status-published"
      : status === "upcoming"
      ? "badge-status-upcoming"
      : "badge-status-draft";
  return <span className={`badge ${cls}`}>{status}</span>;
}

export default function Novels() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const load = async () => {
    const params = {};
    if (filter) params.status = filter;
    if (search) params.search = search;
    const r = await api.get("/novels", { params });
    setItems(r.data);
  };
  useEffect(() => { load(); }, [filter]);

  const remove = async (id) => {
    if (!window.confirm("Delete this novel and all its chapters?")) return;
    try {
      await api.delete(`/novels/${id}`);
      toast.success("Novel deleted");
      setItems((s) => s.filter((n) => n.id !== id));
    } catch (e) {
      toast.error(e.response?.data?.detail || "Delete failed");
    }
  };

  return (
    <div data-testid="novels-page">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-gold/80">Library</div>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">Novels</h1>
          <p className="text-cream-50/55 mt-1.5">Manage covers, scheduling and chapter access.</p>
        </div>
        <Link to="/novels/new" className="btn-gold px-4 py-2.5 rounded-xl text-sm inline-flex items-center gap-2" data-testid="novel-create-btn">
          <Plus className="w-4 h-4" /> New Novel
        </Link>
      </div>

      <div className="mt-7 flex flex-wrap gap-3 items-center">
        <form
          onSubmit={(e) => { e.preventDefault(); load(); }}
          className="relative flex-1 min-w-[260px] max-w-md"
        >
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cream-50/40" />
          <input
            className="input pl-9"
            placeholder="Search by title or author…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-testid="novels-search-input"
          />
        </form>
        <div className="flex items-center gap-2">
          {["", "published", "upcoming", "draft"].map((s) => (
            <button
              key={s || "all"}
              onClick={() => setFilter(s)}
              data-testid={`novels-filter-${s || "all"}`}
              className={`px-3 py-2 rounded-lg text-[12px] uppercase tracking-[0.14em] border ${
                filter === s
                  ? "bg-gold/12 text-gold border-gold/30"
                  : "border-white/[0.06] text-cream-50/60 hover:text-cream-50 hover:border-white/[0.16]"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-7" data-testid="novels-grid">
        {items.map((n, idx) => (
          <div key={n.id} className="card overflow-hidden animate-fade-up" style={{ animationDelay: `${idx * 40}ms` }}>
            <div className="relative aspect-[3/4] bg-ink-800">
              {n.cover_url && (
                <img src={n.cover_url} alt={n.title} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                <StatusBadge status={n.status} />
                <div className="badge bg-black/55 border border-white/15 text-cream-50/80 backdrop-blur-md">
                  <Star className="w-3 h-3 text-gold fill-gold" />
                  <span>{n.avg_rating?.toFixed(1) || "0.0"}</span>
                  <span className="text-cream-50/50">({n.rating_count})</span>
                </div>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <div className="text-[10px] uppercase tracking-[0.18em] text-cream-50/70">{n.category}</div>
                <div className="font-serif text-lg leading-tight mt-0.5 line-clamp-2">{n.title}</div>
                <div className="text-[12px] text-cream-50/60 mt-0.5">{n.author}</div>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between gap-2">
              <div className="text-[12px] text-cream-50/55 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" /> {n.chapter_count} chapters
              </div>
              <div className="flex gap-1.5">
                <Link to={`/novels/${n.id}/chapters`} className="btn-ghost px-2.5 py-1.5 rounded-lg text-[12px]" data-testid={`novel-chapters-${n.id}`}>
                  Chapters
                </Link>
                <Link to={`/novels/${n.id}/edit`} className="btn-ghost px-2 py-1.5 rounded-lg" data-testid={`novel-edit-${n.id}`}>
                  <Pencil className="w-3.5 h-3.5" />
                </Link>
                <button onClick={() => remove(n.id)} className="btn-ghost px-2 py-1.5 rounded-lg hover:!border-red-400/40 hover:!text-red-300" data-testid={`novel-delete-${n.id}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="col-span-full text-cream-50/55 text-sm">No novels match your filter.</div>
        )}
      </div>
    </div>
  );
}
