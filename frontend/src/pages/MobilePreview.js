import React, { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { Play, Pause, RotateCcw, Volume2, Star, ChevronLeft, ChevronRight, Smartphone } from "lucide-react";
import toast from "react-hot-toast";

/**
 * In-browser simulation of the Expo mobile reader.  This is intentionally
 * compact — its purpose is to demo the API + TTS flows for stakeholders
 * who can't run the Expo source locally.
 */
export default function MobilePreview() {
  const [novels, setNovels] = useState([]);
  const [active, setActive] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [chapter, setChapter] = useState(null);
  const [fontSize, setFontSize] = useState(17);
  const [speed, setSpeed] = useState(1.0);
  const [voice, setVoice] = useState("nova");
  const [busy, setBusy] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [sentences, setSentences] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const audioRef = useRef(null);
  const tickRef = useRef(null);

  useEffect(() => {
    api.get("/novels?status=published").then((r) => {
      setNovels(r.data);
      if (r.data[0]) selectNovel(r.data[0]);
    });
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  const selectNovel = async (n) => {
    setActive(n);
    setChapter(null); setSentences([]); setActiveIdx(-1);
    const r = await api.get(`/novels/${n.id}/chapters`);
    setChapters(r.data);
    if (r.data[0]) loadChapter(r.data[0].id);
  };

  const loadChapter = async (cid) => {
    const r = await api.get(`/chapters/${cid}`);
    setChapter(r.data);
    setSentences([]); setActiveIdx(-1);
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPlaying(false);
  };

  const playTTS = async () => {
    if (!chapter || chapter.locked) {
      toast.error("Chapter is locked — subscribe or watch a rewarded ad on the device.");
      return;
    }
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }
    setBusy(true);
    try {
      const text = chapter.content.slice(0, 1500); // keep demo fast
      const r = await api.post("/tts/speech/sentences", {
        text,
        voice,
        speed,
        model: "tts-1",
        response_format: "mp3",
      });
      const { audio_base64, sentences: offsets } = r.data;
      setSentences(offsets);
      const blob = new Blob(
        [Uint8Array.from(atob(audio_base64), (c) => c.charCodeAt(0))],
        { type: "audio/mpeg" }
      );
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.playbackRate = speed;
      audio.onplay = () => setPlaying(true);
      audio.onpause = () => setPlaying(false);
      audio.onended = () => { setPlaying(false); setActiveIdx(-1); };
      audioRef.current = audio;
      if (tickRef.current) clearInterval(tickRef.current);
      tickRef.current = setInterval(() => {
        if (!audioRef.current) return;
        const t = audioRef.current.currentTime;
        const idx = offsets.findIndex((s) => t >= s.start_s && t < s.end_s);
        setActiveIdx(idx);
      }, 120);
      await audio.play();
    } catch (e) {
      toast.error(e.response?.data?.detail || "TTS failed");
    } finally {
      setBusy(false);
    }
  };

  const rewind = () => {
    if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
  };

  const rate = async (score) => {
    try {
      await api.post("/ratings", { novel_id: active.id, score });
      toast.success(`Rated ${score} stars`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Rating failed");
    }
  };

  const renderContent = () => {
    if (!chapter) return null;
    if (chapter.locked) {
      return (
        <div className="text-cream-50/70 p-6 text-center">
          <div className="badge badge-gold mx-auto">PREMIUM</div>
          <div className="font-serif text-xl mt-3">This chapter is locked.</div>
          <div className="text-sm text-cream-50/55 mt-1.5">
            On the mobile device, users can watch a rewarded ad or subscribe to unlock.
          </div>
        </div>
      );
    }
    if (sentences.length === 0) {
      return chapter.content.split("\n").map((p, i) => (
        <p key={i} className="mb-4 font-serif leading-[1.85]" style={{ fontSize }}>
          {p}
        </p>
      ));
    }
    return (
      <div className="font-serif leading-[1.85]" style={{ fontSize }}>
        {sentences.map((s, i) => (
          <span
            key={i}
            className={`inline transition rounded px-0.5 ${i === activeIdx ? "bg-gold/25 text-cream-50" : ""}`}
          >
            {s.text + " "}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div data-testid="mobile-preview-page">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-gold/80">
        Simulator <Smartphone className="w-3 h-3" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight mt-1">Mobile preview</h1>
      <p className="text-cream-50/55 mt-1.5 max-w-2xl">
        A condensed in-browser run of the Expo reader — useful for QA and stakeholder demos.
        The real iOS / Android build lives in <span className="text-gold">/app/mobile</span>.
      </p>

      <div className="mt-7 grid lg:grid-cols-12 gap-6">
        {/* Novel rail */}
        <div className="lg:col-span-3 card p-3 max-h-[680px] overflow-y-auto scrollbar-thin">
          {novels.map((n) => (
            <button
              key={n.id}
              onClick={() => selectNovel(n)}
              className={`w-full text-left rounded-xl p-2.5 flex gap-3 items-center transition ${
                active?.id === n.id ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
              }`}
              data-testid={`preview-novel-${n.id}`}
            >
              <div className="w-12 h-16 rounded-md overflow-hidden bg-black/40 shrink-0">
                {n.cover_url && <img src={n.cover_url} alt={n.title} className="w-full h-full object-cover" />}
              </div>
              <div className="min-w-0">
                <div className="font-serif text-[13px] leading-tight truncate">{n.title}</div>
                <div className="text-[11px] text-cream-50/55 truncate">{n.author}</div>
                <div className="text-[11px] text-gold mt-0.5 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-gold" /> {n.avg_rating?.toFixed(1) || "0.0"}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Phone frame */}
        <div className="lg:col-span-6">
          <div className="mx-auto" style={{ maxWidth: 380 }}>
            <div className="rounded-[36px] border border-white/[0.10] shadow-glass overflow-hidden bg-ink-900">
              <div className="px-4 py-3 flex items-center justify-between border-b border-white/[0.06]">
                <div className="flex items-center gap-2 min-w-0">
                  <button onClick={() => { const i = chapters.findIndex((c)=>c.id===chapter?.id); if (i>0) loadChapter(chapters[i-1].id); }}
                    className="btn-ghost px-2 py-1.5 rounded-lg" data-testid="preview-prev-chapter">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-cream-50/45 truncate">
                      {active?.title}
                    </div>
                    <div className="text-[13px] truncate">
                      Ch. {chapter?.chapter_number} — {chapter?.title || "Untitled"}
                    </div>
                  </div>
                </div>
                <button onClick={() => { const i = chapters.findIndex((c)=>c.id===chapter?.id); if (i<chapters.length-1) loadChapter(chapters[i+1].id); }}
                  className="btn-ghost px-2 py-1.5 rounded-lg" data-testid="preview-next-chapter">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 py-6 max-h-[480px] overflow-y-auto scrollbar-thin" data-testid="preview-reader-content">
                {renderContent()}
              </div>

              {/* TTS player */}
              <div className="border-t border-white/[0.06] p-3 flex items-center gap-2 glass">
                <button onClick={rewind} className="btn-ghost px-2 py-2 rounded-lg" data-testid="preview-rewind-btn">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={playTTS}
                  disabled={busy}
                  className="btn-gold px-3 py-2 rounded-xl inline-flex items-center gap-1.5"
                  data-testid="preview-play-btn"
                >
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span className="text-[12px]">{busy ? "Loading…" : (playing ? "Pause" : "Listen")}</span>
                </button>
                <div className="flex items-center gap-1 ml-1">
                  {[1, 1.25, 1.5, 2].map((sp) => (
                    <button
                      key={sp}
                      onClick={() => { setSpeed(sp); if (audioRef.current) audioRef.current.playbackRate = sp; }}
                      className={`px-2 py-1 rounded text-[11px] border ${
                        speed === sp ? "bg-gold/15 text-gold border-gold/30" : "border-white/[0.08] text-cream-50/60"
                      }`}
                      data-testid={`preview-speed-${sp}`}
                    >
                      {sp}x
                    </button>
                  ))}
                </div>
                <Volume2 className="w-4 h-4 text-cream-50/40 ml-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="lg:col-span-3 space-y-5">
          <div className="card p-5">
            <div className="label mb-1.5">Font size · {fontSize}px</div>
            <input
              type="range" min="14" max="24" value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
              className="w-full accent-gold"
              data-testid="preview-fontsize-slider"
            />
          </div>
          <div className="card p-5">
            <div className="label mb-1.5">TTS voice</div>
            <select className="input" value={voice} onChange={(e) => setVoice(e.target.value)} data-testid="preview-voice-select">
              {["alloy","ash","coral","echo","fable","nova","onyx","sage","shimmer"].map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <p className="text-[11px] text-cream-50/45 mt-2">
              Powered by OpenAI TTS (Emergent LLM key). All voices speak Sinhala via phonetic rendering.
            </p>
          </div>

          <div className="card p-5">
            <div className="label mb-2">Rate this novel</div>
            <div className="flex gap-1.5" data-testid="preview-rating-stars">
              {[1,2,3,4,5].map((s) => (
                <button key={s} onClick={() => rate(s)} className="btn-ghost p-2 rounded-lg" data-testid={`preview-rate-${s}`}>
                  <Star className="w-4 h-4 text-gold" />
                </button>
              ))}
            </div>
            <p className="text-[11px] text-cream-50/45 mt-2">
              Users can update an existing rating — never duplicate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
