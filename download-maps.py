"""
Запусти один раз: python download-maps.py
Скачивает изображения карт CS2 с нескольких источников в frontend/public/maps/
"""
import urllib.request
import os
import sys

os.makedirs("frontend/public/maps", exist_ok=True)

MAPS = {
    "mirage":   [
        "https://static.wikia.nocookie.net/counterstrike/images/d/d4/Mirage_cs2_key_art.jpg",
        "https://wiki.teamliquid.net/commons/images/thumb/d/d4/Mirage_CS2.jpg/400px-Mirage_CS2.jpg",
        "https://liquipedia.net/commons/images/thumb/d/d4/Mirage_CS2.jpg/400px-Mirage_CS2.jpg",
    ],
    "inferno":  [
        "https://static.wikia.nocookie.net/counterstrike/images/5/5b/Inferno_cs2_key_art.jpg",
        "https://liquipedia.net/commons/images/thumb/7/72/Inferno_CS2.jpg/400px-Inferno_CS2.jpg",
    ],
    "nuke":     [
        "https://static.wikia.nocookie.net/counterstrike/images/8/8e/Nuke_cs2_key_art.jpg",
        "https://liquipedia.net/commons/images/thumb/4/46/Nuke_CS2.jpg/400px-Nuke_CS2.jpg",
    ],
    "overpass": [
        "https://static.wikia.nocookie.net/counterstrike/images/9/9c/Overpass_cs2_key_art.jpg",
        "https://liquipedia.net/commons/images/thumb/1/13/Overpass_CS2.jpg/400px-Overpass_CS2.jpg",
    ],
    "ancient":  [
        "https://static.wikia.nocookie.net/counterstrike/images/a/a7/Ancient_cs2_key_art.jpg",
        "https://liquipedia.net/commons/images/thumb/c/c7/Ancient_CS2.jpg/400px-Ancient_CS2.jpg",
    ],
    "anubis":   [
        "https://static.wikia.nocookie.net/counterstrike/images/5/5d/Anubis_cs2_key_art.jpg",
        "https://liquipedia.net/commons/images/thumb/0/03/Anubis_CS2.jpg/400px-Anubis_CS2.jpg",
    ],
    "vertigo":  [
        "https://static.wikia.nocookie.net/counterstrike/images/b/b6/Vertigo_cs2_key_art.jpg",
        "https://liquipedia.net/commons/images/thumb/4/4b/Vertigo_CS2.jpg/400px-Vertigo_CS2.jpg",
    ],
}

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

for map_name, urls in MAPS.items():
    out_path = f"frontend/public/maps/{map_name}.jpg"
    if os.path.exists(out_path) and os.path.getsize(out_path) > 5000:
        print(f"  SKIP {map_name} (already exists)")
        continue

    downloaded = False
    for url in urls:
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = resp.read()
            if len(data) > 5000:
                with open(out_path, "wb") as f:
                    f.write(data)
                print(f"  OK   {map_name} ({len(data)//1024} KB) from {url}")
                downloaded = True
                break
        except Exception as e:
            print(f"  FAIL {map_name} from {url}: {e}")

    if not downloaded:
        print(f"  !! Could not download {map_name} - SVG placeholder will be used")

print("\nDone. Restart frontend (npm run dev) to see images.")
