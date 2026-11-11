import React from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import html2canvas from 'html2canvas';
import BudgetEditor from './BudgetEditor';

const pdfs = vi.hoisted(() => []);
vi.mock('html2canvas', () => ({ default: vi.fn() }));
vi.mock('jspdf', () => ({ default: vi.fn(function () {
  const pdf = { addPage: vi.fn(), addImage: vi.fn(), save: vi.fn() };
  pdfs.push(pdf);
  return pdf;
}) }));

beforeEach(() => {
  localStorage.clear();
  pdfs.length = 0;
  vi.mocked(html2canvas).mockReset();
  vi.mocked(html2canvas).mockImplementation(async (element, options) => {
    const clone = document.implementation.createHTMLDocument();
    clone.body.innerHTML = document.body.innerHTML;
    options.onclone?.(clone);
    const sheet = clone.getElementById(element.id);
    expect(sheet.style.top).toBe('0px');
    expect(sheet.style.left).toBe('0px');
    expect(sheet.style.position).toBe('absolute');
    expect(clone.getElementById('budget-export-stage').style.left).toBe('0px');
    expect(options).not.toHaveProperty('x');
    expect(options).not.toHaveProperty('y');
    return { toDataURL: () => `image:${element.id}` };
  });
});
afterEach(() => { cleanup(); window.innerWidth = 1024; });

it.each([320, 375, 768, 900, 1280])('mantém as etapas acessíveis na largura de %i px', width => {
  window.innerWidth = width;
  render(<BudgetEditor userId={7} />);
  const nav = screen.getByRole('navigation', { name: 'Etapas do orçamento' });
  expect(nav.classList.contains('budget-mobile-bottom-nav')).toBe(width <= 900);
  expect(nav.querySelectorAll('button')).toHaveLength(7);
  expect(nav.querySelector('[aria-current="step"]')).toBeTruthy();
});

it('abre e fecha o painel de item no celular com campos identificados e foco contido', async () => {
  window.innerWidth = 375;
  const user = userEvent.setup();
  render(<BudgetEditor userId={7} />);
  const trigger = screen.getByRole('button', { name: 'Adicionar item', exact: true });
  await user.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Adicionar ou editar item' });
  expect(dialog.parentElement.parentElement).toBe(document.body);
  expect(screen.getByLabelText('Nome do Serviço ou Produto *')).toBeTruthy();
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

it.each([2, 7])('exporta todas as folhas distintas com %i itens e salva o orçamento completo', async count => {
  const items = Array.from({ length: count }, (_, id) => ({ id, name: `Produto ${id}`, price: 30, quantity: 1 }));
  localStorage.setItem('7_budget_data', JSON.stringify({ items, itemsPerPage: '2' }));
  const onSave = vi.fn();
  const user = userEvent.setup();
  render(<BudgetEditor userId={7} initialTab="pdf" onSave={onSave} />);
  const sheets = Array.from(document.querySelectorAll('#budget-export-stage .budget-export-page'));
  expect(sheets).toHaveLength(Math.ceil(count / 2));
  expect(document.getElementById('budget-export-stage').parentElement).toBe(document.body);
  await user.click(screen.getByRole('button', { name: 'Baixar PDF' }));
  await waitFor(() => expect(pdfs[0]?.save).toHaveBeenCalledOnce());
  expect(html2canvas).toHaveBeenCalledTimes(sheets.length);
  expect(pdfs[0].addPage).toHaveBeenCalledTimes(sheets.length - 1);
  expect(pdfs[0].addImage.mock.calls.map(args => args[0])).toEqual(sheets.map(sheet => `image:${sheet.id}`));
  expect(onSave.mock.calls[0][0].data.items).toEqual(items);
});

it('não salva um arquivo parcial nem envia à galeria se uma folha falhar', async () => {
  localStorage.setItem('7_budget_data', JSON.stringify({ items: Array.from({ length: 6 }, (_, id) => ({ id, name: `Produto ${id}`, price: 25, quantity: 1 })), itemsPerPage: '2' }));
  const capture = vi.mocked(html2canvas).getMockImplementation();
  vi.mocked(html2canvas).mockImplementation(async (element, options) => {
    if (element.id === 'export-page-2') throw new Error('Falha na segunda folha');
    return capture(element, options);
  });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const onSave = vi.fn();
  const user = userEvent.setup();
  render(<BudgetEditor userId={7} initialTab="pdf" onSave={onSave} />);
  await user.click(screen.getByRole('button', { name: 'Baixar PDF' }));
  await screen.findByText('Erro ao gerar PDF: Falha na segunda folha');
  expect(pdfs[0].save).not.toHaveBeenCalled();
  expect(onSave).not.toHaveBeenCalled();
});
