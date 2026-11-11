import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, FolderOpen, Building2, Layers, LogOut, Menu, X, ArrowUpRight, Settings2 } from 'lucide-react';
import { SERVICES } from './ServiceSelector';
import { getProfile, toolsForPreferences } from '../config/profiles';
import useCompactLayout from '../utils/useCompactLayout';

export default function WorkspaceNav({ active, user, company, onNavigate, onLogout, preferences = { profileId: 'design' }, onCustomize }) {
  const [expanded, setExpanded] = useState(false);
  const compact = useCompactLayout();
  const menuRef = useRef(null);
  const toggleRef = useRef(null);
  useEffect(() => { if (!compact) setExpanded(false); }, [compact]);
  useEffect(() => {
    if (!compact || !expanded) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const menu = menuRef.current;
    const controls = () => [toggleRef.current, ...menu.querySelectorAll('nav button, .workspace-user button')];
    controls()[1]?.focus();
    document.body.style.overflow = 'hidden';
    const background = Array.from(menu.parentElement.children).filter(element => !element.classList.contains('workspace-nav') && !element.classList.contains('workspace-mobile-header') && !element.classList.contains('workspace-nav-backdrop'));
    const previousInert = background.map(element => element.inert);
    background.forEach(element => { element.inert = true; });
    const handleKey = event => {
      if (event.key === 'Escape') { event.preventDefault(); setExpanded(false); }
      if (event.key !== 'Tab') return;
      const list = controls();
      if (event.shiftKey && document.activeElement === list[0]) { event.preventDefault(); list.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === list.at(-1)) { event.preventDefault(); list[0]?.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
      background.forEach((element, index) => { element.inert = previousInert[index]; });
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [compact, expanded]);
  const profile = getProfile(preferences.profileId);
  const spaceName = profile.id === 'design' ? 'Meu estúdio' : profile.id === 'artesanato' ? 'Meu ateliê' : 'Meu negócio';
  const services = toolsForPreferences(preferences).map(id => SERVICES.find(service => service.id === id)).filter(Boolean);
  const navigate = id => { setExpanded(false); onNavigate(id); };
  const item = (id, label, Icon) => <button key={id} type="button" className={`workspace-link ${active === id ? 'is-active' : ''}`} aria-current={active === id ? 'page' : undefined} onClick={() => navigate(id)}><Icon size={18} strokeWidth={1.6} /><span>{label}</span></button>;
  return <>
    <a className="skip-content-link" href="#main-content" onClick={event => { const main = document.getElementById('main-content'); if (main) { event.preventDefault(); main.focus(); main.scrollIntoView?.({ block: 'nearest' }); } }}>Ir para o conteúdo</a>
    <header className="workspace-mobile-header"><button type="button" className="workspace-wordmark" onClick={() => navigate('home')}><Layers size={22} /> Forma<span>ESTÚDIO</span></button><button ref={toggleRef} className="ds-icon-button" type="button" aria-label={expanded ? 'Fechar navegação' : 'Abrir navegação'} aria-expanded={expanded} aria-controls="workspace-navigation" onClick={() => setExpanded(!expanded)}>{expanded ? <X size={22} /> : <Menu size={22} />}</button></header>
    {expanded && <button type="button" className="workspace-nav-backdrop" aria-label="Fechar navegação" onClick={() => setExpanded(false)} />}
    <aside ref={menuRef} role={compact && expanded ? 'dialog' : undefined} aria-modal={compact && expanded ? true : undefined} inert={compact && !expanded ? '' : undefined} id="workspace-navigation" className={`workspace-nav ${expanded ? 'is-open' : ''}`} aria-label="Navegação do estúdio" onKeyDown={event => { if (event.key === 'Escape') setExpanded(false); }}>
      <button type="button" className="workspace-wordmark" onClick={() => navigate('home')}><span className="workspace-symbol"><Layers size={23} strokeWidth={1.4} /></span><span>Forma<small>{profile.id === 'design' ? 'ESTÚDIO CRIATIVO' : 'MEU ESPAÇO DE TRABALHO'}</small></span></button>
      <div className="workspace-company"><span className="workspace-company-avatar">{company?.companyName?.charAt(0) || 'F'}</span><div><strong>{company?.companyName || spaceName}</strong><span>{profile.label}</span></div></div>
      <nav aria-label="Principal"><span className="workspace-nav-label">Meu espaço</span>{item('home', 'Visão geral', LayoutDashboard)}{item('gallery', 'Meus projetos', FolderOpen)}{item('company', 'Minha empresa', Building2)}<span className="workspace-nav-label">Meus atalhos</span>{services.map(s => item(s.id, s.name, s.icon))}{item('materials', 'Todas as ferramentas', Layers)}<span className="workspace-nav-label">{profile.label}</span><button type="button" className="workspace-link" onClick={() => { setExpanded(false); onCustomize(); }}><Settings2 size={18} /><span>Personalizar meu espaço</span></button></nav>
      <div className="workspace-nav-bottom"><div className="workspace-note"><ArrowUpRight size={17} /><strong>Da ideia ao documento.</strong><p>Um espaço para dar forma à sua marca.</p></div><div className="workspace-user"><span className="workspace-company-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span><div><strong>{user?.name || 'Meu perfil'}</strong><span>Workspace pessoal</span></div><button type="button" className="ds-icon-button" aria-label="Sair da conta" onClick={onLogout}><LogOut size={17} /></button></div></div>
    </aside>
  </>;
}
