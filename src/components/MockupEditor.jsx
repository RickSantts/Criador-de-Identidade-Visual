import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, ChevronLeft, ChevronRight, Maximize, RotateCcw, Image as ImageIcon, Briefcase, Layout, Smartphone, Eye, Settings2 } from 'lucide-react';

const MOCKUP_SCENES = [
  {
    id: 'iphone_15_pro',
    name: 'iPhone 15 Pro Max',
    category: 'Digital / UX',
    background: 'https://images.unsplash.com/photo-1556656793-062ff98782ee?auto=format&fit=crop&w=1200&q=80',
    logoStyles: {
      top: '41%', left: '50%', 
      transform: 'translate(-50%, -50%) rotate(0.5deg)', 
      width: '26%', 
      opacity: 0.95, 
      mixBlendMode: 'normal',
      filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))'
    },
    overlay: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)',
      blendMode: 'screen'
    }
  },
  {
    id: 'minimalist_business_card',
    name: 'Cartão de Visita Premium',
    category: 'Print / Branding',
    background: 'https://images.unsplash.com/photo-1596633605700-1efc9b49e277?auto=format&fit=crop&w=1200&q=80',
    logoStyles: {
      top: '42%', left: '46%', 
      transform: 'translate(-50%, -50%) rotateX(45deg) rotateZ(-32deg) skewX(5deg)', 
      width: '24%', 
      opacity: 0.8, 
      mixBlendMode: 'multiply',
      filter: 'contrast(1.1) brightness(0.8) blur(0.2px)'
    },
    overlay: null
  },
  {
    id: 'luxury_bag',
    name: 'Sacola de Papel Kraft',
    category: 'Packaging',
    background: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80',
    logoStyles: {
      top: '55%', left: '50%', 
      transform: 'translate(-50%, -50%) rotate(-1deg)', 
      width: '32%', 
      opacity: 0.85, 
      mixBlendMode: 'multiply',
      filter: 'blur(0.4px) contrast(1.2)'
    },
    overlay: {
      background: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")',
      opacity: 0.2,
      blendMode: 'overlay'
    }
  },
  {
    id: 'wall_signage',
    name: 'Letreiro Acrílico',
    category: 'Interior / Office',
    background: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&w=1200&q=80',
    logoStyles: {
      top: '32%', left: '50%', 
      transform: 'translate(-50%, -50%) rotateY(15deg)', 
      width: '22%', 
      opacity: 0.9, 
      filter: 'drop-shadow(5px 5px 15px rgba(0,0,0,0.4)) brightness(1.2) contrast(1.1)'
    },
    overlay: {
      background: 'linear-gradient(90deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
      blendMode: 'soft-light'
    }
  }
];

