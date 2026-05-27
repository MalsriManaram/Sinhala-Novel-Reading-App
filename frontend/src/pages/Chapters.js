import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { Plus, Lock, Unlock, ChevronLeft, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function Chapters() {
  const { id } = useParams();
  const [novel, setNovel] = useState(null);
  const [items, setItems] = useState([]);

  const load = async () => {
    const [n, c] = await Promise.all([
      api.get(`/novels/${id}`),
      api.get(`/novels/${id}/chapters`),
    ]);
    setNovel(n.data);
    setItems(c.data);
  };
  useEffect(() => { load(); }, [id]);

  const remove = async (cid) => {
    if (!window.confirm("Delete this chapter?")) return;
    await api.delete(`/chapters/${cid}`);
    toast.success("Chapter deleted");
    setItems((s) => s.filter((c) => c.id !== cid));
  };

  return (
    <div data-testid="chapters-page">
      <Link to="/novels" className="text-cream-50/55 hover:text-cream-50 text-sm inline-flex items-center gap-1.5">
        <ChevronLeft className="w-4 h-4" /> Back to novels
      </Link>
      <div className="flex items-end justify-between gap-4 mt-2 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-gold/80">{novel?.category}</div>
          <h1 className="text-3xl font-semibold tracking-tight mt-1">{novel?.title}</h1>
          <p className="text-cream-50/55 mt-1.5">by {novel?.author}</p>
        </div>
        <Link to={`/novels/${id}/chapters/new`} className="btn-gold px-4 py-2.5 rounded-xl text-sm inline-flex items-center gap-2" data-testid="chapter-create-btn">
          <Plus className="w-4 h-4" /> New chapter
        </Link>
      </div>

      <div className="mt-7 card overflow-hidden">
        <table className="luxe">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Access</th>
              <th>Published</th>
              <th className="text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td className="font-display font-semibold text-gold/90">{c.chapter_number}</td>
                <td>{c.title || <span className="text-cream-50/40">Untitled</span>}</td>
                <td>
                  {c.is_premium
                    ? <span className="badge badge-gold"><Lock className="w-3 h-3" /> Premium</span>
                    : <span className="badge badge-status-published"><Unlock className="w-3 h-3" /> Free</span>}
                </td>
                <td className="text-cream-50/60">{new Date(c.published_at).toLocaleDateString()}</td>
                <td>
                  <div className="flex justify-end gap-1.5">
                    <Link to={`/chapters/${c.id}/edit`} className="btn-ghost px-2 py-1.5 rounded-lg" data-testid={`chapter-edit-${c.id}`}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Link>
                    <button onClick={() => remove(c.id)} className="btn-ghost px-2 py-1.5 rounded-lg hover:!border-red-400/40 hover:!text-red-300" data-testid={`chapter-delete-${c.id}`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="text-center text-cream-50/50 py-12">No chapters yet — add the first one.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
