from http.server import BaseHTTPRequestHandler
import json
import uuid
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))

# In-memory store shared via module-level variable
# On Vercel this persists within the same function instance
try:
    from api._store import rooms
except ImportError:
    rooms = {}

from backend.veto_logic import init_lobby


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        from urllib.parse import urlparse, parse_qs
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        mode        = params.get("mode",         ["online"])[0]
        fmt         = params.get("format",       [None])[0]
        team_a_name = params.get("team_a_name",  ["Team A"])[0]
        team_b_name = params.get("team_b_name",  ["Team B"])[0]

        room_id = str(uuid.uuid4())[:8].upper()

        import api._store as store
        lobby = init_lobby(room_id, mode=mode, format=fmt,
                           team_a_name=team_a_name, team_b_name=team_b_name)
        store.rooms[room_id] = lobby

        body = json.dumps({"room_id": room_id}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
