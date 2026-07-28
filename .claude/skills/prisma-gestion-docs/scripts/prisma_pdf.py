#!/usr/bin/env python3
"""
PRISMA GESTION — Générateur de documents PDF de marque.

Règles de mise en page :
  - En-tête officiel (image) : PREMIÈRE page uniquement, width:100% entre les marges.
  - Pied de page TEXTE (charte) : toutes pages SAUF la dernière, via @bottom-center CSS.
  - Pied de page OFFICIEL (image) : DERNIÈRE page uniquement, width:100% en flux HTML,
    ancré au bas de la page par un spacer calculé en double passe.
  - Largeur : en-tête et pied de page ont EXACTEMENT la même largeur (tous deux width:100%).
"""
import base64, os, math
import numpy as np
from PIL import Image
from weasyprint import HTML
from pdf2image import convert_from_path

# ── Charte graphique ────────────────────────────────────────────────────────
PURPLE  = "#5E4C84"   # violet profond
LAV_BG  = "#F2EFF8"   # fond lavande
OLIVE   = "#BFC04E"   # olive (liserés)
GRAY    = "#565258"   # gris (sous-titres)
INK     = "#262229"   # texte courant

# ── Mise en page (mm) ───────────────────────────────────────────────────────
M_TOP   = 5
M_SIDE  = 10
M_BOT   = 5
PAGE_H  = 297
PAGE_W  = 210
CONTENT_W_MM = PAGE_W - 2 * M_SIDE   # 190 mm

TEXT_FOOTER = ("PRISMA GESTION \u00b7 Comptabilit\u00e9 \u00b7 Finance "
               "\u00b7 Fiscalit\u00e9 \u00b7 GRH \u00b7 G\u00e9nie Logiciel")

_SIG_BLOCK = ('<div class="signature"><div class="role">{role}</div>'
              '<div class="line"></div><div class="name">{name}</div>'
              '<div class="fn">{fn}</div></div>')

_CONFID_BLOCK = ('<div class="confid">Document &eacute;tabli &agrave; titre de conseil '
                 'professionnel par le Cabinet PRISMA GESTION. Les informations '
                 'qu\'il contient sont confidentielles et destin&eacute;es au seul '
                 'usage du destinataire.</div>')


def _uri(path):
    ext = "png" if path.lower().endswith(".png") else "jpeg"
    return f"data:image/{ext};base64," + base64.b64encode(open(path, "rb").read()).decode()


