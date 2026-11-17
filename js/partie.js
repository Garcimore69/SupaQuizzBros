/**
 * Logique d'une partie (sans affichage) : tirage des questions, mélange des
 * propositions, calcul des points.
 */
import { REGLES, MODES } from './config.js';
import { melanger } from './outils.js';
import { lire, ecrire } from './progression.js';

/** Mélange les 4 propositions et retient la nouvelle position de la bonne réponse. */
export function preparerQuestion(q) {
  const ordre = melanger([0, 1, 2, 3]);
  return { ...q, choixMelanges: ordre.map(i => q.choix[i]), bonneMelangee: ordre.indexOf(q.bonne) };
}

/**
 * Crée une partie de 10 questions.
 * Rotation : on pioche d'abord les questions jamais vues sur ce niveau, pour ne pas
 * retomber sur les mêmes ; quand tout le niveau a été vu, le cycle recommence.
 */
export function creerPartie(questions, niveau, modeId = 'normal') {
  const p = lire();
  const vues = new Set(p.vues[niveau] || []);
  const duNiveau = questions.filter(q => q.niveau === niveau);
  const nouvelles = melanger(duNiveau.filter(q => !vues.has(q.id)));
  const dejaVues = melanger(duNiveau.filter(q => vues.has(q.id)));
  const tirage = nouvelles.concat(dejaVues).slice(0, REGLES.questionsParPartie);
  p.vues[niveau] = nouvelles.length >= REGLES.questionsParPartie
    ? [...vues, ...tirage.map(q => q.id)]
    : tirage.map(q => q.id);
  ecrire(p);
  return { niveau, mode: MODES[modeId], questions: tirage.map(preparerQuestion), index: 0, points: 0, historique: [] };
}

/**
 * Enregistre la réponse à la question en cours.
 * @param choix index choisi, ou null si le temps est écoulé
 * @param restantSec secondes restantes au moment de la réponse
 */
export function repondre(partie, choix, restantSec) {
  const q = partie.questions[partie.index];
  const juste = choix === q.bonneMelangee;
  const bonus = juste ? Math.min(REGLES.bonusMax, Math.round(restantSec * partie.mode.bonusParSeconde)) : 0;
  const gain = juste ? REGLES.pointsBonne + bonus : 0;
  partie.points += gain;
  partie.historique.push({ juste, choix, bonus, gain });
  return partie.historique[partie.historique.length - 1];
}

export const bonnesReponses = partie => partie.historique.filter(h => h.juste).length;
