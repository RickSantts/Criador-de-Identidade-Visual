import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import PreviewFrame from './PreviewFrame';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it.each([240, 288, 343, 600, 1000])('ajusta a prévia ao espaço útil de %i px sem alterar a largura da arte', available => {
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function () { return this.className === 'preview-fit-frame' ? available : 794; });
  vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(1123);
  const { container } = render(<PreviewFrame width={794} height={1123}><div style={{ width: 794 }}>Arte</div></PreviewFrame>);
  const scale = Math.min(1, available / 794);
  expect(container.querySelector('[data-preview-frame-content]').style.transform).toBe(`scale(${scale})`);
  expect(container.querySelector('[data-preview-frame-content]').style.width).toBe('794px');
  expect(parseFloat(container.firstChild.style.height)).toBeCloseTo(1123 * scale);
});

it('recalcula a escala ao mudar o tamanho da tela', () => {
  let available = 280;
  vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function () { return this.className === 'preview-fit-frame' ? available : 600; });
  const { container } = render(<PreviewFrame width={600}><div>Arte</div></PreviewFrame>);
  available = 500;
  act(() => window.dispatchEvent(new Event('resize')));
  expect(container.querySelector('[data-preview-frame-content]').style.transform).toBe(`scale(${500 / 600})`);
});
