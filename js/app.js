/**
 * SupaQuizzBros — interface (thème Rétro).
 *
 * Écrans : question du jour → accueil → choix du niveau → question (chrono)
 *          → correction sourcée → résultat → revue des réponses.
 * Ce module ne contient que l'affichage et les interactions ; les règles sont
 * dans config.js, la logique de partie dans partie.js, la sauvegarde dans
 * progression.js et le tirage du jour dans quotidien.js.
 */
import { REGLES, MODES, NIVEAUX } from './config.js';
import { esc, jourLocal, dateLongue } from './outils.js';
import { ICO } from './icones.js';
import * as progression from './progression.js';
import { creerPartie, repondre, bonnesReponses, preparerQuestion } from './partie.js';
import { questionDuJour, resultatDuJour, enregistrerQuotidien } from './quotidien.js';

const $app = document.getElementById('app');
const LETTRES = ['A', 'B', 'C', 'D'];
const majuscule = s => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------- État de l'interface ---------- */
let QUESTIONS = [];   // banque chargée depuis data/questions.json
let partie = null;    // partie en cours (voir partie.js)
let bilan = null;     // bilan de la dernière partie terminée
let jour = null;      // { date, question, reponse } pour la question du jour
let minuteur = null;  // requestAnimationFrame du chrono
let ecran = '';

/** Remplace le contenu de l'écran et place le focus sur l'élément marqué [data-focus]. */
function afficher(html, nom) {
  arreterChrono();
  ecran = nom;
  $app.innerHTML = html;
  window.scrollTo(0, 0);
  $app.querySelector('[data-focus]')?.focus({ preventScroll: true });
}

/* =====================================================================
   Briques réutilisées
   ===================================================================== */

/** Boutons des niveaux, avec accès au mode Challenge quand il est débloqué. */
function htmlNiveaux(avecDescription) {
  const p = progression.lire();
  return [1, 2, 3, 4].map(n => {
    const ouvert = p.debloques.includes(n);
    const best = p.meilleurs[n];
    const couleur = best && best.bonnes >= REGLES.seuilDeblocage ? 'var(--vert)' : 'var(--jaune)';
    const meta = !ouvert
      ? `${ICO.cadenas}${REGLES.seuilDeblocage}/10 en ${esc(NIVEAUX[n - 1].nom)}`
      : best ? `<span style="color:${couleur}">${best.bonnes}/10 · ${best.points} pts</span>`
             : '<span style="color:var(--cyan)">Jouer</span>';
    const bestC = p.meilleursChallenge[n];
    const challenge = progression.challengeOuvert(p, n)
      ? `<button class="btn-challenge" data-niveau="${n}" data-mode="challenge" aria-label="Mode Challenge, niveau ${n}, 10 secondes par question">
           ${ICO.eclair}<span>10 s</span><small>${bestC ? bestC.points + ' pts' : 'Challenge'}</small></button>`
      : '';
    return `<div class="ligne-niveau">
      <button class="niveau" data-niveau="${n}" data-mode="normal" ${ouvert ? '' : 'disabled'} aria-label="Niveau ${n}, ${esc(NIVEAUX[n].nom)}${ouvert ? '' : ', verrouillé'}">
        <span><strong style="color:${ouvert ? 'var(--jaune)' : 'inherit'}">${n}</strong> · ${esc(NIVEAUX[n].nom)}${avecDescription ? `<span class="desc">${esc(NIVEAUX[n].desc)}</span>` : ''}</span>
        <span class="meta">${meta}</span></button>${challenge}</div>`;
  }).join('');
}

/** Bloc « Pourquoi ? » : explication et lien vers la source. */
const htmlPourquoi = q => `
  <div class="bloc pourquoi">
    <span class="etiquette" style="color:var(--jaune)">POURQUOI ?</span>
    <p class="copiable">${esc(q.explication)}</p>
    <a class="source copiable" href="${esc(q.source.url)}" target="_blank" rel="noopener">${ICO.lien}Source : ${esc(q.source.titre)}</a>
  </div>`;

