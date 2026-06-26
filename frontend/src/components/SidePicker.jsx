const CT_COLOR = "#4a9eff";
const T_COLOR  = "#f5a623";

export default function SidePicker({
  pendingSide, isMySideTurn, isLocal,
  teamAName = "Team A", teamBName = "Team B",
  onPick
}) {
  const { map, choosing_team } = pendingSide;
  const chooserName = choosing_team === "A" ? teamAName : teamBName;

  const prompt = isLocal
    ? `${chooserName} — выберите сторону на ${map}`
    : isMySideTurn
    ? `Выберите вашу сторону на ${map}`
    : `${chooserName} выбирает сторону на ${map}...`;

  return (
    <div className="w-full border border-fg px-6 py-5 space-y-4 rounded-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted tracking-widest uppercase">Выбор стороны</p>
        {isMySideTurn && (
          <span className="text-xs border border-fg px-2 py-1 tracking-widest uppercase animate-pulse rounded-sm">
            {isLocal ? chooserName : "Ваш выбор"}
          </span>
        )}
      </div>

      <p className="font-semibold tracking-wider">{prompt}</p>

      {isMySideTurn ? (
        <div className="flex gap-3">
          <button
            onClick={() => onPick("CT")}
            className="flex-1 border py-4 text-sm font-bold tracking-widest uppercase
                       hover:opacity-80 transition-opacity duration-150 rounded-sm"
            style={{ borderColor: CT_COLOR, color: CT_COLOR }}
          >
            CT
          </button>
          <button
            onClick={() => onPick("T")}
            className="flex-1 border py-4 text-sm font-bold tracking-widest uppercase
                       hover:opacity-80 transition-opacity duration-150 rounded-sm"
            style={{ borderColor: T_COLOR, color: T_COLOR }}
          >
            T
          </button>
        </div>
      ) : (
        <div className="flex gap-3 opacity-25 pointer-events-none select-none">
          <div className="flex-1 border py-4 text-sm font-bold tracking-widest uppercase text-center rounded-sm"
            style={{ borderColor: CT_COLOR, color: CT_COLOR }}>
            CT
          </div>
          <div className="flex-1 border py-4 text-sm font-bold tracking-widest uppercase text-center rounded-sm"
            style={{ borderColor: T_COLOR, color: T_COLOR }}>
            T
          </div>
        </div>
      )}
    </div>
  );
}
