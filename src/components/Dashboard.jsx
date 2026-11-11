import React, { useMemo } from 'react';
import {
  LayoutDashboard, Calculator, Briefcase, TrendingUp, Wallet,
  Users, FolderOpen, ArrowUpRight, Sparkles, BarChart3, Clock, Settings2,
  Plus, Trash2, ChevronRight, FileText, Activity, Target, Layers, RefreshCw,
  CalendarDays, Award, PieChart
} from 'lucide-react';
import { SERVICES } from './ServiceSelector';
import { Button } from './ui';
import { getProfile, toolsForPreferences } from '../config/profiles';
import { readBudget } from '../utils/workspaceStorage';

const TYPE_META = {
  budget: { label: 'Orçamento', color: '#10b981' },
  identity: { label: 'Identidade Visual', color: '#4f46e5' },
  businesscard: { label: 'Cartão de Visita', color: '#f59e0b' },
  letterhead: { label: 'Papel Timbrado', color: '#8b5cf6' },
  presentation: { label: 'Apresentação', color: '#0ea5e9' },
  artshowcase: { label: 'Showcase de Arte', color: '#ec4899' },
  moodboard: { label: 'Moodboard', color: '#14b8a6' },
  wifisign: { label: 'Placa de Balcão', color: '#f97316' },
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);

