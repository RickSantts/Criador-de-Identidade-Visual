import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, X, SlidersHorizontal } from 'lucide-react';
import { PROFILES, getProfile, toolsForPreferences } from '../config/profiles';
import { SERVICES } from './ServiceSelector';
import { Button } from './ui';
import useDialogFocus from '../utils/useDialogFocus';

export default function ProfileSettings({ preferences, onSave, onClose }) {
  const dialogRef = useRef(null);
  useDialogFocus(dialogRef, onClose);
  const [profileId, setProfileId] = useState(preferences.profileId);
  const [tools, setTools] = useState(toolsForPreferences(preferences));
  const [error, setError] = useState('');
  const chooseProfile = id => { setProfileId(id); setTools(getProfile(id).tools); setError(''); };
  const toggleTool = id => setTools(current => current.includes(id) ? current.filter(tool => tool !== id) : [...current, id]);
  return createPortal(<div className="profile-settings-backdrop" onClick={onClose}>
    <section ref={dialogRef} className="profile-settings" role="dialog" aria-modal="true" aria-labelledby="profile-settings-title" onClick={event => event.stopPropagation()}>
      <header><div><span className="ds-eyebrow"><SlidersHorizontal size={14} /> SEU JEITO DE TRABALHAR</span><h2 id="profile-settings-title">Personalize seu espaço</h2><p>Escolha sua área e os atalhos da página inicial. Você pode mudar tudo depois.</p></div><button className="ds-icon-button" type="button" aria-label="Fechar personalização" onClick={onClose}><X size={21} /></button></header>
      <div className="profile-settings-content"><fieldset><legend>1. Qual é sua área de atuação?</legend><div className="profile-options">{PROFILES.map(profile => <label key={profile.id} className={`profile-option ${profileId === profile.id ? 'is-selected' : ''}`}><input type="radio" name="usage-profile" value={profile.id} checked={profileId === profile.id} onChange={() => chooseProfile(profile.id)} /><span><strong>{profile.label}</strong><small>{profile.description}</small></span>{profileId === profile.id && <Check size={17} />}</label>)}</div></fieldset>
      <fieldset><legend>2. O que você quer ter à mão?</legend><p className="profile-help">Os selecionados aparecem primeiro no início e na navegação. Todas as ferramentas continuam disponíveis.</p><div className="profile-tools">{SERVICES.filter(service => service.id !== 'gallery').map(service => <label key={service.id}><input type="checkbox" checked={tools.includes(service.id)} onChange={() => toggleTool(service.id)} /><service.icon size={17} /><span>{service.name}</span></label>)}</div></fieldset></div>
      <footer>{error && <p role="alert">{error}</p>}<Button onClick={onClose}>Cancelar</Button><Button variant="primary" onClick={() => { if (!tools.length) { setError('Selecione pelo menos uma ferramenta.'); return; } if (onSave({ profileId, tools, configured: true }) === false) setError('Não foi possível salvar. Tente novamente.'); }}>Salvar personalização</Button></footer>
    </section>
  </div>, document.body);
}
