// The website around the live drawing: its copy (English, Italian, Portuguese), the clickable gallery and the links
// configured at build time. English is the main language.

// Filled in by build.mjs from DESCRIBBLE_REPO_URL and DESCRIBBLE_SUPPORT_URL; empty links stay hidden.
export const SITE_LINKS = { repo: '', support: '' };

export const siteCopy = {
  en: {
    title: 'Free Avatar Maker from a Sentence, No AI Generation · Describble',
    kicker: 'Free avatar maker · no AI generation, no sign-up',
    description: 'Type a description and get a sketchy, hand-drawn style avatar in seconds. Free pfp maker: no AI generation, no photo, no sign-up. Download a PNG for Discord, GitHub or WhatsApp.',
    headline: 'Describe someone. Watch them get drawn.',
    lede: 'Hand-drawn style avatars from a sentence. No AI model, no account, nothing to install.',
    inputLabel: 'Describe the character',
    stageLabel: 'The character you are describing',
    download: 'Download PNG',
    downloaded: 'Saved',
    afterSave: 'Like it? A star on GitHub helps other people find Describble.',
    share: 'Copy link',
    shared: 'Link copied',
    surprise: 'Surprise me',
    github: 'GitHub',
    viewOnGithub: 'View on GitHub',
    supportShort: 'Support',
    galleryTitle: 'Avatar ideas to start from',
    galleryNote: 'Tap a face to write its sentence, then change any word.',
    avatarAlt: 'Hand-drawn style avatar',
    howTitle: 'An avatar maker with no AI model. Just words and rules.',
    how: [
      'Every word you write picks a ready-made piece: hair, hats, glasses, piercings, moods. If it does not know a word, it tells you.',
      'Change a word and only that piece is redrawn. The lines keep wobbling a little, like a sketch that is still alive.',
      'It runs in your browser and keeps working offline. Your sentence never leaves your device.',
    ],
    useTitle: 'Make your profile picture (pfp)',
    use: ['Describe yourself, or anyone.', 'Download the PNG: 1024 × 1024, ready for a round crop.', 'Upload it on GitHub, Discord, Slack or wherever you have a face.'],
    openTitle: 'Open source, and free to use',
    open: 'The code is MIT and every drawing is CC0: use your avatar anywhere, no credit needed. Missing a word or a hat? Suggest it, or draw it.',
    suggest: 'Suggest a word',
    code: 'Read the code',
    supportTitle: 'Keep it free',
    support: 'Describble has no ads and no paid plan. If it made you smile, you can buy the drawings a coffee.',
    supportLink: 'Support on Ko-fi',
    privacy: 'Your sentence stays in your browser.',
    privacyReports: 'To grow the dictionary, single words it did not understand are counted anonymously. Never your sentence.',
    reports: (on) => `Word reports: ${on ? 'on' : 'off'}`,
    license: 'Code MIT, drawings CC0.',
    footerPrivacy: 'Privacy',
    footerCode: 'Source code',
    footerIssue: 'Report a problem',
    faqTitle: 'Questions about the avatar maker',
    faqQ1: 'Is Describble really free?',
    faqA1: 'Yes. No sign-up, no watermark, no paid plan. Describe someone, download the PNG and it is yours.',
    faqQ2: 'Does it use AI?',
    faqA2: 'Not when you use it. No AI model runs: your words are matched against a curated dictionary, each match picks a ready-made piece, and the same sentence always gives the same face, all in your browser.',
    faqQ3: 'Can I use my avatar anywhere?',
    faqA3: 'Yes. Every drawing is CC0: use it as your profile picture on GitHub, Discord, WhatsApp, Twitch or Slack, in a game or a project, even a commercial one, with no credit needed.',
    faqQ4: 'How do I set it as my profile picture?',
    faqA4: 'Describe the character, press Download PNG (1024 × 1024, fits a round crop), then upload the image in your profile settings.',
    faqQ5: 'Is what I write private?',
    faqA5: 'Your sentence never leaves your browser. To learn new words, single words it did not understand can be counted anonymously, never the sentence, and one click turns that off.',
    faqQ6: 'Which languages does it understand?',
    faqA6: 'English, Italian and Portuguese, mixed freely. More languages are on the way, and you can help add them on GitHub.',
    noscript: 'Describble draws with JavaScript. Turn it on to describe your character.',
  },
  it: {
    title: 'Crea il tuo avatar gratis da una frase, senza AI generativa · Describble',
    kicker: 'Crea avatar gratis · senza AI generativa, senza registrazione',
    description: 'Descrivi qualcuno e ottieni un avatar in stile schizzo in pochi secondi. Gratis: niente AI generativa, niente foto, niente registrazione. Scarica il PNG per WhatsApp, Discord o GitHub.',
    headline: 'Descrivi qualcuno. Guardalo prendere forma.',
    lede: 'Avatar in stile schizzo da una frase. Nessun modello di AI, niente account, niente da installare.',
    inputLabel: 'Descrivi il personaggio',
    stageLabel: 'Il personaggio che stai descrivendo',
    download: 'Scarica PNG',
    downloaded: 'Salvato',
    afterSave: 'Ti piace? Una stella su GitHub aiuta altre persone a trovare Describble.',
    share: 'Copia link',
    shared: 'Link copiato',
    surprise: 'Sorprendimi',
    github: 'GitHub',
    viewOnGithub: 'Guarda su GitHub',
    supportShort: 'Sostieni',
    galleryTitle: 'Idee per il tuo avatar',
    galleryNote: 'Tocca una faccia per scriverne la frase, poi cambia quello che vuoi.',
    avatarAlt: 'Avatar in stile schizzo',
    howTitle: 'Un generatore di avatar senza modelli di AI. Solo parole e regole.',
    how: [
      'Ogni parola che scrivi sceglie un pezzo già pronto: capelli, cappelli, occhiali, piercing, espressioni. Se una parola non la conosce, te lo dice.',
      'Cambi una parola e viene ridisegnato solo quel pezzo. Le linee continuano a tremare un po\', come uno schizzo ancora vivo.',
      'Funziona nel tuo browser, anche offline. La tua frase non lascia mai il tuo dispositivo.',
    ],
    useTitle: 'Crea la tua immagine del profilo',
    use: ['Descrivi te stesso, o chi vuoi.', 'Scarica il PNG: 1024 × 1024, pronto anche per il ritaglio tondo.', 'Caricalo su GitHub, Discord, Slack o dove serve una faccia.'],
    openTitle: 'Open source e gratis',
    open: 'Il codice è MIT e ogni disegno è CC0: usa il tuo avatar dove vuoi, senza citare nessuno. Manca una parola o un cappello? Suggeriscilo, o disegnalo.',
    suggest: 'Suggerisci una parola',
    code: 'Leggi il codice',
    supportTitle: 'Tienilo gratis',
    support: 'Describble non ha pubblicità né piani a pagamento. Se ti ha strappato un sorriso, puoi offrire un caffè ai disegni.',
    supportLink: 'Sostieni su Ko-fi',
    privacy: 'La tua frase resta nel tuo browser.',
    privacyReports: 'Per far crescere il dizionario, le singole parole che non ha capito vengono contate in forma anonima. Mai la frase.',
    reports: (on) => `Segnalazione parole: ${on ? 'attiva' : 'spenta'}`,
    license: 'Codice MIT, disegni CC0.',
    footerPrivacy: 'Privacy',
    footerCode: 'Codice sorgente',
    footerIssue: 'Segnala un problema',
    faqTitle: 'Domande sul generatore di avatar',
    faqQ1: 'Describble è davvero gratis?',
    faqA1: 'Sì. Niente registrazione, niente filigrana, niente piani a pagamento. Descrivi qualcuno, scarica il PNG ed è tuo.',
    faqQ2: 'Usa l\'intelligenza artificiale?',
    faqA2: 'Non quando lo usi. Non gira nessun modello di AI: le tue parole vengono cercate in un dizionario curato, ogni parola trovata sceglie un pezzo già pronto e la stessa frase dà sempre la stessa faccia, tutto nel tuo browser.',
    faqQ3: 'Posso usare il mio avatar dove voglio?',
    faqA3: 'Sì. Ogni disegno è CC0: usalo come immagine del profilo su WhatsApp, Instagram, Discord, GitHub o Twitch, in un gioco o in un progetto, anche commerciale, senza citare nessuno.',
    faqQ4: 'Come lo metto come immagine del profilo?',
    faqA4: 'Descrivi il personaggio, premi Scarica PNG (1024 × 1024, va bene anche ritagliato tondo) e carica l\'immagine nelle impostazioni del tuo profilo.',
    faqQ5: 'Quello che scrivo resta privato?',
    faqA5: 'La tua frase non lascia mai il tuo browser. Per imparare parole nuove, le singole parole che non ha capito possono essere contate in forma anonima, mai la frase, e un clic disattiva tutto.',
    faqQ6: 'Che lingue capisce?',
    faqA6: 'Italiano, inglese e portoghese, anche mescolati. Altre lingue sono in arrivo, e puoi aiutare ad aggiungerle su GitHub.',
    noscript: 'Describble disegna con JavaScript. Attivalo per descrivere il tuo personaggio.',
  },
  pt: {
    title: 'Criar avatar grátis a partir de uma frase, sem IA generativa · Describble',
    kicker: 'Criador de avatar grátis · sem IA generativa, sem cadastro',
    description: 'Descreva alguém e ganhe um avatar com cara de rascunho em segundos. Grátis: sem IA generativa, sem foto, sem cadastro. Baixe o PNG para WhatsApp, Discord ou Instagram.',
    headline: 'Descreva alguém. Veja ganhar forma.',
    lede: 'Avatares com cara de rascunho a partir de uma frase. Sem modelo de IA, sem conta, sem nada para instalar.',
    inputLabel: 'Descreva o personagem',
    stageLabel: 'O personagem que você está descrevendo',
    download: 'Baixar PNG',
    downloaded: 'Salvo',
    afterSave: 'Gostou? Uma estrela no GitHub ajuda outras pessoas a encontrar o Describble.',
    share: 'Copiar link',
    shared: 'Link copiado',
    surprise: 'Me surpreenda',
    github: 'GitHub',
    viewOnGithub: 'Ver no GitHub',
    supportShort: 'Apoiar',
    galleryTitle: 'Ideias de avatar para começar',
    galleryNote: 'Toque num rosto para escrever a frase dele, depois mude o que quiser.',
    avatarAlt: 'Avatar com cara de rascunho',
    howTitle: 'Um criador de avatar sem modelo de IA. Só palavras e regras.',
    how: [
      'Cada palavra que você escreve escolhe uma peça pronta: cabelo, chapéu, óculos, piercing, expressão. Se não conhece uma palavra, ele avisa.',
      'Mude uma palavra e só aquela peça é redesenhada. As linhas continuam tremendo um pouco, como um rascunho ainda vivo.',
      'Funciona no seu navegador, até offline. A sua frase nunca sai do seu aparelho.',
    ],
    useTitle: 'Crie sua foto de perfil',
    use: ['Descreva você mesmo, ou quem quiser.', 'Baixe o PNG: 1024 × 1024, pronto para o recorte redondo.', 'Coloque no WhatsApp, Instagram, Discord ou onde precisar de um rosto.'],
    openTitle: 'Código aberto e grátis',
    open: 'O código é MIT e cada desenho é CC0: use seu avatar onde quiser, sem dar crédito. Falta uma palavra ou um chapéu? Sugira, ou desenhe.',
    suggest: 'Sugerir uma palavra',
    code: 'Ler o código',
    supportTitle: 'Mantenha grátis',
    support: 'O Describble não tem anúncios nem plano pago. Se ele te fez sorrir, você pode pagar um café para os desenhos.',
    supportLink: 'Apoiar no Ko-fi',
    privacy: 'A sua frase fica no seu navegador.',
    privacyReports: 'Para aumentar o dicionário, palavras soltas que ele não entendeu são contadas de forma anônima. Nunca a frase.',
    reports: (on) => `Envio de palavras: ${on ? 'ligado' : 'desligado'}`,
    license: 'Código MIT, desenhos CC0.',
    footerPrivacy: 'Privacidade',
    footerCode: 'Código-fonte',
    footerIssue: 'Relatar um problema',
    faqTitle: 'Perguntas sobre o criador de avatar',
    faqQ1: 'O Describble é grátis mesmo?',
    faqA1: 'Sim. Sem cadastro, sem marca d\'água, sem plano pago. Descreva alguém, baixe o PNG e ele é seu.',
    faqQ2: 'Ele usa inteligência artificial?',
    faqA2: 'Não enquanto você usa. Nenhum modelo de IA roda: as suas palavras são procuradas num dicionário, cada palavra encontrada escolhe uma peça pronta e a mesma frase sempre dá o mesmo rosto, tudo no seu navegador.',
    faqQ3: 'Posso usar meu avatar onde quiser?',
    faqA3: 'Sim. Cada desenho é CC0: use como foto de perfil no WhatsApp, Instagram, Discord ou Twitch, num jogo ou num projeto, até comercial, sem dar crédito.',
    faqQ4: 'Como coloco como foto de perfil?',
    faqA4: 'Descreva o personagem, toque em Baixar PNG (1024 × 1024, funciona com recorte redondo) e envie a imagem nas configurações do seu perfil.',
    faqQ5: 'O que eu escrevo fica privado?',
    faqA5: 'A sua frase nunca sai do navegador. Para aprender palavras novas, palavras soltas que ele não entendeu podem ser contadas de forma anônima, nunca a frase, e um clique desliga tudo.',
    faqQ6: 'Quais línguas ele entende?',
    faqA6: 'Português, inglês e italiano, até misturados. As frases que aparecem embaixo do desenho ainda estão em inglês. Outras línguas estão a caminho, e você pode ajudar no GitHub.',
    noscript: 'O Describble desenha com JavaScript. Ative para descrever o seu personagem.',
    unknownWord: (word) => `Ainda não sei desenhar "${word}"`,
  },
};

