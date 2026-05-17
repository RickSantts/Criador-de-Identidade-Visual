import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Palette, Type, ChevronDown, ChevronUp, Wifi, QrCode } from 'lucide-react';

const STORAGE_KEY = 'wifisign_data';

const SIGN_STYLES = [
  { id: 'minimal', name: 'Minimalista', desc: 'Foco no essencial' },
  { id: 'bold', name: 'Destaque', desc: 'Cores vibrantes' },
  { id: 'classic', name: 'Clássico', desc: 'Bordas e elegância' },
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

export default function WiFiSignEditor({ brandData, onNotify }) {
  const getSaved = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  };

  const saved = getSaved();

  const [type, setType] = useState(saved?.type || 'wifi');
  const [style, setStyle] = useState(saved?.style || 'minimal');
  const [primaryColor, setPrimaryColor] = useState(saved?.primaryColor || brandData?.color1 || '#1a1a1a');
  const [accentColor, setAccentColor] = useState(saved?.accentColor || brandData?.color3 || '#666666');
  const [wifiNetwork, setWifiNetwork] = useState(saved?.wifiNetwork || 'NOME_DA_REDE');
  const [wifiPassword, setWifiPassword] = useState(saved?.wifiPassword || 'SENHA_AQUI');
  const [pixKey, setPixKey] = useState(saved?.pixKey || 'chave@email.com');
  const [pixName, setPixName] = useState(saved?.pixName || brandData?.brandName || 'Nome do Bar');
  const [title, setTitle] = useState(saved?.title || (saved?.type === 'pix' ? 'Pague com Pix' : 'Conecte-se'));
  const [footerText, setFooterText] = useState(saved?.footerText || '✦ Obrigado pela preferência! ✦');
  const [expandedSection, setExpandedSection] = useState('type');
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef(null);

  // Auto-save
  useEffect(() => {
    const data = { type, style, primaryColor, accentColor, wifiNetwork, wifiPassword, pixKey, pixName, title, footerText };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [type, style, primaryColor, accentColor, wifiNetwork, wifiPassword, pixKey, pixName, title, footerText]);

  const applyBrandColors = () => {
    if (brandData?.color1) setPrimaryColor(brandData.color1);
    if (brandData?.color3) setAccentColor(brandData.color3);
    if (onNotify) onNotify('Cores da identidade visual aplicadas!', 'success');
  };

  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 3, useCORS: true, backgroundColor: '#ffffff', logging: false
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
      pdf.addImage(imgData, 'JPEG', 0, 0, 148, 210);
      pdf.save(`${brandData?.brandName || 'bar'}_placa_${type}.pdf`);
      if (onNotify) onNotify('PDF exportado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      if (onNotify) onNotify('Erro ao exportar PDF.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPNG = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 4, useCORS: true, backgroundColor: '#ffffff', logging: false
      });
      const link = document.createElement('a');
      link.download = `${brandData?.brandName || 'bar'}_placa_${type}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      if (onNotify) onNotify('PNG exportado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      if (onNotify) onNotify('Erro ao exportar PNG.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleSection = (s) => setExpandedSection(prev => prev === s ? null : s);

  const renderSign = () => {
    const isDark = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return (r * 299 + g * 587 + b * 114) / 1000 < 128;
    };

    const textColor = isDark(style === 'bold' ? primaryColor : '#ffffff') ? '#ffffff' : '#1a1a1a';
    const bgColor = style === 'bold' ? primaryColor : '#ffffff';

    return (
      <div style={{
        width: '100%',
        height: '100%',
        background: bgColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '60px 45px',
        textAlign: 'center',
        border: style === 'classic' ? `10px double ${primaryColor}` : 'none',
        boxSizing: 'border-box'
      }}>
        {/* Logo */}
        {brandData?.logo && (
          <img src={brandData.logo} alt="" style={{
            maxHeight: '40px',
            maxWidth: '80px',
            marginBottom: '12px',
            filter: style === 'bold' && !isDark(primaryColor) ? 'none' : (isDark(bgColor) ? 'brightness(0) invert(1)' : 'none')
          }} />
        )}

        {/* Title */}
        <h2 style={{
          fontFamily: brandData?.headingFont || 'Inter',
          fontSize: '20px',
          fontWeight: 800,
          color: style === 'bold' ? textColor : primaryColor,
          marginBottom: '16px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {title}
        </h2>

        {/* Icon */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: style === 'bold'
              ? `linear-gradient(135deg, ${primaryColor}40, ${accentColor}40)`
              : `${primaryColor}08`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            border: `2px solid ${style === 'bold' ? 'rgba(255,255,255,0.3)' : `${primaryColor}20`}`
          }}>
            <div style={{ color: style === 'bold' ? textColor : primaryColor }}>
              {type === 'wifi' ? <Wifi size={32} /> : <QrCode size={32} />}
            </div>
          </div>
        </div>

        {/* Information Box */}
        <div style={{
          background: style === 'bold' ? 'rgba(255,255,255,0.12)' : `${primaryColor}05`,
          padding: '16px 20px',
          borderRadius: '14px',
          width: '75%',
          maxWidth: '200px',
          border: `1px solid ${style === 'bold' ? 'rgba(255,255,255,0.2)' : `${primaryColor}15`}`,
          textAlign: 'center',
        }}>
          {type === 'wifi' ? (
            <>
              <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: `1px solid ${style === 'bold' ? 'rgba(255,255,255,0.1)' : `${primaryColor}15`}` }}>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', color: style === 'bold' ? `${textColor}70` : '#999', display: 'block', marginBottom: '3px', letterSpacing: '1px' }}>Rede Wi-Fi</span>
                <strong style={{ fontSize: '16px', color: style === 'bold' ? textColor : '#222', fontWeight: 700 }}>{wifiNetwork}</strong>
              </div>
              <div>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', color: style === 'bold' ? `${textColor}70` : '#999', display: 'block', marginBottom: '3px', letterSpacing: '1px' }}>Senha</span>
                <strong style={{ fontSize: '18px', color: style === 'bold' ? textColor : primaryColor, fontWeight: 700, letterSpacing: '1px' }}>{wifiPassword}</strong>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: `1px solid ${style === 'bold' ? 'rgba(255,255,255,0.1)' : `${primaryColor}15`}` }}>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', color: style === 'bold' ? `${textColor}70` : '#999', display: 'block', marginBottom: '3px', letterSpacing: '1px' }}>Beneficiado</span>
                <strong style={{ fontSize: '16px', color: style === 'bold' ? textColor : '#222', fontWeight: 700 }}>{pixName}</strong>
              </div>
              <div>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', color: style === 'bold' ? `${textColor}70` : '#999', display: 'block', marginBottom: '3px', letterSpacing: '1px' }}>Chave Pix</span>
                <strong style={{ fontSize: '13px', color: style === 'bold' ? textColor : primaryColor, fontWeight: 600, wordBreak: 'break-all' }}>{pixKey}</strong>
              </div>
            </>
          )}
        </div>

        {/* Footer — editável */}
        <p style={{
          fontSize: '10px',
          fontFamily: brandData?.bodyFont || 'Inter',
          color: style === 'bold' ? `${textColor}99` : '#aaa',
          letterSpacing: '1px',
          marginTop: '12px'
        }}>
          {footerText}
        </p>
      </div>
    );
  };

  return (
    <div className="social-editor">
      <div className="social-editor-sidebar">
        <div className="social-editor-header">
          <h2>🍺 Placa de Balcão</h2>
          <p>Wi-Fi ou Pix personalizado para o seu bar</p>
        </div>

        <div className="social-editor-controls">
          <SectionHeader id="type" icon={<Type size={14} />} title="Tipo de Placa" expandedSection={expandedSection} onToggle={toggleSection}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className={`social-format-btn ${type === 'wifi' ? 'active' : ''}`}
                onClick={() => { setType('wifi'); setTitle('Conecte-se'); }}
                style={{ flex: 1, padding: '10px' }}
              >
                <Wifi size={16} /> Wi-Fi
              </button>
              <button
                className={`social-format-btn ${type === 'pix' ? 'active' : ''}`}
                onClick={() => { setType('pix'); setTitle('Pague com Pix'); }}
                style={{ flex: 1, padding: '10px' }}
              >
                <QrCode size={16} /> Pix
              </button>
            </div>
          </SectionHeader>

          <SectionHeader id="style" icon={<Palette size={14} />} title="Design" expandedSection={expandedSection} onToggle={toggleSection}>
            <div className="social-format-grid">
              {SIGN_STYLES.map(s => (
                <button key={s.id} className={`social-format-btn ${style === s.id ? 'active' : ''}`} onClick={() => setStyle(s.id)}>
                  <span className="social-format-name">{s.name}</span>
                  <span className="social-format-size">{s.desc}</span>
                </button>
              ))}
            </div>
            <div className="social-color-row" style={{ marginTop: '0.75rem' }}>
              <div className="social-color-input-group">
                <label>Cor principal</label>
                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
              </div>
              <div className="social-color-input-group">
                <label>Destaque</label>
                <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} />
              </div>
            </div>
            {brandData?.color1 && (
              <button className="social-use-brand-btn" style={{ marginTop: '0.5rem' }} onClick={applyBrandColors}>
                <Palette size={12} /> Usar cores da Identidade Visual
              </button>
            )}
          </SectionHeader>

          <SectionHeader id="info" icon={<Type size={14} />} title="Informações" expandedSection={expandedSection} onToggle={toggleSection}>
            <div className="social-texts-controls">
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '4px' }}>Título da Placa</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="form-input" placeholder="Título da Placa" />

              {type === 'wifi' ? (
                <>
                  <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', display: 'block', marginTop: '0.75rem', marginBottom: '4px' }}>Nome da Rede</label>
                  <input type="text" value={wifiNetwork} onChange={e => setWifiNetwork(e.target.value)} className="form-input" placeholder="Nome da Rede" />
                  <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', display: 'block', marginTop: '0.75rem', marginBottom: '4px' }}>Senha</label>
                  <input type="text" value={wifiPassword} onChange={e => setWifiPassword(e.target.value)} className="form-input" placeholder="Senha" />
                </>
              ) : (
                <>
                  <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', display: 'block', marginTop: '0.75rem', marginBottom: '4px' }}>Nome do Beneficiário</label>
                  <input type="text" value={pixName} onChange={e => setPixName(e.target.value)} className="form-input" placeholder="Nome do Beneficiário" />
                  <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', display: 'block', marginTop: '0.75rem', marginBottom: '4px' }}>Chave Pix</label>
                  <input type="text" value={pixKey} onChange={e => setPixKey(e.target.value)} className="form-input" placeholder="Chave Pix" />
                </>
              )}

              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', display: 'block', marginTop: '0.75rem', marginBottom: '4px' }}>Texto de Rodapé</label>
              <input
                type="text"
                value={footerText}
                onChange={e => setFooterText(e.target.value)}
                className="form-input"
                placeholder="Ex: ✦ Obrigado pela preferência! ✦"
              />
            </div>
          </SectionHeader>
        </div>

        <div className="social-editor-actions" style={{ flexDirection: 'column', gap: '0.5rem' }}>
          <button className="btn btn-primary" onClick={handleExportPDF} disabled={isExporting} style={{ width: '100%' }}>
            <Download size={16} /> {isExporting ? 'Exportando...' : 'Exportar PDF (A5)'}
          </button>
          <button className="btn btn-secondary" onClick={handleExportPNG} disabled={isExporting} style={{ width: '100%' }}>
            <Download size={16} /> Exportar PNG
          </button>
        </div>
      </div>

      <div className="social-editor-preview">
        <div className="social-preview-label">
          <span className="social-preview-format-badge">🍺 Placa de Balcão</span>
          <span className="social-preview-dimensions">A5 — 148 × 210mm</span>
        </div>
        <div
          ref={previewRef}
          style={{
            width: 300,
            height: 424,
            background: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '8px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          {renderSign()}
        </div>
      </div>
    </div>
  );
}
