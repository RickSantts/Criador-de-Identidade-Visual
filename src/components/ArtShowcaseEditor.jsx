import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, Upload, Image as ImageIcon, Type, ChevronDown, ChevronUp, ShieldCheck, Grid3X3, Maximize, Trash2, Save } from 'lucide-react';

const SectionHeader = ({ id, icon, title, children, expandedSection, onToggle }) => (
  <div className="social-editor-section">
    <button className="social-section-toggle" onClick={() => onToggle(id)}>
      <span className="social-section-toggle-left">{icon}<span>{title}</span></span>
      {expandedSection === id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </button>
    {expandedSection === id && <div className="social-section-content">{children}</div>}
  </div>
);

export default function ArtShowcaseEditor({ brandData, onNotify }) {
  const [artImage, setArtImage] = useState(null);
  const [frameStyle, setFrameStyle] = useState('shadow');
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.15);
  const [watermarkSize, setWatermarkSize] = useState(120);
  const [watermarkType, setWatermarkType] = useState('center');
  const [watermarkImage, setWatermarkImage] = useState(null);
  const [expandedSection, setExpandedSection] = useState('art');
  const [isExporting, setIsExporting] = useState(false);
  const [bgColor, setBgColor] = useState('#f8fafc');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [showLogo, setShowLogo] = useState(true);

  const previewRef = useRef(null);
  const fileInputRef = useRef(null);
  const watermarkInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setArtImage(event.target.result);
        onNotify?.('Arte carregada com sucesso!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWatermarkUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setWatermarkImage(event.target.result);
        onNotify?.('Marca d\'água configurada!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeArt = () => {
    setArtImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeWatermark = () => {
    setWatermarkImage(null);
    if (watermarkInputRef.current) watermarkInputRef.current.value = '';
  };

  const handleExport = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 3, useCORS: true, backgroundColor: bgColor, logging: false
      });
      const link = document.createElement('a');
      link.download = `${brandData?.brandName || 'showcase'}_art.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      onNotify?.('Exportação concluída!', 'success');
    } catch (err) {
      console.error(err);
      onNotify?.('Erro na exportação.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveToHistory = async () => {
    if (!previewRef.current || !artImage) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, { scale: 0.5, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const historyItem = {
        id: Date.now(),
        type: 'Art Showcase',
        title: title || 'Showcase de Arte',
        date: new Date().toLocaleString(),
        image: imgData
      };
      
      const existing = JSON.parse(localStorage.getItem('finalized_projects') || '[]');
      localStorage.setItem('finalized_projects', JSON.stringify([historyItem, ...existing]));
      onNotify?.('Salvo na Galeria!', 'success');
    } catch (err) {
      console.error(err);
      onNotify?.('Erro ao salvar.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleSection = (s) => setExpandedSection(prev => prev === s ? null : s);

  const primaryColor = brandData?.color1 || '#1a1a1a';
  const logoToUse = watermarkImage || brandData?.logo;

  const renderWatermark = () => {
    if (!watermarkEnabled || !logoToUse) return null;

    if (watermarkType === 'center') {
      return (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 20,
          pointerEvents: 'none',
          padding: '20px'
        }}>
          <img src={logoToUse} alt="" style={{ width: `${watermarkSize}px`, opacity: watermarkOpacity }} />
        </div>
      );
    }

    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 20,
        pointerEvents: 'none',
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, ${watermarkSize}px)`,
        gridTemplateRows: `repeat(auto-fill, ${watermarkSize}px)`,
        gap: '60px',
        padding: '40px',
        justifyContent: 'center',
        alignContent: 'center',
        opacity: watermarkOpacity,
        transform: 'rotate(-15deg) scale(1.2)',
      }}>
        {Array.from({ length: 30 }).map((_, i) => (
          <img key={i} src={logoToUse} alt="" style={{ width: '100%' }} />
        ))}
      </div>
    );
  };

  return (
    <div className="social-editor">
      <div className="social-editor-sidebar">
        <div className="social-editor-header">
          <h2>Showcase de Arte</h2>
        </div>

        <div className="social-editor-controls">
          <SectionHeader id="art" icon={<ImageIcon size={14} />} title="Sua Arte" expandedSection={expandedSection} onToggle={toggleSection}>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
            {!artImage ? (
              <button className="social-upload-btn" onClick={() => fileInputRef.current?.click()}>Upload da Arte</button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="social-upload-btn" onClick={() => fileInputRef.current?.click()}>Trocar</button>
                <button onClick={removeArt} style={{ padding: '8px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            )}
            <div style={{ marginTop: '10px' }}>
              <label style={{ fontSize: '0.65rem', color: '#64748b' }}>Efeito</label>
              <div className="social-bg-type-row">
                <button className={`social-bg-type-btn ${frameStyle === 'shadow' ? 'active' : ''}`} onClick={() => setFrameStyle('shadow')}>Sombra</button>
                <button className={`social-bg-type-btn ${frameStyle === 'border' ? 'active' : ''}`} onClick={() => setFrameStyle('border')}>Borda</button>
                <button className={`social-bg-type-btn ${frameStyle === 'none' ? 'active' : ''}`} onClick={() => setFrameStyle('none')}>Nenhum</button>
              </div>
            </div>
          </SectionHeader>

          <SectionHeader id="watermark" icon={<ShieldCheck size={14} />} title="Marca d'Água" expandedSection={expandedSection} onToggle={toggleSection}>
            <label className="checkbox-label">
              <input type="checkbox" checked={watermarkEnabled} onChange={e => setWatermarkEnabled(e.target.checked)} /> Ativar
            </label>
            {watermarkEnabled && (
              <div style={{ marginTop: '10px' }}>
                <div className="social-bg-type-row">
                  <button className={`social-bg-type-btn ${watermarkType === 'center' ? 'active' : ''}`} onClick={() => setWatermarkType('center')}>Centro</button>
                  <button className={`social-bg-type-btn ${watermarkType === 'pattern' ? 'active' : ''}`} onClick={() => setWatermarkType('pattern')}>Padrão</button>
                </div>
                <label style={{ fontSize: '0.65rem', color: '#64748b' }}>Opacidade: {Math.round(watermarkOpacity * 100)}%</label>
                <input type="range" min="0.05" max="0.6" step="0.05" value={watermarkOpacity} onChange={e => setWatermarkOpacity(parseFloat(e.target.value))} style={{ width: '100%' }} />
                <label style={{ fontSize: '0.65rem', color: '#64748b' }}>Tamanho: {watermarkSize}px</label>
                <input type="range" min="30" max="350" value={watermarkSize} onChange={e => setWatermarkSize(parseInt(e.target.value))} style={{ width: '100%' }} />
                <input type="file" ref={watermarkInputRef} onChange={handleWatermarkUpload} accept="image/*" style={{ display: 'none' }} />
                {!watermarkImage ? (
                  <button className="social-upload-btn" onClick={() => watermarkInputRef.current?.click()}>Upload Logo</button>
                ) : (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="social-upload-btn" onClick={() => watermarkInputRef.current?.click()}>Trocar</button>
                    <button onClick={removeWatermark} style={{ padding: '8px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><Trash2 size={12} /></button>
                  </div>
                )}
              </div>
            )}
          </SectionHeader>

          <SectionHeader id="info" icon={<Type size={14} />} title="Identificação" expandedSection={expandedSection} onToggle={toggleSection}>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="form-input" placeholder="Título" />
            <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} className="form-input" placeholder="Subtítulo" style={{ marginTop: '5px' }} />
            <div style={{ marginTop: '10px' }}>
              <label>Fundo</label>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} />
            </div>
          </SectionHeader>
        </div>

        <div className="social-editor-actions">
          <button className="btn btn-primary" onClick={handleExport} disabled={isExporting || !artImage} style={{ width: '100%' }}>
            <Download size={16} /> {isExporting ? 'Exportando...' : 'Exportar'}
          </button>
          <button className="btn btn-secondary" onClick={handleSaveToHistory} disabled={isExporting || !artImage} style={{ width: '100%', marginTop: '8px' }}>
            <Save size={16} /> Salvar na Galeria
          </button>
        </div>
      </div>

      <div className="social-editor-preview">
        <div ref={previewRef} style={{ width: '600px', minHeight: '600px', backgroundColor: bgColor, display: 'flex', flexDirection: 'column', padding: '40px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', zIndex: 3 }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{title || 'Título'}</h3>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' }}>{subtitle}</p>
            </div>
            {showLogo && brandData?.logo && (
              <img src={brandData.logo} alt="" style={{ height: '30px' }} />
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {artImage ? (
              <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={artImage} alt="Arte" style={{ width: '100%', height: 'auto', objectFit: 'contain', boxShadow: frameStyle === 'shadow' ? '0 30px 60px rgba(0,0,0,0.2)' : 'none', border: frameStyle === 'border' ? '2px solid #fff' : 'none', borderRadius: '4px' }} />
                {renderWatermark()}
              </div>
            ) : (
              <div style={{ width: '100%', minHeight: '400px', border: '2px dashed #cbd5e1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <span>Sua arte aparecerá aqui</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}