// Pages written for one search: the same live drawing, with their own title, text and questions.
// Each one is published at its path in its language; keys it leaves out come from siteCopy.
export const sitePages = {
  pfp: {
    path: '/pfp-maker/', lang: 'en',
    en: {
      title: 'Free PFP Maker: Draw Your Profile Picture from Text, No AI Generation · Describble',
      description: 'Make a hand-drawn style pfp for Discord, Steam, Twitch or X by typing what you look like. Free, no AI generation, no photo, no sign-up.',
      kicker: 'Free pfp maker · no AI generation',
      headline: 'Describe yourself. Get a sketchy pfp.',
      lede: 'Type what you, or your character, look like and a profile picture draws itself. Free, no AI model, no account.',
      pageTitle: 'A pfp that looks like you, not like everyone else\'s',
      pageText: [
        'Most pfp makers hand you a random face or a long list of sliders. Here you just write it down: "headset, backwards cap, tired eyes", "pink bob, heart glasses, freckles", "grumpy pirate grandma". Every word picks a ready-made piece.',
        'The PNG is 1024 × 1024 with the face in the middle, so it survives the round crop of Discord, Twitch, X and Steam. Keep the link to redraw the same face later, or change one word for an alt.',
        'It is free with no watermark, the drawings are CC0, and nothing you type leaves your browser.',
      ],
      faqQ1: 'Is this pfp maker really free?',
      faqA1: 'Yes. No sign-up, no watermark, no credits to buy. Describe your character, download the PNG and it is yours.',
      faqQ2: 'Will it work on Discord, Steam or Twitch?',
      faqA2: 'Yes. The PNG is a 1024 × 1024 square with the face centred, so it fits the round and square crops those sites use. Upload it in your profile settings.',
    },
  },
  noai: {
    path: '/no-ai-avatar-maker/', lang: 'en',
    en: {
      title: 'No-AI Avatar Maker: No Model, Just a Dictionary and Drawings · Describble',
      description: 'An avatar maker with no AI model inside: type a description and ready-made pieces are put together while you type. Free, open source, runs in your browser.',
      kicker: 'Avatar maker without an AI model',
      headline: 'An avatar maker with no AI model inside.',
      lede: 'No image generation and no prompt: a dictionary and a fixed set of drawings, put together in your browser while you type.',
      pageTitle: 'Why no AI model?',
      pageText: [
        'No model trained on anyone\'s art draws your avatar. Every hair style, hat and pair of glasses is one of a fixed set of original SVG pieces, released as CC0. You can read every one of them on GitHub.',
        'There is no prompt guessing. Your words are looked up in a dictionary, so the same sentence always gives the same kind of face, and when it does not know a word it says so instead of making something up.',
        'Because there is no model, it runs entirely in your browser, works offline and sends nothing anywhere: no photo, no account, no server drawing for you.',
      ],
      faqQ1: 'How does it work without AI?',
      faqA1: 'A rule-based parser matches your words and short phrases against a curated dictionary. Each match turns on a ready-made piece, and a small renderer draws the pieces as wobbly pen strokes.',
      faqQ2: 'Is the result AI art?',
      faqA2: 'Nothing is generated by a model when you type: the same sentence always gives the same face from the same fixed pieces. You can read every line of the code and every piece on GitHub.',
    },
  },
  nophoto: {
    path: '/it/avatar-senza-foto/', lang: 'it',
    it: {
      title: 'Crea un avatar senza foto, gratis e senza AI generativa · Describble',
      description: 'Crea un avatar senza caricare foto: descrivi il personaggio a parole e viene disegnato mentre scrivi. Gratis, senza AI generativa, senza registrazione.',
      kicker: 'Avatar senza foto · gratis, senza AI generativa',
      headline: 'Crea il tuo avatar senza caricare foto.',
      lede: 'Descrivi com\'è il personaggio a parole e lo vedi disegnare. Gratis, senza AI generativa, senza registrazione.',
      pageTitle: 'Niente foto, niente dati',
      pageText: [
        'Molti siti per creare avatar chiedono prima una foto del tuo viso e poi la mandano a un server con l\'intelligenza artificiale. Qui la foto non serve: scrivi "ragazza con il caschetto rosa, occhiali a cuore e lentiggini" oppure "nonno pirata con la benda" e il disegno compare mentre scrivi.',
        'Tutto succede nel tuo browser: la frase non viene inviata da nessuna parte e non serve nessun account. Funziona anche offline.',
        'Il PNG è 1024 × 1024 con il viso al centro, quindi va bene come foto profilo su WhatsApp, Telegram, Instagram o Discord, anche con il ritaglio tondo.',
      ],
      faqQ1: 'Serve una foto per creare l\'avatar?',
      faqA1: 'No. Basta descrivere il personaggio a parole: capelli, occhiali, barba, cappello, espressione. Non devi caricare nessuna immagine.',
      faqQ2: 'Posso usarlo come foto profilo su WhatsApp?',
      faqA2: 'Sì. Scarica il PNG e, su WhatsApp, vai su Impostazioni, tocca la tua foto e scegli l\'immagine dalla galleria. Il ritaglio tondo non taglia il viso.',
    },
  },
};

