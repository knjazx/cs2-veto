import uuid
import logging

import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from models import LobbyState, Format, Team, MapName, Side
from veto_logic import init_lobby, apply_action, apply_side_pick, lobby_to_summary, start_veto as _start_veto

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

rooms: dict[str, LobbyState] = {}

sio = socketio.AsyncServer(
    async_mode="asgi", cors_allowed_origins="*",
    logger=False, engineio_logger=False,
)

app = FastAPI(title="CS2 Veto API")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

socket_app = socketio.ASGIApp(sio, other_asgi_app=app, socketio_path="/socket.io")


# ── REST ─────────────────────────────────────────────────────────────────────

@app.post("/lobby/create")
async def create_lobby(
    mode: str = "online",
    format: str = None,
    team_a_name: str = "Team A",
    team_b_name: str = "Team B",
):
    room_id = str(uuid.uuid4())[:8].upper()
    rooms[room_id] = init_lobby(
        room_id,
        mode=mode,
        format=format if format in ("BO1", "BO3", "BO5") else None,
        team_a_name=team_a_name[:30] or "Team A",
        team_b_name=team_b_name[:30] or "Team B",
    )
    logger.info(f"Created lobby {room_id} mode={mode} format={format}")
    return {"room_id": room_id}


@app.get("/lobby/{room_id}")
async def get_lobby(room_id: str):
    lobby = rooms.get(room_id.upper())
    if not lobby:
        return {"error": "Lobby not found"}
    return lobby_to_summary(lobby)


# ── Socket.io ─────────────────────────────────────────────────────────────────

@sio.event
async def connect(sid, environ):
    logger.info(f"Connect: {sid}")


@sio.event
async def disconnect(sid):
    logger.info(f"Disconnect: {sid}")


@sio.event
async def join_lobby(sid, data):
    room_id: str   = data.get("room_id", "").strip().upper()
    team: Team     = data.get("team")
    team_name: str = (data.get("team_name") or "").strip()[:30]

    lobby = rooms.get(room_id)
    if not lobby:
        await sio.emit("error", {"message": "Лобби не найдено."}, to=sid)
        return

    if team == "A":
        if lobby.team_a_sid and lobby.team_a_sid != sid:
            await sio.emit("error", {"message": "Слот Team A уже занят."}, to=sid)
            return
        lobby.team_a_sid = sid
        if team_name:
            lobby.team_a_name = team_name
    elif team == "B":
        if lobby.team_b_sid and lobby.team_b_sid != sid:
            await sio.emit("error", {"message": "Слот Team B уже занят."}, to=sid)
            return
        lobby.team_b_sid = sid
        if team_name:
            lobby.team_b_name = team_name
    else:
        await sio.emit("error", {"message": "Неверная команда."}, to=sid)
        return

    await sio.enter_room(sid, room_id)
    await sio.emit("lobby_state", lobby_to_summary(lobby), room=room_id)


@sio.event
async def join_local(sid, data):
    room_id: str = data.get("room_id", "").strip().upper()
    lobby = rooms.get(room_id)
    if not lobby:
        await sio.emit("error", {"message": "Лобби не найдено."}, to=sid)
        return
    lobby.team_a_sid = sid
    lobby.team_b_sid = sid
    lobby.mode = "local"
    await sio.enter_room(sid, room_id)
    await sio.emit("lobby_state", lobby_to_summary(lobby), room=room_id)


@sio.event
async def set_format(sid, data):
    room_id: str = data.get("room_id", "").strip().upper()
    fmt: Format = data.get("format")

    lobby = rooms.get(room_id)
    if not lobby:
        await sio.emit("error", {"message": "Лобби не найдено."}, to=sid)
        return
    if lobby.mode == "online" and lobby.team_a_sid != sid:
        await sio.emit("error", {"message": "Только Team A может выбрать формат."}, to=sid)
        return
    if fmt not in ("BO1", "BO3", "BO5"):
        await sio.emit("error", {"message": "Неверный формат."}, to=sid)
        return
    if lobby.format is not None:
        await sio.emit("error", {"message": "Формат уже выбран."}, to=sid)
        return

    lobby.format = fmt
    await sio.emit("lobby_state", lobby_to_summary(lobby), room=room_id)


@sio.event
async def start_veto(sid, data):
    """Randomize first team and start the veto."""
    room_id: str = data.get("room_id", "").strip().upper()
    lobby = rooms.get(room_id)
    if not lobby:
        await sio.emit("error", {"message": "Лобби не найдено."}, to=sid)
        return
    if lobby.mode == "online" and lobby.team_a_sid != sid:
        await sio.emit("error", {"message": "Только Team A может начать вето."}, to=sid)
        return
    if not lobby.format:
        await sio.emit("error", {"message": "Сначала выберите формат."}, to=sid)
        return
    if not (lobby.team_a_sid and lobby.team_b_sid):
        await sio.emit("error", {"message": "Оба игрока должны подключиться."}, to=sid)
        return
    if lobby.started:
        await sio.emit("error", {"message": "Вето уже начато."}, to=sid)
        return
    summary = _start_veto(lobby)
    await sio.emit("lobby_state", summary, room=room_id)


@sio.event
async def veto_action(sid, data):
    room_id: str = data.get("room_id", "").strip().upper()
    team: Team = data.get("team")
    map_name: MapName = data.get("map")

    lobby = rooms.get(room_id)
    if not lobby:
        await sio.emit("error", {"message": "Лобби не найдено."}, to=sid)
        return
    if team == "A" and lobby.team_a_sid != sid:
        await sio.emit("error", {"message": "Вы не Team A."}, to=sid)
        return
    if team == "B" and lobby.team_b_sid != sid:
        await sio.emit("error", {"message": "Вы не Team B."}, to=sid)
        return

    try:
        summary = apply_action(lobby, team, map_name)
    except ValueError as e:
        await sio.emit("error", {"message": str(e)}, to=sid)
        return

    await sio.emit("lobby_state", summary, room=room_id)


@sio.event
async def veto_side(sid, data):
    room_id: str = data.get("room_id", "").strip().upper()
    team: Team = data.get("team")
    side: Side = data.get("side")

    lobby = rooms.get(room_id)
    if not lobby:
        await sio.emit("error", {"message": "Лобби не найдено."}, to=sid)
        return
    if team == "A" and lobby.team_a_sid != sid:
        await sio.emit("error", {"message": "Вы не Team A."}, to=sid)
        return
    if team == "B" and lobby.team_b_sid != sid:
        await sio.emit("error", {"message": "Вы не Team B."}, to=sid)
        return

    try:
        summary = apply_side_pick(lobby, team, side)
    except ValueError as e:
        await sio.emit("error", {"message": str(e)}, to=sid)
        return

    await sio.emit("lobby_state", summary, room=room_id)
