/**
 * Question du jour : la même pour tous les joueurs, sans serveur.
 *
 * Principe : les questions des niveaux 1 à 3 sont rangées dans un ordre mélangé
 * avec une graine fixe (identique sur tous les appareils). Le jour J prend la
 * question n° (J - premier jour) de cette liste, puis la liste recommence.
 * Ajouter des questions à la banque modifie l'ordre : prévoir les ajouts
 * en même temps qu'une mise à jour de la graine si on veut éviter des répétitions.
 */
import { QUOTIDIEN } from './config.js';
import { aleaDeterministe, melanger, ecartJours } from './outils.js';
import { lire, ecrire } from './progression.js';

/** Renvoie la question du jour `jour` (format AAAA-MM-JJ). */
export function questionDuJour(questions, jour) {
  const candidates = questions
    .filter(q => QUOTIDIEN.niveaux.includes(q.niveau))
    .sort((a, b) => a.id.localeCompare(b.id)); // ordre stable, indépendant du fichier
  const ordre = melanger(candidates, aleaDeterministe(QUOTIDIEN.graine));
  const n = ecartJours(QUOTIDIEN.premierJour, jour);
  return ordre[((n % ordre.length) + ordre.length) % ordre.length];
}

/** Résultat déjà enregistré pour ce jour (ou null si pas encore joué). */
export const resultatDuJour = jour => lire().quotidien.jours[jour] || null;

/**
 * Enregistre la réponse du jour et met à jour la série.
 * La série compte les jours joués à la suite, que la réponse soit juste ou non.
 */
export function enregistrerQuotidien(jour, id, juste) {
  const p = lire();
  const q = p.quotidien;
  if (q.jours[jour]) return q.serie; // déjà joué aujourd'hui : rien ne change
  const ecart = q.dernierJour ? ecartJours(q.dernierJour, jour) : null;
  q.serie = ecart === 1 ? (q.serie || 0) + 1 : 1;
  q.dernierJour = jour;
  q.jours[jour] = { id, juste };
  ecrire(p);
  return q.serie;
}
