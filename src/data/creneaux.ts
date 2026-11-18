/**
 * Créneaux d'appel proposés par le formulaire de contact.
 *
 * Six créneaux de 15 minutes par jour ouvré — fin de matinée (11 h 30, 11 h 45, 12 h) et fin de
 * journée (17 h 30, 17 h 45, 18 h) — du lundi au vendredi, jours fériés exclus. Tout se règle
 * dans `creneauxReglages` ci-dessous : horaires, durée, jours, nombre de jours proposés.
 *
 * Ce fichier ne dépend de rien d'autre : il sert au rendu des pages (au build) et au navigateur
 * (src/scripts/creneaux.ts). Les calculs se font toujours à l'heure de Paris — l'heure de
 * l'entreprise — quel que soit le fuseau horaire du visiteur.
 */

export const creneauxReglages = {
  /** Fuseau de référence : les horaires sont ceux de l'entreprise, pas ceux du visiteur. */
  zone: 'Europe/Paris',
  /** Heures de début proposées chaque jour ouvré (format 24 h). */
  heures: ['11:30', '11:45', '12:00', '17:30', '17:45', '18:00'],
  /** Durée d'un appel, en minutes : c'est aussi la durée du rendez-vous dans l'agenda. */
  duree: 15,
  /** Jours ouvrés (1 = lundi … 7 = dimanche). */
  jours: [1, 2, 3, 4, 5],
  /** Nombre de jours ouvrés proposés dans le formulaire. */
  joursProposes: 10,
  /** Délai minimum entre la demande et l'appel, en minutes (on ne propose pas « dans 5 minutes »). */
  delaiMinimum: 60,
  /** Les jours fériés français sont fermés. */
  feriesFermes: true,
};

/** Un créneau d'appel. */
export interface Creneau {
  /** Identifiant stable, ex. « 20261119-1130 ». */
  cle: string;
  /** Début et fin de l'appel. */
  debut: Date;
  fin: Date;
  /** « 11 h 30 ». */
  heure: string;
  /** « Jeudi 19 novembre à 11 h 30 ». */
  libelle: string;
  /** Vrai quand l'agenda de l'entreprise est déjà occupé sur ce créneau (créneau grisé). */
  pris: boolean;
}

/** Un jour ouvré et ses créneaux. */
export interface JourCreneaux {
  /** Date du jour, ex. « 2026-11-19 ». */
  cle: string;
  /** « Jeudi 19 novembre ». */
  libelle: string;
  /** Première ligne de la barre des jours : « Jeu. », « Aujourd’hui », « Demain ». */
  jourCourt: string;
  /** Deuxième ligne de la barre des jours : « 19 nov. ». */
  dateCourte: string;
  creneaux: Creneau[];
}

/** Période occupée dans l'agenda de l'entreprise. */
export interface Periode {
  debut: Date;
  fin: Date;
}

/** Une date du calendrier, sans heure ni fuseau. */
interface DateCivile {
  annee: number;
  mois: number;
  jour: number;
}

const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const JOURS_COURTS = ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'];
const MOIS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];
const MOIS_COURTS = [
  'janv.',
  'févr.',
  'mars',
  'avr.',
  'mai',
  'juin',
  'juil.',
  'août',
  'sept.',
  'oct.',
  'nov.',
  'déc.',
];

const deux = (n: number) => String(n).padStart(2, '0');

// ---------------------------------------------------------------- Heure de Paris
// Tout est calculé à l'heure de Paris sans bibliothèque de dates : `Intl` sait convertir un
// instant en heure locale d'un fuseau, on s'en sert pour retrouver le décalage (+1 h en hiver,
// +2 h en été) et faire la conversion dans les deux sens.

