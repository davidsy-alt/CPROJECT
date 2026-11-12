/**
 * Informations générales de l'entreprise : coordonnées, zone d'intervention, liens.
 * Tout ce qui est affiché à plusieurs endroits du site se modifie ici.
 */
export const site = {
  name: 'CPROJECT’',
  legalName: 'C PROJECT SARL CHEVRIER PLATRERIE',
  slogan: 'Faites le choix de l’expertise CPROJECT’',
  url: 'https://www.flocage-lorraine.com',

  /** Description utilisée par défaut dans les balises meta (reprise du site d'origine). */
  description:
    'CPROJECT entreprise RGE Qualibat agréée Placo propose ses services et son savoir-faire aux professionnels et aux particuliers pour tous travaux de flocage fibreux, flocage pâteux, Aeroblue, plâtre projeté, protection feu, travaux de plâtrerie et isolation, isolation projetée (isolation par projection, isolation par insufflation, isolation par soufflage) dans les départements des Vosges 88, Meurthe-et-Moselle 54, Moselle 57, Meuse 55, Ardennes 08, Marne 51, Aube 10, Côte-d’Or 21, Haute-Marne 52, Haute-Saône 70, Haut-Rhin 68, Bas-Rhin 67.',

  phone: '03 29 38 06 17',
  phoneHref: 'tel:+33329380617',
  email: 'c.project@orange.fr',
  address: {
    street: 'ZA du Pâtis des Saules',
    postalCode: '88450',
    city: 'Vincey',
  },

  /** Carte Google Maps intégrée (même carte que sur le site d'origine). */
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2651.4121881606075!2d6.316718016038801!3d48.35260277924126!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4793704eefd8010f%3A0x9b0b451fd9e3b78c!2sZ.A.%20du%20Patis%20des%20Saules%2C%2088450%20Vincey!5e0!3m2!1sfr!2sfr!4v1582198293200!5m2!1sfr!2sfr',
  mapLinkUrl: 'https://www.google.com/maps/search/?api=1&query=Z.A.+du+Patis+des+Saules%2C+88450+Vincey',
  googleReviewUrl: 'https://g.page/r/CWPNKweVCIOjEB0/review',

  /** Arguments repris tels quels du site d'origine. */
  reassurance: ['Devis rapide et gratuit', 'Des techniciens qualifiés', '20 ans d’expérience'],
  reassuranceZone: 'Interventions sur tout le Grand Est',

  /**
   * Adresse qui reçoit les demandes du formulaire (POST JSON).
   * Vide = pas encore branché : le formulaire ouvre un e-mail pré-rempli vers `email`.
   */
  contactWebhookUrl: (import.meta.env.PUBLIC_CONTACT_WEBHOOK_URL as string | undefined) ?? '',
};

/** Départements d'intervention (liste du site d'origine). */
export const departements = [
  { name: 'Vosges', code: '88' },
  { name: 'Meurthe-et-Moselle', code: '54' },
  { name: 'Moselle', code: '57' },
  { name: 'Meuse', code: '55' },
  { name: 'Ardennes', code: '08' },
  { name: 'Marne', code: '51' },
  { name: 'Aube', code: '10' },
  { name: 'Côte-d’Or', code: '21' },
  { name: 'Haute-Marne', code: '52' },
  { name: 'Haute-Saône', code: '70' },
  { name: 'Haut-Rhin', code: '68' },
  { name: 'Bas-Rhin', code: '67' },
  { name: 'Territoire de Belfort', code: '90' },
];

/** Mention de référencement affichée en bas des pages prestations (reprise du site d'origine). */
export const mentionZone =
  'CPROJECT’ entreprise RGE Qualibat agréée Placo, réalisation de travaux de flocage en Lorraine : Vosges 88, Meurthe-et-Moselle 54, Moselle 57, Meuse 55, Ardennes 08, Marne 51, Aube 10, Côte-d’Or 21, Haute-Marne 52, Haute-Saône 70, Haut-Rhin 68, Bas-Rhin 67, Territoire de Belfort 90.';
