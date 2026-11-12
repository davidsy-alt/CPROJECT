/**
 * Liens internes du site.
 *
 * Le site peut être publié à la racine d'un domaine (https://www.flocage-lorraine.com/) ou dans un
 * sous-dossier (aperçu GitHub Pages : https://compte.github.io/CPROJECT/). Pour que les liens
 * fonctionnent dans les deux cas, un lien vers une page ou un fichier du site s'écrit toujours
 * `lien('/contact/')`, jamais `"/contact/"` en dur : la fonction ajoute le sous-dossier quand il y en a un.
 *
 * Le sous-dossier vient de l'option `base` d'Astro (voir astro.config.mjs). Les images et fichiers
 * générés par Astro (dossier _astro) sont préfixés automatiquement, sans passer par cette fonction.
 */
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const lien = (chemin: string) => `${base}${chemin}`;
