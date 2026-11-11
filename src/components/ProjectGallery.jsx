import React, { useMemo, useState } from 'react';
import { Search, FolderOpen, Plus, Download, ArrowUpRight, Trash2, FileText, X } from 'lucide-react';
import { SERVICES } from './ServiceSelector';
import ConfirmDialog from './ConfirmDialog';
import { Button, EmptyState, PageHeading } from './ui';

export default function ProjectGallery({ projects, onDelete, onOpen, onCreate }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [pendingDelete, setPendingDelete] = useState(null);
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const categories = SERVICES.filter(s => projects.some(p => p.type === s.id));
  const filtered = useMemo(() => projects.filter(p => (category === 'all' || p.type === category) && normalize(`${p.title} ${p.client || ''}`).includes(normalize(query))), [projects, category, query]);
  const confirmDelete = () => {
    if (onDelete(pendingDelete) !== false) setPendingDelete(null);
  };
  return <main className="project-gallery" id="main-content" tabIndex={-1}>
    <PageHeading eyebrow="SEU ARQUIVO CRIATIVO" title="Meus projetos" description="Tudo o que você criou. Organizado, acessível e pronto para o próximo passo." actions={<Button variant="primary" onClick={onCreate}><Plus size={17} />Novo material</Button>} />
    <div className="gallery-toolbar"><div className="ds-search"><Search size={18} /><input aria-label="Buscar projetos" placeholder="Buscar por projeto ou cliente…" value={query} onChange={event => setQuery(event.target.value)} />{query && <button className="ds-icon-button" aria-label="Limpar busca" onClick={() => setQuery('')}><X size={17} /></button>}</div><label className="gallery-filter"><span>Tipo de material</span><select value={category} onChange={event => setCategory(event.target.value)}><option value="all">Todos os materiais</option>{categories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label><span className="gallery-count" role="status">{filtered.length} {filtered.length === 1 ? 'projeto' : 'projetos'}</span></div>
    {filtered.length === 0 ? <EmptyState icon={FolderOpen} title={projects.length ? 'Nenhum resultado por aqui' : 'Seu próximo projeto começa aqui'} description={projects.length ? 'Experimente outro nome ou selecione todos os materiais.' : 'Crie seu primeiro material e salve-o para construir sua coleção.'}>{projects.length ? <Button onClick={() => { setQuery(''); setCategory('all'); }}>Limpar filtros</Button> : <Button variant="primary" onClick={onCreate}><Plus size={16} />Criar primeiro material</Button>}</EmptyState> : <div className="project-grid">{filtered.map(project => {
      const service = SERVICES.find(s => s.id === project.type);
      const Icon = service?.icon || FileText;
      return <article className="project-card" key={project.id}>
        <div className="project-thumbnail">{project.image ? <img src={project.image} alt={`Prévia de ${project.title}`} /> : <div className="project-document"><Icon size={30} strokeWidth={1.2} /><span>{service?.name || 'Documento'}</span><i /><i /><i /></div>}<span className="project-type">{service?.name || 'Material'}</span></div>
        <div className="project-card-body"><h2>{project.title || 'Projeto sem título'}</h2><p>{project.client || 'Projeto do estúdio'}{project.date ? ` · ${project.date}` : ''}</p>{Number(project.total) > 0 && <strong className="project-value">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(project.total)}</strong>}<div className="project-card-actions">{project.image ? <a className="ds-button ds-button--secondary" href={project.image} download={`${project.title || 'projeto'}.png`}><Download size={15} />Baixar material</a> : <Button onClick={() => onOpen(project)}><ArrowUpRight size={16} />Abrir projeto</Button>}<Button variant="ghost" className="project-delete" aria-label={`Excluir ${project.title}`} onClick={() => setPendingDelete(project)}><Trash2 size={17} /></Button></div></div>
      </article>;
    })}</div>}
    <ConfirmDialog open={!!pendingDelete} title="Excluir projeto?" message={`O projeto “${pendingDelete?.title || 'Sem título'}” será removido da sua galeria. Esta ação não pode ser desfeita.`} confirmLabel="Excluir projeto" variant="danger" onCancel={() => setPendingDelete(null)} onConfirm={confirmDelete} />
  </main>;
}
