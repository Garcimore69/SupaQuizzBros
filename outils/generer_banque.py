"""
Génère data/questions.json, la banque de questions de SupaQuizzBros.

Usage :  python3 outils/generer_banque.py
La banque est assemblée à partir :
  - du lot d'origine ci-dessous (40 questions, 10 par niveau) ;
  - des lots banque_n1.py … banque_n4.py (40 questions chacun).
Pour ajouter des questions : compléter un lot (ou en créer un nouveau et
l'ajouter à LOTS), puis relancer ce script. Les identifiants existants ne
changent pas tant qu'on ajoute les questions à la FIN des listes.

Format d'une question (figé pour la suite du projet) :
  id          identifiant unique, ex. "N1-001"
  niveau      1 à 4 (1 = Joueur du dimanche … 4 = Légende)
  epoque      ex. "Années 80"
  theme       ex. "Puzzle", "Consoles", "Studios"
  enonce      la question
  choix       4 propositions
  bonne       index (0-3) de la bonne réponse dans `choix`
  explication 1 à 2 phrases qui justifient la réponse
  source      {"titre": ..., "url": ...}

Les liens Wikipédia passent par la recherche « aller à l'article » :
ils ouvrent directement l'article quand le titre existe, sinon la liste
des résultats. Aucun lien mort possible pendant la phase de test.
"""
import importlib
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
from outils import wp, web  # noqa: E402
from verifier import verifier  # noqa: E402

LOTS = ("banque_n1", "banque_n2", "banque_n3", "banque_n4", "banque_v05")
SORTIE = pathlib.Path(__file__).resolve().parent.parent / "data" / "questions.json"

