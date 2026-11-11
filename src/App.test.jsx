import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

vi.mock('html2canvas', () => ({ default: vi.fn() }));
vi.mock('jspdf', () => ({ default: vi.fn() }));

const project = { id: 42, title: 'Proposta Aurora', type: 'budget', total: 1500, client: 'Aurora', timestamp: new Date().toISOString(), data: {} };
const storageKey = '7_finalized_projects';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('brandManual_current_user', JSON.stringify({ id: 7, name: 'Designer' }));
  localStorage.setItem(storageKey, JSON.stringify([project]));
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
});
afterEach(() => cleanup());

async function openGallery(user) {
  await user.click(screen.getByRole('button', { name: 'Meus projetos' }));
  return screen.getByRole('main');
}

describe('Exclusão real na galeria', () => {
  it('abre confirmação sobre a página, cancela sem excluir e devolve o foco à lixeira', async () => {
    const user = userEvent.setup();
    render(<App />);
    await openGallery(user);
    const trash = screen.getByRole('button', { name: 'Excluir Proposta Aurora' });
    await user.click(trash);
    const dialog = screen.getByRole('alertdialog', { name: 'Excluir projeto?' });
    expect(dialog.parentElement.parentElement).toBe(document.body);
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Cancelar' }));
    await user.tab();
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Excluir projeto' }));
    await user.tab();
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Fechar' }));
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Excluir projeto' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(document.activeElement).toBe(trash);
    expect(JSON.parse(localStorage.getItem(storageKey))).toHaveLength(1);
  });

  it('exclui somente após confirmar, persiste e continua excluído ao recarregar', async () => {
    const user = userEvent.setup();
    const view = render(<App />);
    await openGallery(user);
    await user.click(screen.getByRole('button', { name: 'Excluir Proposta Aurora' }));
    expect(JSON.parse(localStorage.getItem(storageKey))).toHaveLength(1);
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Excluir projeto' }));
    expect(JSON.parse(localStorage.getItem(storageKey))).toEqual([]);
    expect(screen.queryByRole('button', { name: 'Excluir Proposta Aurora' })).toBeNull();
    expect(screen.getByText('Seu próximo projeto começa aqui')).toBeTruthy();
    view.unmount();
    render(<App />);
    await openGallery(user);
    expect(screen.queryByRole('button', { name: 'Excluir Proposta Aurora' })).toBeNull();
  });

  it('mantém o projeto e a confirmação se o armazenamento falhar', async () => {
    const user = userEvent.setup();
    render(<App />);
    await openGallery(user);
    await user.click(screen.getByRole('button', { name: 'Excluir Proposta Aurora' }));
    const original = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
      if (key === storageKey) throw new DOMException('Storage unavailable', 'QuotaExceededError');
      return original.call(this, key, value);
    });
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Excluir projeto' }));
    expect(screen.getByRole('alertdialog')).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(storageKey))).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Excluir Proposta Aurora' })).toBeTruthy();
  });
});

