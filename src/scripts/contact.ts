/**
 * Formulaire de contact QCM et fenêtre de contact.
 *
 * - Chaque formulaire `[data-qcm]` devient un questionnaire pas à pas (une question par écran).
 * - Tout élément `[data-open-contact]` ouvre la fenêtre de contact (`#contact-dialog`) quand elle
 *   existe sur la page ; sinon le lien suit simplement son adresse (page contact).
 * - Envoi : POST JSON vers l'adresse `data-webhook` si elle est renseignée, sinon ouverture d'un
 *   e-mail pré-rempli vers `data-email`.
 */

interface Answer {
  id: string;
  question: string;
  lettre: string;
  reponse: string;
}

/** Réponse transmise au formulaire par un bouton extérieur (attributs data-preset-*). */
interface PresetAnswer {
  question: string;
  option: number;
  advance: boolean;
}

function initQcm(form: HTMLFormElement) {
  const steps = Array.from(form.querySelectorAll<HTMLElement>('[data-qcm-step]'));
  const prev = form.querySelector<HTMLButtonElement>('[data-qcm-prev]');
  const next = form.querySelector<HTMLButtonElement>('[data-qcm-next]');
  const submit = form.querySelector<HTMLButtonElement>('[data-qcm-submit]');
  const status = form.querySelector<HTMLElement>('[data-qcm-status]');
  if (!steps.length || !prev || !next || !submit || !status) return;

  const counter = form.querySelector<HTMLElement>('[data-qcm-counter]');
  const bars = Array.from(form.querySelectorAll<HTMLElement>('[data-qcm-bar]'));
  const recap = form.querySelector<HTMLElement>('[data-qcm-recap]');
  const mailLink = form.querySelector<HTMLAnchorElement>('[data-qcm-mailto]');
  const questionSteps = steps.filter((step) => step.hasAttribute('data-qcm-question'));
  const lastIndex = steps.length - 1;

  let current = 0;
  let timer: number | undefined;

  // Le navigateur ne doit pas bloquer l'envoi à cause d'une question masquée : on valide nous-mêmes.
  form.noValidate = true;
  form.dataset.enhanced = 'true';

  const checked = (step: HTMLElement) => step.querySelector<HTMLInputElement>('input[type="radio"]:checked');

  const answers = (): Answer[] =>
    questionSteps.flatMap((step) => {
      const input = checked(step);
      if (!input) return [];
      return [
        {
          id: input.name,
          question: step.dataset.qcmTitle ?? '',
          lettre: input.dataset.letter ?? '',
          reponse: input.dataset.label ?? input.value,
        },
      ];
    });

  const say = (message: string) => {
    status.textContent = message;
  };

  /** Rappel des réponses sur le dernier écran : une pastille par question, cliquable pour modifier. */
  const renderRecap = () => {
    if (!recap) return;
    const items = answers().map((answer) => {
      const item = document.createElement('li');
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'qcm-chip';
      chip.setAttribute('aria-label', `Modifier la réponse à « ${answer.question} » : ${answer.reponse}`);

      const letter = document.createElement('span');
      letter.className = 'qcm-chip-letter';
      letter.textContent = answer.lettre;
      const label = document.createElement('span');
      label.textContent = answer.reponse;
      const edit = document.createElement('span');
      edit.className = 'qcm-chip-edit';
      edit.textContent = 'Modifier';

      chip.append(letter, label, edit);
      chip.addEventListener('click', () => {
        const index = steps.findIndex((step) => step.dataset.qcmQuestion === answer.id);
        if (index >= 0) show(index);
      });
      item.append(chip);
      return item;
    });
    recap.replaceChildren(...items);
  };

  const show = (index: number, focus = true) => {
    window.clearTimeout(timer);
    const target = Math.max(0, Math.min(index, lastIndex));
    form.dataset.dir = target < current ? 'back' : 'forward';
    current = target;

    steps.forEach((step, i) => step.toggleAttribute('data-active', i === current));
    const isLast = current === lastIndex;
    prev.hidden = current === 0;
    next.hidden = isLast;
    submit.hidden = !isLast;
    next.disabled = !isLast && !checked(steps[current]);

    bars.forEach((bar, i) => {
      bar.dataset.state = i < current ? 'done' : i === current ? 'current' : 'todo';
    });
    if (counter) {
      counter.textContent = isLast ? 'Dernière étape' : `Question ${current + 1} sur ${questionSteps.length}`;
    }
    if (isLast) renderRecap();
    say('');

    if (focus) {
      steps[current].querySelector<HTMLElement>('[data-qcm-heading]')?.focus({ preventScroll: true });
    }
  };

  const finish = (mode: 'webhook' | 'mail') => {
    form.dataset.sent = mode;
    form
      .querySelector<HTMLElement>(`[data-qcm-success="${mode}"] [data-qcm-success-title]`)
      ?.focus({ preventScroll: true });
  };

  form.addEventListener('change', () => {
    if (current !== lastIndex) next.disabled = !checked(steps[current]);
  });

  // Réponse choisie en dehors du formulaire (bloc de la page d'accueil, bouton d'une page prestation).
  // `advance` : la réponse vient d'être cliquée, on passe directement à la question suivante ;
  // sinon c'est une simple pré-sélection, qui ne remplace pas un choix déjà fait.
  form.addEventListener('qcm:answer', (event) => {
    const { question, option, advance } = (event as CustomEvent<PresetAnswer>).detail;
    const step = questionSteps.find((item) => item.dataset.qcmQuestion === question);
    const input = step?.querySelectorAll<HTMLInputElement>('input[type="radio"]')[option];
    if (!step || !input) return;

    if (advance) {
      delete form.dataset.sent;
      input.checked = true;
      show(steps.indexOf(step) + 1);
    } else if (!checked(step)) {
      input.checked = true;
      if (current !== lastIndex) next.disabled = !checked(steps[current]);
    }
  });

  // Clic (souris ou doigt) sur une réponse : on passe à la suite après un court instant.
  // Au clavier, la sélection ne fait pas avancer : on valide avec « Suivant » ou Entrée.
  form.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element) || target instanceof HTMLInputElement) return;
    const option = target.closest('[data-qcm-option]');
    if (!option || !steps[current].contains(option)) return;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => show(current + 1), 300);
  });

  next.addEventListener('click', () => {
    if (checked(steps[current])) show(current + 1);
  });
  prev.addEventListener('click', () => show(current - 1));

  form.querySelectorAll<HTMLButtonElement>('[data-qcm-restart]').forEach((button) => {
    button.addEventListener('click', () => {
      const wasMail = form.dataset.sent === 'mail';
      delete form.dataset.sent;
      // Après un e-mail pré-rempli on revient aux coordonnées (rien n'a été effacé) ; sinon on repart de zéro.
      show(wasMail ? lastIndex : 0);
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Entrée pendant le questionnaire = « Suivant ».
    if (current !== lastIndex) {
      if (checked(steps[current])) show(current + 1);
      return;
    }

    const missing = questionSteps.find((step) => !checked(step));
    if (missing) {
      show(steps.indexOf(missing));
      say('Merci de choisir une réponse pour continuer.');
      return;
    }

    const fields = Array.from(
      steps[lastIndex].querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea'),
    );
    const invalid = fields.find((field) => !field.checkValidity());
    if (invalid) {
      invalid.reportValidity();
      return;
    }

    const data = new FormData(form);
    const text = (name: string) => String(data.get(name) ?? '').trim();

    // Robot détecté (champ invisible rempli) : on fait comme si tout s'était bien passé.
    if (text('site_web')) {
      form.reset();
      finish('webhook');
      return;
    }

    const reponses = answers();
    const contact = {
      nom: text('nom'),
      prenom: text('prenom'),
      telephone: text('telephone'),
      email: text('email'),
      message: text('message'),
    };

    const webhook = form.dataset.webhook ?? '';

    if (!webhook) {
      // Aucun service d'envoi branché : e-mail pré-rempli dans la messagerie du visiteur.
      const lines = [
        'Bonjour,',
        '',
        'Je souhaite être recontacté(e) au sujet de mon projet.',
        '',
        ...reponses.map((a) => `${a.question} ${a.lettre} - ${a.reponse}`),
        '',
        `Nom : ${contact.nom}`,
        `Prénom : ${contact.prenom}`,
        `Téléphone : ${contact.telephone}`,
        `Email : ${contact.email}`,
        '',
        'Commentaires :',
        contact.message || '-',
      ];
      const href =
        `mailto:${form.dataset.email ?? ''}` +
        `?subject=${encodeURIComponent('Demande de devis depuis le site internet')}` +
        `&body=${encodeURIComponent(lines.join('\r\n'))}`;
      finish('mail');
      if (mailLink) {
        // Le même lien reste affiché sur l'écran de confirmation (« Ouvrir mon e-mail »).
        mailLink.href = href;
        mailLink.click();
      } else {
        window.location.href = href;
      }
      return;
    }

    submit.disabled = true;
    say('Envoi en cours…');

    try {
      const response = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'Formulaire de contact du site',
          // Une ligne par question, ex. « profil: "A - Un particulier" », puis le détail complet.
          ...Object.fromEntries(reponses.map((a) => [a.id, `${a.lettre} - ${a.reponse}`])),
          reponses,
          ...contact,
          consentement: 'oui',
          page: window.location.href,
          date: new Date().toISOString(),
        }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      form.reset();
      finish('webhook');
    } catch {
      say(`L’envoi a échoué. Merci de réessayer ou de nous écrire à ${form.dataset.email ?? ''}.`);
    } finally {
      submit.disabled = false;
    }
  });

  show(0, false);
}