const formatParis = new Intl.DateTimeFormat('en-CA', {
  timeZone: creneauxReglages.zone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

/** Instant → heure de Paris, découpée en nombres. */
function partiesParis(instant: Date) {
  const parties: Record<string, number> = {};
  for (const { type, value } of formatParis.formatToParts(instant)) {
    if (type !== 'literal') parties[type] = Number(value);
  }
  return {
    annee: parties.year,
    mois: parties.month,
    jour: parties.day,
    heures: parties.hour,
    minutes: parties.minute,
    secondes: parties.second,
  };
}

/** Décalage de Paris sur UTC à cet instant, en minutes (60 en hiver, 120 en été). */
function decalageParis(instant: Date) {
  const p = partiesParis(instant);
  const commeSiUtc = Date.UTC(p.annee, p.mois - 1, p.jour, p.heures, p.minutes, p.secondes);
  return (commeSiUtc - instant.getTime()) / 60000;
}

/** Heure lue sur une horloge à Paris → instant. */
function instantParis(date: DateCivile, heures = 0, minutes = 0) {
  const commeSiUtc = Date.UTC(date.annee, date.mois - 1, date.jour, heures, minutes);
  // Premier essai avec le décalage du même instant en UTC, puis on corrige : les deux ne diffèrent
  // qu'au voisinage du changement d'heure, où une seconde passe suffit à trouver le bon décalage.
  const decalage = decalageParis(new Date(commeSiUtc));
  const instant = new Date(commeSiUtc - decalage * 60000);
  const corrige = decalageParis(instant);
  return corrige === decalage ? instant : new Date(commeSiUtc - corrige * 60000);
}

/** Date du jour à Paris. */
function dateParis(instant: Date): DateCivile {
  const { annee, mois, jour } = partiesParis(instant);
  return { annee, mois, jour };
}

/** Jour de la semaine (1 = lundi … 7 = dimanche) — calcul sur la date seule, sans fuseau. */
function jourSemaine(date: DateCivile) {
  const dimancheZero = new Date(Date.UTC(date.annee, date.mois - 1, date.jour)).getUTCDay();
  return dimancheZero === 0 ? 7 : dimancheZero;
}

function ajouterJours(date: DateCivile, nombre: number): DateCivile {
  const deplacee = new Date(Date.UTC(date.annee, date.mois - 1, date.jour + nombre));
  return { annee: deplacee.getUTCFullYear(), mois: deplacee.getUTCMonth() + 1, jour: deplacee.getUTCDate() };
}

const cleDate = (date: DateCivile) => `${date.annee}-${deux(date.mois)}-${deux(date.jour)}`;

// ---------------------------------------------------------------- Jours fériés

/**
 * Jours fériés français d'une année : les huit dates fixes, plus le lundi de Pâques,
 * l'Ascension et le lundi de Pentecôte (calcul de la date de Pâques).
 */
function joursFeries(annee: number) {
  const a = annee % 19;
  const b = Math.floor(annee / 100);
  const c = annee % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const paques: DateCivile = {
    annee,
    mois: Math.floor((h + l - 7 * m + 114) / 31),
    jour: ((h + l - 7 * m + 114) % 31) + 1,
  };
  const fixes = ['01-01', '05-01', '05-08', '07-14', '08-15', '11-01', '11-11', '12-25'];
  return new Set([
    ...fixes.map((jour) => `${annee}-${jour}`),
    // Lundi de Pâques, Ascension, lundi de Pentecôte.
    ...[1, 39, 50].map((decalage) => cleDate(ajouterJours(paques, decalage))),
  ]);
}

const feriesParAnnee = new Map<number, Set<string>>();

function estFerie(date: DateCivile) {
  if (!feriesParAnnee.has(date.annee)) feriesParAnnee.set(date.annee, joursFeries(date.annee));
  return feriesParAnnee.get(date.annee)!.has(cleDate(date));
}

const estOuvert = (date: DateCivile) =>
  creneauxReglages.jours.includes(jourSemaine(date)) && !(creneauxReglages.feriesFermes && estFerie(date));

// ---------------------------------------------------------------- Libellés

/** « 11:30 » → « 11 h 30 » (et « 12:00 » → « 12 h »). */
export function libelleHeure(horaire: string) {
  const [heures, minutes] = horaire.split(':').map(Number);
  return minutes ? `${heures} h ${deux(minutes)}` : `${heures} h`;
}

const majuscule = (texte: string) => texte.charAt(0).toUpperCase() + texte.slice(1);

/** « jeudi 19 novembre » (et « 1er » pour le premier du mois). */
function libelleJour(date: DateCivile) {
  const jour = date.jour === 1 ? '1er' : String(date.jour);
  return `${JOURS[jourSemaine(date) - 1]} ${jour} ${MOIS[date.mois - 1]}`;
}

// ---------------------------------------------------------------- Créneaux proposés

/**
 * Créneaux proposés au visiteur : les prochains jours ouvrés (`joursProposes`), chacun avec ses
 * six créneaux, les créneaux passés ou trop proches en moins. Tous les créneaux sont libres
 * (`pris: false`) : c'est `marquerOccupes()` qui les grise à partir de l'agenda.
 */
export function joursCreneaux(maintenant: Date = new Date()): JourCreneaux[] {
  const auPlusTot = maintenant.getTime() + creneauxReglages.delaiMinimum * 60000;
  const aujourdhui = dateParis(maintenant);
  const jours: JourCreneaux[] = [];

  // Garde-fou : 60 jours de calendrier au plus, même si tout est fermé (fériés, réglage exotique).
  for (let n = 0; n < 60 && jours.length < creneauxReglages.joursProposes; n++) {
    const date = ajouterJours(aujourdhui, n);
    if (!estOuvert(date)) continue;

    const creneaux: Creneau[] = [];
    for (const horaire of creneauxReglages.heures) {
      const [heures, minutes] = horaire.split(':').map(Number);
      const debut = instantParis(date, heures, minutes);
      if (debut.getTime() < auPlusTot) continue;
      creneaux.push({
        cle: `${date.annee}${deux(date.mois)}${deux(date.jour)}-${deux(heures)}${deux(minutes)}`,
        debut,
        fin: new Date(debut.getTime() + creneauxReglages.duree * 60000),
        heure: libelleHeure(horaire),
        libelle: `${majuscule(libelleJour(date))} à ${libelleHeure(horaire)}`,
        pris: false,
      });
    }
    if (!creneaux.length) continue;

    jours.push({
      cle: cleDate(date),
      libelle: majuscule(libelleJour(date)),
      jourCourt: n === 0 ? 'Aujourd’hui' : n === 1 ? 'Demain' : JOURS_COURTS[jourSemaine(date) - 1],
      dateCourte: `${date.jour} ${MOIS_COURTS[date.mois - 1]}`,
      creneaux,
    });
  }

  return jours;
}

/** Période à interroger dans l'agenda pour savoir ce qui est déjà pris. */
export function fenetreCreneaux(jours: JourCreneaux[], maintenant: Date = new Date()) {
  const dernier = jours.at(-1)?.creneaux.at(-1)?.fin ?? maintenant;
  return { debut: maintenant, fin: dernier };
}

/** Grise les créneaux qui tombent sur une période occupée de l'agenda. */
export function marquerOccupes(jours: JourCreneaux[], occupes: Periode[]) {
  for (const jour of jours) {
    for (const creneau of jour.creneaux) {
      creneau.pris = occupes.some(
        (periode) => periode.debut.getTime() < creneau.fin.getTime() && periode.fin.getTime() > creneau.debut.getTime(),
      );
    }
  }
  return jours;
}

/**
 * Lit la réponse du service de disponibilités. Formats acceptés, le premier étant celui
 * documenté dans le README :
 *   { "occupes": [{ "debut": "…", "fin": "…" }] }   ·   [{ "start": "…", "end": "…" }]
 *   { "occupes": ["2026-11-19T11:30:00+01:00"] }    (un instant seul = un créneau entier)
 */
export function lireOccupations(donnees: unknown): Periode[] {
  const liste = Array.isArray(donnees)
    ? donnees
    : ((donnees as Record<string, unknown>)?.occupes ??
        (donnees as Record<string, unknown>)?.occupés ??
        (donnees as Record<string, unknown>)?.busy ??
        []);
  if (!Array.isArray(liste)) return [];

  const instant = (valeur: unknown) => {
    const date = new Date(String(valeur ?? ''));
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const periodes: Periode[] = [];
  for (const brut of liste) {
    if (typeof brut === 'string') {
      const debut = instant(brut);
      if (debut) periodes.push({ debut, fin: new Date(debut.getTime() + creneauxReglages.duree * 60000) });
      continue;
    }
    const element = brut as Record<string, unknown>;
    const debut = instant(element?.debut ?? element?.start ?? element?.dateTime);
    const fin = instant(element?.fin ?? element?.end);
    if (debut && fin && fin > debut) periodes.push({ debut, fin });
  }
  return periodes;
}

/** Instant → date ISO à l'heure de Paris, ex. « 2026-11-19T11:30:00+01:00 ». */
export function isoParis(instant: Date) {
  const p = partiesParis(instant);
  const decalage = decalageParis(instant);
  const signe = decalage < 0 ? '-' : '+';
  const absolu = Math.abs(decalage);
  return (
    `${p.annee}-${deux(p.mois)}-${deux(p.jour)}T${deux(p.heures)}:${deux(p.minutes)}:${deux(p.secondes)}` +
    `${signe}${deux(Math.floor(absolu / 60))}:${deux(absolu % 60)}`
  );
}
