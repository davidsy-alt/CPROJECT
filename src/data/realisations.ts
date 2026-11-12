import type { ImageMetadata } from 'astro';
import { photo } from './photos';

/**
 * Albums de la page « Nos réalisations » (mêmes albums et mêmes photos que le site d'origine).
 * Pour ajouter une photo : la déposer dans src/assets/photos puis ajouter son nom (sans .jpg) à l'album.
 */
export interface Album {
  id: string;
  title: string;
  accent: string;
  photos: ImageMetadata[];
}

const album = (id: string, title: string, accent: string, names: string[]): Album => ({
  id,
  title,
  accent,
  photos: names.map(photo),
});

export const albums: Album[] = [
  album('aeroblue', 'Aeroblue', '#0d93d8', ['aeroblue-4', 'aeroblue-1', 'aeroblue-2', 'aeroblue-3', 'aeroblue-5']),
  album('flocage', 'Flocage', '#efbb00', ['flocage-4', 'flocage-1', 'flocage-2', 'flocage-3', 'flocage-5']),
  album('flocage-incendie', 'Flocage incendie', '#da2a1c', [
    'flocage-incendie-1',
    'flocage-incendie-2',
    'flocage-incendie-3',
  ]),
  album('platre-projete', 'Plâtre projeté', '#2fa01f', [
    'platre-projete-4',
    'platre-projete-1',
    'platre-projete-2',
    'platre-projete-3',
    'platre-projete-5',
    'platre-projete-6',
    'platre-projete-7',
    'platre-projete-8',
    'platre-projete-9',
  ]),
  album('platrerie', 'Plâtrerie', '#7a1fa2', [
    'platrerie-1',
    'platrerie-2',
    'platrerie-3',
    'platrerie-4',
    'platrerie-5',
    'platrerie-6',
    'platrerie-7',
    'platrerie-8',
    'platrerie-9',
  ]),
];
