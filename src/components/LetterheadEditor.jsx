import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Palette, Type, ChevronDown, ChevronUp } from 'lucide-react';

const LETTERHEAD_STYLES = [
  { id: 'professional', name: 'Profissional', desc: 'Header + rodapé completo' },
  { id: 'clean', name: 'Limpo', desc: 'Mínimo e elegante' },
  { id: 'accent', name: 'Com Destaque', desc: 'Barra lateral colorida' },
  { id: 'full_header', name: 'Header Full', desc: 'Cabeçalho largo' },
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

export default function LetterheadEditor({ brandData }) {
  const [style, setStyle] = useState('professional');
  const [headerColor, setHeaderColor] = useState(brandData?.color1 || '#1a1a1a');
  const [accentColor, setAccentColor] = useState(brandData?.color3 || '#666666');
  const [companyName, setCompanyName] = useState(brandData?.brandName || '');
  const [tagline, setTagline] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [showLogo, setShowLogo] = useState(true);
  const [sampleText, setSampleText] = useState('Prezado(a),\n\nSegue abaixo a proposta conforme solicitado. Ficamos à disposição para quaisquer esclarecimentos.\n\nAtenciosamente,');
  const [expandedSection, setExpandedSection] = useState('style');
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef(null);

  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      pdf.save(`${brandData?.brandName || 'timbrado'}_papeltimbrado.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPNG = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 3, useCORS: true, backgroundColor: '#ffffff', logging: false
      });
      const link = document.createElement('a');
      link.download = `${brandData?.brandName || 'timbrado'}_papeltimbrado.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleSection = (s) => setExpandedSection(prev => prev === s ? null : s);

  const renderHeader = () => {
    switch (style) {
      case 'professional':
        return (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', borderBottom: `3px solid ${headerColor}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {showLogo && brandData?.logo && (
                <img src={brandData.logo} alt="" style={{ height: '40px', objectFit: 'contain' }} />
              )}
              <div>
                <div style={{ fontFamily: brandData?.headingFont || 'Inter', fontSize: '16px', fontWeight: 700, color: headerColor }}>
                  {companyName || brandData?.brandName || 'Nome da Empresa'}
                </div>
                {tagline && (
                  <div style={{ fontFamily: brandData?.bodyFont || 'Inter', fontSize: '8px', color: accentColor, marginTop: '2px' }}>
                    {tagline}
                  </div>
                )}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '7px', color: accentColor, lineHeight: 1.6, fontFamily: brandData?.bodyFont || 'Inter' }}>
              {phone && <div>{phone}</div>}
              {email && <div>{email}</div>}
              {website && <div>{website}</div>}
            </div>
          </div>
        );

      case 'clean':
        return (
          <div style={{ padding: '25px 30px', textAlign: 'center' }}>
            {showLogo && brandData?.logo && (
              <img src={brandData.logo} alt="" style={{ height: '35px', objectFit: 'contain', marginBottom: '8px' }} />
            )}
            <div style={{ fontFamily: brandData?.headingFont || 'Inter', fontSize: '14px', fontWeight: 600, color: headerColor, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {companyName || brandData?.brandName || 'Nome da Empresa'}
            </div>
            <div style={{ width: '40px', height: '2px', background: headerColor, margin: '8px auto' }} />
          </div>
        );

      case 'accent':
        return (
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            <div style={{ width: '8px', background: headerColor, flexShrink: 0 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 25px', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {showLogo && brandData?.logo && (
                  <img src={brandData.logo} alt="" style={{ height: '35px', objectFit: 'contain' }} />
                )}
                <div style={{ fontFamily: brandData?.headingFont || 'Inter', fontSize: '15px', fontWeight: 700, color: headerColor }}>
                  {companyName || brandData?.brandName || 'Nome da Empresa'}
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '7px', color: accentColor, lineHeight: 1.6 }}>
                {phone && <div>{phone}</div>}
                {email && <div>{email}</div>}
              </div>
            </div>
          </div>
        );

      case 'full_header':
        return (
          <div style={{ background: headerColor, padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {showLogo && brandData?.logo && (
                <img src={brandData.logo} alt="" style={{ height: '35px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
              )}
              <div>
                <div style={{ fontFamily: brandData?.headingFont || 'Inter', fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                  {companyName || brandData?.brandName || 'Nome da Empresa'}
                </div>
                {tagline && <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>{tagline}</div>}
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '7px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
              {phone && <div>{phone}</div>}
              {email && <div>{email}</div>}
              {website && <div>{website}</div>}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderFooter = () => (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      padding: '12px 30px',
      borderTop: style === 'accent' ? 'none' : `1px solid ${headerColor}20`,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontSize: '7px', color: accentColor,
      fontFamily: brandData?.bodyFont || 'Inter',
      background: style === 'full_header' ? `${headerColor}08` : 'transparent',
    }}>
      {style === 'accent' && (
        <div style={{ position: 'absolute', left: 0, top: 0, width: '8px', height: '100%', background: headerColor }} />
      )}
      <div style={{ paddingLeft: style === 'accent' ? '16px' : 0 }}>
        {address || 'Endereço da empresa'}
      </div>
      <div>
        {website || 'www.suaempresa.com'}
      </div>
    </div>
  );

  return (
    <div className="social-editor">
      <div className="social-editor-sidebar">
        <div className="social-editor-header">
          <h2>📝 Papel Timbrado</h2>
          <p>Documentos oficiais com a identidade da marca</p>
        </div>

        <div className="social-editor-controls">
          <SectionHeader 
            id="style" 
            icon={<Palette size={14} />} 
            title="Estilo"
            expandedSection={expandedSection}
            onToggle={toggleSection}
          >
            <div className="social-format-grid">
              {LETTERHEAD_STYLES.map(s => (
                <button key={s.id} className={`social-format-btn ${style === s.id ? 'active' : ''}`} onClick={() => setStyle(s.id)}>
                  <span className="social-format-name">{s.name}</span>
                  <span className="social-format-size">{s.desc}</span>
                </button>
              ))}
            </div>
            <div className="social-color-row" style={{ marginTop: '0.75rem' }}>
              <div className="social-color-input-group">
                <label>Cor principal</label>
                <input type="color" value={headerColor} onChange={e => setHeaderColor(e.target.value)} />
              </div>
              <div className="social-color-input-group">
                <label>Cor secundária</label>
                <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} />
              </div>
            </div>
            {brandData?.color1 && (
              <button className="social-use-brand-btn" style={{ marginTop: '0.5rem' }} onClick={() => { setHeaderColor(brandData.color1); setAccentColor(brandData.color3 || '#666666'); }}>
                <Palette size={12} /> Usar cores da marca
              </button>
            )}
          </SectionHeader>

          <SectionHeader 
            id="info" 
            icon={<Type size={14} />} 
            title="Informações"
            expandedSection={expandedSection}
            onToggle={toggleSection}
          >
            <div className="social-texts-controls">
              <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="form-input" placeholder="Nome da empresa" />
              <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} className="form-input" placeholder="Slogan" style={{ marginTop: '0.25rem' }} />
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="form-input" placeholder="Telefone" style={{ marginTop: '0.25rem' }} />
              <input type="text" value={email} onChange={e => setEmail(e.target.value)} className="form-input" placeholder="Email" style={{ marginTop: '0.25rem' }} />
              <input type="text" value={website} onChange={e => setWebsite(e.target.value)} className="form-input" placeholder="Website" style={{ marginTop: '0.25rem' }} />
              <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="form-input" placeholder="Endereço" style={{ marginTop: '0.25rem' }} />
              <label className="checkbox-label" style={{ marginTop: '0.5rem' }}>
                <input type="checkbox" checked={showLogo} onChange={e => setShowLogo(e.target.checked)} /> Mostrar logo
              </label>
            </div>
          </SectionHeader>

          <SectionHeader 
            id="content" 
            icon={<Type size={14} />} 
            title="Conteúdo de Exemplo"
            expandedSection={expandedSection}
            onToggle={toggleSection}
          >
            <textarea
              value={sampleText}
              onChange={e => setSampleText(e.target.value)}
              className="form-textarea"
              style={{ minHeight: '100px' }}
              placeholder="Texto de exemplo para o documento..."
            />
          </SectionHeader>
        </div>

        <div className="social-editor-actions" style={{ flexDirection: 'column', gap: '0.5rem' }}>
          <button className="btn btn-primary" onClick={handleExportPDF} disabled={isExporting} style={{ width: '100%' }}>
            <Download size={16} /> {isExporting ? 'Exportando...' : 'Exportar PDF'}
          </button>
          <button className="btn btn-secondary" onClick={handleExportPNG} disabled={isExporting} style={{ width: '100%' }}>
            <Download size={16} /> Exportar PNG
          </button>
        </div>
      </div>

      <div className="social-editor-preview">
        <div className="social-preview-label">
          <span className="social-preview-format-badge">📝 Papel Timbrado</span>
          <span className="social-preview-dimensions">A4 — 210 × 297mm</span>
        </div>
        <div
          ref={previewRef}
          className="letterhead-canvas"
          style={{
            width: 340,
            height: 480,
            background: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '8px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          {renderHeader()}

          <div style={{
            padding: '25px 30px',
            fontFamily: brandData?.bodyFont || 'Inter',
            fontSize: '9px',
            color: '#333',
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap',
          }}>
            {sampleText}
          </div>

          {renderFooter()}
        </div>
      </div>
    </div>
  );
}