describe('Navegação e descoberta', () => {
  it.each([
    ['Identidade Visual', 'Identidade Visual'],
    ['Cartão de Visita', 'Cartão de Visita'],
    ['Papel Timbrado', 'Papel Timbrado'],
    ['Apresentação', 'Apresentação'],
    ['Showcase de Arte', 'Showcase de Arte'],
    ['Placa de Balcão', 'Placa de Balcão'],
    ['Moodboard', 'Moodboard Automático'],
    ['Orçamento', 'Orçamento'],
  ])('abre a categoria %s e permite voltar ao painel', async (category, heading) => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(within(screen.getByRole('navigation', { name: 'Principal' })).getByRole('button', { name: category }));
    expect(screen.getByRole('heading', { name: heading, exact: true })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Visão geral' }));
    expect(screen.getByRole('heading', { name: 'Seu espaço criativo.' })).toBeTruthy();
  });

  it('sai da conta também a partir de um editor', async () => {
    const user = userEvent.setup();
    render(<App />);
    await openGallery(user);
    await user.click(screen.getByRole('button', { name: 'Sair da conta' }));
    expect(screen.getByRole('heading', { name: 'Bem-vindo de volta' })).toBeTruthy();
    expect(screen.queryByRole('main')).toBeNull();
  });

  it('a confirmação de limpar estatísticas também funciona no painel', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Limpar estatísticas' }));
    expect(screen.getByRole('alertdialog', { name: 'Limpar estatísticas' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(JSON.parse(localStorage.getItem(storageKey))).toHaveLength(1);
  });

  it('busca projetos e limpa os filtros sem alterar os dados', async () => {
    const user = userEvent.setup();
    render(<App />);
    await openGallery(user);
    await user.type(screen.getByRole('textbox', { name: 'Buscar projetos' }), 'inexistente');
    expect(screen.getByText('Nenhum resultado por aqui')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(screen.getByRole('button', { name: 'Excluir Proposta Aurora' })).toBeTruthy();
  });

  it('abre a empresa e retorna ao painel pela navegação principal', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Minha empresa' }));
    expect(screen.getByRole('heading', { name: 'Minha Empresa' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Visão geral' }));
    expect(screen.queryByRole('heading', { name: 'Minha Empresa' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Seu espaço criativo.' })).toBeTruthy();
  });

  it('a busca de materiais encontra nomes sem acentos', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Criar um material' }));
    await user.type(screen.getByRole('textbox', { name: 'Buscar materiais' }), 'apresentacao');
    expect(screen.getByRole('heading', { name: 'Apresentação' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Cartão de Visita' })).toBeNull();
  });
});

describe('Espaço personalizado por perfil', () => {
  it('carrega preferências e projetos da conta escolhida ao trocar de usuário', async () => {
    const user = userEvent.setup();
    localStorage.setItem('brandManual_users', JSON.stringify([{ id: 8, name: 'Outra pessoa', password: 'teste-local' }]));
    localStorage.setItem('7_workspace_preferences', JSON.stringify({ profileId: 'artesanato', tools: ['budget'], configured: true }));
    localStorage.setItem('8_workspace_preferences', JSON.stringify({ profileId: 'design', tools: ['identity'], configured: true }));
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Seu ateliê, organizado.' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Sair da conta' }));
    await user.type(screen.getByLabelText('Nome'), 'Outra pessoa');
    await user.type(screen.getByLabelText('Senha'), 'teste-local');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(screen.getByRole('heading', { name: 'Seu espaço criativo.' })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('7_workspace_preferences')).profileId).toBe('artesanato');
    await openGallery(user);
    expect(screen.queryByRole('button', { name: 'Excluir Proposta Aurora' })).toBeNull();
    expect(JSON.parse(localStorage.getItem('7_finalized_projects'))).toHaveLength(1);
  });

  it('salva o perfil de artesanato, adapta os atalhos e mantém a escolha ao recarregar', async () => {
    const user = userEvent.setup();
    const view = render(<App />);
    await user.click(screen.getByRole('button', { name: 'Personalizar início' }));
    const dialog = screen.getByRole('dialog', { name: 'Personalize seu espaço' });
    await user.click(within(dialog).getByRole('radio', { name: /Artesanato e personalizados/ }));
    await user.click(within(dialog).getByRole('button', { name: 'Salvar personalização' }));
    expect(screen.getByRole('heading', { name: 'Seu ateliê, organizado.' })).toBeTruthy();
    const nav = screen.getByRole('navigation', { name: 'Principal' });
    expect(within(nav).getByRole('button', { name: 'Orçamento' })).toBeTruthy();
    expect(within(nav).queryByRole('button', { name: 'Identidade Visual' })).toBeNull();
    expect(within(nav).getByRole('button', { name: 'Todas as ferramentas' })).toBeTruthy();
    view.unmount();
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Seu ateliê, organizado.' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Criar orçamento', exact: true }));
    expect(screen.getByRole('button', { name: /Kit Personalizado/ })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /\+ Logomarca/ })).toBeNull();
    expect(JSON.parse(localStorage.getItem('7_budget_data')).businessType).toBe('Artesanato & Personalizados');
  });

  it('o atalho de calcular preço abre diretamente a calculadora', async () => {
    const user = userEvent.setup();
    localStorage.setItem('7_workspace_preferences', JSON.stringify({ profileId: 'artesanato', configured: true, tools: ['budget'] }));
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Calcular preço/ }));
    expect(screen.getByDisplayValue('Serviço Especial / Peça Confeccionada')).toBeTruthy();
  });

  it('cancelar a personalização mantém o perfil anterior', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Personalizar início' }));
    await user.click(screen.getByRole('radio', { name: /Artesanato e personalizados/ }));
    await user.click(screen.getByRole('button', { name: 'Cancelar', exact: true }));
    expect(screen.getByRole('heading', { name: 'Seu espaço criativo.' })).toBeTruthy();
    expect(localStorage.getItem('7_workspace_preferences')).toBeNull();
  });

  it('preserva itens e valores personalizados de um orçamento existente', async () => {
    const user = userEvent.setup();
    const draft = { businessType: 'Meu ateliê', fixedValues: [{ id: 9, name: 'Bordado exclusivo', price: 88 }], items: [{ id: 12, name: 'Pedido em andamento', price: 250, quantity: 1 }] };
    localStorage.setItem('7_budget_data', JSON.stringify(draft));
    localStorage.setItem('7_workspace_preferences', JSON.stringify({ profileId: 'artesanato', tools: ['budget'], configured: true }));
    render(<App />);
    await user.click(within(screen.getByRole('navigation', { name: 'Principal' })).getByRole('button', { name: 'Orçamento' }));
    expect(screen.getByRole('button', { name: /Bordado exclusivo/ })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('7_budget_data')).items).toEqual(draft.items);
  });
});
