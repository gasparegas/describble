// Live page: the text box is the whole description. Every keystroke redraws the character,
// pausing lets the lines settle, and the head keeps turning in 2.5D on a paper disc over a dark page.
// The rest of the website (copy, gallery, links) lives in site.js.
import { createStage, boilFrame } from './stage.js';
import { applyMessage, describe, initialState, missesIn, sceneFor } from './dialogue.js';
import { recordMisses, reportingOn, setReporting, REPORT_ENDPOINT } from './misses.js';
import { exportPng } from './export.js';
import { siteCopy, siteGallery, pickSiteLanguage, saveSiteLanguage, applySiteLanguage, applySiteLinks, buildSiteGallery, shareLink, readSharedLink, copyText } from './site.js';

const TYPE_DEBOUNCE = 50;
const SETTLE_AFTER = 1400;
const FILL_SCALE = 1;
const EXAMPLE_EVERY = 3200;
const TYPE_SPEED = 28;
const CONFIRM_FOR = 1600;

// Placeholder ideas that rotate while the box is empty, to show what can be written.
const examples = {
  it: ['biondo, sigaretta in bocca, occhi stanchi…', 'ragazza con caschetto rosa e occhiali a cuore…', 'vampiro con il mantello…', 'doomer…', 'nonno calvo con i baffi e la pipa…', 'gamer con le cuffie e il cappellino al contrario…', 'sorprendimi…'],
  en: ['blond, cigarette in mouth, tired eyes…', 'girl with a pink bob and heart glasses…', 'vampire with a cape…', 'doomer…', 'bald grandpa with a moustache and a pipe…', 'gamer with headset and backwards cap…', 'surprise me…'],
};

// Under the text: what was understood, as a quiet list; honest messages only for unknown words.
function statusLine(result, state) {
  if (/Non conosco|Non so|Intendevi|I don't know|I can't|Did you mean|per cosa|for what/.test(result.reply)) return result.reply;
  const understood = describe(state, state.lang).replace(/^Avatar: /, '');
  return state.started ? understood : '';
}

// The character keeps its normal hand-drawn look (dark ink, full colours) on a round paper
// disc, the same crop a profile picture gets; only the page around it is dark.
function darken(colors) {
  return colors;
}

