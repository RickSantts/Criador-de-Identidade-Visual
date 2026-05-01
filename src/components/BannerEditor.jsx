import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, Type, Palette, Image, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

const BANNER_FORMATS = {
  web_banner: { name: 'Banner Web', width: 1200, height: 400, previewW: 400, previewH: 133, icon: '🌐' },
  youtube_cover: { name: 'Capa YouTube', width: 2560, height: 1440, previewW: 400, previewH: 225, icon: '▶️' },
  leaderboard: { name: 'Leaderboard', width: 728, height: 90, previewW: 400, previewH: 50, icon: '📊' },
  skyscraper: { name: 'Skyscraper', width: 160, height: 600, previewW: 120, previewH: 450, icon: '🏗️' },
  medium_rect: { name: 'Retângulo Médio', width: 300, height: 250, previewW: 300, previewH: 250, icon: '⬜' },
  event_banner: { name: 'Banner Evento', width: 1920, height: 600, previewW: 400, previewH: 125, icon: '🎪' },
};

export default function BannerEditor({ brandData }) {
  const [format, setFormat] = useState('web_banner');
  const [bgColor1, setBgColor1] = useState(brandData?.color1 || '#1a1a1a');
  const [bgColor2, setBgColor2] = useState(brandData?.color3 || '#333333');
  const [bgType, setBgType] = useState('gradient');
  const [bgImage, setBgImage] = useState(null);
  const [bgOverlayOpacity, setBgOverlayOpacity] = useState(0.6);
  const [showLogo, setShowLogo] = useState(true);
  const [logoPosition, setLogoPosition] = useState('left');
  const [logoSize, setLogoSize] = useState(100);
  const [headline, setHeadline] = useState('Seu título principal');
  const [subline, setSubline] = useState('Texto secundário aqui');
  const [headlineColor, setHeadlineColor] = useState('#ffffff');
  const [sublineColor, setSublineColor] = useState('#ffffffcc');
  const [ctaText, setCtaText] = useState('Acesse Agora');
  const [ctaColor, setCtaColor] = useState(brandData?.color1 || '#4f46e5');
  const [showCta, setShowCta] = useState(true);
  const [expandedSection, setExpandedSection] = useState('format');
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef(null);

  const currentFormat = BANNER_FORMATS[format];

  const handleExport = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: currentFormat.width / currentFormat.previewW,
        useCORS: true, backgroundColor: null, logging: false
      });
      const link = document.createElement('a');
      link.download = `${brandData?.brandName || 'banner'}_${format}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleBgImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBgImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const toggleSection = (s) => setExpandedSection(prev => prev === s ? null : s);

const SectionHeader = ({ id, icon, title, children, expandedSection, onToggle }) => (
  <div className="social-editor-section">
    <button className="social-section-toggle" onClick={() => onToggle(id)}>
      <span className="social-section-toggle-left">{icon}<span>{title}</span></span>
      {expandedSection === id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </button>
    {expandedSection === id && <div className="social-section-content">{children}</div>}
  </div>
);

  const getBackground = () => {
    if (bgType === 'solid') return bgColor1;
    if (bgType === 'gradient') return `linear-gradient(135deg, ${bgColor1}, ${bgColor2})`;
    return `linear-gradient(135deg, ${bgColor1}, ${bgColor2})`;
  };

  const scaleFactor = currentFormat.previewW / currentFormat.width;

  return (
    <div className="social-editor">
      <div className="social-editor-sidebar">
        <div className="social-editor-header">
          <h2>🖼️ Banners</h2>
          <p>Crie banners profissionais para web e ads</p>
        </div>

        <div className="social-editor-controls">
          <SectionHeader 
            id="format" 
            icon={<Image size={14} />} 
            title="Formato"
            expandedSection={expandedSection}
            onToggle={toggleSection}
          >
            <div className="social-format-grid">
              {Object.entries(BANNER_FORMATS).map(([key, f]) => (
                <button key={key} className={`social-format-btn ${format === key ? 'active' : ''}`} onClick={() => setFormat(key)}>
                  <span className="social-format-icon">{f.icon}</span>
                  <span className="social-format-name">{f.name}</span>
                  <span className="social-format-size">{f.width}×{f.height}</span>
                </button>
              ))}
            </div>
          </SectionHeader>

          <SectionHeader 
            id="background" 
            icon={<Palette size={14} />} 
            title="Fundo"
            expandedSection={expandedSection}
            onToggle={toggleSection}
          >
            <div className="social-bg-controls">
              <div className="social-bg-type-row">
                {['solid', 'gradient', 'image'].map(type => (
                  <button key={type} className={`social-bg-type-btn ${bgType === type ? 'active' : ''}`} onClick={() => setBgType(type)}>
                    {type === 'solid' ? 'Sólido' : type === 'gradient' ? 'Gradiente' : 'Imagem'}
                  </button>
                ))}
              </div>
              <div className="social-color-row">
                <div className="social-color-input-group">
                  <label>Cor 1</label>
                  <input type="color" value={bgColor1} onChange={e => setBgColor1(e.target.value)} />
                </div>
                {bgType === 'gradient' && (
                  <div className="social-color-input-group">
                    <label>Cor 2</label>
                    <input type="color" value={bgColor2} onChange={e => setBgColor2(e.target.value)} />
                  </div>
                )}
              </div>
              {bgType === 'image' && (
                <label className="social-upload-btn">
                  <Image size={14} /><span>Carregar imagem</span>
                  <input type="file" accept="image/*" onChange={handleBgImageUpload} hidden />
                </label>
              )}
              {brandData?.color1 && (
                <button className="social-use-brand-btn" onClick={() => { setBgColor1(brandData.color1); setBgColor2(brandData.color3 || brandData.color2); }}>
                  <Palette size={12} /> Usar cores da marca
                </button>
              )}
            </div>
          </SectionHeader>

          <SectionHeader 
            id="content" 
            icon={<Type size={14} />} 
            title="Conteúdo"
            expandedSection={expandedSection}
            onToggle={toggleSection}
          >
            <div className="social-texts-controls">
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>Título</label>
                <input type="text" value={headline} onChange={e => setHeadline(e.target.value)} className="form-input" />
                <input type="color" value={headlineColor} onChange={e => setHeadlineColor(e.target.value)} style={{ marginTop: '0.25rem', width: '100%', height: '28px', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', marginBottom: '0.25rem', display: 'block' }}>Subtítulo</label>
                <input type="text" value={subline} onChange={e => setSubline(e.target.value)} className="form-input" />
                <input type="color" value={sublineColor} onChange={e => setSublineColor(e.target.value)} style={{ marginTop: '0.25rem', width: '100%', height: '28px', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
              </div>
              <label className="checkbox-label">
                <input type="checkbox" checked={showLogo} onChange={e => setShowLogo(e.target.checked)} /> Mostrar logo
              </label>
              <label className="checkbox-label">
                <input type="checkbox" checked={showCta} onChange={e => setShowCta(e.target.checked)} /> Botão CTA
              </label>
              {showCta && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <input type="text" value={ctaText} onChange={e => setCtaText(e.target.value)} className="form-input" style={{ flex: 1 }} />
                  <input type="color" value={ctaColor} onChange={e => setCtaColor(e.target.value)} style={{ width: '36px', height: '36px', border: '1px solid #e2e8f0', borderRadius: '4px', cursor: 'pointer' }} />
                </div>
              )}
            </div>
          </SectionHeader>
        </div>

        <div className="social-editor-actions">
          <button className="btn btn-primary" onClick={handleExport} disabled={isExporting} style={{ flex: 1 }}>
            <Download size={16} /> {isExporting ? 'Exportando...' : `Exportar ${currentFormat.name}`}
          </button>
        </div>
      </div>

      <div className="social-editor-preview">
        <div className="social-preview-label">
          <span className="social-preview-format-badge">{currentFormat.icon} {currentFormat.name}</span>
          <span className="social-preview-dimensions">{currentFormat.width} × {currentFormat.height}px</span>
        </div>
        <div
          ref={previewRef}
          className="social-canvas"
          style={{
            width: currentFormat.previewW,
            height: currentFormat.previewH,
            background: bgType === 'image' && bgImage ? 'none' : getBackground(),
            position: 'relative', overflow: 'hidden', borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px',
            padding: '20px',
          }}
        >
          {bgType === 'image' && bgImage && (
            <>
              <img src={bgImage} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${bgOverlayOpacity})` }} />
            </>
          )}

          {showLogo && brandData?.logo && (
            <img src={brandData.logo} alt="Logo" style={{
              maxHeight: '60%', maxWidth: '20%', objectFit: 'contain', zIndex: 5,
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
            }} />
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 5, flex: 1 }}>
            <div style={{
              fontFamily: brandData?.headingFont || 'Inter',
              fontSize: `${Math.max(14, 48 * scaleFactor * 3)}px`,
              fontWeight: 700, color: headlineColor, lineHeight: 1.2,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}>
              {headline}
            </div>
            <div style={{
              fontFamily: brandData?.bodyFont || 'Inter',
              fontSize: `${Math.max(10, 24 * scaleFactor * 3)}px`,
              fontWeight: 400, color: sublineColor, lineHeight: 1.4,
            }}>
              {subline}
            </div>
          </div>

          {showCta && (
            <div style={{
              padding: '8px 20px', background: ctaColor, color: '#fff', borderRadius: '24px',
              fontFamily: brandData?.bodyFont || 'Inter', fontSize: `${Math.max(10, 18 * scaleFactor * 3)}px`,
              fontWeight: 600, zIndex: 5, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {ctaText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
