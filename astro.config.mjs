// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Site vitrine 100 % statique : chaque page est générée en HTML au build.
  output: 'static',
  // Domaine du site : utilisé pour le sitemap, les URL canoniques et les données structurées.
  site: 'https://www.flocage-lorraine.com',
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
