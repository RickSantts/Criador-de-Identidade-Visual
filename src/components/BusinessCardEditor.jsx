import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, Palette, Type, ChevronDown, ChevronUp, Phone, Mail, Globe, MapPin, Layout, Camera, Image as ImageIcon, Upload, Trash2 } from 'lucide-react';

const CARD_VIEWS = {
  front: { name: 'Frente', icon: '🃏' },
  back: { name: 'Verso', icon: '🔙' },
  mockup: { name: 'Mockup Cena', icon: '✨' },
};

const CARD_STYLES = [
  { id: 'modern', name: 'Moderno', desc: 'Clean com accent lateral' },
  { id: 'classic', name: 'Clássico', desc: 'Tradicional e elegante' },
  { id: 'bold', name: 'Bold', desc: 'Cores fortes e impactantes' },
  { id: 'minimal', name: 'Mínimo', desc: 'Extremamente limpo' },
];

const SectionHeader = ({ id, icon, title, children, expandedSection, onToggle }) => (
  <div className="social-editor-section">
    <button className="social-section-toggle" onClick={() => onToggle(id)}>
      <span className="social-section-toggle-left">{icon}<span>{title}</span></span>
      {expandedSection === id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </button>
    {expandedSection === id && <div className="social-section-content">{children}</div>}
  </div>
);

export default function BusinessCardEditor({ brandData, onNotify }) {
  const [view, setView] = useState('front');
  const [style, setStyle] = useState('modern');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState(brandData?.color1 || '#1a1a1a');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [address, setAddress] = useState('');
  const [showLogo, setShowLogo] = useState(true);
  const [customLogo, setCustomLogo] = useState(null);
  const [expandedSection, setExpandedSection] = useState('info');
  const [isExporting, setIsExporting] = useState(false);
  
  const previewRef = useRef(null);
  const logoInputRef = useRef(null);

  const handleExport = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 6, useCORS: true, backgroundColor: view === 'mockup' ? '#f1f5f9' : null, logging: false
      });
      const link = document.createElement('a');
      link.download = `${brandData?.brandName || 'cartao'}_${view}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      if (onNotify) onNotify('Cartão exportado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      if (onNotify) onNotify('Erro na exportação.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomLogo(event.target.result);
        if (onNotify) onNotify('Logo personalizada carregada!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSection = (s) => setExpandedSection(prev => prev === s ? null : s);

  const isLightBg = () => {
    const r = parseInt(bgColor.slice(1, 3), 16);
    const g = parseInt(bgColor.slice(3, 5), 16);
    const b = parseInt(bgColor.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
  };

  const textColor = isLightBg() ? '#1a1a1a' : '#ffffff';
  const mutedColor = isLightBg() ? '#64748b' : '#ffffffaa';
  const logoToUse = customLogo || brandData?.logo;

  const renderFront = (isMockup = false) => {
    const cardScale = isMockup ? 'scale(0.8)' : 'none';
    const cardRotation = isMockup ? 'rotate(-2deg)' : 'none';

    switch (style) {
      case 'modern':
        return (
          <div style={{ position: 'relative', width: '100%', height: '100%', background: bgColor, overflow: 'hidden', transform: cardScale + ' ' + cardRotation }}>
            <div style={{ position: 'absolute', left: 0, top: 0, width: '6px', height: '100%', background: accentColor }} />
            <div style={{ padding: '24px 24px 24px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: brandData?.headingFont || 'Inter', fontSize: '16px', fontWeight: 700, color: textColor }}>{name || 'Seu Nome'}</div>
                  <div style={{ fontFamily: brandData?.bodyFont || 'Inter', fontSize: '10px', color: accentColor, fontWeight: 500, marginTop: '2px', textTransform: 'uppercase' }}>{title || 'Cargo'}</div>
                </div>
                {showLogo && logoToUse && <img src={logoToUse} alt="" style={{ width: '50px', maxHeight: '40px', objectFit: 'contain' }} />}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                {phone && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '8px', color: mutedColor }}><Phone size={8} /> {phone}</div>}
                {email && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '8px', color: mutedColor, overflow: 'hidden', textOverflow: 'ellipsis' }}><Mail size={8} /> {email}</div>}
                {website && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '8px', color: mutedColor }}><Globe size={8} /> {website}</div>}
                {instagram && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '8px', color: mutedColor }}><Instagram size={8} /> {instagram}</div>}
              </div>
            </div>
          </div>
        );
      case 'minimal':
        return (
          <div style={{ width: '100%', height: '100%', background: bgColor, display: 'flex', flexDirection: 'column', padding: '30px', transform: cardScale + ' ' + cardRotation, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
             {showLogo && logoToUse && <img src={logoToUse} alt="" style={{ width: '40px', marginBottom: '15px' }} />}
             <div style={{ fontFamily: brandData?.headingFont || 'Inter', fontSize: '14px', fontWeight: 700, color: textColor }}>{name || 'Seu Nome'}</div>
             <div style={{ fontFamily: brandData?.bodyFont || 'Inter', fontSize: '9px', color: accentColor, marginBottom: '15px' }}>{title || 'Cargo'}</div>
             <div style={{ display: 'flex', gap: '15px', fontSize: '8px', color: mutedColor }}>
                {phone && <span>{phone}</span>}
                {instagram && <span>@{instagram}</span>}
             </div>
          </div>
        );
      default:
        return (
          <div style={{ width: '100%', height: '100%', background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px', transform: cardScale + ' ' + cardRotation }}>
            <div>
              <div style={{ fontFamily: brandData?.headingFont || 'Inter', fontSize: '14px', fontWeight: 600, color: textColor }}>{name || 'Seu Nome'}</div>
              <div style={{ fontFamily: brandData?.bodyFont || 'Inter', fontSize: '9px', color: mutedColor, marginBottom: '8px' }}>{title || 'Cargo'}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {phone && <div style={{ fontSize: '8px', color: mutedColor }}>{phone}</div>}
                {instagram && <div style={{ fontSize: '8px', color: mutedColor }}>@{instagram}</div>}
              </div>
            </div>
            {showLogo && logoToUse && <img src={logoToUse} alt="" style={{ width: '55px', objectFit: 'contain' }} />}
          </div>
        );
    }
  };

  const renderBack = (isMockup = false) => {
    const cardScale = isMockup ? 'scale(0.8)' : 'none';
    const cardRotation = isMockup ? 'rotate(3deg)' : 'none';
    return (
      <div style={{ width: '100%', height: '100%', background: style === 'bold' ? accentColor : bgColor, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', position: 'relative', overflow: 'hidden', transform: cardScale + ' ' + cardRotation }}>
        {logoToUse && (
          <img src={logoToUse} alt="" style={{ width: '80px', maxHeight: '60px', objectFit: 'contain', filter: style === 'bold' ? 'brightness(0) invert(1)' : 'none' }} />
        )}
        <div style={{ fontFamily: brandData?.headingFont || 'Inter', fontSize: '12px', fontWeight: 500, color: style === 'bold' ? '#fff' : (isLightBg() ? accentColor : '#fff'), letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {brandData?.brandName || 'Nome da Marca'}
        </div>
      </div>
    );
  };

  return (
    <div className="social-editor">
      <div className="social-editor-sidebar">
        <div className="social-editor-header">
          <h2>💳 Cartão de Visita</h2>
          <p>Design profissional e apresentações premium</p>
        </div>

        <div className="social-editor-controls">
          <SectionHeader 
            id="view" 
            icon={<Layout size={14} />} 
            title="Vista & Mockup"
            expandedSection={expandedSection}
            onToggle={toggleSection}
          >
            <div className="social-format-grid">
              {Object.entries(CARD_VIEWS).map(([key, v]) => (
                <button key={key} className={`social-format-btn ${view === key ? 'active' : ''}`} onClick={() => setView(key)}>
                  <span className="social-format-icon">{v.icon}</span>
                  <span className="social-format-name">{v.name}</span>
                </button>
              ))}
            </div>
          </SectionHeader>

          <SectionHeader 
            id="logo" 
            icon={<ImageIcon size={14} />} 
            title="Logotipo"
            expandedSection={expandedSection}
            onToggle={toggleSection}
          >
            <div className="social-texts-controls">
              <label className="checkbox-label">
                <input type="checkbox" checked={showLogo} onChange={e => setShowLogo(e.target.checked)} /> Exibir Logo no Cartão
              </label>
              
              {showLogo && (
                <div style={{ marginTop: '10px' }}>
                  <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" style={{ display: 'none' }} />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="social-upload-btn" onClick={() => logoInputRef.current.click()} style={{ flex: 1, fontSize: '0.7rem' }}>
                      <Upload size={12} /> {customLogo ? 'Trocar Logo' : 'Logo Personalizada'}
                    </button>
                    {customLogo && (
                      <button className="social-upload-btn delete" onClick={() => setCustomLogo(null)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', padding: '8px', cursor: 'pointer' }}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  {!customLogo && brandData?.logo && (
                    <p style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '5px' }}>Usando logo da Identidade Visual</p>
                  )}
                </div>
              )}
            </div>
          </SectionHeader>

          <SectionHeader 
            id="style" 
            icon={<Palette size={14} />} 
            title="Estilo"
            expandedSection={expandedSection}
            onToggle={toggleSection}
          >
            <div className="social-format-grid">
              {CARD_STYLES.map(s => (
                <button key={s.id} className={`social-format-btn ${style === s.id ? 'active' : ''}`} onClick={() => setStyle(s.id)}>
                  <span className="social-format-name">{s.name}</span>
                </button>
              ))}
            </div>
            <div className="social-color-row" style={{ marginTop: '10px' }}>
              <div className="social-color-input-group">
                <label>Fundo</label>
                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} />
              </div>
              <div className="social-color-input-group">
                <label>Destaque</label>
                <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} />
              </div>
            </div>
          </SectionHeader>

          <SectionHeader 
            id="info" 
            icon={<Type size={14} />} 
            title="Informações"
            expandedSection={expandedSection}
            onToggle={toggleSection}
          >
            <div className="social-texts-controls">
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="form-input" placeholder="Nome completo" />
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="form-input" placeholder="Cargo" style={{ marginTop: '5px' }} />
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="form-input" placeholder="Telefone" style={{ marginTop: '5px' }} />
              <input type="text" value={email} onChange={e => setEmail(e.target.value)} className="form-input" placeholder="Email" style={{ marginTop: '5px' }} />
              <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} className="form-input" placeholder="Instagram (Ex: @seuuser)" style={{ marginTop: '5px' }} />
              <input type="text" value={website} onChange={e => setWebsite(e.target.value)} className="form-input" placeholder="Website" style={{ marginTop: '5px' }} />
            </div>
          </SectionHeader>
        </div>

        <div className="social-editor-actions">
          <button className="btn btn-primary" onClick={handleExport} disabled={isExporting} style={{ flex: 1 }}>
            <Download size={16} /> {isExporting ? 'Exportando...' : `Exportar ${CARD_VIEWS[view].name}`}
          </button>
        </div>
      </div>

      <div className="social-editor-preview">
        <div className="social-preview-label">
          <span className="social-preview-format-badge">💳 Cartão de Visita</span>
        </div>
        <div
          ref={previewRef}
          className="business-card-canvas"
          style={{
            width: view === 'mockup' ? 500 : 350,
            height: view === 'mockup' ? 500 : 200,
            background: view === 'mockup' ? '#f1f5f9' : 'transparent',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: view === 'mockup' ? '12px' : '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: view === 'mockup' ? 'none' : '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          {view === 'mockup' ? (
             <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Simulated shadow */}
                <div style={{ position: 'absolute', width: '300px', height: '180px', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', transform: 'rotate(3deg) translate(10px, 10px)', filter: 'blur(10px)' }} />
                <div style={{ width: '300px', height: '180px', position: 'relative', boxShadow: '0 30px 60px rgba(0,0,0,0.15)', zIndex: 2 }}>
                   {renderFront(true)}
                </div>
                <div style={{ width: '300px', height: '180px', position: 'absolute', top: '55%', left: '45%', boxShadow: '0 30px 60px rgba(0,0,0,0.15)', zIndex: 1 }}>
                   {renderBack(true)}
                </div>
             </div>
          ) : (
            view === 'front' ? renderFront() : renderBack()
          )}
        </div>
      </div>
    </div>
  );
}