export default function MockupEditor({ brandData, onNotify }) {
  const [activeSceneIdx, setActiveSceneIdx] = useState(0);
  const [logoScale, setLogoScale] = useState(1);
  const [logoOpacity, setLogoOpacity] = useState(0.85);
  const [logoRotate, setLogoRotate] = useState(0);
  const [logoY, setLogoY] = useState(0);
  const [logoX, setLogoX] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef(null);

  const scene = MOCKUP_SCENES[activeSceneIdx];

  const handleExport = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        useCORS: true,
        scale: 3,
        backgroundColor: null,
        logging: false
      });
      const link = document.createElement('a');
      link.download = `Premium_Mockup_${scene.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      onNotify?.('Mockup exportado com sucesso!', 'success');
    } catch (err) {
      onNotify?.('Erro na exportação.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="social-editor" style={{ height: 'calc(100vh - 100px)' }}>
      <div className="social-editor-sidebar">
        <div className="social-editor-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
            <div style={{ padding: '8px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: '10px', color: '#fff' }}>
              <Eye size={20} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Mockups Realistas</h2>
              <span style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Premium Engine v2</span>
            </div>
          </div>
        </div>

        <div className="social-editor-controls">
          <div className="social-editor-section">
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '12px', color: '#1e293b', textTransform: 'uppercase' }}>Selecione a Cena</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {MOCKUP_SCENES.map((s, idx) => (
                <button 
                  key={s.id}
                  onClick={() => setActiveSceneIdx(idx)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: activeSceneIdx === idx ? '2px solid #6366f1' : '1px solid #e2e8f0',
                    background: activeSceneIdx === idx ? '#f5f3ff' : '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="social-editor-section" style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
              <Settings2 size={14} color="#6366f1" />
              <h3 style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e293b', margin: 0, textTransform: 'uppercase' }}>Ajustes de Integração</h3>
            </div>
            
            <div className="control-group" style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600 }}>Escala</label>
                <span style={{ fontSize: '0.7rem', color: '#6366f1' }}>{Math.round(logoScale * 100)}%</span>
              </div>
              <input type="range" min="0.1" max="2" step="0.01" value={logoScale} onChange={e => setLogoScale(parseFloat(e.target.value))} style={{ width: '100%' }} />
            </div>

            <div className="control-group" style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600 }}>Rotação Fine-tune</label>
                <span style={{ fontSize: '0.7rem', color: '#6366f1' }}>{logoRotate}°</span>
              </div>
              <input type="range" min="-180" max="180" step="1" value={logoRotate} onChange={e => setLogoRotate(parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div className="control-group">
                <label style={{ fontSize: '0.7rem', fontWeight: 600, display: 'block', marginBottom: '5px' }}>Eixo X</label>
                <input type="range" min="-200" max="200" value={logoX} onChange={e => setLogoX(parseInt(e.target.value))} style={{ width: '100%' }} />
              </div>
              <div className="control-group">
                <label style={{ fontSize: '0.7rem', fontWeight: 600, display: 'block', marginBottom: '5px' }}>Eixo Y</label>
                <input type="range" min="-200" max="200" value={logoY} onChange={e => setLogoY(parseInt(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>

            <div className="control-group" style={{ marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600 }}>Opacidade</label>
                <span style={{ fontSize: '0.7rem', color: '#6366f1' }}>{Math.round(logoOpacity * 100)}%</span>
              </div>
              <input type="range" min="0.1" max="1" step="0.01" value={logoOpacity} onChange={e => setLogoOpacity(parseFloat(e.target.value))} style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        <div className="social-editor-actions">
          <button className="btn btn-primary" onClick={handleExport} disabled={isExporting} style={{ width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <Download size={18} /> {isExporting ? 'Renderizando...' : 'Exportar em Alta Definição'}
          </button>
        </div>
      </div>

      <div className="social-editor-preview" style={{ background: '#f8fafc', padding: '40px' }}>
        <div 
          ref={previewRef}
          style={{ 
            width: '100%', 
            maxWidth: '700px', 
            aspectRatio: '4/3',
            background: `url(${scene.background})`, 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            boxShadow: '0 40px 100px rgba(0,0,0,0.2)',
            borderRadius: '20px',
            overflow: 'hidden',
            margin: '0 auto'
          }}
        >
          {brandData?.logo && (
            <div 
              style={{ 
                position: 'absolute',
                ...scene.logoStyles,
                transform: `${scene.logoStyles.transform} translate(${logoX}px, ${logoY}px) rotate(${logoRotate}deg)`,
                width: `calc(${scene.logoStyles.width} * ${logoScale})`,
                opacity: logoOpacity,
                transition: 'opacity 0.2s ease-out',
                mixBlendMode: scene.logoStyles.mixBlendMode || 'normal',
                perspective: '1200px',
                zIndex: 10
              }}
            >
              <img src={brandData.logo} alt="" style={{ width: '100%', height: 'auto', filter: scene.logoStyles.filter || 'none' }} />
              
              {/* Reality Overlay for Texture and Lighting */}
              {scene.overlay && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: scene.overlay.background,
                  opacity: scene.overlay.opacity || 1,
                  mixBlendMode: scene.overlay.blendMode || 'normal',
                  pointerEvents: 'none',
                  borderRadius: 'inherit'
                }} />
              )}
            </div>
          )}
          
          <div style={{ position: 'absolute', bottom: '25px', right: '25px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.8)', padding: '5px 12px', borderRadius: '20px', backdropFilter: 'blur(5px)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase' }}>{scene.category}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