// The copy of one page in one language: the page's own keys over the language's defaults.
export const pageCopy = (page, lang) => ({ ...siteCopy[lang], ...(sitePages[page]?.[lang] ?? {}) });

// Gallery sentences: each one is a real input, so tapping it shows exactly how it was made.
export const siteGallery = {
  en: [
    'blond, cigarette in mouth, tired eyes',
    'girl with a pink bob and heart glasses',
    'vampire with a cape',
    'grandma with curlers and reading glasses',
    'gamer with headset and backwards cap',
    'girl with gauges, septum and fuchsia hair',
    'construction worker with a hard hat and a beard',
    'fedora, matrix glasses, open black shirt',
    'old sailor with a pipe and a white beard',
    'punk with a green mohawk and a leather jacket',
    'nun smiling',
    'kid with braces and big glasses',
  ],
  it: [
    'biondo, sigaretta in bocca, occhi stanchi',
    'ragazza con caschetto rosa e occhiali a cuore',
    'vampiro con il mantello',
    'nonna con i bigodini e gli occhiali a mezzaluna',
    'gamer con le cuffie e il cappellino al contrario',
    'ragazza con dilatatori, septum e capelli fucsia',
    'muratore con il casco e la barba',
    'cappello italiano, occhiali da matrix, camicia nera aperta',
    'vecchio marinaio con la pipa e la barba bianca',
    'punk con cresta verde e chiodo',
    'suora sorridente',
    'ragazzino con l apparecchio e occhiali grandi',
  ],
  pt: [
    'loiro, cigarro na boca, olhos cansados',
    'menina com cabelo chanel rosa e óculos de coração',
    'vampiro com capa',
    'vovozinha com bobes e óculos de leitura',
    'gamer com headset e boné para trás',
    'menina com alargadores, piercing no septo e cabelo fúcsia',
    'pedreiro com capacete e barba',
    'chapéu fedora, óculos do matrix, camisa preta aberta',
    'marinheiro velho com cachimbo e barba branca',
    'punk com moicano verde e jaqueta de couro',
    'freira sorrindo',
    'criança com aparelho e óculos grandes',
  ],
};

