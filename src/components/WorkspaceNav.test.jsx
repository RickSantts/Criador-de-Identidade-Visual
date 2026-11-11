import React from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkspaceNav from './WorkspaceNav';

afterEach(() => { cleanup(); window.innerWidth = 1024; });

it('abre o menu mobile, contém o foco, protege o conteúdo e fecha com Esc', async () => {
  window.innerWidth = 375;
  const user = userEvent.setup();
  render(<div><WorkspaceNav onNavigate={vi.fn()} onLogout={vi.fn()} /><main><button>Conteúdo</button></main></div>);
  const toggle = screen.getByRole('button', { name: 'Abrir navegação' });
  await user.click(toggle);
  const menu = screen.getByRole('dialog');
  expect(document.activeElement).toBe(within(menu).getByRole('button', { name: 'Visão geral' }));
  expect(screen.getByRole('main').inert).toBe(true);
  within(menu).getByRole('button', { name: 'Sair da conta' }).focus();
  await user.tab();
  expect(document.activeElement).toBe(toggle);
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(screen.getByRole('main').inert).toBeFalsy();
  expect(document.activeElement).toBe(toggle);
});

it('fecha o menu e libera o conteúdo ao ampliar para desktop', async () => {
  window.innerWidth = 375;
  const user = userEvent.setup();
  render(<WorkspaceNav onNavigate={vi.fn()} onLogout={vi.fn()} />);
  await user.click(screen.getByRole('button', { name: 'Abrir navegação' }));
  window.innerWidth = 1200;
  act(() => window.dispatchEvent(new Event('resize')));
  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.body.style.overflow).not.toBe('hidden');
});
