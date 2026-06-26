import { VETO_SEQUENCES_META } from "../lib/vetoMeta";

export default function VetoStatus({
  lobbyState, myTeam, isMyTurn, isLocal, teamAName = "Team A", teamBName = "Team B"
}) {
  const { format, current_turn, current_step, finished, maps, pending_side_pick, first_team } = lobbyState;

  // Build sequence with swapped teams if first_team == "B"
  const baseSeq = VETO_SEQUENCES_META[format] || [];
  const sequence = first_team === "B"
    ? baseSeq.map(s => ({ ...s, team: s.team === "A" ? "B" : "A" }))
    : baseSeq;
  const name = (t) => t === "A" ? teamAName : teamBName;

  let statusLabel = "";
  let subLabel = "";

  if (finished) {
    statusLabel = "Вето завершено";
  } else if (pending_side_pick) {
    statusLabel = `${name(pending_side_pick.choosing_team)}: выбор стороны`;
    subLabel = pending_side_pick.map;
  } else if (current_turn) {
    const act = current_turn.action === "ban" ? "БАН" : "ПИК";
    statusLabel = `${name(current_turn.team)}: ${act}`;
  }

  const highlight = !finished && (isMyTurn || (pending_side_pick &&
    (isLocal || pending_side_pick.choosing_team === myTeam)));

  return (
    <div className="w-full space-y-4">
      {/* Banner */}
      <div className={`border px-4 py-4 flex items-center justify-between transition-colors duration-200
        ${highlight ? "border-fg bg-fg/5" : "border-border"}`}>
        <div>
          <p className="text-xs text-muted tracking-widest uppercase">
            {finished ? "Результат" : pending_side_pick ? "Выбор стороны" : "Текущий ход"}
          </p>
          <p className={`mt-1 font-semibold tracking-wider text-lg
            ${highlight ? "text-fg" : "text-muted"}`}>
            {statusLabel || "—"}
          </p>
          {subLabel && (
            <p className="text-xs text-muted mt-0.5 tracking-widest uppercase">{subLabel}</p>
          )}
        </div>

        {isMyTurn && !finished && !pending_side_pick && (
          <span className="text-xs border border-fg px-3 py-1 tracking-widest uppercase animate-pulse shrink-0 ml-4">
            {isLocal ? name(current_turn?.team) : "Ваш ход"}
          </span>
        )}
      </div>

      {/* Timeline */}
      {sequence.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sequence.map((step, idx) => {
            const actedMap  = maps.find((m) => m.step_index === idx);
            const isPast    = idx < current_step;
            const isCurrent = idx === current_step && !finished && !pending_side_pick;

            return (
              <div key={idx}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 border text-xs
                  tracking-widest uppercase transition-colors min-w-[64px] text-center
                  ${isCurrent  ? "border-fg text-fg"
                    : isPast   ? "border-border text-muted"
                               : "border-border/20 text-muted/30"}`}>
                <span>{step.action === "ban" ? "BAN" : "PICK"} {step.team}</span>
                {actedMap && (
                  <span className="normal-case font-normal opacity-60 leading-tight max-w-[80px] truncate">
                    {actedMap.name}
                  </span>
                )}
              </div>
            );
          })}

          {/* Decider slot */}
          <div className={`flex flex-col items-center gap-0.5 px-3 py-2 border text-xs
            tracking-widest uppercase min-w-[64px] text-center
            ${finished ? "border-fg text-fg" : "border-border/20 text-muted/30"}`}>
            <span>DECIDER</span>
            {lobbyState.decider && (
              <span className="normal-case font-normal opacity-60 leading-tight">
                {lobbyState.decider}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