document.querySelectorAll<HTMLFormElement>('form[data-qcm]').forEach(initQcm);

// ---------- Fenêtre de contact ----------
const dialog = document.querySelector<HTMLDialogElement>('#contact-dialog');

if (dialog && typeof dialog.showModal === 'function') {
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const trigger = target.closest<HTMLElement>('[data-open-contact]');
    if (!trigger) return;
    // Ctrl/Cmd/Maj + clic : on laisse le navigateur ouvrir la page contact dans un nouvel onglet.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();

    if (!dialog.open) dialog.showModal();

    // Le bouton peut porter une réponse : data-preset-question="travaux" data-preset-option="0"
    // (pré-sélection), plus data-preset-advance quand le visiteur vient de cliquer cette réponse.
    const { presetQuestion, presetOption } = trigger.dataset;
    if (presetQuestion !== undefined && presetOption !== undefined) {
      const detail: PresetAnswer = {
        question: presetQuestion,
        option: Number(presetOption),
        advance: trigger.hasAttribute('data-preset-advance'),
      };
      dialog.querySelector('form[data-qcm]')?.dispatchEvent(new CustomEvent('qcm:answer', { detail }));
    }
  });

  dialog.querySelectorAll<HTMLElement>('[data-close-contact]').forEach((button) => {
    button.addEventListener('click', () => dialog.close());
  });

  // Clic sur le fond assombri (en dehors de la fenêtre) : on ferme. On vérifie que le clic a aussi
  // commencé sur le fond, pour ne pas fermer quand on sélectionne du texte en débordant de la fenêtre.
  const onBackdrop = (event: MouseEvent) => {
    if (event.target !== dialog) return false;
    const box = dialog.getBoundingClientRect();
    return (
      event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom
    );
  };
  let pressedOnBackdrop = false;
  dialog.addEventListener('pointerdown', (event) => {
    pressedOnBackdrop = onBackdrop(event);
  });
  dialog.addEventListener('click', (event) => {
    if (pressedOnBackdrop && onBackdrop(event)) dialog.close();
    pressedOnBackdrop = false;
  });

  // Après une demande envoyée, la fenêtre repart d'un questionnaire vierge à la prochaine ouverture.
  dialog.addEventListener('close', () => {
    dialog
      .querySelectorAll<HTMLButtonElement>('form[data-sent="webhook"] [data-qcm-success="webhook"] [data-qcm-restart]')
      .forEach((button) => button.click());
  });
}
