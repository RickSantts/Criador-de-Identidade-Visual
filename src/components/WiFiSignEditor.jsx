import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Palette, Type, ChevronDown, ChevronUp, Wifi, CreditCard, QrCode } from 'lucide-react';

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

export default function WiFiSignEditor({ brandData }) {
  const [type, setType] = useState('wifi'); // 'wifi' or 'pix'
  const [style, setStyle] = useState('minimal');
  const [primaryColor, setPrimaryColor] = useState(brandData?.color1 || '#1a1a1a');
  const [secondaryColor, setSecondaryColor] = useState(brandData?.color2 || '#ffffff');
  const [accentColor, setAccentColor] = useState(brandData?.color3 || '#666666');
  
  const [wifiNetwork, setWifiNetwork] = useState('NOME_DA_REDE');
  const [wifiPassword, setWifiPassword] = useState('SENHA_AQUI');
  const [pixKey, setPixKey] = useState('chave@email.com');
  const [pixName, setPixName] = useState(brandData?.brandName || 'Nome do Bar');
  
  const [title, setTitle] = useState(type === 'wifi' ? 'Conecte-se' : 'Pague com Pix');
  const [expandedSection, setExpandedSection] = useState('type');
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef(null);

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
        scale: 4, useCORS: true, backgroundColor: '#ffffff', logging: false
      });
      const link = document.createElement('a');
      link.download = `${brandData?.brandName || 'bar'}_placa_${type}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
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
        justifyContent: 'center',
        padding: '30px',
        textAlign: 'center',
        border: style === 'classic' ? `10px double ${primaryColor}` : 'none',
        position: 'relative'
      }}>
        {/* Logo */}
        {brandData?.logo && (
          <img src={brandData.logo} alt="" style={{ 
            maxHeight: '60px', 
            maxWidth: '120px', 
            marginBottom: '20px',
            filter: style === 'bold' && !isDark(primaryColor) ? 'none' : (isDark(bgColor) ? 'brightness(0) invert(1)' : 'none')
          }} />
        )}

        {/* Title */}
        <h2 style={{
          fontFamily: brandData?.headingFont || 'Inter',
          fontSize: '24px',
          fontWeight: 800,
          color: style === 'bold' ? textColor : primaryColor,
          marginBottom: '15px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {title}
        </h2>

        {/* Icon */}
        <div style={{ 
          margin: '20px 0', 
          color: style === 'bold' ? textColor : accentColor,
          display: 'flex',
          justifyContent: 'center'
        }}>
          {type === 'wifi' ? <Wifi size={64} /> : <QrCode size={64} />}
        </div>

        {/* Information Box */}
        <div style={{
          background: style === 'bold' ? 'rgba(255,255,255,0.1)' : `${primaryColor}08`,
          padding: '20px',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '240px',
          border: `1px solid ${style === 'bold' ? 'rgba(255,255,255,0.2)' : `${primaryColor}20`}`
        }}>
          {type === 'wifi' ? (
            <>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: style === 'bold' ? textColor : '#666', display: 'block', marginBottom: '4px' }}>Rede</span>
                <strong style={{ fontSize: '16px', color: style === 'bold' ? textColor : '#1a1a1a' }}>{wifiNetwork}</strong>
              </div>
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: style === 'bold' ? textColor : '#666', display: 'block', marginBottom: '4px' }}>Senha</span>
                <strong style={{ fontSize: '16px', color: style === 'bold' ? textColor : '#1a1a1a' }}>{wifiPassword}</strong>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: style === 'bold' ? textColor : '#666', display: 'block', marginBottom: '4px' }}>Beneficiário</span>
                <strong style={{ fontSize: '16px', color: style === 'bold' ? textColor : '#1a1a1a' }}>{pixName}</strong>
              </div>
              <div>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: style === 'bold' ? textColor : '#666', display: 'block', marginBottom: '4px' }}>Chave Pix</span>
                <strong style={{ fontSize: '14px', color: style === 'bold' ? textColor : '#1a1a1a' }}>{pixKey}</strong>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p style={{
          position: 'absolute',
          bottom: '20px',
          fontSize: '10px',
          fontFamily: brandData?.bodyFont || 'Inter',
          color: style === 'bold' ? textColor : '#999',
          opacity: 0.8
        }}>
          Obrigado pela preferência!
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
          <SectionHeader 
            id="type" 
            icon={<Type size={14} />} 
            title="Tipo de Placa"
            expandedSection={expandedSection}
            onToggle={toggleSection}
          >
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

          <SectionHeader 
            id="style" 
            icon={<Palette size={14} />} 
            title="Design"
            expandedSection={expandedSection}
            onToggle={toggleSection}
          >
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
          </SectionHeader>

          <SectionHeader 
            id="info" 
            icon={<Type size={14} />} 
            title="Informações"
            expandedSection={expandedSection}
            onToggle={toggleSection}
          >
            <div className="social-texts-controls">
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="form-input" placeholder="Título da Placa" />
              
              {type === 'wifi' ? (
                <>
                  <input type="text" value={wifiNetwork} onChange={e => setWifiNetwork(e.target.value)} className="form-input" placeholder="Nome da Rede" style={{ marginTop: '0.25rem' }} />
                  <input type="text" value={wifiPassword} onChange={e => setWifiPassword(e.target.value)} className="form-input" placeholder="Senha" style={{ marginTop: '0.25rem' }} />
                </>
              ) : (
                <>
                  <input type="text" value={pixName} onChange={e => setPixName(e.target.value)} className="form-input" placeholder="Nome do Beneficiário" style={{ marginTop: '0.25rem' }} />
                  <input type="text" value={pixKey} onChange={e => setPixKey(e.target.value)} className="form-input" placeholder="Chave Pix" style={{ marginTop: '0.25rem' }} />
                </>
              )}
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
