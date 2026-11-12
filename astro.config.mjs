// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Adresse du site et sous-dossier éventuel.
// Par défaut : le domaine définitif, à la racine. Pour publier ailleurs (aperçu GitHub Pages à
// l'adresse https://compte.github.io/CPROJECT/, par exemple), on fournit SITE_URL et BASE_PATH au
// moment du build : c'est ce que fait `npm run apercu`.
const site = process.env.SITE_URL || 'https://www.flocage-lorraine.com';
const base = process.env.BASE_PATH || '/';

// https://astro.build/config
export default defineConfig({
  // Site vitrine 100 % statique : chaque page est générée en HTML au build.
  output: 'static',
  // Utilisé pour le sitemap, les URL canoniques et les données structurées.
  site,
  // Sous-dossier dans lequel le site est servi. Les liens internes en tiennent compte grâce à
  // la fonction `lien()` de src/data/liens.ts.
  base,
  // Une page = un dossier avec index.html (ex. /flocage-lorraine/) : fonctionne chez tout hébergeur statique.
  trailingSlash: 'always',
  // On garde les espaces et retours à la ligne tels qu'écrits dans les pages : la compression d'Astro
  // supprime l'espace entre un texte et une balise placée à la ligne suivante (mots collés à l'affichage).
  compressHTML: false,
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