/** Liste corrigée des propositions (bonne réponse en vert, erreur en rose). */
function htmlCorrection(q, choix) {
  return `<div class="corr">${q.choixMelanges.map((c, i) => {
    const cls = i === q.bonneMelangee ? 'bonne' : (i === choix ? 'faux' : '');
    const note = i === choix ? 'Votre choix' : (i === q.bonneMelangee && choix !== q.bonneMelangee ? 'Bonne réponse' : '');
    return `<div class="${cls}"><span>${LETTRES[i]} · ${esc(c)}</span>${note ? `<small>${note}</small>` : ''}</div>`;
  }).join('')}</div>`;
}

/** Bandeau de verdict. */
function htmlVerdict(juste, tempsEcoule) {
  const [cls, icone, texte] = juste ? ['ok', ICO.ok, 'BONNE RÉPONSE']
    : tempsEcoule ? ['temps', ICO.chrono.replace('#ffd23f', 'currentColor'), 'TEMPS ÉCOULÉ'] : ['ko', ICO.ko, 'RATÉ !'];
  return `<div class="bloc verdict ${cls}">${icone}<span>${texte}</span></div>`;
}

/** Propositions cliquables ; en grille 2×2 quand elles sont courtes (dates, noms brefs). */
function htmlPropositions(q) {
  const courtes = q.choixMelanges.every(c => c.length <= 14);
  return `<div class="${courtes ? 'grille-jour' : 'choix'}">${q.choixMelanges.map((c, i) =>
    `<button class="rep" data-rep="${i}">${courtes ? '' : `<span class="l">${LETTRES[i]}</span>`}${esc(c)}</button>`).join('')}</div>`;
}

/* =====================================================================
   Question du jour
   ===================================================================== */

/** Prépare la question du jour (une seule fois par session). */
function preparerJour() {
  const date = jourLocal();
  if (jour?.date === date) return jour;
  // Déjà jouée aujourd'hui : on reprend la question enregistrée (la banque a pu changer entre-temps)
  const deja = resultatDuJour(date);
  const q = (deja && QUESTIONS.find(x => x.id === deja.id)) || questionDuJour(QUESTIONS, date);
  jour = { date, question: preparerQuestion(q), reponse: null };
  if (deja) jour.reponse = deja.juste ? jour.question.bonneMelangee : -1; // -1 : ratée
  return jour;
}

function ecranQuotidien() {
  const j = preparerJour();
  if (j.reponse !== null) return ecranQuotidienCorrection();
  const serie = progression.serieActuelle(progression.lire(), j.date);
  afficher(`
    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;padding-top:12px">
      ${ICO.soleil}
      <h1 class="titre-jour" style="margin:0">QUESTION DU JOUR</h1>
      <span style="font-size:17px;color:var(--texte-2)">${esc(dateLongue())}</span>
    </div>
    <div class="bloc carte-q">
      <span class="tag">${esc(j.question.epoque)} · ${esc(j.question.theme)}</span>
      <h2 class="enonce">${esc(j.question.enonce)}</h2>
    </div>
    ${htmlPropositions(j.question)}
    <div class="astuce">
      <span>Pas de chrono : prends ton temps.</span>
      <span>Réponds chaque jour pour allonger ta série${serie ? ` (actuellement ${serie} jour${serie > 1 ? 's' : ''})` : ''}.</span>
    </div>
    <div class="espace"></div>
    <button class="lien" data-action="accueil">Plus tard, aller à l'accueil</button>
  `, 'quotidien');
}

function ecranQuotidienCorrection() {
  const j = jour;
  const q = j.question;
  const juste = j.reponse === q.bonneMelangee;
  const serie = progression.serieActuelle(progression.lire(), j.date);
  afficher(`
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding-top:4px">
      <span class="etiquette" style="color:var(--jaune)">QUESTION DU JOUR</span>
      <span style="font-size:15px;color:var(--texte-2)">${esc(dateLongue())}</span>
    </div>
    ${htmlVerdict(juste, false)}
    <div class="bloc serie" style="justify-content:center;box-shadow:none">${ICO.serie}<span>Série : <strong>${serie} jour${serie > 1 ? 's' : ''}</strong></span></div>
    <h2 style="margin:0;font-size:20px;line-height:1.3">${esc(q.enonce)}</h2>
    ${j.reponse >= 0 ? htmlCorrection(q, j.reponse) : `<div class="corr"><div class="bonne"><span>${esc(q.choix[q.bonne])}</span><small>Bonne réponse</small></div></div>`}
    ${htmlPourquoi(q)}
    <p style="margin:0;text-align:center;font-size:15px;color:var(--texte-2)">Nouvelle question demain !</p>
    <div class="espace"></div>
    <button class="btn btn-jaune" data-action="accueil" data-focus>Aller à l'accueil</button>
  `, 'quotidien-correction');
}

