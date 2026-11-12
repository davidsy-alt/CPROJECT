import type { ImageMetadata } from 'astro';

import qualibat from '../assets/partenaires/qualibat.png';
import clubPlaco from '../assets/partenaires/club-placo.png';
import placo from '../assets/partenaires/placo.png';
import artisanat from '../assets/partenaires/artisanat.png';
import ruaud from '../assets/partenaires/ruaud-industries.jpg';
import daussan from '../assets/partenaires/daussan.jpg';

/** Toutes les photos de chantier (src/assets/photos), accessibles par leur nom de fichier sans extension. */
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.jpg', { eager: true });

export function photo(name: string): ImageMetadata {
  const entry = files[`../assets/photos/${name}.jpg`];
  if (!entry) throw new Error(`Photo introuvable : src/assets/photos/${name}.jpg`);
  return entry.default;
}

/** Logos des labels et partenaires. */
export const partenaires = {
  qualibat: { name: 'RGE Qualibat', logo: qualibat },
  'club-placo': { name: 'Le Club entreprises Placo', logo: clubPlaco },
  placo: { name: 'Placo', logo: placo },
  artisanat: { name: 'Artisan – L’Artisanat, première entreprise de France', logo: artisanat },
  ruaud: { name: 'Ruaud Industries', logo: ruaud },
  daussan: { name: 'Daussan Group', logo: daussan },
} satisfies Record<string, { name: string; logo: ImageMetadata }>;

export type PartenaireId = keyof typeof partenaires;
