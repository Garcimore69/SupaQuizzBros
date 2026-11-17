/**
 * Progression du joueur, stockée uniquement dans son navigateur (aucun compte, aucun serveur).
 *
 * Structure enregistrée :
 * {
 *   debloques: [1, 2],                         niveaux accessibles
 *   meilleurs: { 1: { bonnes, points } },      meilleur score par niveau, mode normal
 *   meilleursChallenge: { 1: { bonnes, points } }  idem en mode Challenge
 *   vues: { 1: ["N1-004", …] },                questions déjà tirées (rotation)
 *   quotidien: { dernierJour, serie, jours: { "2026-11-17": { id, juste } } }
 * }
 */
import { REGLES } from './config.js';
import { ecartJours } from './outils.js';

const CLE = 'sqb.progression.v1';
let memoire = null; // repli si le stockage du navigateur est indisponible (navigation privée…)

const vide = () => ({ debloques: [1], meilleurs: {}, meilleursChallenge: {}, vues: {}, quotidien: { jours: {} } });

/** Lit la progression ; complète les champs manquants (anciennes versions). */
export function lire() {
  let p = memoire;
  try { const brut = localStorage.getItem(CLE); if (brut) p = JSON.parse(brut); } catch (e) { /* stockage indisponible */ }
  return { ...vide(), ...(p || {}), quotidien: { jours: {}, ...(p && p.quotidien) } };
}

export function ecrire(p) {
  memoire = p;
  try { localStorage.setItem(CLE, JSON.stringify(p)); } catch (e) { /* on garde la copie en mémoire */ }
}

export const reinitialiser = () => ecrire(vide());

/** Le mode Challenge d'un niveau s'ouvre avec 7/10 en mode normal sur ce niveau. */
export const challengeOuvert = (p, niveau) =>
  (p.meilleurs[niveau]?.bonnes ?? 0) >= REGLES.seuilDeblocage;

/**
 * Enregistre une partie terminée et renvoie le bilan à afficher.
 * Seul le mode normal débloque le niveau suivant (le Challenge exige de toute façon le niveau réussi).
 */
export function enregistrerPartie({ niveau, mode, bonnes, points }) {
  const p = lire();
  const table = mode === 'challenge' ? p.meilleursChallenge : p.meilleurs;
  const ancien = table[niveau] || null;
  const record = !ancien || points > ancien.points;
  const challengeAvant = challengeOuvert(p, niveau);
  if (record) table[niveau] = { bonnes, points };
  // On garde aussi la meilleure note sur 10, même si le record de points est ailleurs
  if (!record && bonnes > ancien.bonnes) table[niveau] = { ...ancien, bonnes };

  let niveauDebloque = null;
  if (mode === 'normal' && bonnes >= REGLES.seuilDeblocage && niveau < 4 && !p.debloques.includes(niveau + 1)) {
    p.debloques.push(niveau + 1);
    niveauDebloque = niveau + 1;
  }
  const challengeDebloque = mode === 'normal' && !challengeAvant && challengeOuvert(p, niveau);
  ecrire(p);
  return { ancien, record, niveauDebloque, challengeDebloque, meilleur: table[niveau] };
}

/** Série actuelle : jours consécutifs où la question du jour a été jouée (0 si un jour a été manqué). */
export function serieActuelle(p, aujourdhui) {
  const q = p.quotidien;
  if (!q.dernierJour) return 0;
  return ecartJours(q.dernierJour, aujourdhui) <= 1 ? q.serie : 0;
}
