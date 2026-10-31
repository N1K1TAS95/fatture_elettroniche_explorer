#!/usr/bin/env python3
"""Server locale per Fatture Elettroniche Explorer.

Serve la cartella ``html/`` con gli stessi header di sicurezza usati in produzione
(vedi ``nginx.conf`` e ``security-headers.conf``). Usa solo la libreria standard di
Python: non servono dipendenze.

Con uv:        uv run serve.py
Senza uv:      python serve.py

Su ``localhost`` il browser considera la pagina un contesto sicuro: selezione diretta
delle cartelle, cartelle recenti e installazione come app (PWA) funzionano come in HTTPS.
"""
import argparse
import http.server
import threading
import webbrowser
from functools import partial
from pathlib import Path

ROOT = Path(__file__).resolve().parent / "html"

# Content-Security-Policy dell'app. Tienila allineata a nginx.conf e al <meta> di html/index.html.
CSP_PAGE = (
    "default-src 'none'; script-src 'self'; style-src 'self'; style-src-attr 'unsafe-inline'; "
    "img-src 'self' data:; object-src blob:; frame-src blob:; manifest-src 'self'; "
    "worker-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"
)
# Il service worker deve poter fare fetch verso la propria origine (vedi nginx.conf).
CSP_SW = "default-src 'none'; connect-src 'self'"

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Cross-Origin-Resource-Policy": "same-origin",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Permissions-Policy": (
        "accelerometer=(), camera=(), geolocation=(), gyroscope=(), "
        "microphone=(), payment=(), usb=()"
    ),
    "Cache-Control": "no-cache",
}


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".webmanifest": "application/manifest+json",
        ".js": "text/javascript",
        ".svg": "image/svg+xml",
    }

    def end_headers(self):
        for name, value in SECURITY_HEADERS.items():
            self.send_header(name, value)
        is_sw = self.path.split("?", 1)[0] == "/sw.js"
        self.send_header("Content-Security-Policy", CSP_SW if is_sw else CSP_PAGE)
        super().end_headers()

    def _hidden(self):
        parts = self.path.split("?", 1)[0].split("/")
        return any(p.startswith(".") and p not in ("", ".") for p in parts)

    def do_GET(self):
        if self._hidden():
            return self.send_error(404)
        super().do_GET()

    def do_HEAD(self):
        if self._hidden():
            return self.send_error(404)
        super().do_HEAD()

    def list_directory(self, path):
        # niente elenco dei file delle cartelle
        self.send_error(404)
        return None


def main():
    parser = argparse.ArgumentParser(description="Serve Fatture Elettroniche Explorer in locale.")
    parser.add_argument("-p", "--port", type=int, default=8000, help="porta (predefinita: 8000)")
    parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="indirizzo su cui ascoltare (predefinito: 127.0.0.1, solo questo computer)",
    )
    parser.add_argument("--no-browser", action="store_true", help="non aprire il browser")
    args = parser.parse_args()

    if not (ROOT / "index.html").is_file():
        raise SystemExit(f"Cartella dell'app non trovata: {ROOT}")

    try:
        server = http.server.ThreadingHTTPServer((args.host, args.port), partial(Handler, directory=str(ROOT)))
    except OSError as e:
        raise SystemExit(f"Impossibile ascoltare su {args.host}:{args.port} ({e}). Prova con --port.")

    shown = "localhost" if args.host in ("127.0.0.1", "0.0.0.0", "::1") else args.host
    url = f"http://{shown}:{args.port}/"
    print(f"Fatture Elettroniche Explorer: {url}   (Ctrl+C per fermare)")
    if args.host not in ("127.0.0.1", "localhost", "::1"):
        print(
            "ATTENZIONE: da altri computer questo indirizzo e' in HTTP, quindi il browser non abilita "
            "la selezione diretta delle cartelle, le recenti e la PWA (serve HTTPS). Vedi il README."
        )

    if not args.no_browser:
        threading.Timer(0.5, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nFermato.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
