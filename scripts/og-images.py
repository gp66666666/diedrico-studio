#!/usr/bin/env python3
"""Genera las tarjetas Open Graph (1200x630 PNG) de Diédrico Studio.

Uso:  python3 scripts/og-images.py
Necesita `playwright` (pip install playwright && playwright install chromium).
Los PNG se guardan en public/og/ y se commitean: el build no los regenera.
"""
import html
import pathlib
import re

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "og"
SITE = "diedricostudio.com"

CUBE = """
<svg width="250" height="250" viewBox="0 0 200 200" fill="none" aria-hidden="true">
  <g stroke="#3b82f6" stroke-width="1" opacity=".25">
    <path d="M20 60h160M20 100h160M20 140h160M60 20v160M100 20v160M140 20v160"/>
  </g>
  <g stroke="#60a5fa" stroke-width="2.2" stroke-linejoin="round">
    <path d="M55 125l45 26 45-26v-52l-45-26-45 26z" fill="#0b1626" fill-opacity=".85"/>
    <path d="M55 125l45-26 45 26M100 99v52" stroke-dasharray="4 4" opacity=".55"/>
    <path d="M55 73l45 26 45-26" opacity=".9"/>
  </g>
  <g fill="#93c5fd">
    <circle cx="55" cy="125" r="4"/><circle cx="145" cy="125" r="4"/>
    <circle cx="100" cy="151" r="4"/><circle cx="55" cy="73" r="4"/>
    <circle cx="145" cy="73" r="4"/><circle cx="100" cy="47" r="4"/>
  </g>
</svg>
"""


def page_html(kicker, title, subtitle, badge=None):
    pill = f'<span class="pill">{html.escape(badge)}</span>' if badge else ""
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  body {{
    width:1200px; height:630px; overflow:hidden;
    background:
      radial-gradient(900px 500px at 78% 12%, rgba(37,99,235,.30), transparent 62%),
      radial-gradient(700px 420px at 8% 96%, rgba(79,70,229,.22), transparent 60%),
      #070d18;
    font-family: "DejaVu Sans", system-ui, -apple-system, sans-serif;
    color:#e2e8f0; padding:62px 68px; display:flex; flex-direction:column;
    border-top:10px solid #2563eb;
  }}
  .brand {{ font-size:19px; font-weight:700; letter-spacing:.18em; color:#93c5fd; text-transform:uppercase; }}
  .kicker {{ margin-top:64px; font-size:18px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#94a3b8; }}
  h1 {{ margin-top:12px; font-size:{'60px' if len(title) < 34 else '50px'}; line-height:1.1; font-weight:800; color:#ffffff; max-width:760px; letter-spacing:-.01em; }}
  .sub {{ position:absolute; left:68px; right:68px; bottom:52px; }}
  .sub p {{ font-size:22px; line-height:1.4; color:#cbd5e1; max-width:860px; }}
  .site {{ margin-top:12px; font-size:19px; color:#60a5fa; font-weight:600; }}
  .pill {{ display:inline-block; margin-top:20px; padding:7px 15px; border-radius:999px;
          border:1px solid rgba(96,165,250,.45); background:rgba(37,99,235,.16); color:#bfdbfe;
          font-size:16px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }}
  .art {{ position:absolute; right:48px; top:196px; opacity:.85; }}
</style></head><body>
  <div class="brand">Diédrico Studio</div>
  <div class="kicker">{html.escape(kicker)}</div>
  <h1>{html.escape(title)}</h1>
  {pill}
  <div class="sub">
    <div><p>{html.escape(subtitle)}</p><div class="site">{SITE}</div></div>
  </div>
  <div class="art">{CUBE}</div>
</body></html>"""


def read_exercises():
    src = (ROOT / "src/data/exercises.ts").read_text(encoding="utf-8")
    items = []
    for m in re.finditer(
        r"slug:\s*'([^']+)'[\s\S]*?title:\s*'([^']+)'[\s\S]*?topic:\s*'([^']+)'[\s\S]*?level:\s*'([^']+)'",
        src,
    ):
        items.append({"slug": m.group(1), "title": m.group(2), "topic": m.group(3), "level": m.group(4)})
    return items


EXTRA = [
    ("ejercicios.png", "Ejercicios resueltos", "Sistema diédrico, paso a paso",
     "Trazas, intersecciones, distancias, abatimientos y giros, con el dibujo montado en 3D.", "Bachillerato · PAU / EBAU"),
    ("temario.png", "Temario de dibujo técnico", "Sistema diédrico por bloques",
     "Todos los temas de la PAU/EBAU con sus ejercicios resueltos, en orden.", "Bachillerato"),
    ("para-profesores.png", "Para profesores", "Diédrico en el aula",
     "Proyecta el ejercicio, gira la pieza y explica las proyecciones en vivo. Gratis y sin instalar nada.", "Docentes"),
    ("guia.png", "Guía de la herramienta", "Todo lo que puedes hacer",
     "Puntos, rectas, planos, sólidos, secciones, abatimientos, láminas e impresión.", "Guía"),
    ("academia.png", "Academia", "Teoría de diédrico, tema a tema",
     "Los 20 temas del curso explicados y enlazados con la práctica en el editor 3D.", "Teoría"),
]


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "ejercicios").mkdir(exist_ok=True)
    jobs = []
    for ex in read_exercises():
        jobs.append(
            (
                OUT / "ejercicios" / f"{ex['slug']}.png",
                page_html("Ejercicio resuelto · " + ex["topic"], ex["title"],
                          "Enunciado, pasos y resultado, con el dibujo montado en 3D.",
                          ex["level"]),
            )
        )
    for name, kicker, title, sub, badge in EXTRA:
        jobs.append((OUT / name, page_html(kicker, title, sub, badge)))

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
        page = ctx.new_page()
        for path, markup in jobs:
            page.set_content(markup, wait_until="load")
            page.screenshot(path=str(path))
            print("ok", path.relative_to(ROOT))
        browser.close()
    print(f"{len(jobs)} imágenes")


if __name__ == "__main__":
    main()
