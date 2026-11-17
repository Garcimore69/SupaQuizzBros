"""Lot v0.5 · Niveau 1 « Joueur du dimanche » : 8 questions très accessibles.

Ajoutées après le test client du 17/11/2026 (niveau 1 jugé trop élevé).
Règle du niveau 1 : ce que l'on voit à l'écran en jouant (personnages, couleurs,
objets, principe du jeu) et les grandes marques connues de tous. Jamais de nom de
créateur, de studio peu connu, de date précise ni de détail technique.
Format des tuples : voir generer_banque.py (bonne réponse en premier)."""
from outils import wp

Q = [
 (1, "Années 80", "Personnages", "De quelle couleur est la casquette de Mario ?",
  ["Rouge", "Verte", "Bleue", "Jaune"],
  "Mario porte une casquette rouge marquée d'un « M ». Le vert est la couleur de son frère.",
  wp("Mario (personnage)")),
 (1, "Années 90", "Personnages", "Que ramasse Sonic tout au long de ses niveaux ?",
  ["Des anneaux dorés", "Des pièces", "Des étoiles", "Des bananes"],
  "Sonic collecte des anneaux dorés : tant qu'il en a, un coup reçu ne le fait pas perdre de vie, il les éparpille seulement.",
  wp("Sonic the Hedgehog (personnage)")),
 (1, "Années 80", "Objets", "Dans Super Mario Bros., quel objet fait grandir Mario ?",
  ["Un champignon", "Une étoile", "Une pièce", "Une plume"],
  "Le Super Champignon fait grandir Mario. L'étoile le rend invincible quelques secondes et la plume lui donne une cape (Super Mario World).",
  wp("Super Mario Bros.")),
 (1, "Années 80", "Arcade", "Dans Pac-Man, que doit manger Pac-Man pour pouvoir dévorer les fantômes ?",
  ["Une super pac-gomme", "Une cerise", "Une clé", "Une cloche"],
  "Les super pac-gommes, plus grosses que les autres, rendent les fantômes bleus et vulnérables quelques secondes. Cerise, clé et cloche sont des bonus.",
  wp("Pac-Man")),
 (1, "Années 90", "Course", "Dans Mario Kart, quel objet fonce directement sur le joueur en tête de la course ?",
  ["La carapace bleue", "La carapace verte", "La banane", "Le champignon"],
  "La carapace bleue, apparue dans Mario Kart 64, file vers le premier de la course. La verte part tout droit, la banane se pose derrière soi.",
  wp("Mario Kart")),
 (1, "Années 2010", "Multijoueur", "Au début d'une partie de Fortnite Battle Royale, d'où sautent les joueurs ?",
  ["D'un bus volant", "D'un avion", "D'un hélicoptère", "D'une montgolfière"],
  "Les joueurs sautent du « bus de combat », un bus suspendu à un ballon, puis ouvrent leur planeur pour atterrir sur l'île.",
  wp("Fortnite Battle Royale")),
 (1, "Années 80", "Personnages", "Quelle princesse Mario doit-il souvent sauver ?",
  ["Peach", "Zelda", "Samus", "Amy"],
  "La princesse Peach règne sur le Royaume Champignon et le roi des Koopa l'enlève régulièrement. Zelda est la princesse d'une autre série de Nintendo.",
  wp("Princesse Peach")),
 (1, "Années 80", "Puzzle", "Dans Tetris, que se passe-t-il quand une ligne horizontale est entièrement remplie ?",
  ["Elle disparaît", "La partie s'arrête", "Elle devient grise", "Elle change de couleur"],
  "Une ligne complète disparaît et rapporte des points ; compléter quatre lignes d'un coup s'appelle faire un « Tetris ».",
  wp("Tetris")),
]