function repondreQuotidien(choix) {
  if (ecran !== 'quotidien') return;
  jour.reponse = choix;
  enregistrerQuotidien(jour.date, jour.question.id, choix === jour.question.bonneMelangee);
  ecranQuotidienCorrection();
}

/* =====================================================================
   Accueil et choix du niveau
   ===================================================================== */

function ecranAccueil() {
  const j = preparerJour();
  const p = progression.lire();
  const serie = progression.serieActuelle(p, j.date);
  const fait = j.reponse !== null;
  const statut = !fait ? '<button class="btn btn-jaune" data-action="quotidien">Jouer</button>'
    : `<button class="btn btn-cyan" data-action="quotidien" aria-label="Revoir la question du jour">${j.reponse === j.question.bonneMelangee ? '✓ Réussie' : 'Revoir'}</button>`;
  afficher(`
    <div class="ligne">
      <div class="bloc serie" style="box-shadow:none">${ICO.serie}<span>Série : <strong>${serie} jour${serie > 1 ? 's' : ''}</strong></span></div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:0 0 4px">
      ${ICO.manette}
      <h1 class="titre-jeu">SUPA<br>QUIZZ<br>BROS</h1>
      <p class="sous-titre">Le quiz du jeu vidéo, de Pong à aujourd'hui</p>
    </div>
    <div class="bloc carte-jour">
      <div style="flex:1;display:flex;flex-direction:column;gap:6px">
        <span class="etiquette" style="color:var(--cyan)">QUESTION DU JOUR</span>
        <span style="font-size:18px;font-weight:700">${esc(majuscule(dateLongue().replace(/ \d{4}$/, '')))}</span>
        <span style="font-size:14px;color:var(--texte-2)">${fait ? 'Déjà jouée, rendez-vous demain' : 'La même pour tout le monde'}</span>
      </div>
      ${statut}
    </div>
    <button class="btn btn-rose" data-action="solo">Partie solo</button>
    <button class="btn" disabled>Défier des amis · bientôt</button>
    <div style="display:flex;flex-direction:column;gap:8px">
      <span class="etiquette">NIVEAUX</span>
      ${htmlNiveaux(false)}
    </div>
    <div class="espace"></div>
    <button class="lien" data-action="reinit" style="font-size:15px">Réinitialiser ma progression</button>
  `, 'accueil');
}

function ecranNiveaux() {
  afficher(`
    <div class="ligne">
      <button class="icone" data-action="accueil" aria-label="Retour à l'accueil" data-focus>${ICO.retour}</button>
      <span class="pixel" style="font-size:13px;color:var(--jaune)">CHOIX DU NIVEAU</span>
      <span style="width:44px"></span>
    </div>
    <p style="margin:0;font-size:16px;line-height:1.45;color:var(--texte-2)">10 questions, 20 secondes par question.
      100 points par bonne réponse, plus un bonus de rapidité jusqu'à +20.
      Obtiens <strong style="color:var(--texte)">${REGLES.seuilDeblocage}/10</strong> pour débloquer le niveau suivant
      et le <strong class="mode-challenge">mode Challenge</strong> : 10 secondes seulement par question.</p>
    <div style="display:flex;flex-direction:column;gap:10px">${htmlNiveaux(true)}</div>
  `, 'niveaux');
}

/* =====================================================================
   Partie : question, chrono, correction
   ===================================================================== */

function demarrer(niveau, modeId) {
  partie = creerPartie(QUESTIONS, niveau, modeId);
  ecranQuestion();
}

