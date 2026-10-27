#!/usr/bin/env python3
"""
Regenera src/data/academyPages.json: el HTML estático de cada tema de la
Academia, que es lo que se sirve a los buscadores en /academia/<slug>.

Uso (con `dist` servido en http://localhost:4190):

    npm run build
    node /tmp/opencode/serve-dist.mjs &
    python3 scripts/academy-pages.py

Si cambias la teoría, vuelve a ejecutarlo y haz commit del JSON.
"""
import json
import pathlib
import re

from playwright.sync_api import sync_playwright

BASE = "http://localhost:4190/academy"
OUT = pathlib.Path(__file__).resolve().parent.parent / "src/data/academyPages.json"

IDS = [
    "theory-1-point", "theory-2-line", "theory-3-plane", "theory-4-intersections",
    "theory-5-parallelism", "theory-6-distances", "theory-7-angles", "theory-8-abatements",
    "theory-9-rotations", "theory-10-change-plane", "theory-11-polyhedra", "theory-12-surfaces",
    "theory-13-sections", "theory-14-developments", "theory-15-max-slope",
    "theory-16-angles-planes", "theory-17-positions", "theory-18-oblique",
    "theory-19-sphere", "theory-20-map",
]

SLUGS = [
    "introduccion-el-punto", "la-recta", "el-plano", "intersecciones",
    "paralelismo-y-perpendicularidad", "distancias", "angulos", "abatimientos",
    "giros", "cambios-de-plano", "poliedros", "superficies", "secciones",
    "desarrollos", "maxima-pendiente-e-inclinacion",
    "angulos-con-los-planos-de-proyeccion", "posiciones-caracteristicas",
    "cuerpos-de-revolucion-oblicuos", "la-esfera", "mapa-del-temario",
]


def main():
    pages = []
    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1400, "height": 1000})
        page = ctx.new_page()
        page.goto(BASE, wait_until="domcontentloaded")
        page.wait_for_timeout(2500)

        labels = page.evaluate(
            """() => [...document.querySelectorAll('button')]
                .filter(b => /^\\d+\\. /.test((b.innerText || '').replace(/\\s+/g, ' ').trim()))
                .map(b => {
                    const h = b.querySelector('h3');
                    const p = b.querySelector('p');
                    return {
                        title: h ? h.innerText.trim() : '',
                        desc: p ? p.innerText.replace(/\\s+/g, ' ').trim() : ''
                    };
                })"""
        )

        for i, (topic_id, slug) in enumerate(zip(IDS, SLUGS)):
            page.evaluate(
                """(n) => {
                    const label = (v) => (v || '').replace(/\\s+/g, ' ').trim();
                    [...document.querySelectorAll('button')]
                        .find(b => label(b.innerText).startsWith(n + '.'))
                        ?.click();
                }""",
                i + 1,
            )
            page.wait_for_timeout(700)
            data = page.evaluate(
                """() => {
                    const el = document.querySelector('.academy-content');
                    return { html: el ? el.innerHTML : '', text: el ? el.innerText : '' };
                }"""
            )
            meta = labels[i] if i < len(labels) else {"title": slug, "desc": ""}
            title = re.sub(r"^\d+\.\s*", "", meta["title"]).strip()
            pages.append({
                "id": topic_id,
                "slug": slug,
                "title": title,
                "description": meta["desc"],
                "html": data["html"],
                "text": re.sub(r"\s+", " ", data["text"]).strip(),
            })
        browser.close()

    OUT.write_text(json.dumps(pages, ensure_ascii=False), encoding="utf-8")
    print(f"{len(pages)} temas · {OUT.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