# (niveau, époque, thème, énoncé, [bonne réponse en premier, puis 3 leurres], explication, source)
# La bonne réponse est écrite en premier ici ; l'appli mélange les propositions à chaque partie.
Q = [
 # ---------- Niveau 1 · Joueur du dimanche ----------
 (2, "Années 80", "Puzzle", "Qui a créé Tetris en 1984 ?",
  ["Alekseï Pajitnov", "Shigeru Miyamoto", "Hideo Kojima", "Toru Iwatani"],
  "Alekseï Pajitnov, chercheur à l'Académie des sciences d'URSS à Moscou, programme Tetris en 1984 sur un ordinateur Electronika 60.",
  wp("Tetris")),
 (2, "Années 80", "Arcade", "Quelle entreprise japonaise a créé Pac-Man en 1980 ?",
  ["Namco", "Sega", "Taito", "Konami"],
  "Pac-Man est développé et édité par Namco en 1980 ; il devient l'un des jeux d'arcade les plus célèbres de l'histoire.",
  wp("Pac-Man")),
 (1, "Années 80", "Personnages", "Dans quel jeu d'arcade de 1981 Mario apparaît-il pour la première fois ?",
  ["Donkey Kong", "Super Mario Bros.", "Mario Bros.", "Popeye"],
  "Mario fait ses débuts en 1981 dans Donkey Kong, sous le nom de « Jumpman ». Super Mario Bros. n'arrive qu'en 1985.",
  wp("Donkey Kong (jeu vidéo, 1981)")),
 (1, "Années 90", "Marques", "Quelle entreprise a créé Sonic the Hedgehog en 1991 ?",
  ["Sega", "Nintendo", "Capcom", "Sony"],
  "Sonic est créé par Sega en 1991 pour sa Mega Drive, afin de concurrencer Mario.",
  wp("Sonic the Hedgehog (jeu vidéo, 1991)")),
 (2, "Années 2010", "Bac à sable", "Qui est le créateur de Minecraft ?",
  ["Markus « Notch » Persson", "Will Wright", "John Romero", "Todd Howard"],
  "Le Suédois Markus Persson, dit « Notch », lance Minecraft en 2009 ; son studio Mojang est racheté par Microsoft en 2014.",
  wp("Minecraft")),
 (1, "Années 80", "Personnages", "Dans la série The Legend of Zelda, comment s'appelle le héros que l'on dirige ?",
  ["Link", "Zelda", "Ganon", "Epona"],
  "Le héros s'appelle Link. Zelda est la princesse du royaume, Ganon le grand méchant et Epona le cheval de Link.",
  wp("The Legend of Zelda")),
 (1, "Années 90", "Pokémon", "De quel type est Pikachu ?",
  ["Électrik", "Feu", "Plante", "Eau"],
  "Pikachu, mascotte de la série Pokémon, est un Pokémon de type Électrik.",
  wp("Pikachu")),
 (1, "Années 70", "Arcade", "Quelle entreprise a sorti le jeu d'arcade Pong en 1972 ?",
  ["Atari", "Magnavox", "Nintendo", "Sega"],
  "Pong est le premier grand succès d'Atari, la société fondée par Nolan Bushnell et Ted Dabney en 1972.",
  wp("Pong")),
 (1, "Années 90", "Consoles", "Quel fabricant a lancé la console PlayStation au Japon en 1994 ?",
  ["Sony", "Sega", "Nintendo", "Microsoft"],
  "La PlayStation de Sony sort au Japon le 3 décembre 1994, puis en Europe en 1995.",
  wp("PlayStation (console)")),
 (1, "Années 2020", "Consoles", "Quelle console Nintendo est sortie le 5 juin 2025 ?",
  ["Nintendo Switch 2", "Wii U", "Nintendo 3DS", "Nintendo Switch Lite"],
  "La Nintendo Switch 2, successeure de la Switch de 2017, est sortie dans le monde le 5 juin 2025.",
  wp("Nintendo Switch 2")),

 # ---------- Niveau 2 · Gamer ----------
 (2, "Années 2010", "Studios", "Quel studio a développé The Witcher 3: Wild Hunt (2015) ?",
  ["CD Projekt Red", "Bethesda", "BioWare", "Ubisoft"],
  "The Witcher 3 est développé par le studio polonais CD Projekt Red, d'après les romans d'Andrzej Sapkowski.",
  wp("The Witcher 3: Wild Hunt")),
 (2, "Années 2000", "Studios", "Quel studio a développé Halo: Combat Evolved, sorti avec la première Xbox en 2001 ?",
  ["Bungie", "Epic Games", "343 Industries", "Valve"],
  "Halo: Combat Evolved est l'œuvre de Bungie. 343 Industries ne reprend la série qu'à partir de 2011.",
  wp("Halo: Combat Evolved")),
 (2, "Années 90", "Créateurs", "Quel créateur français est à l'origine de Rayman (1995) ?",
  ["Michel Ancel", "Éric Chahi", "Frédérick Raynal", "David Cage"],
  "Michel Ancel imagine Rayman, sorti chez Ubisoft en 1995. Il créera aussi Beyond Good & Evil.",
  wp("Rayman (jeu vidéo)")),
 (2, "Années 2010", "Univers", "Quelle ville fictive, inspirée de Los Angeles, sert de cadre à GTA V ?",
  ["Los Santos", "Liberty City", "Vice City", "San Fierro"],
  "GTA V (2013) se déroule à Los Santos, version fictive de Los Angeles. Liberty City évoque New York et Vice City Miami.",
  wp("Grand Theft Auto V")),
 (2, "Années 90", "Personnages", "Comment s'appelle le héros de Final Fantasy VII (1997) ?",
  ["Cloud Strife", "Squall Leonhart", "Tidus", "Noctis"],
  "Cloud Strife est le héros de Final Fantasy VII. Squall est celui de FF VIII, Tidus de FF X et Noctis de FF XV.",
  wp("Final Fantasy VII")),
 (2, "Années 80", "Créateurs", "Qui est le créateur de la série Metal Gear ?",
  ["Hideo Kojima", "Yu Suzuki", "Hironobu Sakaguchi", "Shinji Mikami"],
  "Hideo Kojima crée Metal Gear chez Konami en 1987, puis la série culte Metal Gear Solid.",
  wp("Hideo Kojima")),
 (2, "Années 90", "Studios", "Quel studio a développé Half-Life (1998) ?",
  ["Valve", "id Software", "Epic MegaGames", "Looking Glass"],
  "Half-Life est le premier jeu de Valve, studio fondé par Gabe Newell et Mike Harrington.",
  wp("Half-Life")),
 (2, "Années 2010", "Studios", "Quel studio japonais a développé Dark Souls (2011) ?",
  ["FromSoftware", "Team Ninja", "Capcom", "PlatinumGames"],
  "Dark Souls est développé par FromSoftware, sous la direction d'Hidetaka Miyazaki.",
  wp("Dark Souls")),
 (2, "Années 2020", "Studios", "Quel studio français a développé Clair Obscur: Expedition 33 (2025) ?",
  ["Sandfall Interactive", "Don't Nod", "Quantic Dream", "Arkane"],
  "Clair Obscur: Expedition 33 est le premier jeu du studio montpelliérain Sandfall Interactive, sacré Jeu de l'année aux Game Awards 2025.",
  web("CNC, « Clair Obscur : Expedition 33 aux Game Awards 2025 »",
      "https://www.cnc.fr/jeu-video/actualites/clair-obscur--expedition-33--aux-game-awards-2025--un-triomphe-pour-le-jeu-francais_2511219")),
 (2, "Années 80", "Consoles", "En quelle année la Game Boy est-elle sortie au Japon ?",
  ["1989", "1985", "1992", "1996"],
  "La Game Boy sort au Japon en avril 1989, accompagnée de Tetris qui fera son succès.",
  wp("Game Boy")),

 # ---------- Niveau 3 · Hardcore ----------
 (4, "Années 50", "Origines", "Qui a créé Tennis for Two en 1958, l'un des tout premiers jeux vidéo ?",
  ["William Higinbotham", "Ralph Baer", "Nolan Bushnell", "Steve Russell"],
  "Le physicien William Higinbotham crée Tennis for Two en 1958 au laboratoire de Brookhaven, sur un oscilloscope.",
  wp("Tennis for Two")),
 (3, "Années 70", "Consoles", "Quelle est la première console de salon commercialisée, en 1972 ?",
  ["Magnavox Odyssey", "Atari 2600", "Fairchild Channel F", "Coleco Telstar"],
  "La Magnavox Odyssey, conçue par l'équipe de Ralph Baer, sort aux États-Unis en septembre 1972.",
  wp("Magnavox Odyssey")),
 (4, "Années 60", "Origines", "Sur quel ordinateur Spacewar! a-t-il été programmé au MIT en 1962 ?",
  ["PDP-1", "Apple II", "ENIAC", "IBM PC"],
  "Spacewar! est développé par Steve Russell et ses collègues du MIT sur un DEC PDP-1.",
  wp("Spacewar!")),
 (3, "Années 80", "Anecdotes", "Sous quel nom Pac-Man est-il sorti à l'origine au Japon ?",
  ["Puck Man", "Paku Paku", "Chomp Man", "Yellow Man"],
  "Le jeu s'appelle d'abord Puck Man au Japon ; il est renommé Pac-Man pour l'export afin d'éviter les détournements du nom.",
  wp("Pac-Man")),
 (3, "Années 80", "Créateurs", "Quel concepteur de Namco a imaginé Pac-Man ?",
  ["Toru Iwatani", "Shigeru Miyamoto", "Tomohiro Nishikado", "Masaya Nakamura"],
  "Toru Iwatani conçoit Pac-Man. Nishikado est le créateur de Space Invaders et Nakamura le fondateur de Namco.",
  wp("Toru Iwatani")),
 (3, "Années 90", "Créateurs", "Quel créateur français a conçu presque seul Another World (1991) ?",
  ["Éric Chahi", "Paul Cuisset", "Michel Ancel", "Philippe Ulrich"],
  "Éric Chahi réalise Another World quasiment seul pendant deux ans. Paul Cuisset est, lui, le créateur de Flashback.",
  wp("Another World (jeu vidéo)")),
 (3, "Années 90", "Créateurs", "Quel programmeur d'id Software a conçu le moteur de Doom (1993) ?",
  ["John Carmack", "John Romero", "Tim Sweeney", "Gabe Newell"],
  "John Carmack programme le moteur de Doom ; John Romero en est l'un des principaux concepteurs de niveaux.",
  wp("Doom (jeu vidéo, 1993)")),
 (3, "Années 90", "Consoles", "En quelle année la Dreamcast de Sega est-elle sortie au Japon ?",
  ["1998", "1996", "2000", "2001"],
  "La Dreamcast sort au Japon le 27 novembre 1998. C'est la dernière console de salon de Sega.",
  wp("Dreamcast")),
 (4, "Années 80", "Musique", "Qui a composé la musique de Super Mario Bros. (1985) ?",
  ["Koji Kondo", "Nobuo Uematsu", "Yuzo Koshiro", "Koichi Sugiyama"],
  "Koji Kondo compose la musique de Super Mario Bros. et de The Legend of Zelda. Uematsu est connu pour Final Fantasy.",
  wp("Koji Kondo")),
 (4, "Années 80", "Anecdotes", "Près de quelle ville Atari a-t-il enterré des milliers de cartouches, dont celles d'E.T., en 1983 ?",
  ["Alamogordo", "Roswell", "Las Vegas", "Phoenix"],
  "En septembre 1983, Atari enfouit des cartouches invendues dans une décharge d'Alamogordo (Nouveau-Mexique). Des fouilles l'ont confirmé en 2014.",
  web("Slate.fr, « En 1983, un extraterrestre en pixels a failli couler l'industrie du jeu vidéo »",
      "https://www.slate.fr/culture/1983-extraterrestre-pixels-failli-couler-industrie-jeu-video-pire-histoire-et-the-extra-terrestrial-atari-howard-scott-warshaw-decharge")),

 # ---------- Niveau 4 · Légende ----------
 (3, "Années 80", "Industrie", "En quelle année a lieu le grand krach du jeu vidéo nord-américain ?",
  ["1983", "1979", "1987", "1991"],
  "En 1983, le marché nord-américain s'effondre sous l'excès de consoles et de jeux médiocres ; il ne se relèvera qu'avec la NES.",
  wp("Krach du jeu vidéo de 1983")),
 (4, "Années 70", "Arcade", "Quel est le premier jeu d'arcade vidéo commercialisé, en 1971 ?",
  ["Computer Space", "Pong", "Space Invaders", "Gun Fight"],
  "Computer Space, de Nolan Bushnell et Ted Dabney, sort en 1971 chez Nutting Associates, un an avant Pong.",
  wp("Computer Space")),
 (3, "XIXe siècle", "Industrie", "Que fabriquait Nintendo à sa fondation en 1889 ?",
  ["Des cartes à jouer hanafuda", "Des jouets en bois", "Des appareils photo", "Des machines à coudre"],
  "Fusajiro Yamauchi fonde Nintendo à Kyoto en 1889 pour fabriquer des cartes à jouer traditionnelles, les hanafuda.",
  wp("Nintendo")),
 (3, "Années 80", "Industrie", "Dans quelle ville l'éditeur Infogrames a-t-il été fondé en 1983 ?",
  ["Lyon", "Paris", "Montpellier", "Bordeaux"],
  "Infogrames est fondé à Lyon en juin 1983 par Bruno Bonnell et Christophe Sapet ; la société deviendra Atari SA en 2009.",
  wp("Infogrames Entertainment")),
 (4, "Années 70", "Origines", "Dans quelle université le premier MUD, ancêtre des jeux en ligne, a-t-il été créé en 1978 ?",
  ["Université d'Essex", "MIT", "Stanford", "Cambridge"],
  "Roy Trubshaw et Richard Bartle créent MUD (Multi-User Dungeon) à l'université d'Essex, au Royaume-Uni, en 1978.",
  wp("MUD1", "en")),
 (4, "Années 90", "Consoles", "Sur quelle console sont sortis en 1993 des Zelda développés hors de Nintendo ?",
  ["Philips CD-i", "3DO", "Atari Jaguar", "Sega Mega-CD"],
  "Link: The Faces of Evil et Zelda: The Wand of Gamelon sortent en 1993 sur le CD-i de Philips, sous licence Nintendo.",
  wp("CD-i")),
 (4, "Années 80", "Créateurs", "Quel ingénieur de Nintendo a conçu les Game & Watch, puis la Game Boy ?",
  ["Gunpei Yokoi", "Satoru Iwata", "Hiroshi Yamauchi", "Masayuki Uemura"],
  "Gunpei Yokoi conçoit les Game & Watch (1980) puis la Game Boy (1989). Uemura est, lui, le père de la Famicom.",
  wp("Gunpei Yokoi")),
 (4, "Années 90", "Créateurs", "Quel créateur français est à l'origine d'Alone in the Dark (1992) ?",
  ["Frédérick Raynal", "Éric Chahi", "Paul Cuisset", "Michel Ancel"],
  "Frédérick Raynal crée Alone in the Dark chez Infogrames en 1992, précurseur du « survival horror ».",
  wp("Frédérick Raynal")),
 (4, "Années 70", "Anecdotes", "Dans quel jeu Atari 2600 Warren Robinett a-t-il caché une salle secrète affichant son nom ?",
  ["Adventure", "Pitfall!", "Yars' Revenge", "Combat"],
  "Dans Adventure, Robinett cache une salle affichant « Created by Warren Robinett », l'un des premiers easter eggs connus.",
  wp("Adventure (jeu vidéo)")),
 (3, "Années 2020", "Récompenses", "Quel jeu a été sacré Jeu de l'année aux Game Awards 2024 ?",
  ["Astro Bot", "Black Myth: Wukong", "Final Fantasy VII Rebirth", "Metaphor: ReFantazio"],
  "Astro Bot, du studio Team Asobi (Sony), remporte le titre de Jeu de l'année aux Game Awards de décembre 2024.",
  wp("Astro Bot")),
]

