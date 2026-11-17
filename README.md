# 🎮 SupaQuizzBros

Le quiz du jeu vidéo en français, de Pong à aujourd'hui.

**Jouer :** https://garcimore69.github.io/SupaQuizzBros/

- **Question du jour** : la même pour tout le monde, sans chrono, avec une série de jours consécutifs.
- **4 niveaux** progressifs (Joueur du dimanche, Gamer, Hardcore, Légende) : 7/10 débloque le niveau suivant.
- **Mode Challenge** : 10 secondes par question au lieu de 20, débloqué avec 7/10 sur un niveau.
- **208 questions sourcées** : chaque réponse est expliquée et renvoie vers une source vérifiable.
- Aucun compte, aucun serveur : la progression reste dans le navigateur du joueur.

## Organisation du code

```
index.html            page unique ; charge le style et js/app.js
css/retro.css         thème « Rétro pixel » (thème par défaut)
js/config.js          toutes les règles chiffrées (durées, points, seuils, niveaux)
js/app.js             affichage des écrans et interactions
js/partie.js          logique d'une partie : tirage, rotation des questions, points
js/quotidien.js       question du jour (tirage identique pour tous) et série
js/progression.js     sauvegarde locale : niveaux, records, série
js/outils.js          utilitaires (mélange, aléa déterministe, dates)
js/icones.js          icônes pixel en SVG
data/questions.json   banque de questions (générée, ne pas modifier à la main)
outils/               scripts Python de la banque de questions
```

Technologie : HTML, CSS et JavaScript natifs (modules ES), sans framework ni dépendance.
Hébergement : GitHub Pages, gratuit, sans compte supplémentaire.

## Banque de questions

Les questions sont écrites dans `outils/generer_banque.py` (lot d'origine),
`outils/banque_n1.py` … `banque_n4.py` (un lot par niveau) et `outils/banque_v05.py`.
Les identifiants sont figés dans `outils/identifiants.json` : une question garde le sien
même si elle change de niveau. Pour les régénérer :

```bash
python3 outils/generer_banque.py
```

Le script contrôle la banque avant de l'écrire (`outils/verifier.py`) : pas de doublon,
4 propositions distinctes, bonne réponse absente de l'énoncé, source en https, et
aucune explication qui souffle la réponse d'une autre question du même niveau.

Format d'une question :

| Champ | Contenu |
|-------|---------|
| `id` | identifiant unique, ex. `N2-007` |
| `niveau` | 1 à 4 |
| `epoque`, `theme` | étiquettes affichées au-dessus de la question |
| `enonce` | la question |
| `choix` | 4 propositions |
| `bonne` | position de la bonne réponse dans `choix` |
| `explication` | 1 à 2 phrases (230 caractères maximum) |
| `source` | `{ titre, url }` |

**Calibrage des niveaux :** Joueur du dimanche = ce qu'on voit en jouant (personnages, couleurs, objets, principe du jeu) et les grandes marques, jamais de créateur, de studio, de date précise ni de technique ; Gamer = séries, studios et consoles ; Hardcore = faits qu'un joueur passionné peut retrouver ou
déduire ; Légende = faits qu'on ne devine pas (pionniers, coulisses, compositeurs).

## Tester en local

Les modules ES ne se chargent pas en ouvrant le fichier directement : lancer un petit serveur.

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Publication

Le site est servi par GitHub Pages depuis la branche `gh-pages`.
Publier une nouvelle version = pousser `main`, puis la recopier sur `gh-pages` :

```bash
git push origin main && git push origin main:gh-pages
```

## Feuille de route

- **v0.5** (actuelle) : mise en ligne, question du jour, mode Challenge
- **v0.8** : défi entre amis par QR code, installation sur Android (PWA, hors-ligne), thèmes Néon et Cartouche
- **v1.0** : mise en production, renouvellement régulier de la banque
