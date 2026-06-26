/**
 * CoinFlip — fullscreen coin toss animation
 */
import { useEffect, useState } from "react";

const SPIN_MS   = 2800;
const RESULT_MS = 2400;

export default function CoinFlip({ teamAName, teamBName, winner, onDone }) {
  const [phase, setPhase]     = useState("spinning"); // spinning | landing | result | fade
  const [opacity, setOpacity] = useState(1);

  const winnerName = winner === "A" ? teamAName : teamBName;
  const loserName  = winner === "A" ? teamBName : teamAName;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("landing"),  SPIN_MS - 400);
    const t2 = setTimeout(() => setPhase("result"),   SPIN_MS);
    const t3 = setTimeout(() => setPhase("fade"),     SPIN_MS + RESULT_MS - 400);
    const t4 = setTimeout(() => { setOpacity(0); setTimeout(onDone, 500); }, SPIN_MS + RESULT_MS);
    return () => [t1,t2,t3,t4].forEach(clearTimeout);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: "radial-gradient(ellipse at center, #111 0%, #000 70%)",
        opacity: phase === "fade" ? 0 : opacity,
        transition: phase === "fade" ? "opacity 0.5s ease" : "none",
      }}
    >
      {/* Subtle grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      {/* Logo top */}
      <div className="absolute top-8 flex flex-col items-center gap-1 opacity-40">
        <img src="/logo.png" alt="EFL" className="h-10 object-contain"
          draggable={false}
          style={{ mixBlendMode: "screen", filter: "brightness(1.1)" }} />
      </div>

      {/* Teams bar */}
      <div className="absolute top-1/4 w-full max-w-lg flex items-center justify-between px-8">
        <TeamLabel name={teamAName} side="A" active={winner === "A" && phase === "result"} dimmed={winner === "B" && phase === "result"} align="left" />
        <span className="text-muted/30 text-xs tracking-widest uppercase">vs</span>
        <TeamLabel name={teamBName} side="B" active={winner === "B" && phase === "result"} dimmed={winner === "A" && phase === "result"} align="right" />
      </div>

      {/* Coin */}
      <div className="relative flex items-center justify-center" style={{ perspective: "800px" }}>
        {/* Glow behind coin */}
        <div
          className="absolute rounded-full transition-all duration-700"
          style={{
            width: "180px", height: "180px",
            background: phase === "result"
              ? "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />

        {/* The coin */}
        <div
          style={{
            width: "140px", height: "140px",
            borderRadius: "50%",
            position: "relative",
            animation: phase === "spinning"
              ? "coinFlip 0.3s linear infinite"
              : phase === "landing"
              ? "coinLand 0.4s ease-out forwards"
              : "none",
            background: "conic-gradient(from 0deg, #e8e8e8, #a0a0a0, #ffffff, #888, #e8e8e8)",
            boxShadow: phase === "result"
              ? "0 0 60px rgba(255,255,255,0.3), 0 0 120px rgba(255,255,255,0.1), inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.3)"
              : "0 0 20px rgba(255,255,255,0.1), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.3)",
            transition: "box-shadow 0.5s ease",
          }}
        >
          {/* Coin face */}
          <div className="absolute inset-0 rounded-full flex items-center justify-center flex-col gap-1"
            style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15), transparent)" }}>
            {phase !== "result" ? (
              <span style={{ fontSize: "3rem", lineHeight: 1 }}>🪙</span>
            ) : (
              <div className="text-center">
                <div className="font-black text-black text-2xl tracking-widest">{winner}</div>
              </div>
            )}
          </div>

          {/* Coin rim */}
          <div className="absolute inset-0 rounded-full" style={{
            border: "3px solid rgba(255,255,255,0.3)",
            boxSizing: "border-box",
          }} />
        </div>
      </div>

      {/* Result text */}
      <div className="mt-12 text-center space-y-3" style={{
        opacity: phase === "result" ? 1 : 0,
        transform: phase === "result" ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>
        <p className="text-4xl font-black tracking-wider text-white" style={{
          textShadow: "0 0 40px rgba(255,255,255,0.4)"
        }}>
          {winnerName}
        </p>
        <p className="text-sm text-muted tracking-widest uppercase">
          начинает вето первым
        </p>
        <p className="text-xs text-muted/40 tracking-widest uppercase mt-2">
          {loserName} отвечает
        </p>
      </div>

      {/* Spinning label */}
      <div className="mt-12 text-center" style={{
        opacity: phase === "spinning" ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}>
        <p className="text-xs text-muted/50 tracking-widest uppercase animate-pulse">
          Определение очерёдности...
        </p>
      </div>

      {/* Decorative lines */}
      <div className="absolute bottom-16 left-0 right-0 flex items-center gap-4 px-16 opacity-20">
        <div className="flex-1 h-px bg-white/30" />
        <span className="text-xs tracking-widest uppercase text-white/50">EFL MAP VETO</span>
        <div className="flex-1 h-px bg-white/30" />
      </div>

      <style>{`
        @keyframes coinFlip {
          0%   { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes coinLand {
          0%   { transform: rotateY(720deg) translateY(-30px) scale(1.1); }
          50%  { transform: rotateY(0deg) translateY(10px) scale(0.97); }
          75%  { transform: rotateY(0deg) translateY(-6px) scale(1.02); }
          100% { transform: rotateY(0deg) translateY(0px) scale(1); }
        }
      `}</style>
    </div>
  );
}

function TeamLabel({ name, active, dimmed, align }) {
  return (
    <div className={`transition-all duration-500 ${align === "left" ? "text-left" : "text-right"}`}
      style={{ opacity: dimmed ? 0.2 : 1 }}>
      <p className={`font-bold tracking-wider text-xl transition-all duration-500
        ${active ? "text-white" : "text-muted"}`}
        style={active ? { textShadow: "0 0 30px rgba(255,255,255,0.6)" } : {}}>
        {name}
      </p>
      {active && (
        <p className="text-xs tracking-widest uppercase text-white/60 mt-1 animate-pulse">
          первый ход ✓
        </p>
      )}
    </div>
  );
}
