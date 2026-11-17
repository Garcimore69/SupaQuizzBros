/** Petites fonctions utilitaires, sans dépendance. */

/** Échappe un texte avant de l'insérer dans du HTML. */
export const esc = s => String(s).replace(/[&<>"']/g,
  c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * Générateur pseudo-aléatoire déterministe (mulberry32) : la même graine
 * donne toujours la même suite de nombres, sur tous les appareils.
 */
export function aleaDeterministe(graine) {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mélange de Fisher-Yates ; renvoie une copie. `alea` permet un mélange reproductible. */
export function melanger(tab, alea = Math.random) {
  const t = tab.slice();
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(alea() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

/** Date locale du joueur au format AAAA-MM-JJ (la journée change à minuit, heure locale). */
export function jourLocal(date = new Date()) {
  const p = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

/** Nombre de jours entre deux dates AAAA-MM-JJ (b - a). */
export function ecartJours(a, b) {
  const utc = s => { const [y, m, d] = s.split('-').map(Number); return Date.UTC(y, m - 1, d); };
  return Math.round((utc(b) - utc(a)) / 86400000);
}

/** Date longue en français, ex. « mardi 17 novembre 2026 ». */
export const dateLongue = (date = new Date()) =>
  date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
