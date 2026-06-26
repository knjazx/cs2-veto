import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FORMATS = [
  { id: "BO1", label: "BO1", desc: "6 банов → 1 карта\n(Decider)" },
  { id: "BO3", label: "BO3", desc: "Ban Ban → Pick Pick\n→ Ban Ban → Decider" },
  { id: "BO5", label: "BO5", desc: "Ban Ban → Pick Pick Pick\n→ Ban Ban → Decider" },
];

const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-white/30">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconDiamond = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    <path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.57a2.41 2.41 0 0 0 3.41 0l7.57-7.57a2.41 2.41 0 0 0 0-3.41L13.7 2.71a2.41 2.41 0 0 0-3.41 0z"/>
  </svg>
);
const IconMonitor = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-white/30">
    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
  </svg>
);
const IconGlobe = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-white/30">
    <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-white/30">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

function FormatPicker({ value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-xs tracking-[0.15em] uppercase text-white/35">Формат</label>
      <div className="grid grid-cols-3 gap-2">
        {FORMATS.map(f => (
          <button
            key={f.id}
            onClick={() => onChange(f.id)}
            className={`relative text-left px-3 py-3 border transition-all duration-150 rounded-sm
              ${value === f.id
                ? "border-white/50 bg-white/8"
                : "border-white/10 bg-transparent hover:border-white/20 hover:bg-white/4"}`}
          >
            {value === f.id && <div className="absolute top-0 left-0 right-0 h-0.5 bg-white rounded-t-sm" />}
            <div className="flex items-center gap-1.5 mb-0.5">
              <IconDiamond />
              <span className={`font-black tracking-widest text-sm ${value === f.id ? "text-white" : "text-white/40"}`}>
                {f.label}
              </span>
            </div>
            <p className={`text-xs leading-relaxed whitespace-pre-line ${value === f.id ? "text-white/45" : "text-white/18"}`}>
              {f.desc}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();

  // Local settings
  const [localA, setLocalA]         = useState("");
  const [localB, setLocalB]         = useState("");
  const [localFormat, setLocalFormat] = useState("BO3");

  // Online settings
  const [onlineA, setOnlineA]           = useState("");
  const [onlineB, setOnlineB]           = useState("");
  const [onlineFormat, setOnlineFormat] = useState("BO3");

  const [creating, setCreating] = useState(false);
  const [error, setError]       = useState("");
  const [joinCode, setJoinCode] = useState("");

  // Active tab: "local" | "online" | "join"
  const [tab, setTab] = useState("local");

  async function createLobby(mode) {
    setCreating(true);
    setError("");
    const a = (mode === "local" ? localA : onlineA).trim() || "Team A";
    const b = (mode === "local" ? localB : onlineB).trim() || "Team B";
    const fmt = mode === "local" ? localFormat : onlineFormat;
    try {
      const params = new URLSearchParams({ mode, format: fmt, team_a_name: a, team_b_name: b });
      const res  = await fetch(`/lobby/create?${params}`, { method: "POST" });
      const data = await res.json();
      navigate(mode === "local" ? `/room/${data.room_id}?mode=local` : `/room/${data.room_id}?team=A`);
    } catch {
      setError("Сервер недоступен. Запусти start-backend.bat");
    } finally {
      setCreating(false);
    }
  }

  function handleJoin(e) {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (code) navigate(`/room/${code}?team=B`);
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center px-4 py-10 relative overflow-hidden">

      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top, rgba(255,255,255,0.05) 0%, transparent 60%)" }} />

      {/* Logo */}
      <div className="relative mb-8 flex flex-col items-center gap-3">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-48 h-20 pointer-events-none"
            style={{ background: "radial-gradient(ellipse, rgba(255,255,255,0.1) 0%, transparent 70%)", filter: "blur(10px)" }} />
          <img src="/logo.png" alt="EFL" className="relative h-16 object-contain" draggable={false}
            style={{ mixBlendMode: "screen", filter: "brightness(1.1)" }} />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/20" />
          <span className="text-xs tracking-[0.35em] uppercase text-white/25">Map Veto System</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/20" />
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-2xl flex mb-0">
        {[
          { id: "local",  icon: <IconMonitor />, label: "Локально" },
          { id: "online", icon: <IconGlobe />,   label: "Онлайн" },
          { id: "join",   icon: <IconLock />,     label: "Войти по коду" },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold tracking-[0.15em] uppercase
              border-b-2 transition-all duration-150
              ${tab === t.id
                ? "border-white text-white bg-white/4"
                : "border-white/10 text-white/30 hover:text-white/50 hover:border-white/20"}`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl border border-white/12 border-t-0 bg-white/[0.02] p-6 rounded-b-sm">

        {/* ── LOCAL TAB ── */}
        {tab === "local" && (
          <div className="space-y-5">
            <p className="text-xs text-white/30 tracking-wide">
              Оба игрока играют на одном устройстве — удобно для LAN.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs tracking-[0.15em] uppercase text-white/35">Команда A</label>
                <div className="flex items-center gap-2 border border-white/12 bg-white/4 px-3 py-2.5 rounded-sm">
                  <IconUser />
                  <input type="text" value={localA} onChange={e => setLocalA(e.target.value)}
                    placeholder="Название команды" maxLength={30}
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs tracking-[0.15em] uppercase text-white/35">Команда B</label>
                <div className="flex items-center gap-2 border border-white/12 bg-white/4 px-3 py-2.5 rounded-sm">
                  <IconUser />
                  <input type="text" value={localB} onChange={e => setLocalB(e.target.value)}
                    placeholder="Название команды" maxLength={30}
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none" />
                </div>
              </div>
            </div>

            <FormatPicker value={localFormat} onChange={setLocalFormat} />

            <button onClick={() => createLobby("local")} disabled={creating}
              className="w-full py-4 border border-white text-white text-sm font-bold tracking-[0.25em] uppercase
                         hover:bg-white hover:text-black transition-all duration-200
                         disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 rounded-sm">
              <span>▶</span>
              <span>{creating ? "Создание..." : "Начать вето"}</span>
            </button>
          </div>
        )}

        {/* ── ONLINE TAB ── */}
        {tab === "online" && (
          <div className="space-y-5">
            <p className="text-xs text-white/30 tracking-wide">
              Создай лобби и отправь ссылку второму игроку. Team B подключается удалённо.
            </p>

            <div className="space-y-1.5">
                <label className="text-xs tracking-[0.15em] uppercase text-white/35">Ваша команда (A)</label>
                <div className="flex items-center gap-2 border border-white/12 bg-white/4 px-3 py-2.5 rounded-sm">
                  <IconUser />
                  <input type="text" value={onlineA} onChange={e => setOnlineA(e.target.value)}
                    placeholder="Ваше название" maxLength={30}
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20 focus:outline-none" />
                </div>
              </div>

            <FormatPicker value={onlineFormat} onChange={setOnlineFormat} />

            <button onClick={() => createLobby("online")} disabled={creating}
              className="w-full py-4 border border-white text-white text-sm font-bold tracking-[0.25em] uppercase
                         hover:bg-white hover:text-black transition-all duration-200
                         disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-3 rounded-sm">
              <IconGlobe />
              <span>{creating ? "Создание..." : "Создать онлайн лобби"}</span>
            </button>

            <p className="text-xs text-white/20 text-center tracking-wide">
              После создания ты получишь ссылку — отправь её сопернику
            </p>
          </div>
        )}

        {/* ── JOIN TAB ── */}
        {tab === "join" && (
          <div className="space-y-5">
            <p className="text-xs text-white/30 tracking-wide">
              Введи код лобби чтобы подключиться как Team B.
            </p>

            <form onSubmit={handleJoin} className="space-y-3">
              <div className="flex items-center gap-2 border border-white/12 bg-white/4 px-3 py-3 rounded-sm">
                <IconLock />
                <input
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Введите код лобби"
                  maxLength={8}
                  autoFocus
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/20
                             focus:outline-none tracking-[0.2em] uppercase text-center"
                />
              </div>
              <button type="submit"
                className="w-full py-4 border border-white text-white text-sm font-bold tracking-[0.25em] uppercase
                           hover:bg-white hover:text-black transition-all duration-200 rounded-sm
                           flex items-center justify-center gap-2">
                <IconLock />
                <span>Войти в лобби</span>
              </button>
            </form>
          </div>
        )}

        {error && <p className="text-xs text-red-400/70 text-center mt-3">{error}</p>}
      </div>

      {/* Footer */}
      <p className="relative mt-8 text-xs text-white/12 tracking-[0.3em] uppercase">
        Counter-Strike 2 · Veto System
      </p>
    </div>
  );
}
