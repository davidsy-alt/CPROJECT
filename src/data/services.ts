import type { ImageMetadata } from 'astro';
import { lien } from './liens';
import { photo, type PartenaireId } from './photos';

/**
 * Contenu des six pages « prestations ».
 * Les textes sont ceux du site d'origine (flocage-lorraine.com), seules les coquilles ont été corrigées.
 */

export type Block =
  /** Paragraphe : une entrée de `lines` par phrase (affichées à la ligne, comme sur le site d'origine). */
  | { type: 'p'; lines: string[] }
  /** Points clés mis en avant (texte en gras sur le site d'origine). */
  | { type: 'facts'; lines: string[] }
  | { type: 'list'; intro?: string; items: string[] }
  | { type: 'link'; label: string; href: string };

export interface ResumeColumn {
  title: string;
  icon: 'package' | 'thumbs-up' | 'layers';
  /** Texte d'introduction facultatif (page isolation projetée). */
  intro?: string[];
  items: string[];
  image?: { src: ImageMetadata; alt: string };
}

export interface Service {
  /** Adresse de la page, identique au site d'origine (sans le .php). */
  slug: string;
  /** Libellé dans le menu. */
  label: string;
  /** Titre et sous-titre de la carte sur la page d'accueil. */
  cardTitle: string;
  cardText: string;
  /** Titre de la page (h1) et balise <title>. */
  title: string;
  metaTitle: string;
  /** Couleur d'accent de la prestation (reprise du code couleur du site d'origine). */
  accent: string;
  cover: { src: ImageMetadata; alt: string; position?: string };
  /** Texte d'accroche (en couleur sur le site d'origine). */
  lead: string[];
  blocks: Block[];
  photos: { src: ImageMetadata; alt: string }[];
  certifications: PartenaireId[];
  /** Petit libellé au-dessus du titre du bloc de synthèse (« En résumé » par défaut). */
  resumeEyebrow?: string;
  resumeTitle?: string;
  resume: ResumeColumn[];
  video?: { id: string; title: string; poster: ImageMetadata };
  document?: { href: string; label: string };
  /**
   * Réponse pré-cochée à la question « travaux » du formulaire quand on vient de cette page
   * (0 = A, 1 = B, 2 = C, dans l'ordre de src/data/qcm.ts). Absent = rien de pré-coché.
   */
  qcmTravaux?: number;
}

