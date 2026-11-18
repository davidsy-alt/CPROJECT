/**
 * Choix du créneau d'appel dans le formulaire de contact.
 *
 * - Les créneaux proposés viennent de `src/data/creneaux.ts` (six horaires par jour ouvré).
 * - Les créneaux déjà pris sont grisés : ils sont lus auprès du service de disponibilités
 *   (`data-creneaux-service`, renseigné par PUBLIC_CRENEAUX_URL). Sans service, tous les
 *   créneaux sont proposés et c'est le service de prise de rendez-vous qui tranche.
 * - Le reste du formulaire (étapes, envoi) est dans src/scripts/contact.ts.
 */

import {
  creneauxReglages,
  fenetreCreneaux,
  isoParis,
  joursCreneaux,
  lireOccupations,
  marquerOccupes,
  type JourCreneaux,
} from '../data/creneaux';

/** Créneau choisi, tel qu'il part dans la demande. */
export interface ChoixCreneau {
  cle: string;
  /** Début et fin de l'appel, en UTC (« 2026-11-19T10:30:00.000Z »). */
  debut: string;
  fin: string;
  /** Début à l'heure de Paris (« 2026-11-19T11:30:00+01:00 »). */
  debut_local: string;
  /** « Jeudi 19 novembre à 11 h 30 ». */
  libelle: string;
  duree_minutes: number;
  fuseau: string;
}

export interface Creneaux {
  /** Recharge les créneaux pris (au plus une fois par minute, sauf `force`). */
  rafraichir(force?: boolean): Promise<void>;
  /** Créneau choisi par le visiteur, ou `null`. */
  choix(): ChoixCreneau | null;
  /** Marque un créneau comme pris (le service a refusé la réservation) et redemande un choix. */
  marquerPris(cle: string): void;
  /** Oublie le choix en cours (nouvelle demande). */
  reinitialiser(): void;
  /** Message affiché sous les créneaux. */
  dire(message: string): void;
}

/** Délai avant de redemander les créneaux pris au service, en millisecondes. */
const FRAICHEUR = 60_000;
/** Au-delà, on considère le service injoignable et on propose tous les créneaux. */
const DELAI_SERVICE = 8_000;

