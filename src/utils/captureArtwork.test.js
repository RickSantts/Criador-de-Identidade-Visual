import { expect, it, vi } from 'vitest';
import html2canvas from 'html2canvas';
import captureArtwork from './captureArtwork';

vi.mock('html2canvas', () => ({ default: vi.fn() }));

it('remove a escala apenas na cópia usada para exportar', async () => {
  const clone = document.implementation.createHTMLDocument();
  clone.body.innerHTML = '<div style="display:none"><div class="preview-fit-frame" style="width:280px;height:280px;overflow:hidden"><div data-preview-frame-content style="width:600px;transform:scale(.46)"><div id="art" style="width:600px;height:600px"></div></div></div></div>';
  const source = document.createElement('div');
  const onclone = vi.fn();
  vi.mocked(html2canvas).mockImplementation(async (element, options) => { await options.onclone(clone, clone.getElementById('art')); return 'canvas'; });
  expect(await captureArtwork(source, { scale: 2, onclone, width: 0, height: 0 })).toBe('canvas');
  expect(clone.querySelector('[data-preview-frame-content]').style.transform).toBe('none');
  const stage = clone.querySelector('.preview-fit-frame');
  expect(stage.parentElement).toBe(clone.body);
  expect(stage.style.width).toBe('600px');
  expect(stage.style.overflow).toBe('visible');
  expect(html2canvas.mock.calls[0][1]).not.toHaveProperty('width');
  expect(html2canvas.mock.calls[0][1]).not.toHaveProperty('height');
  expect(onclone).toHaveBeenCalledOnce();
});
