import { beforeEach, expect, it } from 'vitest';
import { readBudget } from './workspaceStorage';

beforeEach(() => localStorage.clear());

it('migra o rascunho antigo uma única vez e o mantém isolado por conta', () => {
  const legacy = { projectName: 'Encomenda antiga', items: [{ name: 'Peça', price: 95 }] };
  localStorage.setItem('budget_data', JSON.stringify(legacy));
  expect(readBudget(7)).toEqual(legacy);
  expect(JSON.parse(localStorage.getItem('7_budget_data'))).toEqual(legacy);
  expect(readBudget(8)).toBeNull();
  localStorage.setItem('8_budget_data', JSON.stringify({ projectName: 'Outra conta' }));
  expect(readBudget(8).projectName).toBe('Outra conta');
  expect(readBudget(7)).toEqual(legacy);
});
