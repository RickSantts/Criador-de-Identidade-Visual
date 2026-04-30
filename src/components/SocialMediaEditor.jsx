import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, RotateCcw, Type, Image, Palette, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Layers, Smartphone, Monitor, Square, Plus, Trash2, Move, ChevronDown, ChevronUp } from 'lucide-react';

const SOCIAL_FORMATS = {
  instagram_post: { name: 'Post Instagram', width: 1080, height: 1080, previewW: 340, previewH: 340, icon: '📸' },
  instagram_story: { name: 'Story Instagram', width: 1080, height: 1920, previewW: 220, previewH: 390, icon: '📱' },
  facebook_cover: { name: 'Capa Facebook', width: 820, height: 312, previewW: 400, previewH: 152, icon: '🌐' },
  linkedin_cover: { name: 'Capa LinkedIn', width: 1584, height: 396, previewW: 400, previewH: 100, icon: '💼' },
  twitter_post: { name: 'Post Twitter/X', width: 1200, height: 675, previewW: 380, previewH: 214, icon: '🐦' },
  whatsapp_status: { name: 'Status WhatsApp', width: 1080, height: 1920, previewW: 220, previewH: 390, icon: '💬' },
};

const LAYOUT_PRESETS = [
  { id: 'centered', name: 'Centralizado', layout: 'center' },
  { id: 'top_banner', name: 'Banner Topo', layout: 'top' },
  { id: 'bottom_cta', name: 'CTA Inferior', layout: 'bottom' },
  { id: 'left_split', name: 'Dividido Esquerda', layout: 'left' },
  { id: 'overlay', name: 'Overlay', layout: 'overlay' },
  { id: 'minimal', name: 'Mínimo', layout: 'minimal' },
];

const DEFAULT_TEXTS = [
  { id: 1, content: 'Seu título aqui', fontSize: 32, fontWeight: 700, color: '#ffffff', x: 50, y: 40, align: 'center', type: 'heading' },
  { id: 2, content: 'Subtítulo ou descrição do post', fontSize: 16, fontWeight: 400, color: '#ffffffcc', x: 50, y: 55, align: 'center', type: 'body' },
];