export function initCreneaux(form: HTMLFormElement): Creneaux | null {
  const etape = form.querySelector<HTMLElement>('[data-creneaux]');
  const barre = form.querySelector<HTMLElement>('[data-creneaux-jours]');
  const liste = form.querySelector<HTMLElement>('[data-creneaux-liste]');
  const etat = form.querySelector<HTMLElement>('[data-creneaux-etat]');
  if (!etape || !barre || !liste || !etat) return null;

  const service = etape.dataset.creneauxService ?? '';

  let jours: JourCreneaux[] = [];
  let jourAffiche = '';
  let choisi = '';
  /** Créneaux refusés par le service de prise de rendez-vous, en plus de ceux de l'agenda. */
  const refuses = new Set<string>();
  let luLe = 0;
  let enCours: Promise<void> | null = null;

  const dire = (message: string) => {
    etat.textContent = message;
  };

  const creneauChoisi = () => jours.flatMap((jour) => jour.creneaux).find((creneau) => creneau.cle === choisi);

  /** Barre des jours : un bouton par jour, « Complet » quand ses six créneaux sont pris. */
  const rendreJours = () => {
    barre.replaceChildren(
      ...jours.map((jour) => {
        const complet = jour.creneaux.every((creneau) => creneau.pris);
        const bouton = document.createElement('button');
        bouton.type = 'button';
        bouton.className = 'creneau-jour';
        bouton.dataset.cle = jour.cle;
        bouton.disabled = complet;
        bouton.setAttribute('aria-pressed', String(jour.cle === jourAffiche));
        bouton.setAttribute('aria-label', complet ? `${jour.libelle} : complet` : jour.libelle);

        const haut = document.createElement('span');
        haut.className = 'creneau-jour-nom';
        haut.textContent = jour.jourCourt;
        const bas = document.createElement('span');
        bas.className = 'creneau-jour-date';
        bas.textContent = complet ? 'Complet' : jour.dateCourte;

        bouton.append(haut, bas);
        bouton.addEventListener('click', () => {
          jourAffiche = jour.cle;
          rendre();
        });
        return bouton;
      }),
    );
  };

  /** Grille des créneaux du jour affiché. */
  const rendreCreneaux = () => {
    const jour = jours.find((item) => item.cle === jourAffiche);
    if (!jour) {
      liste.replaceChildren();
      return;
    }

    liste.replaceChildren(
      ...jour.creneaux.map((creneau) => {
        const etiquette = document.createElement('label');
        etiquette.className = 'creneau';
        if (creneau.pris) etiquette.dataset.pris = 'true';
        else etiquette.dataset.qcmOption = '';

        const entree = document.createElement('input');
        entree.type = 'radio';
        entree.name = 'rappel';
        entree.value = creneau.libelle;
        entree.className = 'peer sr-only';
        entree.dataset.label = creneau.libelle;
        entree.dataset.cle = creneau.cle;
        entree.disabled = creneau.pris;
        entree.checked = creneau.cle === choisi;
        entree.addEventListener('change', () => {
          if (!entree.checked) return;
          choisi = creneau.cle;
          dire('');
        });

        const heure = document.createElement('span');
        heure.className = 'creneau-heure';
        heure.textContent = creneau.heure;
        etiquette.append(entree, heure);

        if (creneau.pris) {
          const pris = document.createElement('span');
          pris.className = 'creneau-pris';
          pris.textContent = 'Pris';
          etiquette.append(pris);
        }
        return etiquette;
      }),
    );
  };

  /** Affiche les jours et les créneaux. Renvoie `true` si le choix du visiteur a dû être annulé. */
  const rendre = () => {
    // Le créneau choisi vient d'être pris (ou la journée a changé) : on redemande un choix.
    const garde = creneauChoisi();
    const perdu = Boolean(choisi) && (!garde || garde.pris);
    if (perdu) {
      choisi = '';
      dire('Ce créneau vient d’être réservé. Merci d’en choisir un autre.');
    }
    if (!jours.some((jour) => jour.cle === jourAffiche)) {
      jourAffiche = (jours.find((jour) => jour.creneaux.some((creneau) => !creneau.pris)) ?? jours[0])?.cle ?? '';
    }
    rendreJours();
    rendreCreneaux();
    etape.dataset.creneauxVide = String(!jours.length);
    return perdu;
  };

  /** Périodes occupées lues auprès du service de disponibilités. */
  let occupations: { debut: Date; fin: Date }[] = [];

  /** Recalcule les jours proposés (le temps passe : des créneaux deviennent trop proches). */
  const regenerer = () => {
    jours = joursCreneaux();
    marquerOccupes(jours, occupations);
    for (const jour of jours) {
      for (const creneau of jour.creneaux) {
        if (refuses.has(creneau.cle)) creneau.pris = true;
      }
    }
  };

  const lire = async () => {
    const fenetre = fenetreCreneaux(jours.length ? jours : joursCreneaux());
    const adresse = new URL(service, window.location.href);
    adresse.searchParams.set('debut', fenetre.debut.toISOString());
    adresse.searchParams.set('fin', fenetre.fin.toISOString());

    const arret = new AbortController();
    const minuteur = window.setTimeout(() => arret.abort(), DELAI_SERVICE);
    try {
      const reponse = await fetch(adresse, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: arret.signal,
      });
      if (!reponse.ok) throw new Error(`HTTP ${reponse.status}`);
      occupations = lireOccupations(await reponse.json());
      luLe = Date.now();
      regenerer();
      // On n'efface pas le message quand il annonce justement que le créneau choisi est parti.
      if (!rendre()) dire('');
    } catch {
      // Service injoignable : on propose tous les créneaux ; la réservation sera confirmée par e-mail.
      occupations = [];
      regenerer();
      rendre();
      dire('Disponibilités non vérifiées : nous vous confirmons le créneau par e-mail.');
    } finally {
      window.clearTimeout(minuteur);
    }
  };

  const rafraichir = async (force = false) => {
    regenerer();
    rendre();
    if (!service) return;
    if (enCours) return enCours;
    if (!force && luLe && Date.now() - luLe < FRAICHEUR) return;
    if (!luLe) dire('Vérification des créneaux déjà pris…');
    enCours = lire().finally(() => {
      enCours = null;
    });
    return enCours;
  };

  const choix = (): ChoixCreneau | null => {
    const creneau = creneauChoisi();
    if (!creneau || creneau.pris) return null;
    return {
      cle: creneau.cle,
      debut: creneau.debut.toISOString(),
      fin: creneau.fin.toISOString(),
      debut_local: isoParis(creneau.debut),
      libelle: creneau.libelle,
      duree_minutes: creneauxReglages.duree,
      fuseau: creneauxReglages.zone,
    };
  };

  regenerer();
  rendre();

  return {
    rafraichir,
    choix,
    dire,
    marquerPris(cle) {
      refuses.add(cle);
      regenerer();
      rendre();
    },
    reinitialiser() {
      choisi = '';
      regenerer();
      rendre();
    },
  };
}
