/**
 * Contenus externes chargés à la demande (carte Google Maps, vidéo YouTube).
 * Un lien `[data-embed="adresse"]` est remplacé par le lecteur intégré au clic ; sans JavaScript,
 * il reste un lien normal vers le site externe.
 */
document.querySelectorAll<HTMLAnchorElement>('a[data-embed]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const src = link.dataset.embed;
    if (!src) return;
    event.preventDefault();

    const frame = document.createElement('iframe');
    frame.src = src;
    frame.title = link.dataset.embedTitle ?? '';
    frame.className = 'absolute inset-0 h-full w-full border-0';
    frame.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    link.replaceWith(frame);
    frame.focus();
  });
});