# Lots complémentaires de la banque v0.3 (un fichier par niveau, ajoutés au fur et à mesure)
for nom in LOTS:
    Q += importlib.import_module(nom).Q

# Identifiants figés : une question garde son identifiant même si elle change de niveau
# (le préfixe N1…N4 indique le niveau d'origine). Les nouvelles questions reçoivent
# le numéro suivant libre de leur niveau. Modifier le texte d'un énoncé crée un nouvel identifiant.
REGISTRE = pathlib.Path(__file__).parent / "identifiants.json"
registre = json.loads(REGISTRE.read_text(encoding="utf-8")) if REGISTRE.exists() else {}
pris = set(registre.values())

def nouvel_id(niveau):
    n = 1
    while f"N{niveau}-{n:03d}" in pris:
        n += 1
    pris.add(f"N{niveau}-{n:03d}")
    return f"N{niveau}-{n:03d}"

out, compteur = [], {1: 0, 2: 0, 3: 0, 4: 0}
for niveau, epoque, theme, enonce, choix, expl, source in Q:
    assert len(choix) == 4 and len(set(choix)) == 4, enonce
    compteur[niveau] += 1
    if enonce not in registre:
        registre[enonce] = nouvel_id(niveau)
    out.append({
        "id": registre[enonce],
        "niveau": niveau, "epoque": epoque, "theme": theme,
        "enonce": enonce, "choix": choix, "bonne": 0,
        "explication": expl, "source": source,
    })

problemes = verifier(out)
if problemes:
    print("\n".join(problemes))
    sys.exit("Banque NON générée : corriger les problèmes ci-dessus.")
SORTIE.write_text(json.dumps(out, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
REGISTRE.write_text(json.dumps(registre, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
print(len(out), "questions", compteur, "->", SORTIE)