export default function SocialMediaEditor({ brandData }) {
  const [format, setFormat] = useState('instagram_post');
  const [layout, setLayout] = useState('centered');
  const [bgType, setBgType] = useState('gradient');
  const [bgColor1, setBgColor1] = useState(brandData?.color1 || '#1a1a1a');
  const [bgColor2, setBgColor2] = useState(brandData?.color3 || '#333333');
  const [bgImage, setBgImage] = useState(null);
  const [bgOverlayOpacity, setBgOverlayOpacity] = useState(0.5);
  const [showLogo, setShowLogo] = useState(true);
  const [logoPosition, setLogoPosition] = useState('top-center');
  const [logoSize, setLogoSize] = useState(80);
  const [texts, setTexts] = useState(DEFAULT_TEXTS);
  const [selectedText, setSelectedText] = useState(null);
  const [ctaText, setCtaText] = useState('Saiba Mais');
  const [ctaColor, setCtaColor] = useState(brandData?.color1 || '#4f46e5');
  const [showCta, setShowCta] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [expandedSection, setExpandedSection] = useState('format');
  const previewRef = useRef(null);

  const currentFormat = SOCIAL_FORMATS[format];

  const handleExport = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: currentFormat.width / currentFormat.previewW,
        useCORS: true,
        backgroundColor: null,
        logging: false
      });
      const link = document.createElement('a');
      link.download = `${brandData?.brandName || 'design'}_${format}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleBgImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBgImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const updateText = (id, field, value) => {
    setTexts(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const addText = () => {
    const newId = Math.max(...texts.map(t => t.id), 0) + 1;
    setTexts(prev => [...prev, {
      id: newId, content: 'Novo texto', fontSize: 18, fontWeight: 400,
      color: '#ffffff', x: 50, y: 70, align: 'center', type: 'body'
    }]);
    setSelectedText(newId);
  };

  const removeText = (id) => {
    setTexts(prev => prev.filter(t => t.id !== id));
    if (selectedText === id) setSelectedText(null);
  };

  const getBackground = () => {
    if (bgType === 'solid') return bgColor1;
    if (bgType === 'gradient') return `linear-gradient(135deg, ${bgColor1}, ${bgColor2})`;
    if (bgType === 'image' && bgImage) return `url(${bgImage})`;
    return `linear-gradient(135deg, ${bgColor1}, ${bgColor2})`;
  };

  const getLogoPositionStyle = () => {
    const positions = {
      'top-left': { top: '5%', left: '5%' },
      'top-center': { top: '5%', left: '50%', transform: 'translateX(-50%)' },
      'top-right': { top: '5%', right: '5%' },
      'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
      'bottom-left': { bottom: '5%', left: '5%' },
      'bottom-center': { bottom: '5%', left: '50%', transform: 'translateX(-50%)' },
      'bottom-right': { bottom: '5%', right: '5%' },
    };
    return positions[logoPosition] || positions['top-center'];
  };

  const toggleSection = (section) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

const SectionHeader = ({ id, icon, title, children, expandedSection, onToggle }) => (
  <div className="social-editor-section">
    <button className="social-section-toggle" onClick={() => onToggle(id)}>
      <span className="social-section-toggle-left">
        {icon}
        <span>{title}</span>
      </span>
      {expandedSection === id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </button>
    {expandedSection === id && <div className="social-section-content">{children}</div>}
  </div>
);

export default function SocialMediaEditor({ brandData }) {

  return (
    <div className="social-editor">
      <div className="social-editor-sidebar">
        <div className="social-editor-header">
          <h2>📱 Redes Sociais</h2>
          <p>Crie posts profissionais com a identidade da marca</p>
        </div>

        <div className="social-editor-controls">
          <SectionHeader 
            id="format" 
            icon={<Layers size={14} />} 
            title="Formato"
            expandedSection={expandedSection}
            onToggle={toggleSection}
          >
            <div className="social-format-grid">
              {Object.entries(SOCIAL_FORMATS).map(([key, f]) => (
                <button
                  key={key}
                  className={`social-format-btn ${format === key ? 'active' : ''}`}
                  onClick={() => setFormat(key)}
                >
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
                  <button
                    key={type}
                    className={`social-bg-type-btn ${bgType === type ? 'active' : ''}`}
                    onClick={() => setBgType(type)}
                  >
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
                <div className="social-image-upload">
                  <label className="social-upload-btn">
                    <Image size={14} />
                    <span>Carregar imagem</span>
                    <input type="file" accept="image/*" onChange={handleBgImageUpload} hidden />
                  </label>
                  {bgImage && (
                    <div className="social-overlay-control">
                      <label>Overlay: {Math.round(bgOverlayOpacity * 100)}%</label>
                      <input type="range" min="0" max="1" step="0.05" value={bgOverlayOpacity} onChange={e => setBgOverlayOpacity(parseFloat(e.target.value))} />
                    </div>
                  )}
                </div>
              )}
              {brandData?.color1 && (
                <button className="social-use-brand-btn" onClick={() => { setBgColor1(brandData.color1); setBgColor2(brandData.color3 || brandData.color2); }}>
                  <Palette size={12} /> Usar cores da marca
                </button>
              )}
            </div>
          </SectionHeader>

          <SectionHeader 
            id="logo" 
            icon={<Image size={14} />} 
            title="Logo"
            expandedSection={expandedSection}
            onToggle={toggleSection}
          >
            <div className="social-logo-controls">
              <label className="checkbox-label">
                <input type="checkbox" checked={showLogo} onChange={e => setShowLogo(e.target.checked)} />
                Mostrar logo
              </label>
              {showLogo && (
                <>
                  <div className="social-logo-position-grid">
                    {['top-left', 'top-center', 'top-right', 'center', 'bottom-left', 'bottom-center', 'bottom-right'].map(pos => (
                      <button
                        key={pos}
                        className={`social-logo-pos-btn ${logoPosition === pos ? 'active' : ''}`}
                        onClick={() => setLogoPosition(pos)}
                        title={pos}
                      >
                        •
                      </button>
                    ))}
                  </div>
                  <div className="social-logo-size">
                    <label>Tamanho: {logoSize}px</label>
                    <input type="range" min="30" max="200" value={logoSize} onChange={e => setLogoSize(parseInt(e.target.value))} />
                  </div>
                </>
              )}
            </div>
          </SectionHeader>

          <SectionHeader 
            id="texts" 
            icon={<Type size={14} />} 
            title="Textos"
            expandedSection={expandedSection}
            onToggle={toggleSection}
          >
            <div className="social-texts-controls">
              {texts.map(text => (
                <div
                  key={text.id}
                  className={`social-text-item ${selectedText === text.id ? 'selected' : ''}`}
                  onClick={() => setSelectedText(text.id)}
                >
                  <div className="social-text-item-header">
                    <input
                      type="text"
                      value={text.content}
                      onChange={e => updateText(text.id, 'content', e.target.value)}
                      className="social-text-input"
                      placeholder="Texto..."
                    />
                    <button className="social-text-remove" onClick={e => { e.stopPropagation(); removeText(text.id); }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                  {selectedText === text.id && (
                    <div className="social-text-options animate-fade-in">
                      <div className="social-text-options-row">
                        <input type="number" value={text.fontSize} onChange={e => updateText(text.id, 'fontSize', parseInt(e.target.value))} className="social-text-size-input" min="8" max="120" />
                        <select value={text.fontWeight} onChange={e => updateText(text.id, 'fontWeight', parseInt(e.target.value))} className="social-text-weight-select">
                          <option value={300}>Light</option>
                          <option value={400}>Regular</option>
                          <option value={500}>Medium</option>
                          <option value={600}>Semi</option>
                          <option value={700}>Bold</option>
                        </select>
                        <input type="color" value={text.color} onChange={e => updateText(text.id, 'color', e.target.value)} className="social-text-color" />
                      </div>
                      <div className="social-text-options-row">
                        <div className="social-text-align-group">
                          {['left', 'center', 'right'].map(align => (
                            <button
                              key={align}
                              className={`social-align-btn ${text.align === align ? 'active' : ''}`}
                              onClick={() => updateText(text.id, 'align', align)}
                            >
                              {align === 'left' ? <AlignLeft size={14} /> : align === 'center' ? <AlignCenter size={14} /> : <AlignRight size={14} />}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="social-text-position-row">
                        <div>
                          <label>X: {text.x}%</label>
                          <input type="range" min="0" max="100" value={text.x} onChange={e => updateText(text.id, 'x', parseInt(e.target.value))} />
                        </div>
                        <div>
                          <label>Y: {text.y}%</label>
                          <input type="range" min="0" max="100" value={text.y} onChange={e => updateText(text.id, 'y', parseInt(e.target.value))} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button className="social-add-text-btn" onClick={addText}>
                <Plus size={14} /> Adicionar texto
              </button>
            </div>
          </SectionHeader>

          <SectionHeader 
            id="cta" 
            icon={<Square size={14} />} 
            title="Botão CTA"
            expandedSection={expandedSection}
            onToggle={toggleSection}
          >
            <div className="social-cta-controls">
              <label className="checkbox-label">
                <input type="checkbox" checked={showCta} onChange={e => setShowCta(e.target.checked)} />
                Mostrar botão CTA
              </label>
              {showCta && (
                <>
                  <input type="text" value={ctaText} onChange={e => setCtaText(e.target.value)} className="form-input" placeholder="Texto do botão" />
                  <div className="social-color-input-group">
                    <label>Cor do botão</label>
                    <input type="color" value={ctaColor} onChange={e => setCtaColor(e.target.value)} />
                  </div>
                </>
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
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '12px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          {bgType === 'image' && bgImage && (
            <>
              <img
                src={bgImage}
                alt=""
                style={{
                  position: 'absolute', inset: 0, width: '100%', height: '100%',
                  objectFit: 'cover',
                }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: `rgba(0,0,0,${bgOverlayOpacity})`,
              }} />
            </>
          )}

          {showLogo && brandData?.logo && (
            <img
              src={brandData.logo}
              alt="Logo"
              style={{
                position: 'absolute',
                ...getLogoPositionStyle(),
                width: `${logoSize * (currentFormat.previewW / currentFormat.width) * 3}px`,
                maxWidth: '40%',
                objectFit: 'contain',
                zIndex: 5,
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
              }}
            />
          )}

          {texts.map(text => (
            <div
              key={text.id}
              style={{
                position: 'absolute',
                left: `${text.x}%`,
                top: `${text.y}%`,
                transform: 'translate(-50%, -50%)',
                fontFamily: brandData?.headingFont || 'Inter',
                fontSize: `${text.fontSize * (currentFormat.previewW / currentFormat.width) * 3}px`,
                fontWeight: text.fontWeight,
                color: text.color,
                textAlign: text.align,
                zIndex: 10,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                maxWidth: '90%',
                lineHeight: 1.3,
                cursor: 'pointer',
                outline: selectedText === text.id ? '2px dashed rgba(255,255,255,0.5)' : 'none',
                padding: '4px 8px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
              onClick={() => setSelectedText(text.id)}
            >
              {text.content}
            </div>
          ))}

          {showCta && (
            <div style={{
              position: 'absolute',
              bottom: '10%',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '10px 28px',
              background: ctaColor,
              color: '#fff',
              borderRadius: '30px',
              fontFamily: brandData?.bodyFont || 'Inter',
              fontSize: `${14 * (currentFormat.previewW / currentFormat.width) * 3}px`,
              fontWeight: 600,
              zIndex: 10,
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              letterSpacing: '0.02em',
              whiteSpace: 'nowrap',
            }}>
              {ctaText}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
