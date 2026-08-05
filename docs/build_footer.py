# -*- coding: utf-8 -*-
"""Régénère le pied de page officiel PRISMA GESTION avec l'email corrigé."""
import shutil, os
import numpy as np
from weasyprint import HTML
from pdf2image import convert_from_path
from PIL import Image

SK_ASSETS = "/root/.claude/skills/prisma-gestion-docs/assets"
SCRATCH = "/tmp/claude-0/-home-user/4ae13f90-a4a3-5888-8cbd-84d657e17613/scratchpad"

# 1) Sauvegarde de l'original (une seule fois).
orig = os.path.join(SK_ASSETS, "footer_mb.png")
backup = os.path.join(SK_ASSETS, "footer_mb_yahoo_backup.png")
if not os.path.exists(backup):
    shutil.copy(orig, backup)
    print("Sauvegarde créée :", backup)

# 2) HTML du pied de page (charte : lavande #9880B2, serif, deux colonnes).
html = """
<style>
  @page { size: 172mm 32mm; margin: 0; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: Georgia,'Times New Roman',serif; color:#262229; }
  .bar { height: 7px; background:#9880B2; width:100%; }
  .wrap { display:flex; justify-content:space-between;
          padding:9px 4px 7px 4px; font-size:10.5pt; line-height:1.55; }
  .lbl { font-weight:bold; }
  .rule { border-top:0.7pt solid #b9b2c6; margin:0 4px; }
</style>
<div class="bar"></div>
<div class="wrap">
  <div>
    <div><span class="lbl">Si&egrave;ge Social :</span> Yaound&eacute; &ndash; Bata Longkak</div>
    <div><span class="lbl">BP :</span> 35 462 Yaound&eacute; &ndash; Cameroun</div>
    <div><span class="lbl">RCCM N&deg; :</span> RC/YAO/2021/2124</div>
  </div>
  <div>
    <div><span class="lbl">T&eacute;l :</span> (237) 656 752 475 / 671 050 546</div>
    <div><span class="lbl">Email :</span> prismagestionsarl@gmail.com</div>
    <div><span class="lbl">N.I.U :</span> M052116042979Z</div>
  </div>
</div>
<div class="rule"></div>
"""

pdf_tmp = os.path.join(SCRATCH, "_footer.pdf")
HTML(string=html).write_pdf(pdf_tmp)

# 3) PDF -> PNG haute résolution, puis rognage aux marges de contenu.
im = convert_from_path(pdf_tmp, dpi=230)[0].convert("RGB")
arr = np.array(im)
mask = arr.min(axis=2) < 245           # pixels non blancs
ys, xs = np.where(mask)
padx, padyt, padyb = 4, 4, 6
top = max(int(ys.min()) - padyt, 0)
bottom = min(int(ys.max()) + padyb, arr.shape[0])
left = max(int(xs.min()) - padx, 0)
right = min(int(xs.max()) + padx, arr.shape[1])
cropped = im.crop((left, top, right, bottom))
cropped.save(orig)                      # remplace l'asset de la compétence
cropped.save(os.path.join(SCRATCH, "footer_preview.png"))
print("Nouveau pied de page :", orig, "taille", cropped.size)