function htmlEntetePartie(avecQuitter) {
  const n = partie.questions.length;
  const segments = Array.from({ length: n }, (_, i) => {
    const h = partie.historique[i];
    return `<span class="${h ? (h.juste ? 'ok' : 'ko') : (i === partie.index ? 'cur' : '')}"></span>`;
  }).join('');
  const challenge = partie.mode.id === 'challenge';
  return `
    <div class="ligne">
      ${avecQuitter ? `<button class="icone" data-action="quitter" aria-label="Quitter la partie">${ICO.croix}</button>` : '<span style="width:44px"></span>'}
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px">
        <span class="pixel ${challenge ? 'mode-challenge' : ''}" style="font-size:11px;color:var(--jaune)">${NIVEAUX[partie.niveau].court}${challenge ? ' · 10 S' : ''}</span>
        <span style="font-size:16px">Question ${partie.index + 1} / ${n}</span>
      </div>
      <div class="puce" style="color:var(--vert)">${partie.points} pts</div>
    </div>
    <div class="progres" role="img" aria-label="${partie.historique.length} questions répondues sur ${n}">${segments}</div>`;
}

function ecranQuestion() {
  const q = partie.questions[partie.index];
  const duree = partie.mode.duree;
  afficher(`
    ${htmlEntetePartie(true)}
    <div class="chrono">${ICO.chrono}
      <div class="piste" role="progressbar" aria-label="Temps restant" aria-valuemin="0" aria-valuemax="${duree}"><div class="jauge" id="jauge"></div></div>
      <span class="sec" id="sec">${duree}s</span>
    </div>
    <div class="bloc carte-q">
      <span class="tag">${esc(q.epoque)} · ${esc(q.theme)}</span>
      <h2 class="enonce">${esc(q.enonce)}</h2>
    </div>
    <div class="choix">
      ${q.choixMelanges.map((c, i) => `<button class="rep" data-rep="${i}"><span class="l">${LETTRES[i]}</span>${esc(c)}</button>`).join('')}
    </div>
  `, 'question');
  lancerChrono(duree);
}

/** Chrono précis basé sur l'horloge système ; passe au rose dans le dernier quart. */
function lancerChrono(dureeSec) {
  const debut = performance.now();
  const duree = dureeSec * 1000;
  const $jauge = document.getElementById('jauge');
  const $sec = document.getElementById('sec');
  partie.debutQuestion = debut;
  const tic = maintenant => {
    const restant = Math.max(0, duree - (maintenant - debut));
    $jauge.style.width = (restant / duree * 100) + '%';
    $jauge.classList.toggle('urgent', restant < duree / 4);
    $sec.textContent = Math.ceil(restant / 1000) + 's';
    if (restant <= 0) { minuteur = null; repondreQuestion(null); return; }
    minuteur = requestAnimationFrame(tic);
  };
  minuteur = requestAnimationFrame(tic);
}
function arreterChrono() { if (minuteur) cancelAnimationFrame(minuteur); minuteur = null; }

function repondreQuestion(choix) {
  if (ecran !== 'question') return; // ignore un double clic
  arreterChrono();
  const restant = Math.max(0, partie.mode.duree - (performance.now() - partie.debutQuestion) / 1000);
  repondre(partie, choix, restant);
  ecranCorrection();
}

function ecranCorrection() {
  const q = partie.questions[partie.index];
  const h = partie.historique[partie.index];
  const derniere = partie.index === partie.questions.length - 1;
  afficher(`
    ${htmlEntetePartie(false)}
    ${htmlVerdict(h.juste, h.choix === null)}
    <p class="gain">${h.juste ? `+${REGLES.pointsBonne} pts · bonus rapidité +${h.bonus}` : '0 pt sur cette question'}</p>
    <h2 style="margin:0;font-size:20px;line-height:1.3">${esc(q.enonce)}</h2>
    ${htmlCorrection(q, h.choix)}
    ${htmlPourquoi(q)}
    <div class="espace"></div>
    <button class="btn btn-jaune" data-action="suivante" data-focus>${derniere ? 'Voir mon résultat' : 'Question suivante'}</button>
  `, 'correction');
}

function suivante() {
  if (partie.index < partie.questions.length - 1) { partie.index++; ecranQuestion(); return; }
  bilan = { bonnes: bonnesReponses(partie), ...progression.enregistrerPartie({
    niveau: partie.niveau, mode: partie.mode.id, bonnes: bonnesReponses(partie), points: partie.points }) };
  ecranResultat();
}