export const services: Service[] = [
  {
    slug: 'flocage-lorraine',
    label: 'Flocage',
    cardTitle: 'Flocage',
    cardText: 'Protection incendie / Thermique / Acoustique',
    title: 'Flocage : thermique, incendie, acoustique',
    metaTitle: 'Flocage en Lorraine : thermique, incendie, acoustique',
    accent: '#efbb00',
    cover: {
      src: photo('flocage-3'),
      alt: 'Technicien projetant un flocage fibreux sur un mur',
      position: '60% 70%',
    },
    lead: [
      'Une isolation thermique alliant protection passive contre l’incendie et une correction acoustique pour votre sécurité et votre confort, c’est ce que vous propose CPROJECT’ avec la réalisation de flocage fibreux.',
    ],
    blocks: [
      {
        type: 'facts',
        lines: [
          'Le flocage fibreux est un isolant composé essentiellement de laine minérale.',
          'C’est un matériau traditionnel de couleur gris ou blanc.',
          'Ce flocage est imputrescible et résiste aux rongeurs et aux parasites.',
          'Le flocage fibreux est vierge de tout produit nocif ou toxique, l’intégralité de sa composition est en accord avec la réglementation chimique européenne (REACH).',
        ],
      },
      {
        type: 'link',
        label: 'En savoir plus sur la réglementation REACH',
        href: 'https://www.ecologique-solidaire.gouv.fr/reglementation-reach',
      },
      {
        type: 'p',
        lines: [
          'Le flocage fibreux s’adapte à toutes les formes de supports, c’est un isolant relativement économique avec des délais de réalisation courts.',
          'Par projection, cet isolant absorbe sans fissurer les dilatations.',
          'Le produit étant relativement léger, les épaisseurs peuvent varier entre 10 et 160 mm.',
          'Le flocage fibreux est utilisé dans le cadre de l’isolation thermique et de la correction acoustique, de la protection incendie du fait de ses caractéristiques coupe-feu.',
        ],
      },
      {
        type: 'facts',
        lines: [
          'Les équipes de l’entreprise CPROJECT’ assurent un travail de qualité en rénovation comme en neuf sur différents types d’ouvrages.',
        ],
      },
    ],
    photos: [
      { src: photo('flocage-3'), alt: 'Technicien projetant un flocage fibreux sur un mur' },
      { src: photo('flocage-4'), alt: 'Chargement du produit de flocage dans la machine à projeter' },
      { src: photo('flocage-5'), alt: 'Flocage fibreux projeté en sous-face de plancher' },
    ],
    certifications: ['qualibat'],
    resumeTitle: 'Le flocage : en résumé',
    resume: [
      {
        title: 'Produit',
        icon: 'package',
        items: [
          'Composé essentiellement de laine minérale',
          'L’aspect final brut ou fini au moyen de rouleau et taloche',
        ],
      },
      {
        title: 'Avantages',
        icon: 'thumbs-up',
        items: [
          'Absorbe sans fissurer les dilatations',
          'Économique',
          'Délais de réalisation courts',
          'Poids du produit relativement léger',
          'Caractéristiques coupe-feu',
        ],
      },
      { title: 'Application', icon: 'layers', items: ['Toutes formes de supports'] },
    ],
    // Pas de réponse pré-cochée : la page couvre à la fois le coupe-feu (A) et le thermique / acoustique (B).
  },
  {
    slug: 'aeroblue-lorraine',
    label: 'Aeroblue',
    cardTitle: 'Aeroblue®',
    cardText: 'Étanchéité projetée',
    title: 'Aeroblue : étanchéité projetée',
    metaTitle: 'Aeroblue en Lorraine : étanchéité projetée',
    accent: '#0d93d8',
    cover: {
      src: photo('aeroblue-applicateur'),
      alt: 'Applicateur CPROJECT’ projetant l’enduit Aeroblue sur un mur en briques',
      position: '50% 30%',
    },
    lead: [
      'Particuliers ou professionnels : assurez et améliorez les performances énergétiques de vos bâtiments, c’est ce que vous propose CPROJECT’ avec la réalisation d’étanchéité projetée avec la méthode AEROBLUE®.',
    ],
    blocks: [
      {
        type: 'facts',
        lines: [
          'L’étanchéité à l’air des bâtiments est une exigence réglementaire mais permet surtout une baisse de la consommation énergétique.',
        ],
      },
      {
        type: 'link',
        label: 'En savoir plus sur la législation',
        href: 'https://www.ecologique-solidaire.gouv.fr/exigences-reglementaires-construction-des-batiments',
      },
      {
        type: 'p',
        lines: [
          'Aeroblue® est le 1er revêtement technique projeté pour l’étanchéité à l’air des murs maçonnés.',
          'Il contribue activement à l’amélioration de l’efficacité énergétique du bâtiment en traitant les fuites d’air parasites de la maçonnerie et des points singuliers (menuiseries, maçonneries, plafonds/maçonnerie).',
        ],
      },
      {
        type: 'p',
        lines: [
          'L’entreprise CPROJECT’ est équipée pour assurer l’étanchéité à l’air de vos bâtiments.',
          'Nous réalisons plus de 10 000 m² par an d’Aeroblue®, une solution rapide à mettre en œuvre.',
        ],
      },
      {
        type: 'link',
        label: 'En savoir plus sur la méthode',
        href: 'https://www.placo.fr/Solutions/Innovations-et-produits-phares/Innovations-Placo-R/Revetement-interieur-Aeroblue-R',
      },
    ],
    photos: [
      {
        src: photo('aeroblue-applicateur'),
        alt: 'Applicateur CPROJECT’ projetant l’enduit Aeroblue sur un mur en briques',
      },
      { src: photo('aeroblue-1'), alt: 'Projection d’Aeroblue sur les murs d’une maison en construction' },
      { src: photo('aeroblue-4'), alt: 'Pièce aux murs maçonnés recouverts d’Aeroblue' },
    ],
    certifications: ['club-placo', 'qualibat', 'placo'],
    resumeTitle: 'Aeroblue® : en résumé',
    resume: [
      {
        title: 'Produit',
        icon: 'package',
        items: [
          'Ce revêtement technique intérieur est à base de gypse projeté de couleur bleue.',
          'Il s’applique directement sur l’intégralité des murs maçonnés dits « froids » avant ou après la pose des plafonds en plaques de plâtre.',
        ],
      },
      {
        title: 'Avantages',
        icon: 'thumbs-up',
        items: [
          'Sécurise l’étanchéité à l’air pendant et après le chantier',
          'Solution durable',
          'Compatible avec les systèmes de doublages collés ou sur ossatures',
        ],
      },
      { title: 'Application', icon: 'layers', items: ['Toutes formes de supports maçonnés'] },
    ],
    video: { id: 'gEF2euruBYE', title: 'Aeroblue® en vidéo', poster: photo('aeroblue-5') },
    document: { href: '/aerobluedocpdf.pdf', label: 'Téléchargez la documentation' },
    qcmTravaux: 2,
  },
  {
    slug: 'platre-projete-lorraine',
    label: 'Plâtre projeté',
    cardTitle: 'Plâtre projeté',
    cardText: 'Réalisation d’enduits plâtre',
    title: 'Plâtre traditionnel projeté',
    metaTitle: 'Plâtre traditionnel projeté en Lorraine',
    accent: '#2fa01f',
    cover: {
      src: photo('platre-projete-4'),
      alt: 'Plâtrier appliquant un plâtre projeté sur un mur en briques',
      position: '45% 50%',
    },
    lead: [
      'Pérennité, confort, esthétisme, finitions lisses et parfaites, savoir-faire artisanal… c’est ce que vous propose l’entreprise CPROJECT’ avec la réalisation de travaux de plâtrerie traditionnelle.',
    ],
    blocks: [
      {
        type: 'facts',
        lines: [
          'Le plâtre permet de réaliser tous types d’enduisage intérieur : bâtiment neuf ou rénovation, architecture moderne ou historique.',
          'Il participe à la création d’espaces agréables avec une vraie dimension esthétique.',
        ],
      },
      {
        type: 'p',
        lines: [
          'Le plâtre participe à l’amélioration de l’étanchéité à l’air des bâtiments en traitant des fuites d’air du gros œuvre maçonné.',
        ],
      },
      {
        type: 'list',
        intro: 'De par ses propriétés intrinsèques, il offre également :',
        items: [
          'Un confort sanitaire : grâce à son comportement inerte vis-à-vis des moisissures.',
          'Un confort hygrothermique : il régule l’humidité et permet de créer au sein des bâtiments un climat ambiant confortable au fil des saisons.',
        ],
      },
      {
        type: 'p',
        lines: [
          'L’entreprise CPROJECT’, forte de son expertise, offre une finition inégalable à vos murs, doublages et plafonds intérieurs avec un plâtre projeté monocouche.',
        ],
      },
    ],
    photos: [
      { src: photo('platre-projete-4'), alt: 'Plâtrier appliquant un plâtre projeté sur un mur en briques' },
      { src: photo('platre-projete-3'), alt: 'Deux plâtriers CPROJECT’ préparant le plâtre à projeter' },
      { src: photo('platre-projete-1'), alt: 'Plâtrier lissant un mur enduit au plâtre' },
    ],
    certifications: ['club-placo', 'qualibat', 'placo'],
    resumeTitle: 'Le plâtre projeté : en résumé',
    resume: [
      {
        title: 'Produit',
        icon: 'package',
        items: [
          'Plâtres allégés offrant une mise en œuvre et un temps de séchage rapide (environ 3 semaines avant mise en peinture)',
        ],
      },
      {
        title: 'Avantages',
        icon: 'thumbs-up',
        items: [
          'Grande résistance au choc',
          'Confort sanitaire et hygrométrique',
          'Produit sain et naturel',
          'Matériau respirant et étanche à l’air',
        ],
      },
      { title: 'Application', icon: 'layers', items: ['Brique, agglo ciment, béton'] },
    ],
    qcmTravaux: 2,
  },
  {
    slug: 'protection-feu-lorraine',
    label: 'Protection feu',
    cardTitle: 'Protection coupe-feu',
    cardText: 'Flocage fibreux / Flocage pâteux / Conduit de désenfumage',
    title: 'Protection coupe-feu',
    metaTitle: 'Protection coupe-feu en Lorraine',
    accent: '#da2a1c',
    cover: {
      src: photo('flocage-incendie-3'),
      alt: 'Technicien projetant une protection coupe-feu au plafond',
      position: '70% 60%',
    },
    lead: [
      'Une protection incendie alliant performances et légèreté. C’est ce que vous propose CPROJECT’ avec des solutions adaptées.',
    ],
    blocks: [
      {
        type: 'p',
        lines: [
          'Les professionnels de l’entreprise CPROJECT’ assurent un travail de qualité en rénovation comme en neuf sur différents types d’ouvrages.',
        ],
      },
      {
        type: 'facts',
        lines: [
          'Les établissements recevant du public (ERP) doivent respecter des critères de conception définis par une réglementation spécifique visant à assurer la sécurité des occupants.',
        ],
      },
      {
        type: 'p',
        lines: [
          'L’obligation de protection contre l’incendie est très large dans la mesure où elle s’impose à toutes les personnes (autres que les salariés et le public reçu) ayant un lien avec l’établissement et s’applique non seulement au moment de la construction mais également en cours d’exploitation de l’établissement.',
        ],
      },
      {
        type: 'link',
        label: 'En savoir plus sur la réglementation',
        href: 'https://www.service-public.fr/professionnels-entreprises/vosdroits/F31684',
      },
    ],
    photos: [
      { src: photo('flocage-incendie-3'), alt: 'Technicien projetant une protection coupe-feu au plafond' },
      { src: photo('flocage-incendie-1'), alt: 'Équipe CPROJECT’ sur un chantier de flocage incendie' },
      { src: photo('flocage-incendie-2'), alt: 'Projection d’un flocage coupe-feu en sous-face de plancher' },
    ],
    certifications: ['qualibat'],
    resumeTitle: 'Protection coupe-feu : en résumé',
    resume: [
      { title: 'Produit', icon: 'package', items: ['Plâtre à base de vermiculite'] },
      {
        title: 'Avantages',
        icon: 'thumbs-up',
        items: ['Sain et naturel', 'Rapide à mettre en œuvre', 'Assure une protection durable'],
      },
      { title: 'Application', icon: 'layers', items: ['Structures béton, bois et métalliques'] },
    ],
    qcmTravaux: 0,
  },
  {
    slug: 'isolation-platrerie-lorraine',
    label: 'Isolation plâtrerie',
    cardTitle: 'Travaux de plâtrerie et isolation',
    cardText: 'Tous travaux de plâtrerie, isolation et faux plafonds',
    title: 'Entreprise spécialisée dans les travaux de plâtrerie et isolation en Lorraine',
    metaTitle: 'Travaux de plâtrerie et isolation en Lorraine',
    accent: '#7a1fa2',
    cover: {
      src: photo('platrerie-6'),
      alt: 'Doublage isolant et ossature métallique dans des combles',
      position: '50% 60%',
    },
    lead: [
      'Pour vos travaux neufs ou rénovation en matière de plâtrerie et isolation, CPROJECT’ est votre interlocuteur privilégié.',
    ],
    blocks: [
      {
        type: 'list',
        items: [
          'Travaux de plâtrerie générale',
          'Modification du bâtiment',
          'Faux plafonds',
          'Aménagement de combles',
          'Travaux d’isolation',
        ],
      },
      {
        type: 'facts',
        lines: [
          'Que vous soyez professionnels ou particuliers, notre équipe de professionnels sera en mesure de répondre à vos besoins, attentes et exigences en prenant en compte les contraintes techniques, architecturales et budgétaires !',
        ],
      },
    ],
    photos: [
      { src: photo('platrerie-6'), alt: 'Doublage isolant et ossature métallique dans des combles' },
      { src: photo('platrerie-1'), alt: 'Ossature métallique de faux plafond sous charpente' },
      { src: photo('platrerie-4'), alt: 'Cloisons sur ossature métallique en cours de montage' },
    ],
    certifications: ['club-placo', 'qualibat', 'placo'],
    resumeTitle: 'Plâtrerie et isolation : en résumé',
    resume: [
      { title: 'Produit', icon: 'package', items: ['Utilisation de matériaux naturels prioritairement'] },
      {
        title: 'Avantages',
        icon: 'thumbs-up',
        items: [
          'Des professionnels compétents à votre écoute de l’ébauche de votre projet à sa réalisation',
          'Utilisation de matériaux écologiques et économiques majoritairement',
          'Possibilité d’obtention de crédit d’impôt ou de subvention pour vos travaux d’isolation',
        ],
      },
      { title: 'Applications', icon: 'layers', items: ['Travaux neufs et rénovation'] },
    ],
    qcmTravaux: 2,
  },
  {
    slug: 'isolation-projetee-lorraine',
    label: 'Isolation projetée',
    cardTitle: 'Isolation projetée',
    cardText: 'Soufflage / Insufflation / Flocage',
    title: 'Entreprise spécialisée dans les travaux d’isolation projetée en Lorraine',
    metaTitle: 'Isolation projetée en Lorraine : flocage, insufflation, soufflage',
    accent: '#f27405',
    cover: {
      src: photo('flocage-1'),
      alt: 'Sous-face de plancher isolée par flocage',
      position: '50% 30%',
    },
    lead: [
      'CPROJECT’ dispose des techniques et compétences nécessaires, ainsi que des moyens humains et matériels pour la réalisation de travaux d’isolation projetée.',
      'Isolation par projection, isolation par insufflation ou encore isolation par soufflage, nos techniciens qualifiés vous orientent dans vos choix en tenant compte des contraintes liées au bâti mais aussi en fonction de vos besoins.',
    ],
    blocks: [],
    photos: [],
    certifications: [],
    resumeEyebrow: 'Nos techniques',
    resumeTitle: 'Isolation par flocage, par insufflation ou par soufflage',
    resume: [
      {
        title: 'Isolation par flocage',
        icon: 'layers',
        intro: [
          'Cette technique consiste à projeter une laine minérale sous vos planchers à isoler.',
          'Conforme à la réglementation RT2012, l’isolation par projection offre de nombreux avantages :',
        ],
        items: [
          'L’aspect final brut ou fini au moyen de rouleau et taloche',
          'Absorbe sans fissurer les dilatations',
          'Économique',
          'Délais de réalisation courts',
          'Poids du produit relativement léger',
          'Caractéristique coupe-feu',
          'Toutes formes de supports',
          'Rapidité d’exécution',
        ],
      },
      {
        title: 'Isolation par insufflation',
        icon: 'layers',
        intro: [
          'La technique d’isolation par insufflation consiste à injecter de l’isolant à l’aide d’une buse spéciale dans les murs, planchers ou combles.',
          'Cette méthode offre de nombreux avantages :',
        ],
        items: [
          'Élimination des ponts thermiques',
          'Élimination de la sensation de murs froids',
          'Amélioration du confort général de la maison',
          'Économie significative',
          'Amélioration du DPE de la bâtisse',
        ],
      },
      {
        title: 'Isolation par soufflage',
        icon: 'layers',
        intro: [
          'La technique d’isolation par soufflage est à l’heure actuelle la méthode la moins coûteuse.',
          'Elle consiste à la projection de flocons isolants au moyen d’une machine à souffler : ouate de cellulose, laine minérale, liège en granulé…',
          'Cette technique est avantageuse :',
        ],
        items: ['Économe et rapide d’exécution', 'Haute résistance thermique', 'Isolation des espaces exigus'],
        image: { src: photo('isolation-soufflage'), alt: 'Soufflage d’isolant en vrac dans des combles' },
      },
    ],
    qcmTravaux: 1,
  },
];

export const serviceHref = (service: Pick<Service, 'slug'>) => lien(`/${service.slug}/`);
