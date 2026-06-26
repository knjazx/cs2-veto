import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import FormatSelector from "../components/FormatSelector";
import MapGrid from "../components/MapGrid";
import VetoStatus from "../components/VetoStatus";
import LobbyInfo from "../components/LobbyInfo";
import SidePicker from "../components/SidePicker";
import CoinFlip from "../components/CoinFlip";

export default function VetoRoom() {
  const { roomId }     = useParams();
  const [searchParams] = useSearchParams();
  const modeParam      = searchParams.get("mode");
  const teamParam      = searchParams.get("team") || "A";
  const isLocal        = modeParam === "local";

  const { socket, connected } = useSocket();
  const [lobbyState, setLobbyState] = useState(null);
  const [errorMsg, setErrorMsg]     = useState("");
  const [showCoin, setShowCoin]     = useState(false);
  const [coinShown, setCoinShown]   = useState(false); // show only once
  // Team B enters their name before joining
  const [myName, setMyName]         = useState("");
  const [nameConfirmed, setNameConfirmed] = useState(isLocal || teamParam === "A");

  // ── Socket ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;
    const onState = (s) => {
      setLobbyState(prev => {
        // Show coin flip once when veto just started
        if (!prev?.started && s.started && s.first_team && !coinShown) {
          setShowCoin(true);
          setCoinShown(true);
        }
        return s;
      });
      setErrorMsg("");
    };
    const onErr   = ({ message }) => setErrorMsg(message);
    socket.on("lobby_state", onState);
    socket.on("error", onErr);
    return () => { socket.off("lobby_state", onState); socket.off("error", onErr); };
  }, [socket, coinShown]);

  useEffect(() => {
    if (!socket || !connected || !nameConfirmed) return;
    if (isLocal) socket.emit("join_local", { room_id: roomId });
    else         socket.emit("join_lobby", { room_id: roomId, team: teamParam, team_name: myName.trim() || undefined });
  }, [socket, connected, roomId, isLocal, teamParam, nameConfirmed]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectFormat = useCallback((fmt) => {
    socket?.emit("set_format", { room_id: roomId, format: fmt });
  }, [socket, roomId]);

  const handleStartVeto = useCallback(() => {
    socket?.emit("start_veto", { room_id: roomId });
  }, [socket, roomId]);

  const handleMapAction = useCallback((mapName) => {
    const team = isLocal ? lobbyState?.current_turn?.team : teamParam;
    if (!team) return;
    socket?.emit("veto_action", { room_id: roomId, team, map: mapName });
  }, [socket, roomId, isLocal, lobbyState, teamParam]);

  const handleSidePick = useCallback((side) => {
    if (!lobbyState?.pending_side_pick) return;
    const team = isLocal ? lobbyState.pending_side_pick.choosing_team : teamParam;
    socket?.emit("veto_side", { room_id: roomId, team, side });
  }, [socket, roomId, isLocal, lobbyState, teamParam]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const isMyTurn = !lobbyState?.finished && !lobbyState?.pending_side_pick && (
    isLocal ? !!lobbyState?.current_turn
            : lobbyState?.current_turn?.team === teamParam
  );

  const isMySideTurn = !!lobbyState?.pending_side_pick && (
    isLocal ? true : lobbyState.pending_side_pick.choosing_team === teamParam
  );

  const activeTeam = isLocal ? (lobbyState?.current_turn?.team || "A") : teamParam;
  const teamAName  = lobbyState?.team_a_name || "Team A";
  const teamBName  = lobbyState?.team_b_name || "Team B";
  const myTeamName = activeTeam === "A" ? teamAName : teamBName;

  // ── Loading ───────────────────────────────────────────────────────────────
  // Team B name entry screen (online only)
  if (!nameConfirmed && teamParam === "B" && !isLocal) {
    return (
      <Center>
        <div className="w-full max-w-sm space-y-6 px-4">
          <div className="text-center space-y-1">
            <img src="/logo.png" alt="EFL" className="w-32 mx-auto mb-4 object-contain" draggable={false} />
            <p className="text-xs text-muted tracking-widest uppercase">Вы подключаетесь как Team B</p>
            <p className="text-xs text-muted/50 tracking-wide">Лобби: {roomId}</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted tracking-widest uppercase">Название вашей команды</label>
            <input
              type="text"
              value={myName}
              onChange={(e) => setMyName(e.target.value)}
              placeholder="Введите название"
              maxLength={30}
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") setNameConfirmed(true); }}
              className="w-full bg-transparent border border-border px-4 py-3
                         text-sm focus:outline-none focus:border-fg transition-colors"
            />
          </div>
          <button
            onClick={() => setNameConfirmed(true)}
            className="w-full border border-fg py-3 text-sm font-bold tracking-widest uppercase
                       hover:bg-fg hover:text-bg transition-colors duration-150"
          >
            Войти в лобби
          </button>
        </div>
      </Center>
    );
  }

  if (!connected || !lobbyState) {
    return (
      <Center>
        <Spinner />
        <p className="mt-4 text-muted text-sm tracking-widest uppercase">
          {!connected ? "Подключение..." : "Загрузка..."}
        </p>
      </Center>
    );
  }

  const waitingForFormat  = !lobbyState.format;
  const waitingForPlayers = !lobbyState.players_ready;
  const readyToStart      = lobbyState.players_ready && lobbyState.format && !lobbyState.started;
  const canStart          = isLocal || teamParam === "A";

  return (
    <div className="min-h-screen flex flex-col">

      {/* Coin flip animation */}
      {showCoin && lobbyState?.first_team && (
        <CoinFlip
          teamAName={teamAName}
          teamBName={teamBName}
          winner={lobbyState.first_team}
          onDone={() => setShowCoin(false)}
        />
      )}

      {/* Header */}
      <header className="border-b border-border px-4 py-2 flex items-center justify-between shrink-0">
        <img src="/logo.png" alt="EFL" className="h-8 object-contain"
          draggable={false}
          style={{ mixBlendMode: "screen", filter: "brightness(1.1)" }} />
        <div className="flex items-center gap-3">
          {lobbyState.format && (
            <span className="text-xs text-muted tracking-widest uppercase border border-border px-2 py-1">
              {lobbyState.format}
            </span>
          )}
          <span className="text-xs text-muted tracking-widest uppercase">{roomId}</span>
          <span className={`text-xs border px-2 py-1 tracking-widest uppercase
            ${isLocal || teamParam === "A" ? "border-fg text-fg" : "border-muted text-muted"}`}>
            {isLocal ? myTeamName : (teamParam === "A" ? teamAName : teamBName)}
          </span>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-4 py-6 gap-5 max-w-5xl mx-auto w-full">

        {/* Invite link — online Team A only, only before start */}
        {!isLocal && teamParam === "A" && !lobbyState.started && (
          <LobbyInfo roomId={roomId} />
        )}

        {errorMsg && (
          <div className="w-full border border-border px-4 py-3 text-sm text-muted">
            ⚠ {errorMsg}
          </div>
        )}

        {/* Waiting for player 2 */}
        {waitingForPlayers && !isLocal && (
          <div className="w-full border border-border px-4 py-4 text-center text-sm text-muted tracking-widest uppercase">
            Ожидание {teamBName}...
          </div>
        )}

        {/* Format selector — if not pre-set */}
        {waitingForFormat && lobbyState.players_ready && (isLocal || teamParam === "A") && (
          <FormatSelector onSelect={handleSelectFormat} />
        )}
        {waitingForFormat && lobbyState.players_ready && !isLocal && teamParam === "B" && (
          <div className="w-full border border-border px-4 py-4 text-center text-sm text-muted tracking-widest uppercase">
            {teamAName} выбирает формат...
          </div>
        )}

        {/* Ready to start */}
        {readyToStart && (
          <ReadyScreen
            teamAName={teamAName}
            teamBName={teamBName}
            format={lobbyState.format}
            canStart={canStart}
            onStart={handleStartVeto}
          />
        )}

        {/* Veto UI */}
        {!waitingForFormat && lobbyState.started && (
          <>
            <VetoStatus
              lobbyState={lobbyState}
              myTeam={activeTeam}
              isMyTurn={isMyTurn}
              isLocal={isLocal}
              teamAName={teamAName}
              teamBName={teamBName}
            />

            {lobbyState.pending_side_pick && (
              <SidePicker
                pendingSide={lobbyState.pending_side_pick}
                isMySideTurn={isMySideTurn}
                isLocal={isLocal}
                teamAName={teamAName}
                teamBName={teamBName}
                onPick={handleSidePick}
              />
            )}

            <MapGrid
              maps={lobbyState.maps}
              isMyTurn={isMyTurn}
              currentAction={lobbyState.current_turn?.action}
              onMapClick={handleMapAction}
              finished={lobbyState.finished}
              teamAName={teamAName}
              teamBName={teamBName}
            />

            {lobbyState.finished && (
              <FinishedBanner
                decider={lobbyState.decider}
                maps={lobbyState.maps}
                teamAName={teamAName}
                teamBName={teamBName}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Center({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {children}
    </div>
  );
}

function Spinner() {
  return <div className="w-8 h-8 border-2 border-border border-t-fg rounded-full animate-spin" />;
}

function ReadyScreen({ teamAName, teamBName, format, canStart, onStart }) {
  const FORMAT_DESC = {
    BO1: "6 банов → 1 карта (Decider)",
    BO3: "Ban-Ban → Pick-Pick → Ban-Ban → Decider",
    BO5: "Ban-Ban → Pick-Pick-Pick-Pick → Decider",
  };

  return (
    <div className="w-full flex flex-col items-center gap-8 py-8">
      {/* Teams */}
      <div className="flex items-center gap-6 w-full max-w-sm">
        <div className="flex-1 border border-fg px-4 py-5 text-center">
          <p className="text-xs text-muted tracking-widest uppercase mb-1">Team A</p>
          <p className="font-bold tracking-wider truncate">{teamAName}</p>
        </div>
        <div className="text-muted text-xs tracking-widest uppercase">VS</div>
        <div className="flex-1 border border-border px-4 py-5 text-center">
          <p className="text-xs text-muted tracking-widest uppercase mb-1">Team B</p>
          <p className="font-bold tracking-wider truncate">{teamBName}</p>
        </div>
      </div>

      {/* Format info */}
      <div className="text-center space-y-1">
        <p className="text-2xl font-bold tracking-widest uppercase">{format}</p>
        <p className="text-xs text-muted tracking-wide">{FORMAT_DESC[format]}</p>
      </div>

      {/* Start button */}
      {canStart ? (
        <button
          onClick={onStart}
          className="border border-fg px-16 py-4 text-sm font-bold tracking-widest uppercase
                     hover:bg-fg hover:text-bg transition-colors duration-150"
        >
          Начать вето
        </button>
      ) : (
        <div className="border border-border px-12 py-4 text-sm text-muted tracking-widest uppercase">
          Ожидание старта от {teamAName}...
        </div>
      )}
    </div>
  );
}

function FinishedBanner({ decider, maps, teamAName, teamBName }) {
  const picked = maps.filter((m) => m.status === "picked");
  const name   = (t) => t === "A" ? teamAName : teamBName;

  return (
    <div className="w-full border border-fg px-6 py-6 space-y-4">
      <h2 className="text-xs font-semibold tracking-widest uppercase text-muted">
        Вето завершено
      </h2>

      {picked.length > 0 && (
        <div>
          <p className="text-xs text-muted tracking-widest uppercase mb-3">Выбранные карты</p>
          <div className="flex flex-wrap gap-2">
            {picked.map((m) => (
              <span key={m.name}
                className="border border-fg px-4 py-2 text-xs tracking-widest uppercase">
                <span className="font-bold">{m.name}</span>
                <span className="text-muted ml-2">пик: {name(m.action_by)}</span>
                {m.side && (
                  <span className="text-muted ml-2">
                    · {name(m.action_by)}: {m.side === "CT" ? "T" : "CT"}
                    {" / "}{name(m.side_chosen_by)}: {m.side}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {decider && (
        <div>
          <p className="text-xs text-muted tracking-widest uppercase mb-2">Decider</p>
          <span className="border border-fg px-4 py-2 text-sm tracking-widest uppercase font-bold">
            {decider}
          </span>
        </div>
      )}
    </div>
  );
}
