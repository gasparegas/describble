import { PAPER, SVG_NS } from './pen.js';
import { createStage } from './stage.js';
import { sceneFor } from './dialogue.js';

const EXPORT_SIZE = 1024;

// Renders the finished avatar off screen and downloads it as a square PNG.
// paint(colors) lets a page restyle the export (the live page keeps its dark look).
export async function exportPng(state, paint = (colors) => colors, fillScale = 1) {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('xmlns', SVG_NS);
  svg.setAttribute('width', EXPORT_SIZE);
  svg.setAttribute('height', EXPORT_SIZE);
  const stage = createStage(svg, { instant: true, fillScale });
  const scene = sceneFor({ ...state, started: true, confirmed: true });
  scene.colors = paint(scene.colors);
  stage.update(scene, 0);
  stage.draw(1, 0);
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }));
  const image = new Image();
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = url;
  });
  const canvas = Object.assign(document.createElement('canvas'), { width: EXPORT_SIZE, height: EXPORT_SIZE });
  const context = canvas.getContext('2d');
  context.fillStyle = scene.colors.background ?? PAPER;
  context.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE);
  context.drawImage(image, 0, 0, EXPORT_SIZE, EXPORT_SIZE);
  URL.revokeObjectURL(url);
  const png = canvas.toDataURL('image/png');
  Object.assign(document.createElement('a'), { href: png, download: 'scribble-avatar.png' }).click();
  return png;
}
