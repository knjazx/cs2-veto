import { getMapImageSrc } from "../lib/mapAssets";
import { useState } from "react";

const CT_COLOR = "#4a9eff";
const T_COLOR  = "#f5a623";

export default function MapGrid({ maps, isMyTurn, currentAction, onMapClick, finished,
  teamAName = "Team A", teamBName = "Team B" }) {
  const name = (t) => t === "A" ? teamAName : teamBName;

  return (
    <div className="w-full space-y-1.5">
      {isMyTurn && !finished && (
        <p className="text-xs text-muted tracking-widest uppercase mb-3">
          {currentAction === "ban" ? "Выберите карту для бана" : "Выберите карту для пика"}
        </p>
      )}
      {maps.map((map) => (
        <MapRow
          key={map.name}
          map={map}
          isMyTurn={isMyTurn}
          currentAction={currentAction}
          finished={finished}
          teamName={name}
          onClick={() => {
            if (isMyTurn && map.status === "available" && !finished) {
              onMapClick(map.name);
            }
          }}
        />
      ))}
    </div>
  );
}

function MapRow({ map, isMyTurn, currentAction, finished, teamName, onClick }) {
  const { name, status, action_by, side, side_chosen_by } = map;
  const [hovered, setHovered] = useState(false);

  const isAvailable = status === "available";
  const isBanned    = status === "banned";
  const isPicked    = status === "picked";
  const isDecider   = status === "decider";
  const isClickable = isMyTurn && isAvailable && !finished;

  const pickerSide  = side ? (side === "CT" ? "T" : "CT") : null;
  const chooserSide = side;

  // Border color
  let borderColor = "transparent";
  if (isPicked || isDecider) borderColor = "#22c55e";
  if (isBanned)              borderColor = "#ef4444";

  // Hover action color
  const hoverColor = currentAction === "ban" ? "rgba(239,68,68,0.35)" : "rgba(34,197,94,0.25)";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => isClickable && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={(e) => { if (isClickable && (e.key === "Enter" || e.key === " ")) onClick(); }}
      aria-label={`${name}, ${status}`}
      className={`relative overflow-hidden select-none transition-all duration-200
        ${isClickable ? "cursor-pointer" : "cursor-default"}`}
      style={{
        border: `2px solid ${borderColor}`,
        height: "72px",
        borderRadius: "3px",
      }}
    >
      {/* Background image — full width strip */}
      <img
        src={getMapImageSrc(name)}
        alt={name}
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          objectPosition: "center 40%",
          filter: isBanned
            ? "brightness(0.3) saturate(0.3)"
            : hovered
            ? "brightness(0.75) saturate(1.1)"
            : "brightness(0.55) saturate(0.9)",
          transform: hovered && isClickable ? "scale(1.04)" : "scale(1)",
          transition: "filter 0.25s ease, transform 0.3s ease",
          transformOrigin: "center",
        }}
      />

      {/* Dark gradient left + right for depth */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.6) 100%)" }} />

      {/* Hover tint overlay */}
      {isClickable && hovered && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-150"
          style={{ background: currentAction === "ban" ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.15)" }}
        />
      )}

      {/* Ban overlay */}
      {isBanned && (
        <>
          <div className="absolute inset-0 bg-red-900/50 pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: "repeating-linear-gradient(-45deg, rgba(200,0,0,0.15) 0px, rgba(200,0,0,0.15) 2px, transparent 2px, transparent 12px)"
          }} />
        </>
      )}

      {/* Content layer */}
      <div className="relative h-full flex items-center justify-between px-5">

        {/* Left: status indicator */}
        <div className="w-32 flex items-center gap-2">
          {isBanned && (
            <span className="text-xs font-bold tracking-widest uppercase text-red-400 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
              БАН · {teamName(action_by)}
            </span>
          )}
          {isPicked && (
            <span className="text-xs font-bold tracking-widest uppercase text-green-400 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              ПИК · {teamName(action_by)}
            </span>
          )}
          {isDecider && (
            <span className="text-xs font-bold tracking-widest uppercase text-green-400 animate-pulse flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
              DECIDER
            </span>
          )}
          {isAvailable && isClickable && (
            <span className="text-xs tracking-widest uppercase text-white/30">
              {currentAction === "ban" ? "БАН" : "ПИК"}
            </span>
          )}
        </div>

        {/* Center: map name */}
        <div className="text-center">
          <span
            className={`font-bold tracking-widest uppercase text-xl drop-shadow-lg
              ${isBanned ? "text-white/30 line-through" : "text-white"}`}
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.95)" }}
          >
            {name}
          </span>
        </div>

        {/* Right: CT/T sides */}
        <div className="w-32 flex items-center justify-end gap-3">
          {isPicked && side && (
            <>
              <div className="text-right">
                <div className="text-xs tracking-widest uppercase font-bold"
                  style={{ color: pickerSide === "CT" ? CT_COLOR : T_COLOR }}>
                  {pickerSide}
                </div>
                <div className="text-xs text-white/40 tracking-wide">{teamName(action_by)}</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-left">
                <div className="text-xs tracking-widest uppercase font-bold"
                  style={{ color: chooserSide === "CT" ? CT_COLOR : T_COLOR }}>
                  {chooserSide}
                </div>
                <div className="text-xs text-white/40 tracking-wide">{teamName(side_chosen_by)}</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom border highlight for picked/decider */}
      {(isPicked || isDecider) && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500" />
      )}
      {isBanned && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500" />
      )}
    </div>
  );
}
