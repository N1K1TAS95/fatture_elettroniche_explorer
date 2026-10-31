#!/usr/bin/env python3
"""Controlli statici del repository (solo libreria standard, nessun browser).

A mano: `uv run tests/check.py`. In automatico: GitHub Action `.github/workflows/ci.yml`.
Esce con codice 1 se qualcosa non torna.
"""
import json
import re
import sys
import xml.dom.minidom
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")  # accenti corretti anche nella console di Windows
ROOT = Path(__file__).resolve().parent.parent
HTML = ROOT / "html"
FIXTURES = ROOT / "tests" / "fixtures"
ROTTI_APPOSTA = {"xml-non-valido.xml", "namespace-non-valido.xml"}  # non devono essere XML valido

errori = []


def ko(msg):
    errori.append(msg)
    print(f"  ERRORE: {msg}")


def leggi(p):
    return Path(p).read_text(encoding="utf-8")


print("Content-Security-Policy allineata (index.html, nginx.conf, serve.py)")
meta = re.search(r'<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"', leggi(HTML / "index.html"))
nginx = re.findall(r'add_header\s+Content-Security-Policy\s+"([^"]+)"', leggi(ROOT / "nginx.conf"))
sp = re.search(r'CSP_PAGE\s*=\s*\(((?:\s*"[^"]*")+)\s*\)', leggi(ROOT / "serve.py"))
ss = re.search(r'CSP_SW\s*=\s*"([^"]+)"', leggi(ROOT / "serve.py"))
if not (meta and len(nginx) >= 2 and sp and ss):
    ko("non riesco a leggere la CSP da index.html, nginx.conf o serve.py")
else:
    pagina = "".join(re.findall(r'"([^"]*)"', sp.group(1))).strip()
    senza_fa = re.sub(r";?\s*frame-ancestors[^;]*", "", pagina).strip()  # il <meta> non può averlo
    if senza_fa != meta.group(1).strip():
        ko("CSP di serve.py diversa da quella del <meta> di index.html")
    if nginx[0].strip() != pagina:
        ko("CSP di nginx.conf (pagina) diversa da quella di serve.py")
    if nginx[1].strip() != ss.group(1).strip():
        ko("CSP di nginx.conf per /sw.js diversa da quella di serve.py")
    if "'unsafe-eval'" in pagina or "'unsafe-inline'" in pagina.replace("style-src-attr 'unsafe-inline'", ""):
        ko("la CSP contiene 'unsafe-eval' o 'unsafe-inline' fuori da style-src-attr")

print("Nessuna risorsa esterna né codice inline in html/")
for f in sorted(HTML.rglob("*")):
    if f.suffix in {".html", ".js", ".css", ".webmanifest", ".svg"}:
        testo = re.sub(r'xmlns(:\w+)?="[^"]*"', "", leggi(f))  # gli URI dei namespace non sono richieste
        for m in re.finditer(r"https?://[^\s\"'<>)]+", testo):
            ko(f"{f.relative_to(ROOT)}: riferimento esterno {m.group(0)}")
index = leggi(HTML / "index.html")
if any("src=" not in m.group(1) for m in re.finditer(r"<script\b([^>]*)>", index)):
    ko("index.html contiene uno <script> inline")
if re.search(r"\son[a-z]+\s*=\s*[\"']", index) or re.search(r"javascript:", index, re.I):
    ko("index.html contiene gestori di eventi inline o URL javascript:")

print("Nessun file di dati in html/")
for f in HTML.rglob("*"):
    if f.is_file() and f.suffix.lower() in {".xml", ".p7m", ".csv", ".pdf"}:
        ko(f"{f.relative_to(ROOT)}: un file di dati non deve stare in html/")

print("Manifest e service worker coerenti")
try:
    manifest = json.loads(leggi(HTML / "manifest.webmanifest"))
    for chiave in ("name", "short_name", "start_url", "display", "icons"):
        if chiave not in manifest:
            ko(f"manifest: manca '{chiave}'")
    for icona in manifest.get("icons", []):
        if not (HTML / icona["src"]).is_file():
            ko(f"manifest: icona mancante {icona['src']}")
except (OSError, ValueError, KeyError) as e:
    ko(f"manifest non valido: {e}")
sw = leggi(HTML / "sw.js")
if not re.search(r"const VERSION\s*=\s*'[^']+'", sw):
    ko("sw.js: VERSION non trovata")
for m in re.finditer(r"'(?:\./)?([\w.\-/]+\.(?:html|css|js|svg|png|webmanifest))'", sw):
    if not (HTML / m.group(1)).is_file():
        ko(f"sw.js elenca un file che non esiste: {m.group(1)}")

print("Fatture di prova")
n = 0
for f in sorted(FIXTURES.rglob("*.xml")):
    n += 1
    try:
        xml.dom.minidom.parseString(f.read_bytes())
        valido = True
    except Exception:
        valido = False
    if valido == (f.name in ROTTI_APPOSTA):
        ko(f"{f.relative_to(ROOT)}: " + ("dovrebbe essere rotto ma si legge" if valido else "XML non ben formato"))
if n < 20:
    ko(f"trovati solo {n} file XML di prova (ne attendo almeno 20)")
try:
    json.loads(leggi(FIXTURES / "ATTESO.json"))
except (OSError, ValueError) as e:
    ko(f"ATTESO.json non valido: {e}")

if errori:
    print(f"\nFALLITO: {len(errori)} problema/i")
    sys.exit(1)
print(f"\nOK: tutti i controlli superati ({n} file XML di prova)")