const parseDate = (timestamp) => {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatRelative = (timestamp) => {
  const date = parseDate(timestamp);
  if (!date) return '';
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'agora mesmo';
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d atrás`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

const formatDateLabel = (date) =>
  date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

const monthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`;

const readBudgetDraft = (userId) => {
  try {
    const parsed = readBudget(userId);
    if (!parsed) return null;
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    const total = items.reduce(
      (sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1),
      0
    );
    return {
      clientName: parsed.clientName || '',
      projectName: parsed.projectName || '',
      items,
      total,
      presetCount: Array.isArray(parsed.fixedValues) ? parsed.fixedValues.length : 0,
      businessType: parsed.businessType || '',
    };
  } catch {
    return null;
  }
};

export default function Dashboard({
  currentUser,
  companyData,
  finalizedProjects,
  history,
  onOpenService,
  onOpenCompany,
  onOpenGallery,
  onResetStats,
  preferences = { profileId: 'design' },
  onCustomize,
}) {
  const draft = useMemo(() => readBudgetDraft(currentUser?.id), [currentUser?.id]);
  const profile = getProfile(preferences.profileId);
  const selectedServices = toolsForPreferences(preferences).map(id => SERVICES.find(service => service.id === id)).filter(Boolean);

  const stats = useMemo(() => {
    const gallery = Array.isArray(finalizedProjects) ? finalizedProjects : [];
    const manuals = Array.isArray(history) ? history : [];

    const budgetEntries = gallery.filter((project) => project.type === 'budget');
    const totalValue = budgetEntries.reduce((sum, project) => sum + (Number(project.total) || 0), 0);
    const averageTicket = budgetEntries.length ? totalValue / budgetEntries.length : 0;

    const clientsMap = budgetEntries.reduce((acc, project) => {
      const name = (project.client || '').trim();
      if (!name) return acc;
      const current = acc[name] || { name, total: 0, count: 0 };
      current.total += Number(project.total) || 0;
      current.count += 1;
      acc[name] = current;
      return acc;
    }, {});

    const allClientNames = new Set(
      gallery.map((project) => (project.client || '').trim()).filter(Boolean)
    );

    const activity = [
      ...gallery.map((project) => ({
        id: `p-${project.id}`,
        title: project.title || project.project || 'Projeto',
        type: project.type || 'identity',
        client: project.client || '',
        total: Number(project.total) || 0,
        timestamp: project.timestamp,
        image: project.image || null,
      })),
      ...manuals.map((entry) => ({
        id: `m-${entry.id}`,
        title: entry.brandName || 'Manual de Marca',
        type: 'identity',
        client: '',
        total: 0,
        timestamp: entry.timestamp,
        image: null,
      })),
    ].sort((a, b) => {
      const dateA = parseDate(a.timestamp)?.getTime() || 0;
      const dateB = parseDate(b.timestamp)?.getTime() || 0;
      return dateB - dateA;
    });

    const now = new Date();
    const last30Days = activity.filter((item) => {
      const date = parseDate(item.timestamp);
      return date && Date.now() - date.getTime() < 30 * 24 * 60 * 60 * 1000;
    }).length;

    const currentMonthKey = monthKey(now);
    const monthBudgets = budgetEntries.filter((project) => {
      const date = parseDate(project.timestamp);
      return date && monthKey(date) === currentMonthKey;
    });
    const monthRevenue = monthBudgets.reduce((sum, project) => sum + (Number(project.total) || 0), 0);
    const monthProjects = activity.filter((item) => {
      const date = parseDate(item.timestamp);
      return date && monthKey(date) === currentMonthKey;
    }).length;

    const distributionMap = activity.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});

    const distribution = Object.entries(distributionMap)
      .map(([type, count]) => ({
        type,
        count,
        label: TYPE_META[type]?.label || type,
        color: TYPE_META[type]?.color || '#64748b',
      }))
      .sort((a, b) => b.count - a.count);

    const monthly = [];
    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const key = monthKey(date);
      const monthProjectsList = activity.filter((item) => {
        const itemDate = parseDate(item.timestamp);
        return itemDate && monthKey(itemDate) === key;
      });
      const monthBudgetValue = budgetEntries
        .filter((project) => {
          const itemDate = parseDate(project.timestamp);
          return itemDate && monthKey(itemDate) === key;
        })
        .reduce((sum, project) => sum + (Number(project.total) || 0), 0);
      monthly.push({
        key,
        label: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        total: monthBudgetValue,
        count: monthProjectsList.length,
      });
    }
    const maxMonthly = monthly.reduce((max, item) => Math.max(max, item.total), 0);

    const topClients = Object.values(clientsMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      totalProjects: gallery.length + manuals.length,
      budgetCount: budgetEntries.length,
      totalValue,
      averageTicket,
      clients: allClientNames.size,
      activity: activity.slice(0, 6),
      last30Days,
      monthRevenue,
      monthProjects,
      monthBudgetCount: monthBudgets.length,
      distribution,
      maxDistribution: distribution.reduce((max, item) => Math.max(max, item.count), 1),
      monthly,
      maxMonthly,
      topClients,
    };
  }, [finalizedProjects, history]);

  const firstName = (currentUser?.name || '').trim().split(/\s+/)[0] || 'criador';
  const companyReady = Boolean(companyData?.companyName);
  const presetCount = draft?.presetCount || 0;
  const hasDraft = Boolean(draft && draft.items.length > 0);

  const statCards = [
    {
      label: 'Projetos criados',
      value: stats.totalProjects,
      hint: `${stats.last30Days} nos últimos 30 dias`,
      icon: FolderOpen,
      tone: 'indigo',
    },
    {
      label: 'Orçamentos',
      value: stats.budgetCount,
      hint: `${stats.monthBudgetCount} gerados neste mês`,
      icon: Calculator,
      tone: 'emerald',
    },
    {
      label: 'Valor total orçado',
      value: formatCurrency(stats.totalValue),
      hint: 'Somatório dos orçamentos salvos',
      icon: Wallet,
      tone: 'amber',
    },
    {
      label: 'Ticket médio',
      value: formatCurrency(stats.averageTicket),
      hint: 'Média por orçamento',
      icon: TrendingUp,
      tone: 'sky',
    },
    {
      label: 'Faturamento no mês',
      value: formatCurrency(stats.monthRevenue),
      hint: `${stats.monthProjects} projetos registrados`,
      icon: CalendarDays,
      tone: 'teal',
    },
    {
      label: 'Clientes atendidos',
      value: stats.clients,
      hint: 'Clientes únicos registrados',
      icon: Users,
      tone: 'violet',
    },
    {
      label: 'Identidades visuais',
      value: stats.totalProjects - stats.budgetCount,
      hint: `${stats.distribution.length} tipos de material`,
      icon: FileText,
      tone: 'rose',
    },
    {
      label: 'Presets ativos',
      value: presetCount,
      hint: draft?.businessType || 'Personalize no orçamento',
      icon: Layers,
      tone: 'slate',
    },
  ];

  return (
    <div className="dashboard-screen" role="main" id="main-content" tabIndex={-1}>
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="dashboard-heading">
            <span className="dashboard-eyebrow">
              <LayoutDashboard size={14} /> Painel de controle
            </span>
            <h1>{profile.homeTitle}</h1>
            <p>Olá, {firstName}. Seu espaço de trabalho está pronto para você.</p>
          </div>

          <div className="dashboard-header-actions">
            <Button onClick={onCustomize}><Settings2 size={15} />Personalizar início</Button>
            <div className="dashboard-date">
              <Clock size={14} />
              <span>{formatDateLabel(new Date())}</span>
            </div>
            <button type="button" className="dashboard-reset-btn" onClick={onResetStats}>
              <Trash2 size={14} />
              <span>Limpar estatísticas</span>
            </button>
          </div>
        </header>

        <section className="studio-hero">
          <div className="studio-hero-copy"><span className="ds-eyebrow">{profile.label}</span><h2>{profile.heroTitle}<br /><em>{profile.heroAccent}</em></h2><p>{profile.heroDescription}</p><Button variant="light" onClick={() => onOpenService(profile.destination)}><Plus size={17} />{profile.action}<ArrowUpRight size={17} /></Button><span className="studio-hero-caption">Seu trabalho. Seu ritmo. Todos os detalhes.</span></div>
          <div className="studio-hero-art" aria-hidden="true"><div className="studio-art-sheet"><span>FORMA / SEU NEGÓCIO</span><i /><strong>{profile.id === 'design' ? <>Design que<br />deixa marca.</> : <>Feito com<br />cuidado.</>}</strong><div className="studio-art-rule" /><small>{profile.label.toUpperCase()}<br />SEU TRABALHO / SEU VALOR</small></div><div className="studio-art-card"><Layers size={26} strokeWidth={1} /><span>Feito para<br /><em>ser lembrado.</em></span><small>FORMA</small></div><span className="studio-art-dot" /></div>
        </section>

        {!preferences.configured && <div className="profile-welcome"><div><strong>Um espaço que combina com seu trabalho</strong><p>Você trabalha com design, artesanato ou outro negócio? Personalize seus atalhos e sugestões.</p></div><Button onClick={onCustomize}>Escolher meu perfil<ArrowUpRight size={16} /></Button></div>}
        {profile.id !== 'design' && <section className="profile-shortcuts" aria-label="Atalhos para seu negócio"><button onClick={() => onOpenService('budget', 'calc')}><Calculator size={20} /><span><strong>Calcular preço</strong><small>Materiais, tempo e margem</small></span><ChevronRight size={16} /></button><button onClick={() => onOpenService('budget')}><FileText size={20} /><span><strong>Preparar orçamento</strong><small>Uma proposta para seu cliente</small></span><ChevronRight size={16} /></button><button onClick={onOpenCompany}><Briefcase size={20} /><span><strong>Dados do meu negócio</strong><small>Sua identidade nos documentos</small></span><ChevronRight size={16} /></button></section>}

        <section className="dashboard-panel dashboard-services">
          <div className="dashboard-panel-head">
            <div>
              <span className="dashboard-panel-eyebrow">
                <Sparkles size={14} /> Estúdio de criação
              </span>
              <h2>{profile.id === 'design' ? 'O que vamos criar hoje?' : 'Ferramentas para sua rotina'}</h2>
              <p className="dashboard-panel-subtitle">Seus atalhos, na ordem que faz sentido para você.</p>
            </div>
            <Button variant="ghost" onClick={() => onOpenService('materials')}>Todas as ferramentas<ArrowUpRight size={15} /></Button>
          </div>

          <div className="dashboard-services-grid">
            {selectedServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <button
                  key={service.id}
                  type="button"
                  className="dashboard-service-card"
                  onClick={() => onOpenService(service.id)}
                  style={{ '--service-color': service.color, '--service-gradient': service.gradient }}
                >
                  <div className={`material-preview material-preview--${service.id}`} aria-hidden="true"><div className="material-preview-paper"><span>FORMA</span><Icon size={25} strokeWidth={1.1} /><i /><i /><small>{String(index + 1).padStart(2, '0')} / ESTÚDIO</small></div><div className="material-preview-detail" /></div>
                  <div className="dashboard-service-icon">
                    <Icon size={20} />
                  </div>
                  <div className="dashboard-service-info">
                    <strong>{service.name}</strong>
                    <span>{service.description}</span>
                  </div>
                  <ChevronRight size={16} className="dashboard-service-arrow" />
                </button>
              );
            })}
          </div>
        </section>


        <section className="dashboard-stats">
          {statCards.slice(0, 4).map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.label} className={`dashboard-stat-card tone-${card.tone}`}>
                <div className="dashboard-stat-icon">
                  <Icon size={20} />
                </div>
                <div className="dashboard-stat-body">
                  <span className="dashboard-stat-label">{card.label}</span>
                  <strong className="dashboard-stat-value">{card.value}</strong>
                  <span className="dashboard-stat-hint">{card.hint}</span>
                </div>
              </article>
            );
          })}
        </section>

        <div className="dashboard-columns">
          <section className="dashboard-panel dashboard-activity">
            <div className="dashboard-panel-head">
              <div>
                <span className="dashboard-panel-eyebrow">
                  <Activity size={14} /> Atividade
                </span>
                <h2>Projetos recentes</h2>
              </div>
              <button type="button" className="dashboard-link-btn" onClick={onOpenGallery}>
                Ver galeria <ArrowUpRight size={14} />
              </button>
            </div>

            {stats.activity.length === 0 ? (
              <div className="dashboard-empty">
                <Sparkles size={32} />
                <h3>Nenhuma atividade ainda</h3>
                <p>Gere seu primeiro orçamento ou manual para começar a preencher o painel.</p>
                <button type="button" className="dashboard-primary-btn" onClick={() => onOpenService('budget')}>
                  <Plus size={16} /> Criar orçamento
                </button>
              </div>
            ) : (
              <ul className="dashboard-activity-list">
                {stats.activity.map((item) => {
                  const meta = TYPE_META[item.type] || { label: item.type, color: '#64748b' };
                  return (
                    <li key={item.id} className="dashboard-activity-item">
                      <div className="dashboard-activity-thumb" style={{ '--activity-color': meta.color }}>
                        {item.image ? <img src={item.image} alt="" /> : <BarChart3 size={18} />}
                      </div>
                      <div className="dashboard-activity-info">
                        <strong>{item.title}</strong>
                        <span>
                          {meta.label}
                          {item.client ? ` • ${item.client}` : ''}
                        </span>
                      </div>
                      <div className="dashboard-activity-meta">
                        {item.total > 0 && <strong>{formatCurrency(item.total)}</strong>}
                        <span>{formatRelative(item.timestamp)}</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <aside className="dashboard-side">
            <section className="dashboard-panel dashboard-distribution">
              <div className="dashboard-panel-head compact">
                <div>
                  <span className="dashboard-panel-eyebrow">
                    <Target size={14} /> Distribuição
                  </span>
                  <h2>Por tipo de material</h2>
                </div>
              </div>

              {stats.distribution.length === 0 ? (
                <p className="dashboard-muted">Sem dados suficientes por enquanto.</p>
              ) : (
                <div className="dashboard-distribution-list">
                  {stats.distribution.map((item) => (
                    <div key={item.type} className="dashboard-distribution-row">
                      <div className="dashboard-distribution-label">
                        <span className="dashboard-dot" style={{ background: item.color }} />
                        <span>{item.label}</span>
                        <strong>{item.count}</strong>
                      </div>
                      <div className="dashboard-bar">
                        <div
                          className="dashboard-bar-fill"
                          style={{
                            width: `${Math.max(8, (item.count / stats.maxDistribution) * 100)}%`,
                            background: item.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="dashboard-panel dashboard-company">
              <div className="dashboard-panel-head compact">
                <div>
                  <span className="dashboard-panel-eyebrow">
                    <Briefcase size={14} /> Minha empresa
                  </span>
                  <h2>Dados do emissor</h2>
                </div>
              </div>

              <div className="dashboard-company-body">
                <div className="dashboard-company-logo">
                  {companyData?.logo ? (
                    <img src={companyData.logo} alt="" />
                  ) : (
                    <Briefcase size={20} />
                  )}
                </div>
                <div className="dashboard-company-info">
                  <strong>{companyData?.companyName || 'Empresa não configurada'}</strong>
                  <span>{companyData?.companyEmail || 'Adicione seus dados para os documentos'}</span>
                </div>
                <button type="button" className="dashboard-icon-btn" onClick={onOpenCompany} title="Editar empresa">
                  <Settings2 size={16} />
                </button>
              </div>

              <div className={`dashboard-status ${companyReady ? 'is-ready' : ''}`}>
                <span className="dashboard-status-dot" />
                <span>{companyReady ? 'Pronta para gerar documentos' : 'Complete o cadastro da empresa'}</span>
              </div>
            </section>

            <section className="dashboard-panel dashboard-draft">
              <div className="dashboard-panel-head compact">
                <div>
                  <span className="dashboard-panel-eyebrow">
                    <Layers size={14} /> Em andamento
                  </span>
                  <h2>Orçamento atual</h2>
                </div>
              </div>

              {hasDraft ? (
                <div className="dashboard-draft-body">
                  <div className="dashboard-draft-info">
                    <strong>{draft.projectName || draft.clientName || 'Orçamento sem título'}</strong>
                    <span>
                      {draft.items.length} {draft.items.length === 1 ? 'item' : 'itens'}
                      {draft.businessType ? ` • ${draft.businessType}` : ''}
                    </span>
                  </div>
                  <div className="dashboard-draft-total">{formatCurrency(draft.total)}</div>
                  <button type="button" className="dashboard-primary-btn full" onClick={() => onOpenService('budget')}>
                    <RefreshCw size={15} /> Continuar orçamento
                  </button>
                </div>
              ) : (
                <div className="dashboard-draft-empty">
                  <p>Nenhum rascunho salvo. Comece uma proposta agora.</p>
                  <button type="button" className="dashboard-primary-btn full" onClick={() => onOpenService('budget')}>
                    <Plus size={15} /> Novo orçamento
                  </button>
                </div>
              )}
            </section>
          </aside>
        </div>

        <div className="dashboard-columns dashboard-columns-lower">
          <section className="dashboard-panel dashboard-evolution">
            <div className="dashboard-panel-head">
              <div>
                <span className="dashboard-panel-eyebrow">
                  <PieChart size={14} /> Desempenho
                </span>
                <h2>Evolução dos últimos 6 meses</h2>
              </div>
              <span className="dashboard-pill">{formatCurrency(stats.monthRevenue)} neste mês</span>
            </div>

            <div className="dashboard-chart">
              {stats.monthly.map((item) => {
                const height = stats.maxMonthly > 0
                  ? Math.max(item.total > 0 ? 6 : 2, (item.total / stats.maxMonthly) * 100)
                  : 2;
                return (
                  <div key={item.key} className="dashboard-chart-col">
                    <div className="dashboard-chart-value">
                      {item.total > 0 ? formatCurrency(item.total) : '—'}
                    </div>
                    <div className="dashboard-chart-track">
                      <div
                        className={`dashboard-chart-bar ${item.total > 0 ? 'has-value' : ''}`}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="dashboard-chart-label">{item.label}</span>
                    <span className="dashboard-chart-count">
                      {item.count} {item.count === 1 ? 'projeto' : 'projetos'}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="dashboard-side">
            <section className="dashboard-panel dashboard-clients">
              <div className="dashboard-panel-head compact">
                <div>
                  <span className="dashboard-panel-eyebrow">
                    <Award size={14} /> Ranking
                  </span>
                  <h2>Top clientes</h2>
                </div>
              </div>

              {stats.topClients.length === 0 ? (
                <p className="dashboard-muted">Os clientes aparecerão aqui após os orçamentos serem salvos.</p>
              ) : (
                <ul className="dashboard-clients-list">
                  {stats.topClients.map((client, index) => (
                    <li key={client.name} className="dashboard-client-item">
                      <span className="dashboard-client-rank">{index + 1}</span>
                      <div className="dashboard-client-info">
                        <strong>{client.name}</strong>
                        <span>{client.count} {client.count === 1 ? 'orçamento' : 'orçamentos'}</span>
                      </div>
                      <strong className="dashboard-client-total">{formatCurrency(client.total)}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="dashboard-panel dashboard-goal">
              <div className="dashboard-panel-head compact">
                <div>
                  <span className="dashboard-panel-eyebrow">
                    <TrendingUp size={14} /> Resumo
                  </span>
                  <h2>Visão geral</h2>
                </div>
              </div>
              <div className="dashboard-summary-grid">
                <div>
                  <span>Últimos 30 dias</span>
                  <strong>{stats.last30Days}</strong>
                </div>
                <div>
                  <span>Média mensal</span>
                  <strong>{formatCurrency(stats.totalValue / 6)}</strong>
                </div>
                <div>
                  <span>Materiais distintos</span>
                  <strong>{stats.distribution.length}</strong>
                </div>
                <div>
                  <span>Presets prontos</span>
                  <strong>{presetCount}</strong>
                </div>
              </div>
            </section>
          </aside>
        </div>


        <footer className="dashboard-footer">
          <span>{companyData?.companyName || 'Estúdio de criação'}</span>
          <span className="dashboard-footer-sep" />
          <span>{stats.totalProjects} projetos registrados</span>
          <span className="dashboard-footer-sep" />
          <span>{formatCurrency(stats.totalValue)} em propostas</span>
        </footer>
      </div>
    </div>
  );
}