def _css(n_last):
    """CSS de base ; supprime le pied texte sur la dernière page."""
    return f"""
@page {{
  size: A4;
  margin: {M_TOP}mm {M_SIDE}mm {M_BOT}mm {M_SIDE}mm;
  @bottom-center {{ content: "{TEXT_FOOTER}";
    font-family:'Helvetica',sans-serif; font-size:7pt; color:{PURPLE}; }}
  @bottom-right  {{ content: "Page " counter(page) " / " counter(pages);
    font-family:'Helvetica',sans-serif; font-size:6.6pt; color:#9a93a8; }}
}}
@page:nth({n_last}) {{
  @bottom-center {{ content: none; }}
  @bottom-right  {{ content: none; }}
}}

* {{ box-sizing:border-box; }}
body {{ font-family:'Georgia','Times New Roman',serif; font-size:10.2pt;
  line-height:1.4; color:{INK}; margin:0; }}

.hdr img {{ width:100%; display:block; }}
.hdr {{ margin:0 0 4px 0; }}

.meta {{ display:flex; justify-content:space-between; margin-top:8px;
  font-family:'Helvetica',sans-serif; font-size:8.6pt; color:#3a3442; }}
.meta .ref {{ line-height:1.6; }} .meta .ref b {{ color:{PURPLE}; }}
.place-date {{ text-align:right; line-height:1.6; font-style:italic; }}

.objet {{ margin-top:12px; font-family:'Helvetica',sans-serif; font-size:9pt;
  border-left:3pt solid {OLIVE}; padding:5px 0 5px 10px; background:{LAV_BG}; }}
.objet b {{ color:{PURPLE}; }}

h1.doc-title {{ text-align:center; font-family:'Helvetica',sans-serif;
  font-size:14.5pt; color:{PURPLE}; letter-spacing:.5px; margin:16px 0 3px 0;
  text-transform:uppercase; }}
.subtitle {{ text-align:center; font-family:'Helvetica',sans-serif;
  font-size:8.4pt; color:{GRAY}; letter-spacing:1px; margin-bottom:14px; }}

h2.section {{ font-family:'Helvetica',sans-serif; font-size:10.5pt; color:#fff;
  background:{PURPLE}; padding:5px 10px; margin:14px 0 8px 0;
  border-left:4pt solid {OLIVE}; page-break-after:avoid; }}
p {{ margin:0 0 7px 0; text-align:justify; }}

ul.rules {{ margin:4px 0 6px 0; padding-left:0; list-style:none; }}
ul.rules li {{ margin:0 0 4px 0; padding-left:16px; position:relative;
  text-align:justify; }}
ul.rules li::before {{ content:""; position:absolute; left:0; top:6px;
  width:6px; height:6px; background:{OLIVE}; transform:rotate(45deg); }}
ul.rules li b {{ color:{PURPLE}; }}

.market-head {{ font-family:'Helvetica',sans-serif; font-size:9.6pt;
  font-weight:700; color:{PURPLE}; margin:11px 0 2px 0;
  page-break-after:avoid; }}
.market-sub {{ font-size:9.4pt; margin:0 0 7px 0; page-break-after:avoid; }}
.market-sub .lbl {{ font-family:'Helvetica',sans-serif; font-size:8.4pt;
  color:{GRAY}; }}

table {{ width:100%; border-collapse:collapse; margin:4px 0 8px 0;
  font-size:8.9pt; }}
table.synth {{ page-break-inside:avoid; }}
table.liq th, table.liq td,
table.synth th, table.synth td {{ border:.5pt solid #cdc7d6; padding:5px 8px; }}
thead th {{ background:{PURPLE}; color:#fff;
  font-family:'Helvetica',sans-serif; font-size:8.2pt; font-weight:600;
  text-align:center; }}
table.liq td.elem {{ text-align:left; }}
table.liq td.form {{ text-align:center; color:{GRAY}; font-size:8.4pt; }}
table.liq td.amt {{ text-align:right; }}
tbody tr:nth-child(even) {{ background:#F7F5FB; }}
tr.total td {{ background:{LAV_BG}; font-weight:700; color:{PURPLE};
  font-family:'Helvetica',sans-serif; font-size:8.8pt; }}
tr.total td.amt {{ text-align:right; }}
table.synth td {{ text-align:right; }}
table.synth td.name {{ text-align:left; }}
table.synth tr.grand td {{ background:{PURPLE}; color:#fff; font-weight:700;
  font-family:'Helvetica',sans-serif; }}
.hl {{ color:{PURPLE}; font-weight:700; }}

.signature {{ margin-top:24px; width:46%; margin-left:54%; text-align:center;
  font-family:'Helvetica',sans-serif; font-size:9pt; page-break-inside:avoid; }}
.signature .role {{ color:{GRAY}; font-size:8.4pt; }}
.signature .line {{ border-bottom:.6pt solid #a79bbb; height:34px;
  margin:4px 0 6px 0; }}
.signature .name {{ color:{PURPLE}; font-weight:700; }}
.signature .fn {{ color:{GRAY}; font-size:8pt; }}

.confid {{ margin-top:16px; border-top:.5pt solid #dcd6e4; padding-top:6px;
  font-family:'Helvetica',sans-serif; font-size:7pt; color:#9a93a8;
  text-align:justify; }}

.ftr-img {{ width:100%; display:block; }}

.soussignes .party {{ margin:0 0 9px 0; text-align:justify; }}
.soussignes .party b {{ color:{PURPLE}; }}
.lead {{ font-family:'Helvetica',sans-serif; font-weight:700; color:{PURPLE};
  font-size:9pt; margin:10px 0 6px 0; letter-spacing:.5px; }}
.art-h {{ font-family:'Helvetica',sans-serif; font-size:9.4pt; font-weight:700;
  color:{PURPLE}; margin:11px 0 3px 0; page-break-after:avoid;
  border-left:3pt solid {OLIVE}; padding-left:7px; }}
ul.plain {{ margin:3px 0 6px 0; padding-left:18px; }}
ul.plain li {{ margin:0 0 3px 0; text-align:justify; }}
.sig3 {{ display:table; width:100%; table-layout:fixed; margin-top:18px;
  page-break-inside:avoid; }}
.sig3 .cell {{ display:table-cell; width:33.33%; vertical-align:top;
  text-align:center; padding:0 6px; font-family:'Helvetica',sans-serif; }}
.sig3 .role {{ color:{PURPLE}; font-weight:700; font-size:8.4pt; }}
.sig3 .sub {{ color:{GRAY}; font-size:7.6pt; margin-bottom:1px; min-height:20px; }}
.sig3 .line {{ border-bottom:.6pt solid #a79bbb; height:46px; margin:6px 4px 4px; }}
.sig3 .nm {{ color:{INK}; font-weight:700; font-size:8.2pt; }}
.sig3 .fn {{ color:{GRAY}; font-size:7.4pt; }}
"""