// Flowing background lines that get livelier while the user types.
function startLines(canvas, calm) {
  const context = canvas.getContext('2d');
  const lines = Array.from({ length: 11 }, (_, i) => ({ phase: i * 1.7, speed: 0.15 + (i % 4) * 0.05, height: (i + 0.5) / 11 }));
  let energy = 0.2;
  // Lines drift towards the character's main colour, mixed with the page white.
  let tint = [243, 239, 230];
  let target = tint;
  const resize = () => {
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
  };
  resize();
  addEventListener('resize', resize);
  return {
    kick: () => { energy = Math.min(1, energy + 0.18); },
    burst: () => { energy = 1; },
    setTint(hex) {
      const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
      target = rgb.map((v) => Math.round(v * 0.55 + 243 * 0.45));
    },
    draw(now) {
      const { width, height } = canvas;
      context.clearRect(0, 0, width, height);
      context.lineWidth = devicePixelRatio;
      energy = Math.max(0.2, energy * 0.985);
      tint = tint.map((v, i) => v + (target[i] - v) * 0.03);
      const time = calm ? 0 : now / 1000;
      for (const line of lines) {
        context.strokeStyle = `rgba(${tint.map(Math.round).join(', ')}, ${0.04 + energy * 0.08})`;
        context.beginPath();
        for (let x = 0; x <= width; x += 12 * devicePixelRatio) {
          const u = x / width;
          const y = line.height * height
            + Math.sin(u * 7 + time * line.speed * 3 + line.phase) * (10 + energy * 40) * devicePixelRatio
            + Math.sin(u * 17 - time * line.speed * 5) * (2 + energy * 8) * devicePixelRatio;
          if (x === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();
      }
    },
  };
}

function liveMain() {
  const svg = document.querySelector('#stage');
  const input = document.querySelector('#say');
  const downloadButton = document.querySelector('#download');
  const shareButton = document.querySelector('#share');
  const status = document.querySelector('#status');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stage = createStage(svg, { fillScale: FILL_SCALE });
  const lines = startLines(document.querySelector('#lines'), calm);
  let lang = pickSiteLanguage();
  // One seed per visit: unmentioned traits stay put while the text grows.
  let base = { ...initialState(lang), seed: Math.floor(Math.random() * 2 ** 31) };
  let state = base;
  let lastTyped = -1e9;
  let settled = false;
  let loggedText = '';
  let pendingLog = null;
  let shown = -1;
  let traitCount = 0;
  let pendingTyping = null;
  let typing = null;
  // Drawing every frame is only worth it while the character is on screen.
  let heroVisible = true;
  new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; }).observe(svg);
  const pose = { yaw: 0, turn: 0, turnAt: -1e9, drag: null };
  // Blinks come at irregular intervals; the gaze follows the head turn and the pointer.
  const life = { nextBlink: performance.now() + 2500, blinkAt: -1e9, pointer: [0, 0], gaze: [0, 0] };
  addEventListener('pointermove', (event) => {
    life.pointer = [(event.clientX / innerWidth - 0.5) * 2, (event.clientY / innerHeight - 0.5) * 2];
  });

  const show = (now, confirmed) => {
    const scene = sceneFor({ ...state, confirmed });
    scene.colors = darken(scene.colors);
    stage.update(scene, now);
    if (state.started) {
      lines.setTint(scene.accent);
      document.documentElement.style.setProperty('--accent', scene.accent);
    }
    svg.setAttribute('aria-label', state.started ? describe(state, state.lang) : siteCopy[lang].stageLabel);
  };

  const redraw = () => {
    const text = input.value;
    // The whole text is replayed on a fresh state, so deleting words also removes them.
    const result = applyMessage(base, text, 0);
    if (result.action === 'random') base = { ...result.state, seed: result.state.seed };
    state = result.action ? base : result.state;
    const count = describe(state).split(',').length;
    if (count > traitCount && text.trim()) {
      lines.burst();
      pose.turn = pose.turn >= 0 ? -1 : 1;
      pose.turnAt = performance.now();
    }
    traitCount = count;
    status.textContent = text.trim() ? statusLine(result, state) : '';
    // Nothing to download or share until something has been drawn.
    downloadButton.disabled = !state.started;
    shareButton.disabled = !text.trim();
    settled = false;
    show(performance.now(), false);
  };

  // The box grows with the text (up to its CSS max-height), so no line is cut off on narrow screens.
  const fitInput = () => {
    input.style.height = 'auto';
    input.style.height = `${input.scrollHeight}px`;
  };
  input.addEventListener('input', () => {
    fitInput();
    lastTyped = performance.now();
    lines.kick();
    clearTimeout(pendingTyping);
    pendingTyping = setTimeout(redraw, TYPE_DEBOUNCE);
    // After a pause the words are complete: log the ones the lexicon does not know.
    clearTimeout(pendingLog);
    pendingLog = setTimeout(() => {
      if (!input.value.trim() || input.value === loggedText) return;
      loggedText = input.value;
      recordMisses(missesIn(loggedText), loggedText.trim(), state.lang);
    }, SETTLE_AFTER);
  });

  // A button briefly says what just happened, then goes back to its label.
  const confirm = (button, key, back) => {
    button.textContent = siteCopy[lang][key];
    setTimeout(() => { button.textContent = siteCopy[lang][back]; }, CONFIRM_FOR);
  };
  const download = async () => {
    redraw();
    if (!state.started) return;
    await exportPng(state, darken, FILL_SCALE);
    confirm(downloadButton, 'downloaded', 'download');
    // The happiest moment of a visit: invite a star, once, only when the repository link is configured.
    const afterSave = document.querySelector('#after-save');
    if (afterSave.querySelector('a[href^="http"]')) afterSave.hidden = false;
  };
  input.addEventListener('keydown', async (event) => {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    const word = input.value.trim().toLowerCase();
    if (/^(scarica|download|salva|save|png)$/.test(word.split(/\s+/).pop() ?? '')) {
      input.value = input.value.replace(/\s*\S+\s*$/, '');
      await download();
    }
  });
  downloadButton.addEventListener('click', download);
  // On phones the share sheet is the natural place for a link; elsewhere it goes to the clipboard.
  shareButton.addEventListener('click', async () => {
    const url = shareLink(input.value.trim(), base.seed);
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      try {
        await navigator.share({ url, title: siteCopy[lang].title });
        return;
      } catch {}
    }
    if (await copyText(url)) confirm(shareButton, 'shared', 'share');
  });

  // Writes a sentence into the box letter by letter, so the drawing builds up as if typed.
  const typeInto = (text, seed) => {
    clearInterval(typing);
    if (seed !== undefined) base = { ...initialState(lang), seed };
    traitCount = 0;
    document.querySelector('#hero').scrollIntoView({ behavior: calm ? 'auto' : 'smooth' });
    if (calm) {
      input.value = text;
      input.dispatchEvent(new Event('input'));
      return;
    }
    input.value = '';
    let i = 0;
    typing = setInterval(() => {
      i += 1;
      input.value = text.slice(0, i);
      input.dispatchEvent(new Event('input'));
      if (i >= text.length) clearInterval(typing);
    }, TYPE_SPEED);
  };
  // Typing by hand stops any sentence being written for you.
  input.addEventListener('keydown', () => clearInterval(typing));
  document.querySelector('#surprise').addEventListener('click', () => {
    const pool = [...siteGallery[lang], ...examples[lang].slice(0, -1).map((text) => text.replace(/…$/, ''))]
      .filter((text) => text !== input.value);
    typeInto(pool[Math.floor(Math.random() * pool.length)], Math.floor(Math.random() * 2 ** 31));
  });

  // Drag the face sideways to turn it by hand.
  svg.addEventListener('pointerdown', (event) => {
    pose.drag = event.clientX;
    svg.setPointerCapture(event.pointerId);
  });
  svg.addEventListener('pointermove', (event) => {
    if (pose.drag === null) return;
    const rect = svg.getBoundingClientRect();
    pose.yaw = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2.4));
  });
  const release = () => { pose.drag = null; };
  svg.addEventListener('pointerup', release);
  svg.addEventListener('pointercancel', release);

  show(-1e9, false);

  function tick(now) {
    if (!settled && now - lastTyped > SETTLE_AFTER && state.started) {
      settled = true;
      show(now, true);
    }
    if (heroVisible) {
      if (!calm) {
        // Idle sway, plus a quick look to one side whenever a new trait appears.
        const since = (now - pose.turnAt) / 1000;
        const glance = since < 1.6 ? pose.turn * Math.sin(Math.PI * Math.min(1, since / 1.6)) * 0.85 : 0;
        const idle = 0.38 * Math.sin(now / 1900) + 0.12 * Math.sin(now / 730);
        const target = pose.drag !== null ? pose.yaw : idle + glance;
        pose.yaw += (target - pose.yaw) * 0.12;
        stage.setPose({ yaw: pose.yaw, roll: 2.2 * Math.sin(now / 2300), bob: 3 * Math.sin(now / 1100) });
        if (now > life.nextBlink) {
          life.blinkAt = now;
          life.nextBlink = now + 2200 + Math.random() * 3800;
        }
        const blinkT = (now - life.blinkAt) / 170;
        const gazeTarget = [pose.yaw * 0.7 + life.pointer[0] * 0.5, life.pointer[1] * 0.6];
        life.gaze = life.gaze.map((v, i) => v + (Math.max(-1, Math.min(1, gazeTarget[i])) - v) * 0.15);
        stage.setLife({ blink: blinkT >= 0 && blinkT <= 1 ? Math.sin(Math.PI * blinkT) : 0, gaze: life.gaze });
        lines.draw(now);
      }
      const frame = calm ? 0 : boilFrame(now);
      // The pieces only change on boil frames (9 fps) or while animating; the face moves every frame.
      if (stage.busy(now) || frame !== shown) {
        shown = frame;
        stage.draw(now, frame);
      } else if (!calm) {
        stage.draw(now, frame, { faceOnly: true });
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // A switch for anonymous word reports, in the privacy note, shown only when reporting is configured.
  const toggle = document.querySelector('#report');
  const reportLabel = () => {
    toggle.textContent = siteCopy[lang].reports(reportingOn());
    toggle.setAttribute('aria-pressed', String(reportingOn()));
  };
  if (REPORT_ENDPOINT) {
    toggle.hidden = false;
    document.querySelector('#privacy-reports').hidden = false;
    reportLabel();
    toggle.addEventListener('click', () => { setReporting(!reportingOn()); reportLabel(); });
  }

  let example = 0;
  const setLanguage = (next) => {
    lang = next;
    applySiteLanguage(lang);
    // Screen readers pick the voice from the page language, set by applySiteLanguage.
    input.setAttribute('aria-label', siteCopy[lang].inputLabel);
    input.placeholder = examples[lang][example % examples[lang].length];
    base = { ...initialState(lang), seed: base.seed };
    if (REPORT_ENDPOINT) reportLabel();
    redraw();
  };
  for (const button of document.querySelectorAll('[data-lang]')) {
    button.addEventListener('click', () => {
      saveSiteLanguage(button.dataset.lang);
      setLanguage(button.dataset.lang);
    });
  }

  applySiteLinks();
  buildSiteGallery(lang, typeInto);
  setLanguage(lang);
  // Opening a shared link writes its sentence, with its seed, so the same face appears.
  const shared = readSharedLink();
  if (shared) typeInto(shared.text, shared.seed);
  // On phones the keyboard would cover the drawing before anyone has seen it.
  if (!matchMedia('(pointer: coarse)').matches) input.focus({ preventScroll: true });
  if (!calm) {
    setInterval(() => {
      if (input.value) return;
      example = (example + 1) % examples[lang].length;
      input.placeholder = examples[lang][example];
    }, EXAMPLE_EVERY);
  }
}

liveMain();
