# -*- coding: utf-8 -*-
"""Reecrit des lignes du pied de page officiel PRISMA GESTION (footer_mb.png).

Le script d'origine (docs/build_footer.py) passe par WeasyPrint, dont les
bibliotheques natives ne s'installent pas simplement sous Windows. On repeint
donc ligne par ligne, en laissant le reste de l'image intact au pixel pres.

Deux reglages ont ete calibres sur l'image elle-meme, et non deduits du CSS :

- Police : Georgia **grasse** pour tout, labels comme valeurs. Le CSS de
  build_footer.py ne met en gras que `.lbl`, mais l'image montre l'inverse.
  Taille 19, calibree sur les lignes non modifiees (ecart max 11 px).
- Couleur : gris 127 et non le #262229 de la charte. L'image a ete tant
  reduite que son texte plafonne a une intensite de 110 (moyenne 141) ;
  tracer a la couleur nominale donnait des lignes deux fois plus denses que
  leurs voisines, ce qui se voyait a l'oeil.

Usage : python refaire_footer.py source.png destination.png
"""
import sys
from PIL import Image, ImageDraw, ImageFont

SRC, DST = sys.argv[1], sys.argv[2]

GB = 'C:/Windows/Fonts/georgiab.ttf'
TAILLE = 19
ECH = 4                    # surechantillonnage, pour retrouver le meme lisse
COULEUR = (127, 127, 127)

# (x de la colonne, y du haut des majuscules, x max a effacer, texte)
# Les bornes d'effacement s'arretent avant la colonne voisine et avant la
# ligne suivante : la zone effacee ne depasse jamais sur une ligne conservee.
LIGNES = [
    (75,  31, 700,  'Siège Social : Yaoundé – Etoa - Méki'),
    (713, 31, 1188, 'Tél : (237) 694 310 554 / 676 277 662'),
    (713, 57, 1188, 'Email : prismagestionsarl@gmail.com'),
]

im = Image.open(SRC).convert('RGB')
L, H = im.size
police = ImageFont.truetype(GB, TAILLE * ECH)
dessin = ImageDraw.Draw(im)

for x_col, haut_cible, x_max, texte in LIGNES:
    # 1) Effacer la ligne : de 5 px au-dessus du haut des majuscules jusqu'a
    #    3 px avant le haut de la ligne suivante (les lignes sont espacees
    #    de 26 px).
    dessin.rectangle([x_col, haut_cible - 5, x_max, haut_cible + 23], fill=(255, 255, 255))

    # 2) Tracer a l'echelle ECH puis reduire.
    largeur, hauteur = (x_max - x_col) * ECH, 40 * ECH
    tuile = Image.new('RGB', (largeur, hauteur), (255, 255, 255))
    ImageDraw.Draw(tuile).text((0, 8 * ECH), texte, font=police, fill=COULEUR)
    tuile = tuile.resize((largeur // ECH, hauteur // ECH), Image.LANCZOS)

    # 3) Ne coller que la zone reellement occupee : coller la tuile entiere
    #    ecraserait la ligne suivante.
    bbox = tuile.convert('L').point(lambda p: 255 if p < 200 else 0).getbbox()
    if not bbox:
        raise SystemExit('Texte introuvable : police absente ?')
    im.paste(tuile.crop(bbox), (x_col + bbox[0], haut_cible))

im.save(DST)
print('Ecrit :', DST, im.size)