def _html(hdr_uri, ftr_uri, doc_body, n_last, spacer_mm):
    sp = f'<div style="height:{spacer_mm:.3f}mm"></div>' if spacer_mm > 0 else ""
    return (f"<!DOCTYPE html><html lang='fr'><head><meta charset='UTF-8'>"
            f"<style>{_css(n_last)}</style></head><body>"
            f"{doc_body}{sp}"
            f'<img class="ftr-img" src="{ftr_uri}">'
            f"</body></html>")


def _footer_height_mm(ftr_path):
    """Hauteur réelle du bandeau pied de page en mm (largeur = CONTENT_W_MM)."""
    im = Image.open(ftr_path)
    return im.size[1] / im.size[0] * CONTENT_W_MM


def _last_content_bottom_mm(pdf_path, dpi=200):
    """Mesure la position (mm depuis le haut) de la dernière ligne de contenu
    sur la dernière page du PDF."""
    ims = convert_from_path(pdf_path, dpi=dpi)
    arr = np.array(ims[-1])
    H, W, _ = arr.shape
    cx1 = round(M_SIDE / 25.4 * dpi)
    cx2 = W - cx1
    cy1 = round(M_TOP / 25.4 * dpi)
    cy2 = round((PAGE_H - M_BOT) / 25.4 * dpi)
    band = arr[cy1:cy2, cx1:cx2, :]
    dark = np.where(band.min(axis=(1, 2)) < 180)[0]
    if len(dark):
        return M_TOP + dark.max() / dpi * 25.4
    return M_TOP  # page vide


def build_document(meta, body_html, output_path,
                   assets_dir="assets",
                   header_img="header_full.png",
                   footer_img="footer_mb.png",
                   signature=None, auto_signature=True, auto_confid=True):
    """
    Génère le PDF PRISMA GESTION.

    meta = dict(ref, dossier, date, objet, title, subtitle)
    """
    hdr_uri = _uri(os.path.join(assets_dir, header_img))
    ftr_uri = _uri(os.path.join(assets_dir, footer_img))
    ftr_path = os.path.join(assets_dir, footer_img)
    ftr_h = _footer_height_mm(ftr_path)

    sig = signature or dict(
        role="Pour le Cabinet PRISMA GESTION,",
        name="Nathan OBIANG TIME",
        fn="Directeur Associ&eacute;"
    )

    doc_body = f"""
<div class="hdr"><img src="{hdr_uri}"></div>
<div class="meta">
  <div class="ref">
    <b>R&eacute;f. :</b> {meta.get('ref','')}<br>
    <b>Dossier :</b> {meta.get('dossier','')}
  </div>
  <div class="place-date">{meta.get('date','')}</div>
</div>
<div class="objet"><b>Objet :</b> {meta.get('objet','')}</div>
<h1 class="doc-title">{meta.get('title','')}</h1>
<div class="subtitle">{meta.get('subtitle','')}</div>
{body_html}
{_SIG_BLOCK.format(**sig) if auto_signature else ""}
{_CONFID_BLOCK if auto_confid else ""}
"""

    # ── Passe 1 : page count sans footer image ───────────────────────────────
    n = len(HTML(string=_html(hdr_uri, ftr_uri, doc_body, 9999, 0),
                 base_url=assets_dir).render().pages)

    # ── Passe 2 : mesure espace disponible sur la dernière page ─────────────
    tmp = "/tmp/_pg_measure.pdf"
    HTML(string=_html(hdr_uri, ftr_uri, doc_body, n, 0),
         base_url=assets_dir).write_pdf(tmp)
    last_content_mm = _last_content_bottom_mm(tmp)
    available_mm = PAGE_H - M_BOT - last_content_mm
    spacer_mm = max(available_mm - ftr_h - 1.5, 0)

    # ── Passe 3 : vérifier que le spacer ne crée pas une page supplémentaire ─
    final_html = _html(hdr_uri, ftr_uri, doc_body, n, spacer_mm)
    n2 = len(HTML(string=final_html, base_url=assets_dir).render().pages)
    if n2 > n:
        # réduire le spacer pour rester dans n pages
        spacer_mm = max(spacer_mm - ftr_h - 5, 0)
        final_html = _html(hdr_uri, ftr_uri, doc_body, n, spacer_mm)
        n2 = len(HTML(string=final_html, base_url=assets_dir).render().pages)

    n_final = n2
    final_html = _html(hdr_uri, ftr_uri, doc_body, n_final, spacer_mm)

    # ── Passe finale : rendu PDF ─────────────────────────────────────────────
    HTML(string=final_html, base_url=assets_dir).write_pdf(output_path)
    return output_path