// A shared link carries the sentence and the seed after the #, which browsers never send to a server.
export function shareLink(text, seed) {
  const url = new URL(location.href);
  url.hash = new URLSearchParams({ s: text, k: seed.toString(36) }).toString();
  return url.href;
}

export function readSharedLink() {
  const params = new URLSearchParams(location.hash.slice(1));
  const text = (params.get('s') ?? '').slice(0, 400);
  const seed = parseInt(params.get('k') ?? '', 36);
  return text.trim() ? { text, seed: Number.isFinite(seed) ? seed : undefined } : null;
}

// Copies with the clipboard API where allowed (https), with the old selection trick as a fallback (file://).
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = Object.assign(document.createElement('textarea'), { value: text });
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const done = document.execCommand('copy');
    area.remove();
    return done;
  }
}

// Saved choice first, then the browser language; English for everyone else.
export function pickSiteLanguage() {
  // A page written for one search opens in its own language.
  const page = document.documentElement.dataset.page;
  if (sitePages[page]) return sitePages[page].lang;
  try {
    const saved = localStorage.getItem('describble-lang');
    if (saved in siteCopy) return saved;
  } catch {}
  // The Italian page (/it/) opens in Italian; the main page follows the browser.
  const pageLang = document.documentElement.lang;
  if (pageLang !== 'en' && pageLang in siteCopy) return pageLang;
  const browser = (navigator.language ?? 'en').toLowerCase().slice(0, 2);
  return browser in siteCopy ? browser : 'en';
}

