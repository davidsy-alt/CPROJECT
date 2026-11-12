/**
 * Publie un aperçu du site sur GitHub Pages.
 *
 *   npm run apercu                 construit le site et l'envoie sur la branche « gh-pages » du dépôt GitHub
 *   npm run apercu -- --sans-envoi construit seulement (résultat dans dist-apercu/), sans rien envoyer
 *
 * L'aperçu est servi à l'adresse https://<compte>.github.io/<dépôt>/, donc dans un sous-dossier :
 * le site est construit avec ce sous-dossier (BASE_PATH), et toutes les pages portent la consigne
 * « noindex » (PUBLIC_SITE_PREVIEW) pour ne pas être référencées à la place du vrai site.
 *
 * Réglage à faire une seule fois sur GitHub : Settings → Pages → Source « Deploy from a branch »,
 * branche « gh-pages », dossier « / (root) ».
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

const sansEnvoi = process.argv.includes('--sans-envoi');
const racine = path.resolve(import.meta.dirname, '..');
const dossierBuild = path.join(racine, 'dist-apercu');

/** Lance git et renvoie sa sortie. Les fins de ligne ne sont pas converties (fichiers générés). */
const git = (args, cwd = racine) =>
  execFileSync('git', ['-c', 'core.autocrlf=false', ...args], { cwd, encoding: 'utf8' }).trim();

// 1. Adresse de l'aperçu, déduite de l'adresse du dépôt GitHub (« origin »).
const depot = git(['remote', 'get-url', 'origin']);
const morceaux = depot.match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?$/);
if (!morceaux) {
  console.error(`Le dépôt « origin » (${depot}) n'est pas un dépôt GitHub : impossible d'en déduire l'adresse de l'aperçu.`);
  process.exit(1);
}
const [, compte, nomDepot] = morceaux;
const adresseSite = `https://${compte.toLowerCase()}.github.io`;
const sousDossier = `/${nomDepot}`;

// 2. Construction du site pour cette adresse.
const paquetAstro = path.join(racine, 'node_modules', 'astro', 'package.json');
const astro = path.join(path.dirname(paquetAstro), JSON.parse(fs.readFileSync(paquetAstro, 'utf8')).bin.astro);
fs.rmSync(dossierBuild, { recursive: true, force: true });
execFileSync(process.execPath, [astro, 'build', '--outDir', dossierBuild], {
  cwd: racine,
  stdio: 'inherit',
  env: { ...process.env, SITE_URL: adresseSite, BASE_PATH: sousDossier, PUBLIC_SITE_PREVIEW: 'true' },
});
// Sans ce fichier, GitHub Pages ignore les dossiers commençant par « _ » (dont _astro, qui contient images et styles).
fs.writeFileSync(path.join(dossierBuild, '.nojekyll'), '');

if (sansEnvoi) {
  console.log(`\nSite construit dans dist-apercu/ pour ${adresseSite}${sousDossier}/ (rien n'a été envoyé).`);
  process.exit(0);
}

// 3. Envoi sur la branche gh-pages : on part de son contenu actuel et on le remplace par le nouveau build.
const version = git(['rev-parse', '--short', 'HEAD']);
const auteur = ['-c', `user.name=${git(['config', 'user.name'])}`, '-c', `user.email=${git(['config', 'user.email'])}`];
const travail = fs.mkdtempSync(path.join(os.tmpdir(), 'apercu-'));
try {
  const brancheExiste = git(['ls-remote', '--heads', depot, 'gh-pages']) !== '';
  if (brancheExiste) {
    git(['clone', '--quiet', '--depth', '1', '--branch', 'gh-pages', depot, travail]);
  } else {
    git(['init', '--quiet', '--initial-branch', 'gh-pages'], travail);
  }
  for (const element of fs.readdirSync(travail)) {
    if (element !== '.git') fs.rmSync(path.join(travail, element), { recursive: true, force: true });
  }
  fs.cpSync(dossierBuild, travail, { recursive: true });

  git(['add', '--all'], travail);
  if (git(['status', '--porcelain'], travail) === '') {
    console.log(`\nL'aperçu en ligne est déjà à jour : ${adresseSite}${sousDossier}/`);
  } else {
    git([...auteur, 'commit', '--quiet', '-m', `Aperçu du site (source : ${version})`], travail);
    git(['push', '--quiet', depot, 'HEAD:gh-pages'], travail);
    console.log(`\nAperçu envoyé : ${adresseSite}${sousDossier}/ (mise à jour visible après une à deux minutes).`);
  }
} finally {
  fs.rmSync(travail, { recursive: true, force: true });
}