/* =====================================================================
   Résultat et revue
   ===================================================================== */

function ecranResultat() {
  const { bonnes, record, ancien, niveauDebloque, challengeDebloque, meilleur } = bilan;
  const n = partie.niveau;
  const challenge = partie.mode.id === 'challenge';
  const p = progression.lire();
  const messages = [];
  if (niveauDebloque) messages.push(['NIVEAU DÉBLOQUÉ', `${niveauDebloque} · ${NIVEAUX[niveauDebloque].nom}`]);
  if (challengeDebloque) messages.push(['MODE CHALLENGE DÉBLOQUÉ', `${NIVEAUX[n].nom} en 10 secondes`]);
  let html = messages.map(([titre, texte]) => `<div class="bloc debloque">${ICO.couronne}<div style="display:flex;flex-direction:column;gap:4px">
      <span class="pixel" style="font-size:11px">${titre}</span><span style="font-size:20px;font-weight:700">${esc(texte)}</span></div></div>`).join('');
  if (!challenge && !messages.length && bonnes < REGLES.seuilDeblocage && n < 4 && !p.debloques.includes(n + 1)) {
    const manque = REGLES.seuilDeblocage - bonnes;
    html = `<div class="bloc info">Encore ${manque} bonne${manque > 1 ? 's' : ''} réponse${manque > 1 ? 's' : ''} pour débloquer le niveau ${n + 1} · ${esc(NIVEAUX[n + 1].nom)}.</div>`;
  }
  const suivantOuvert = !challenge && n < 4 && p.debloques.includes(n + 1);
  afficher(`
    <div style="display:flex;flex-direction:column;align-items:center;gap:14px;padding-top:16px">
      <span class="pixel ${challenge ? 'mode-challenge' : ''}" style="font-size:14px;color:var(--texte-2)">${challenge ? 'CHALLENGE TERMINÉ' : 'PARTIE TERMINÉE'}</span>
      <span class="score-final" aria-label="${bonnes} sur 10">${bonnes}/10</span>
      <span style="font-size:18px">Niveau ${esc(NIVEAUX[n].nom)} · ${partie.points} pts</span>
      <span style="font-size:15px;color:${record && ancien ? 'var(--vert)' : 'var(--texte-2)'}">
        ${record ? (ancien ? `Nouveau record ! (ancien : ${ancien.points} pts)` : 'Premier score enregistré') : `Meilleur score : ${meilleur.points} pts`}</span>
    </div>
    <div class="cases" role="img" aria-label="${bonnes} bonnes réponses, ${10 - bonnes} mauvaises">
      ${partie.historique.map(h => `<span class="${h.juste ? 'ok' : 'ko'}"></span>`).join('')}
    </div>
    ${html}
    <button class="lien" data-action="revue" style="color:var(--cyan)">Revoir les réponses et leurs sources</button>
    <div class="espace"></div>
    <div style="display:flex;flex-direction:column;gap:12px">
      ${suivantOuvert ? `<button class="btn btn-cyan" data-niveau="${n + 1}" data-mode="normal" data-focus>Niveau suivant · ${esc(NIVEAUX[n + 1].nom)}</button>` : ''}
      <button class="btn btn-rose" data-action="rejouer" ${suivantOuvert ? '' : 'data-focus'}>Rejouer ${challenge ? 'le Challenge' : 'ce niveau'}</button>
      <button class="lien" data-action="accueil">Retour à l'accueil</button>
    </div>
  `, 'resultat');
}

