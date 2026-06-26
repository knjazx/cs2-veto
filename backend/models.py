from pydantic import BaseModel
from typing import Literal, Optional


MapName = Literal[
    "Mirage", "Inferno", "Nuke", "Overpass", "Ancient", "Anubis", "Dust2"
]

Format = Literal["BO1", "BO3", "BO5"]
ActionType = Literal["ban", "pick"]
Team = Literal["A", "B"]
Side = Literal["CT", "T"]
Mode = Literal["online", "local"]

VETO_SEQUENCES: dict[Format, list[tuple[Team, ActionType]]] = {
    "BO1": [
        ("A", "ban"), ("B", "ban"),
        ("A", "ban"), ("B", "ban"),
        ("A", "ban"), ("B", "ban"),
    ],
    "BO3": [
        ("A", "ban"),  ("B", "ban"),
        ("A", "pick"), ("B", "pick"),
        ("A", "ban"),  ("B", "ban"),
    ],
    "BO5": [
        ("A", "ban"),  ("B", "ban"),
        ("A", "pick"), ("B", "pick"),
        ("A", "pick"), ("B", "pick"),
    ],
}

ALL_MAPS: list[MapName] = [
    "Mirage", "Inferno", "Nuke", "Overpass", "Ancient", "Anubis", "Dust2"
]


class MapState(BaseModel):
    name: MapName
    status: Literal["available", "banned", "picked", "decider"] = "available"
    action_by: Optional[Team] = None
    step_index: Optional[int] = None
    side_chosen_by: Optional[Team] = None
    side: Optional[Side] = None


class LobbyState(BaseModel):
    room_id: str
    mode: Mode = "online"
    format: Optional[Format] = None
    team_a_name: str = "Team A"
    team_b_name: str = "Team B"
    team_a_sid: Optional[str] = None
    team_b_sid: Optional[str] = None
    maps: list[MapState] = []
    current_step: int = 0
    started: bool = False
    finished: bool = False
    decider: Optional[MapName] = None
    pending_side_pick: Optional[dict] = None
    # Randomized first team: "A" or "B" — set on start_veto
    first_team: Optional[Team] = None
