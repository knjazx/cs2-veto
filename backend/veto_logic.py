import random

from models import (
    LobbyState, MapState, ALL_MAPS, VETO_SEQUENCES,
    Team, MapName, Format, Side,
)


def init_lobby(room_id: str, mode: str = "online",
               format: Format = None,
               team_a_name: str = "Team A",
               team_b_name: str = "Team B") -> LobbyState:
    return LobbyState(
        room_id=room_id,
        mode=mode,
        format=format,
        team_a_name=team_a_name,
        team_b_name=team_b_name,
        maps=[MapState(name=m) for m in ALL_MAPS],
    )


def get_current_step(lobby: LobbyState) -> dict | None:
    if lobby.format is None or lobby.finished or not lobby.started:
        return None
    if lobby.pending_side_pick:
        return None
    seq = _get_sequence(lobby)
    if lobby.current_step >= len(seq):
        return None
    team, action = seq[lobby.current_step]
    return {"team": team, "action": action, "step_index": lobby.current_step}


def start_veto(lobby: LobbyState) -> dict:
    """Randomize who goes first, then mark as started."""
    lobby.first_team = random.choice(["A", "B"])
    lobby.started = True
    return _summary(lobby)


def _get_sequence(lobby: LobbyState) -> list:
    """
    Return the veto sequence, optionally swapping A↔B if first_team == "B".
    """
    base = VETO_SEQUENCES[lobby.format]
    if lobby.first_team == "B":
        # Swap A and B in every step
        return [("B" if t == "A" else "A", a) for t, a in base]
    return base


def apply_action(lobby: LobbyState, team: Team, map_name: MapName) -> dict:
    if lobby.format is None:
        raise ValueError("Format not selected yet.")
    if lobby.finished:
        raise ValueError("Veto is already finished.")
    if lobby.pending_side_pick:
        raise ValueError("Waiting for side selection before next action.")

    step = get_current_step(lobby)
    if step is None:
        raise ValueError("No pending steps.")
    if step["team"] != team:
        raise ValueError(f"It's {_name(lobby, step['team'])}'s turn, not {_name(lobby, team)}.")

    map_obj = next((m for m in lobby.maps if m.name == map_name), None)
    if map_obj is None:
        raise ValueError(f"Map '{map_name}' not found.")
    if map_obj.status != "available":
        raise ValueError(f"Map '{map_name}' is already {map_obj.status}.")

    map_obj.status = "banned" if step["action"] == "ban" else "picked"
    map_obj.action_by = team
    map_obj.step_index = step["step_index"]

    lobby.current_step += 1

    if step["action"] == "pick":
        opposing: Team = "B" if team == "A" else "A"
        lobby.pending_side_pick = {"map": map_name, "choosing_team": opposing}
    else:
        _check_finalize(lobby)

    return _summary(lobby)


def apply_side_pick(lobby: LobbyState, team: Team, side: Side) -> dict:
    if not lobby.pending_side_pick:
        raise ValueError("No side selection pending.")
    pending = lobby.pending_side_pick
    if pending["choosing_team"] != team:
        raise ValueError(f"It's {_name(lobby, pending['choosing_team'])}'s turn to choose the side.")

    map_obj = next((m for m in lobby.maps if m.name == pending["map"]), None)
    map_obj.side = side
    map_obj.side_chosen_by = team
    lobby.pending_side_pick = None
    _check_finalize(lobby)
    return _summary(lobby)


def _check_finalize(lobby: LobbyState):
    if lobby.format is None:
        return
    seq = _get_sequence(lobby)
    if lobby.current_step >= len(seq) and not lobby.pending_side_pick:
        _finalize(lobby)


def _finalize(lobby: LobbyState):
    remaining = [m for m in lobby.maps if m.status == "available"]
    if remaining:
        remaining[0].status = "decider"
        lobby.decider = remaining[0].name
    lobby.finished = True


def _name(lobby: LobbyState, team: Team) -> str:
    return lobby.team_a_name if team == "A" else lobby.team_b_name


def _summary(lobby: LobbyState) -> dict:
    step = get_current_step(lobby)
    return {
        "room_id": lobby.room_id,
        "mode": lobby.mode,
        "format": lobby.format,
        "team_a_name": lobby.team_a_name,
        "team_b_name": lobby.team_b_name,
        "maps": [m.model_dump() for m in lobby.maps],
        "current_step": lobby.current_step,
        "started": lobby.started,
        "finished": lobby.finished,
        "decider": lobby.decider,
        "current_turn": step,
        "pending_side_pick": lobby.pending_side_pick,
        "players_ready": lobby.team_a_sid is not None and lobby.team_b_sid is not None,
        "first_team": lobby.first_team,
    }


def lobby_to_summary(lobby: LobbyState) -> dict:
    return _summary(lobby)
