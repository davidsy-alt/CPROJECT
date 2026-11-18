# Site CPROJECT’ – nouvelle version

Prototype de refonte du site [flocage-lorraine.com](https://www.flocage-lorraine.com/) : même contenu (textes, photos, coordonnées, pages), nouvelle présentation, un gros bouton « Contact » qui ouvre un formulaire sous forme de QCM, et le numéro de téléphone en bas de page.

Parti pris, issu de la réunion du 12/11/2026 : le formulaire est l’accès principal (le visiteur coche son besoin, choisit le créneau auquel il veut être appelé, et le rendez-vous est pris) ; le téléphone reste disponible, mais seulement dans le bloc « Nos coordonnées » et le pied de page.

Site 100 % statique construit avec [Astro](https://astro.build) et [Tailwind CSS](https://tailwindcss.com).

## Commandes

Prérequis : Node.js 22 ou plus (testé avec Node 24).

| Commande          | Action                                                |
| :---------------- | :---------------------------------------------------- |
| `npm install`     | Installe les dépendances                              |
| `npm run dev`     | Site en local sur `localhost:4321`, rechargé à chaud  |
| `npm run build`   | Génère le site statique dans `./dist/`                |
| `npm run preview` | Affiche en local le site généré                       |
| `npm run check`   | Vérifie le typage des fichiers `.astro` et `.ts`      |
| `npm run apercu`  | Publie l’aperçu en ligne sur GitHub Pages (voir plus bas) |

## Où modifier quoi

| Je veux changer…                                  | Fichier                                                    |
| :------------------------------------------------ | :--------------------------------------------------------- |
| Les questions et réponses du formulaire (QCM)     | `src/data/qcm.ts`                                          |
| Les créneaux d’appel (horaires, jours, durée)     | `src/data/creneaux.ts`                                     |
| Téléphone, e-mail, adresse, départements          | `src/data/site.ts`                                         |
| Le texte et les photos d’une prestation           | `src/data/services.ts`                                     |
| Les albums de la page « Nos réalisations »        | `src/data/realisations.ts` (photos dans `src/assets/photos`) |
| Les couleurs et les polices                       | `src/styles/global.css` (bloc `@theme`)                    |
| L’en-tête, le pied de page, la fenêtre de contact | `src/components/`                                          |
| Une page                                          | `src/pages/` (une page = un fichier)                       |

Les six pages prestations partagent le même modèle : `src/pages/[slug].astro`.

## Formulaire de contact (QCM)

Le formulaire pose les questions une par une (réponses A, B, C), puis demande les coordonnées :

| Question                     | A                 | B                               | C                      |
| :--------------------------- | :---------------- | :------------------------------ | :--------------------- |
| Q1 – Quel est votre besoin ? | Flocage coupe-feu | Flocage thermique ou acoustique | Plâtrerie ou Aeroblue® |
| Q2 – Quel est votre délai ?  | Urgent            | Dans le mois                    | Plus tard              |

La troisième question — « Quand souhaitez-vous être appelé ? » — n’a pas de réponses fixes : ce sont les créneaux encore libres (voir [Créneaux d’appel](#créneaux-dappel)).

Il s’ouvre dans une fenêtre depuis tous les boutons « Contact » / « Demander un devis gratuit » du site, et il est aussi affiché directement sur la page `/contact/`. Sur la page d’accueil, la première question est posée dans un bloc central : cliquer sur une réponse ouvre le formulaire à la question suivante. Depuis une page prestation, la réponse à la question « travaux » est pré-cochée (réglage `qcmTravaux` dans `src/data/services.ts`).

Pour changer le questionnaire, modifier la liste dans `src/data/qcm.ts` : on peut changer les textes, ajouter ou retirer des questions et des réponses ; les lettres et l’affichage s’adaptent.

### Créneaux d’appel

La dernière question du formulaire n’est pas un QCM : le visiteur choisit le créneau auquel il veut être appelé, parmi **six créneaux de 15 minutes par jour ouvré** — 11 h 30, 11 h 45, 12 h, 17 h 30, 17 h 45, 18 h — du lundi au vendredi, jours fériés exclus.

Les dix prochains jours ouvrés sont proposés ; les créneaux déjà pris dans l’agenda sont **grisés et non cliquables**.

Tout se règle dans `src/data/creneaux.ts` (`creneauxReglages`) : horaires, durée de l’appel, jours ouvrés, nombre de jours proposés, délai minimum avant un appel (1 h par défaut). Les calculs sont faits à l’heure de Paris quel que soit le fuseau du visiteur, changements d’heure compris, et les jours fériés français sont calculés automatiquement.

Sans JavaScript, le formulaire propose un champ date et les six horaires à cocher, transmis dans l’e-mail pré-rempli.

### Envoi des demandes et prise de rendez-vous

Le formulaire s’appuie sur deux adresses, renseignées dans `.env` (voir `.env.example`) :

| Variable                     | Rôle                                                                 |
| :--------------------------- | :------------------------------------------------------------------- |
| `PUBLIC_CRENEAUX_URL`        | GET : indique les créneaux déjà pris, pour les griser                 |
| `PUBLIC_CONTACT_WEBHOOK_URL` | POST : reçoit la demande, crée le rendez-vous et envoie les e-mails   |

Les deux sont facultatives :

- **Aucune des deux (état actuel)** : tous les créneaux sont proposés et, à la validation, la messagerie du visiteur s’ouvre avec un e-mail déjà rédigé (réponses, créneau choisi, coordonnées) adressé à l’adresse de `src/data/site.ts`.
- **`PUBLIC_CRENEAUX_URL` seule** : les créneaux pris sont grisés, l’envoi reste un e-mail pré-rempli.
- **Les deux** : la demande part directement, le rendez-vous est créé dans l’agenda et les e-mails partent automatiquement.

**Disponibilités** — le site appelle `GET <PUBLIC_CRENEAUX_URL>?debut=<ISO>&fin=<ISO>` et attend :

```json
{ "ok": true, "occupes": [{ "debut": "2026-11-19T10:30:00.000Z", "fin": "2026-11-19T11:00:00.000Z" }] }
```

Tout créneau qui chevauche une période `occupes` est grisé — un rendez-vous d’une heure en grise quatre, un événement « journée entière » grise la journée. Si le service ne répond pas, le formulaire propose tous les créneaux et le prévient discrètement (« Disponibilités non vérifiées »).

**Demande** — le site envoie un POST JSON avec, en plus des champs habituels, le créneau retenu :

```json
{
  "source": "Formulaire de contact du site",
  "travaux": "A - Flocage coupe-feu",
  "delai": "A - Urgent",
  "rappel": "Jeudi 19 novembre à 11 h 30",
  "reponses": [{ "id": "travaux", "question": "Quel est votre besoin ?", "lettre": "A", "reponse": "Flocage coupe-feu" }],
  "creneau": {
    "cle": "20261119-1130",
    "debut": "2026-11-19T10:30:00.000Z",
    "fin": "2026-11-19T10:45:00.000Z",
    "debut_local": "2026-11-19T11:30:00+01:00",
    "libelle": "Jeudi 19 novembre à 11 h 30",
    "duree_minutes": 15,
    "fuseau": "Europe/Paris"
  },
  "nom": "Martin",
  "prenom": "",
  "telephone": "0612345678",
  "email": "martin@example.com",
  "message": "",
  "consentement": "oui",
  "page": "https://www.flocage-lorraine.com/",
  "date": "2026-11-18T15:04:35.396Z"
}
```

Réponses attendues :

| Réponse                                        | Ce que fait le site                                                        |
| :--------------------------------------------- | :-------------------------------------------------------------------------- |
| `200 { "ok": true }`                            | Écran de confirmation, avec le créneau rappelé                              |
| `409 { "ok": false, "raison": "creneau_pris" }` | Grise le créneau, recharge les disponibilités et en redemande un autre      |
| Toute autre erreur                              | « L’envoi a échoué », l’adresse e-mail est proposée                         |

Le créneau est revérifié avant l’envoi (créneau passé ou pris entre-temps) : le service reste malgré tout le seul juge, deux visiteurs pouvant choisir le même créneau à quelques secondes d’intervalle.

Un champ invisible sert de piège à robots (à la place du reCAPTCHA du site d’origine).

### Le service derrière : n8n

Le site est 100 % statique : il ne peut ni écrire dans l’agenda Google ni envoyer d’e-mail lui-même. C’est n8n (déjà utilisé pour d’autres automatisations) qui s’en charge, avec **un seul workflow à deux webhooks** :

```
GET  /webhook/cproject-creneaux      → Agenda Google (événements de la période) → créneaux occupés → réponse JSON
POST /webhook/cproject-rendez-vous   → vérification → agenda relu → rendez-vous créé
                                      → e-mail à CPROJECT’ → accusé de réception au client → réponse JSON
```

Le workflow est dans `n8n/rendez-vous.workflow.js` (dossier local, non versionné : le dépôt est public et les adresses de webhook ne doivent pas y figurer). À l’installation :

1. vérifier le node **Réglages** (adresse e-mail qui reçoit les demandes, téléphone, adresse) ;
2. choisir l’agenda dans les trois nodes Google Agenda (« Agenda principal » par défaut) ;
3. relever les deux URL de production et les mettre dans `.env` ;
4. activer le workflow, puis reconstruire le site (`npm run build`) — les variables `PUBLIC_*` sont intégrées au build.

Bon à savoir :

- **Bloquer un créneau sans rendez-vous** : il suffit de créer un événement dans l’agenda (congé, chantier, réunion). Les créneaux concernés se grisent sur le site. Un événement marqué « Disponible » ne bloque rien.
- **Vie privée** : le webhook des disponibilités ne renvoie que les plages 11 h–12 h 30 et 17 h–18 h 30, sans titre ni participant. Le reste de l’agenda ne sort pas.
- **CORS** : les deux webhooks n’acceptent que les origines du site (option « Allowed Origins » des nodes Webhook). À compléter si le site change d’adresse.
- **Doublons** : la référence du créneau est inscrite dans la description de l’événement ; une demande renvoyée deux fois ne crée pas deux rendez-vous.

## Liens internes : toujours `lien()`

Le site peut être servi à la racine d’un domaine (`https://www.flocage-lorraine.com/`) ou dans un sous-dossier (aperçu GitHub Pages : `https://davidsy-alt.github.io/CPROJECT/`). Pour que les liens fonctionnent dans les deux cas, un lien vers une page ou un fichier du site ne s’écrit jamais en dur :

```astro
<a href={lien('/contact/')}>Contact</a>      <!-- oui -->
<a href="/contact/">Contact</a>              <!-- non : cassé dans un sous-dossier -->
```

`lien()` est défini dans `src/data/liens.ts` et ajoute le sous-dossier quand il y en a un (option `base` d’Astro, réglée dans `astro.config.mjs` par la variable `BASE_PATH`). Les images et fichiers générés par Astro sont préfixés automatiquement.

## Aperçu en ligne (GitHub Pages)

`npm run apercu` construit le site pour l’adresse `https://davidsy-alt.github.io/CPROJECT/` et l’envoie sur la branche `gh-pages` du dépôt, que GitHub Pages publie (réglage du dépôt : Settings → Pages → « Deploy from a branch », branche `gh-pages`, dossier `/`).

- L’aperçu ne se met pas à jour tout seul : relancer `npm run apercu` après un changement (compter une à deux minutes avant de le voir en ligne).
- Toutes les pages de l’aperçu portent la consigne `noindex`, pour que les moteurs de recherche ne le référencent pas à la place du vrai site.
- `npm run apercu -- --sans-envoi` construit seulement, dans `dist-apercu/`, sans rien envoyer.

## Mise en ligne

Le dossier `dist/` est un site statique classique, déployable chez tout hébergeur. Les adresses des pages sont celles du site d’origine sans le `.php` (`/flocage-lorraine/`, `/contact/`…) ; `public/_redirects` redirige les anciennes adresses (format Netlify / Cloudflare Pages, à transposer en `.htaccess` chez un hébergeur Apache).

## Écarts avec le site d’origine

Le contenu est repris tel quel, à ces exceptions près.

**Corrigé**

- Titre de la page plâtre projeté : « Aeroblue : plâtre traditionnel projeté » → « Plâtre traditionnel projeté ».
- Carte d’accueil « Travaux de plâtrerie et isolation » : le sous-titre « Étanchéité projetée » (copie de la carte Aeroblue) est remplacé par « Tous travaux de plâtrerie, isolation et faux plafonds », formulation déjà présente dans le code du site d’origine.
- Coquilles : « c’est que vous propose » → « c’est ce que vous propose », « toute les formes » → « toutes les formes », « les fuite d’air » → « les fuites d’air », « dans la mesure ou » → « où », « injecter dans de l’isolant » → « injecter de l’isolant », « liées au bâtis » → « au bâti », « couteuse » → « coûteuse », « à travers sur tout le grand est » → « sur tout le Grand Est », accents sur les majuscules, « m2 » → « m² ».

**Présenté autrement**

- Les photos rondes des pages prestations sont remplacées par les mêmes photos en version rectangulaire (issues des albums de réalisations). La photo de l’applicateur Aeroblue vient du bandeau d’accueil d’origine, recadré.
- Le filigrane d’appareil photo en bas de huit photos est retiré par un léger recadrage.
- Les quatre bandeaux défilants de l’accueil (texte incrusté dans l’image) sont remplacés par une accroche avec photos de chantier, le flocage en premier.
- Le menu regroupe les six prestations sous « Prestations ». La page « Isolation projetée » a désormais sa carte sur l’accueil.
- Le téléphone, l’adresse et l’e-mail ne figurent plus en haut des pages (ni en tête de la page contact) : ils sont regroupés en bas de chaque page, dans le bloc « Nos coordonnées » et le pied de page.

**Retiré**

- Google Analytics (identifiant d’ancienne génération, qui ne collecte plus rien), le script Facebook et le reCAPTCHA. Le site ne dépose plus aucun cookie de lui-même, donc plus de bandeau cookies ; la carte Google Maps et la vidéo YouTube ne se chargent qu’au clic.

## À valider avant mise en ligne

- **Questions du QCM** : le besoin (Q1) vient de ce qui a été convenu ; la question sur le délai (Q2) et le libellé exact des réponses sont des propositions, à ajuster dans `src/data/qcm.ts`.
- **Créneaux d’appel** : six créneaux de 15 minutes (11 h 30, 11 h 45, 12 h, 17 h 30, 17 h 45, 18 h), du lundi au vendredi. Durée, horaires et délai minimum à confirmer dans `src/data/creneaux.ts`.
- **Prise de rendez-vous** : installer le workflow n8n, renseigner `PUBLIC_CRENEAUX_URL` et `PUBLIC_CONTACT_WEBHOOK_URL` (voir plus haut) et faire un essai de bout en bout.
- **Contenu à ajouter plus tard** : références clients, nouvelles photos de chantier, dépôt d’un plan dans le formulaire.
- **Ancienneté** : le site d’origine indique à la fois « depuis plus de 15 ans » (texte d’accueil) et « 20 ans d’expérience » (arguments). Les deux mentions sont reprises telles quelles ; à harmoniser.
- **Carte du Grand Est** (`src/assets/carte-grand-est.png`) : l’image d’origine contient la coquille « Haur-Rhin ».
- **Infos légales** : l’hébergeur, le concepteur et le paragraphe sur les cookies sont ceux du site actuel ; à mettre à jour selon l’hébergement retenu.
