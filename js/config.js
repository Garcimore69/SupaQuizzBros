/**
 * Réglages du jeu validés avec le client (voir PROJET.md, section 2).
 * Toute règle chiffrée de l'appli est ici et nulle part ailleurs.
 */

/** Règles communes à toutes les parties. */
export const REGLES = Object.freeze({
  questionsParPartie: 10,
  pointsBonne: 100,
  bonusMax: 20,        // bonus rapidité plafonné, quel que soit le mode
  seuilDeblocage: 7,   // bonnes réponses sur 10 pour débloquer niveau suivant et mode Challenge
});

/**
 * Modes de jeu. Le bonus rapidité vaut `bonusParSeconde` × secondes restantes,
 * plafonné à REGLES.bonusMax : 1 pt/s en normal, 2 pts/s en Challenge.
 */
export const MODES = Object.freeze({
  normal:    { id: 'normal',    nom: 'Normal',    duree: 20, bonusParSeconde: 1 },
  challenge: { id: 'challenge', nom: 'Challenge', duree: 10, bonusParSeconde: 2 },
});

/** Les 4 niveaux de difficulté (règle de calibrage dans PROJET.md). */
export const NIVEAUX = Object.freeze({
  1: { nom: 'Joueur du dimanche', court: 'DIMANCHE', desc: 'Les grands classiques : Mario, Pac-Man, Tetris…' },
  2: { nom: 'Gamer',              court: 'GAMER',    desc: 'Séries, studios et consoles' },
  3: { nom: 'Hardcore',           court: 'HARDCORE', desc: 'Créateurs, dates et anecdotes célèbres' },
  4: { nom: 'Légende',            court: 'LÉGENDE',  desc: "Pionniers, coulisses et histoire de l'industrie" },
});

/** Question du jour : niveaux tirés au sort (on évite Légende pour rester accessible à tous). */
export const QUOTIDIEN = Object.freeze({
  niveaux: [1, 2, 3],
  graine: 20261117,      // graine fixe : même ordre de questions pour tous les joueurs
  premierJour: '2026-11-17',
});