export function saveSiteLanguage(lang) {
  try {
    localStorage.setItem('describble-lang', lang);
  } catch {}
}

// Writes the copy into every [data-copy] element; list keys fill the element's <li> or <p> children.
export function applySiteLanguage(lang) {
  const copy = pageCopy(document.documentElement.dataset.page, lang);
  document.documentElement.lang = lang;
  document.title = copy.title;
  for (const element of document.querySelectorAll('[data-copy]')) {
    const value = copy[element.dataset.copy];
    if (Array.isArray(value)) {
      [...element.children].forEach((child, i) => { child.textContent = value[i] ?? ''; });
    } else if (typeof value === 'string') {
      element.textContent = value;
    }
  }
  for (const button of document.querySelectorAll('[data-lang]')) button.setAttribute('aria-pressed', String(button.dataset.lang === lang));
  document.querySelectorAll('#gallery figure').forEach((figure, i) => {
    figure.querySelector('figcaption').textContent = siteGallery[lang][i];
    figure.querySelector('img').alt = `${copy.avatarAlt}: ${siteGallery[lang][i]}`;
  });
}

// Links are shown only when configured, so a fork never points at someone else's page.
export function applySiteLinks() {
  const repo = SITE_LINKS.repo.replace(/\/+$/, '');
  const targets = { repo, releases: repo && `${repo}/releases`, issues: repo && `${repo}/issues/new/choose`, privacy: repo && `${repo}/blob/main/PRIVACY.md`, support: SITE_LINKS.support };
  for (const element of document.querySelectorAll('[data-link]')) {
    const href = targets[element.dataset.link];
    if (href) element.href = href;
    else element.hidden = true;
  }
  for (const block of document.querySelectorAll('[data-needs]')) {
    if (!targets[block.dataset.needs]) block.hidden = true;
  }
}

// The gallery faces are drawn by build.mjs as image files; tapping one writes its sentence
// in the page's language, with the seed it was drawn with.
export function buildSiteGallery(lang, onPick) {
  document.querySelectorAll('#gallery button').forEach((button, i) => {
    button.addEventListener('click', () => onPick((siteGallery[document.documentElement.lang] ?? siteGallery.en)[i], Number(button.dataset.seed)));
  });
  applySiteLanguage(lang);
}
