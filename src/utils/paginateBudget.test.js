import { expect, it } from 'vitest';
import paginateBudget from './paginateBudget';

const items = count => Array.from({ length: count }, (_, id) => ({ id, name: `Item ${id + 1}`, price: 25, quantity: 1 }));

it('reserva a folha final quando os itens cabem na primeira folha, mas o fechamento não', () => {
  const input = items(5);
  const pages = paginateBudget({ items: input, additionalNotes: 'Condições', showPixBox: true, pixKey: 'chave' });
  expect(pages).toHaveLength(2);
  expect(pages[0].isFirstPage).toBe(true);
  expect(pages[1].isLastPage).toBe(true);
  expect(pages.flatMap(page => page.items)).toEqual(input);
});

it.each([1, 5, 6, 12, 30])('preserva todos os %i itens na ordem e um único fechamento', count => {
  const input = items(count);
  const pages = paginateBudget({ items: input });
  expect(pages.flatMap(page => page.items)).toEqual(input);
  expect(pages.filter(page => page.isLastPage)).toHaveLength(1);
  expect(pages.at(-1).isLastPage).toBe(true);
  expect(pages.every(page => page.totalPages === pages.length)).toBe(true);
});

it('respeita a quantidade configurada por folha', () => {
  const pages = paginateBudget({ items: items(7) }, '2');
  expect(pages.map(page => page.items.length)).toEqual([2, 2, 2, 1]);
});
