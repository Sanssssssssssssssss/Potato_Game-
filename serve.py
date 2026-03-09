from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os

PORT = 4173
ROOT = Path(__file__).resolve().parent
URL = f"http://127.0.0.1:{PORT}/index.html"


class QuietHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)


if __name__ == "__main__":
    os.chdir(ROOT)
    print("", flush=True)
    print("Spud Arena server is running.", flush=True)
    print(f"Open the game here: {URL}", flush=True)
    print("", flush=True)
    server = ThreadingHTTPServer(("127.0.0.1", PORT), QuietHandler)
    server.serve_forever()
