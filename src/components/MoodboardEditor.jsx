import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, Layout, Image as ImageIcon, Sparkles, Trash2, Save, Move, Grid, Palette, Type } from 'lucide-react';

export default function MoodboardEditor({ brandData, onNotify }) {
  const [images, setImages] = useState([]);
  const [layout, setLayout] = useState('masonry');
  const [spacing, setSpacing] = useState(15);
  const [isExporting, setIsExporting] = useState(false);
  const [boardTitle, setBoardTitle] = useState('Concept Moodboard');

  const previewRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const readers = files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve({ id: Date.now() + Math.random(), src: event.target.result });
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(newImages => {
        setImages(prev => [...prev, ...newImages]);
        onNotify?.(`${newImages.length} imagens adicionadas!`, 'success');
      });
    }
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleExport = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false
      });
      const link = document.createElement('a');
      link.download = `Moodboard_${brandData?.brandName || 'brand'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      onNotify?.('Moodboard exportado!', 'success');
    } catch (err) {
      onNotify?.('Erro na exportação.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const colors = [
    brandData?.color1 || '#1a1a1a',
    brandData?.color2 || '#ffffff',
    brandData?.color3 || '#666666'
  ];

  return (
    <div className="social-editor">
      <div className="social-editor-sidebar">
        <div className="social-editor-header">
          <h2>Moodboard Automático</h2>
          <p style={{ fontSize: '0.7rem', color: '#64748b' }}>Curadoria visual da marca</p>
        </div>

        <div className="social-editor-controls">
          <div className="social-editor-section">
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ImageIcon size={14} /> Imagens de Referência
            </h3>
            <input type="file" multiple ref={fileInputRef} onChange={handleUpload} accept="image/*" style={{ display: 'none' }} />
            <button className="social-upload-btn" onClick={() => fileInputRef.current?.click()}>
              Adicionar Imagens
            </button>
            <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '8px' }}>
              Dica: Use fotos que transmitam a personalidade da marca.
            </p>
          </div>

          <div className="social-editor-section" style={{ marginTop: '20px' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layout size={14} /> Configurações
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.65rem', color: '#64748b' }}>Estilo de Grade</label>
                <div className="social-bg-type-row">
                  <button className={`social-bg-type-btn ${layout === 'masonry' ? 'active' : ''}`} onClick={() => setLayout('masonry')}>Mosaico</button>
                  <button className={`social-bg-type-btn ${layout === 'grid' ? 'active' : ''}`} onClick={() => setLayout('grid')}>Rígido</button>
                  <button className={`social-bg-type-btn ${layout === 'minimal' ? 'active' : ''}`} onClick={() => setLayout('minimal')}>Minimal</button>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.65rem', color: '#64748b' }}>Espaçamento: {spacing}px</label>
                <input type="range" min="0" max="40" value={spacing} onChange={e => setSpacing(parseInt(e.target.value))} style={{ width: '100%' }} />
              </div>
              <input 
                type="text" 
                value={boardTitle} 
                onChange={e => setBoardTitle(e.target.value)} 
                className="form-input" 
                placeholder="Título do Board"
              />
            </div>
          </div>
        </div>

        <div className="social-editor-actions">
          <button className="btn btn-primary" onClick={handleExport} disabled={isExporting || images.length === 0} style={{ width: '100%' }}>
            <Download size={16} /> {isExporting ? 'Gerando...' : 'Exportar Moodboard'}
          </button>
        </div>
      </div>

      <div className="social-editor-preview">
        <div ref={previewRef} style={{ 
          width: '700px', 
          minHeight: '800px', 
          backgroundColor: '#fff', 
          padding: '60px', 
          position: 'relative',
          boxShadow: '0 20px 50px rgba(0,0,0,0.1)'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
            <div>
              <h1 style={{ fontFamily: brandData?.headingFont || 'serif', fontSize: '2.5rem', color: brandData?.color1 || '#1a1a1a', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>
                {boardTitle}
              </h1>
              <p style={{ fontFamily: brandData?.bodyFont || 'sans-serif', color: '#64748b', margin: '5px 0 0 0', textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.7rem', fontWeight: 600 }}>
                {brandData?.brandName || 'Visual Brand Direction'} • Moodboard
              </p>
            </div>
            {brandData?.logo && <img src={brandData.logo} alt="" style={{ height: '40px' }} />}
          </div>

          {/* Color Palette Overlay */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
            {colors.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f8fafc', padding: '5px 12px', borderRadius: '30px', border: '1px solid #e2e8f0' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }} />
                <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#475569' }}>{c}</span>
              </div>
            ))}
          </div>

          {/* Images Board */}
          {images.length > 0 ? (
            <div style={{ 
              display: layout === 'grid' ? 'grid' : 'flex',
              flexWrap: layout === 'grid' ? 'none' : 'wrap',
              gridTemplateColumns: layout === 'grid' ? 'repeat(3, 1fr)' : 'none',
              gap: `${spacing}px`,
              alignItems: 'flex-start'
            }}>
              {images.map((img, idx) => (
                <div key={img.id} style={{ 
                  position: 'relative',
                  width: layout === 'grid' ? '100%' : (layout === 'minimal' ? '48%' : (idx % 3 === 0 ? '60%' : '38%')),
                  flexGrow: layout === 'masonry' ? 1 : 0,
                  height: layout === 'grid' ? '200px' : 'auto',
                  overflow: 'hidden',
                  borderRadius: layout === 'minimal' ? '0' : '8px',
                  boxShadow: layout === 'minimal' ? 'none' : '0 10px 20px rgba(0,0,0,0.05)'
                }}>
                  <img src={img.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <button 
                    onClick={() => removeImage(img.id)}
                    className="moodboard-remove-btn"
                    style={{ 
                      position: 'absolute', top: '10px', right: '10px', 
                      background: 'rgba(255,255,255,0.8)', border: 'none', 
                      borderRadius: '50%', width: '24px', height: '24px', 
                      cursor: 'pointer', display: 'flex', alignItems: 'center', 
                      justifyContent: 'center', color: '#ef4444' 
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              height: '500px', 
              border: '2px dashed #e2e8f0', 
              borderRadius: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#94a3b8'
            }}>
              <Sparkles size={40} style={{ marginBottom: '20px', opacity: 0.5 }} />
              <p>Comece fazendo o upload de referências visuais</p>
              <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} style={{ marginTop: '10px' }}>Upload</button>
            </div>
          )}

          {/* Footer Branding */}
          <div style={{ position: 'absolute', bottom: '60px', right: '60px', left: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.5 }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px' }}>© {new Date().getFullYear()} Brand DNA System</span>
            <div style={{ display: 'flex', gap: '20px', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <span>Concept</span>
              <span>•</span>
              <span>Tone of Voice</span>
              <span>•</span>
              <span>Visual Soul</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
