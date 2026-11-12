/**
 * Questions du formulaire de contact (QCM).
 *
 * Pour modifier le questionnaire, il suffit d'éditer cette liste :
 *  - `title`   : la question posée ;
 *  - `help`    : précision facultative affichée sous la question ;
 *  - `options` : les réponses proposées. Les lettres A, B, C… sont ajoutées automatiquement,
 *    dans l'ordre de la liste. `detail` est une précision facultative affichée sous la réponse.
 *
 * On peut ajouter ou retirer des questions et des réponses : le formulaire s'adapte tout seul.
 * `id` sert de nom de champ dans la demande reçue (lettres minuscules, sans espace ni accent).
 *
 * La première question est aussi affichée en grand sur la page d'accueil (bloc « Votre projet en
 * 3 questions ») : cliquer sur une réponse ouvre le formulaire à la question suivante.
 * La question `travaux` est pré-cochée quand on vient d'une page prestation (voir `qcmTravaux`
 * dans src/data/services.ts).
 */
export interface QcmOption {
  label: string;
  detail?: string;
}

export interface QcmQuestion {
  id: string;
  title: string;
  help?: string;
  options: QcmOption[];
}

export const qcmQuestions: QcmQuestion[] = [
  {
    id: 'travaux',
    title: 'Quel est votre besoin ?',
    options: [
      { label: 'Flocage coupe-feu', detail: 'Protection incendie des structures' },
      { label: 'Flocage thermique ou acoustique', detail: 'Isolation projetée, correction acoustique' },
      { label: 'Plâtrerie ou Aeroblue®', detail: 'Plâtre projeté, faux plafonds, étanchéité à l’air' },
    ],
  },
  {
    id: 'delai',
    title: 'Quel est votre délai ?',
    options: [
      { label: 'Urgent', detail: 'Intervention dès que possible' },
      { label: 'Dans le mois', detail: 'Chantier déjà programmé' },
      { label: 'Plus tard', detail: 'Projet en préparation' },
    ],
  },
  {
    // Créneaux de rappel : fin de matinée et fin de journée, en semaine.
    id: 'rappel',
    title: 'Quand préférez-vous être rappelé ?',
    help: 'Du lundi au vendredi.',
    options: [
      { label: 'En fin de matinée', detail: 'Entre 11 h 30 et 12 h' },
      { label: 'En fin de journée', detail: 'Entre 17 h 30 et 18 h' },
      { label: 'Indifférent', detail: 'Sur l’un ou l’autre créneau' },
    ],
  },
];

/** Lettres affichées devant les réponses. */
export const qcmLetters = 'ABCDEFGHIJ';