function ecranRevue() {
  afficher(`
    <div class="ligne">
      <button class="icone" data-action="resultat" aria-label="Retour au résultat" data-focus>${ICO.retour}</button>
      <span class="pixel" style="font-size:13px;color:var(--jaune)">RÉPONSES</span>
      <span style="width:44px"></span>
    </div>
    ${partie.questions.map((q, i) => {
      const h = partie.historique[i];
      const donnee = h.choix === null ? 'temps écoulé' : esc(q.choixMelanges[h.choix]);
      return `<article class="bloc revue" style="border-color:${h.juste ? 'var(--vert)' : 'var(--rose)'}">
        <span class="etiquette">${i + 1}/10 · ${h.juste ? '<span style="color:var(--vert)">BONNE RÉPONSE</span>' : '<span style="color:var(--rose)">RATÉ</span>'}</span>
        <h3>${esc(q.enonce)}</h3>
        <span class="r" style="color:var(--vert)">✓ ${esc(q.choix[q.bonne])}</span>
        ${h.juste ? '' : `<span style="font-size:14px;color:var(--texte-3)">Votre réponse : ${donnee}</span>`}
        <p class="copiable">${esc(q.explication)}</p>
        <a class="source copiable" href="${esc(q.source.url)}" target="_blank" rel="noopener">${ICO.lien}${esc(q.source.titre)}</a>
      </article>`;
    }).join('')}
    <button class="btn btn-jaune" data-action="resultat">Retour au résultat</button>
  `, 'revue');
}

/* =====================================================================
   Boîte de confirmation (les alert/confirm natifs sont évités)
   ===================================================================== */

function confirmer(texte, libelleOui, siOui) {
  const voile = document.createElement('div');
  voile.className = 'voile';
  voile.innerHTML = `<div class="bloc dialogue" role="dialog" aria-modal="true">
    <p>${esc(texte)}</p>
    <button class="btn btn-rose" data-oui>${esc(libelleOui)}</button>
    <button class="lien" data-non>Annuler</button></div>`;
  const fermer = () => voile.remove();
  voile.addEventListener('click', e => {
    if (e.target.closest('[data-oui]')) { fermer(); siOui(); }
    else if (e.target.closest('[data-non]') || e.target === voile) fermer();
  });
  document.body.appendChild(voile);
  voile.querySelector('[data-oui]').focus();
}

/* =====================================================================
   Événements : un seul écouteur de clics, raccourcis clavier sur PC
   ===================================================================== */

$app.addEventListener('click', e => {
  const el = e.target.closest('button');
  if (!el || el.disabled) return;
  if (el.dataset.rep !== undefined) {
    const i = Number(el.dataset.rep);
    return ecran === 'quotidien' ? repondreQuotidien(i) : repondreQuestion(i);
  }
  if (el.dataset.niveau) return demarrer(Number(el.dataset.niveau), el.dataset.mode || 'normal');
  switch (el.dataset.action) {
    case 'quotidien': return ecranQuotidien();
    case 'solo': return ecranNiveaux();
    case 'accueil': return ecranAccueil();
    case 'suivante': return suivante();
    case 'rejouer': return demarrer(partie.niveau, partie.mode.id);
    case 'revue': return ecranRevue();
    case 'resultat': return ecranResultat();
    case 'quitter':
      // Le chrono continue pendant la confirmation : pas de pause stratégique
      return confirmer('Quitter la partie ? Ton score ne sera pas enregistré.', 'Quitter', ecranAccueil);
    case 'reinit':
      return confirmer('Effacer tes scores, ta série et reverrouiller les niveaux 2 à 4 ?', 'Tout effacer', () => {
        progression.reinitialiser(); jour = null; ecranAccueil();
      });
  }
});

document.addEventListener('keydown', e => {
  if (document.querySelector('.voile') || e.ctrlKey || e.metaKey || e.altKey) return;
  if (ecran !== 'question' && ecran !== 'quotidien') return;
  const t = e.key.toLowerCase();
  const i = 'abcd'.includes(t) && t.length === 1 ? 'abcd'.indexOf(t) : '1234'.indexOf(e.key);
  if (i < 0 || e.key.length !== 1) return;
  e.preventDefault();
  ecran === 'quotidien' ? repondreQuotidien(i) : repondreQuestion(i);
});

/* =====================================================================
   Démarrage : charger la banque, puis question du jour si pas encore jouée
   ===================================================================== */

async function demarrage() {
  try {
    const rep = await fetch('data/questions.json', { cache: 'no-cache' });
    if (!rep.ok) throw new Error(`HTTP ${rep.status}`);
    QUESTIONS = await rep.json();
  } catch (err) {
    $app.innerHTML = `<p class="chargement">Impossible de charger les questions (${esc(err.message)}).<br>Vérifie ta connexion puis recharge la page.</p>`;
    return;
  }
  const j = preparerJour();
  j.reponse === null ? ecranQuotidien() : ecranAccueil();
}

demarrage();
