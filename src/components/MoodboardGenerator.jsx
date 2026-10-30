import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Palette, Image as ImageIcon, Sparkles, Share2, Heart, ExternalLink } from 'lucide-react';
import html2canvas from 'html2canvas';

const MOODBOARD_STYLES = {
  minimalist: { name: 'Minimalista', keywords: ['minimalist', 'clean', 'architecture', 'neutral'] },
  luxury: { name: 'Luxuoso', keywords: ['luxury', 'gold', 'jewelry', 'texture', 'velvet'] },
  tech: { name: 'Tech / Moderno', keywords: ['technology', 'neon', 'futuristic', 'circuit', 'glass'] },
  organic: { name: 'Orgânico / Natureza', keywords: ['nature', 'plants', 'wood', 'organic', 'earthy'] },
  bold: { name: 'Vibrante / Criativo', keywords: ['colorful', 'abstract', 'pop art', 'bold', 'graphic'] },
};

export default function MoodboardGenerator({ brandData, onNotify }) {
  const [style, setStyle] = useState('minimalist');
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [layout, setLayout] = useState('grid1'); // grid1, grid2, mosaic
  const previewRef = React.useRef(null);

  const primaryColor = brandData?.color1 || '#4f46e5';

  const fetchMoodboardImages = async () => {
    setIsLoading(true);
    // Curated high-quality Unsplash IDs for each style
    const styleAssets = {
      minimalist: [
        '1494438639946-1ebd1d20bf85', // Architecture
        '1486406146926-c627a92ad1ab', // Glass building
        '1507652313519-d451e17400de', // Clean interior
        '1449247709967-d4461a6a6103', // White desk
        '1489769002049-ccd828976a6c', // Minimal art
        '1518005020251-58478472505b'  // Textures
      ],
      luxury: [
        '1513519245088-0e12902e5a38', // Gold details
        '1536502829567-baf7d44c2049', // Velvet
        '1600607687920-4e2a12ca6a05', // Luxury lobby
        '1517467134444-8305007f509c', // Watch/Detail
        '1450633306621-e37996759530', // Silk
        '1509339015596-658c82ab3e8d'  // Diamonds
      ],
      tech: [
        '1518770660439-4636190af475', // Circuit
        '1550745165-9bc0b252726f', // High tech hardware
        '1451187580459-43490279c0fa', // Data/Cyber
        '1504384308090-c894fdcc538d', // Workspace
        '1581091226825-a6a2a5aee158', // Neon lab
        '1635070041078-e363dbe005cb'  // Abstract physics
      ],
      organic: [
        '1523348830342-d01fb9131052', // Plants
        '1495107335759-7f3b92744060', // Earthy tones
        '1441974231531-c6227db76b6e', // Forest
        '1501785888041-af3ef285b470', // Landscape
        '1518531933037-91b2f5f229cc', // Wood texture
        '1542601906990-b4d3fb778b09'  // Leaves
      ],
      bold: [
        '1541701494587-cb58502866ab', // Abstract colors
        '1508247469910-539655225d3a', // Pop art
        '1550684848-fac1c5b4e853', // Geometric
        '1500462859273-099772947c53', // Neon lights
        '1579783902614-a3fb3927b6a5', // Bold painting
        '1533109721025-d1ae7ee7c1e1'  // Shapes
      ]
    };

    const ids = styleAssets[style] || styleAssets.minimalist;
    const newImages = ids.map(id => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`);
    setImages(newImages);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMoodboardImages();
  }, [style]);

  const handleExport = async () => {
    if (!previewRef.current) return;
    try {
      const canvas = await html2canvas(previewRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `Moodboard_${brandData?.brandName || 'Brand'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      onNotify?.('Moodboard exportado!', 'success');
    } catch (err) {
      onNotify?.('Erro ao exportar.', 'error');
    }
  };

  return (
    <div className="social-editor">
      <div className="social-editor-sidebar">
        <div className="social-editor-header">
          <h2>🖼️ Moodboard Automático</h2>
          <p>Inspiração visual baseada na alma da sua marca</p>
        </div>

        <div className="social-editor-controls">
          <div className="social-editor-section">
            <h3 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '10px', color: '#64748b' }}>Estilo de Referência</h3>
            <div className="social-format-grid">
              {Object.entries(MOODBOARD_STYLES).map(([key, s]) => (
                <button 
                  key={key} 
                  className={`social-format-btn ${style === key ? 'active' : ''}`}
                  onClick={() => setStyle(key)}
                >
                  <span className="social-format-name">{s.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="social-editor-section" style={{ marginTop: '20px' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '10px', color: '#64748b' }}>Paleta Atual</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[brandData?.color1, brandData?.color2, brandData?.color3].filter(Boolean).map((c, i) => (
                <div key={i} style={{ width: '30px', height: '30px', borderRadius: '50%', background: c, border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
              ))}
            </div>
          </div>
        </div>

        <div className="social-editor-actions">
          <button className="btn btn-secondary" onClick={fetchMoodboardImages} style={{ width: '100%', marginBottom: '10px' }}>
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Recarregar Inspirações
          </button>
          <button className="btn btn-primary" onClick={handleExport} style={{ width: '100%' }}>
            <Download size={16} /> Exportar Moodboard
          </button>
        </div>
      </div>

      <div className="social-editor-preview" style={{ background: '#f1f5f9' }}>
        <div 
          ref={previewRef}
          style={{ 
            width: '500px', 
            height: '700px', 
            background: '#fff', 
            padding: '30px', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(6, 1fr)',
            gridTemplateRows: 'repeat(10, 1fr)',
            gap: '15px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
            borderRadius: '4px'
          }}
        >
          {/* Header of Moodboard */}
          <div style={{ gridColumn: '1 / span 6', gridRow: '1 / span 1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontFamily: brandData?.headingFont || 'serif', color: '#1a1a1a', margin: 0 }}>{brandData?.brandName || 'Brand Name'}</h1>
              <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#999' }}>Visual Moodboard / {MOODBOARD_STYLES[style].name}</p>
            </div>
            {brandData?.logo && <img src={brandData.logo} alt="" style={{ height: '30px' }} />}
          </div>

          {/* Image Grid - Artistic Layout */}
          <div style={{ gridColumn: '1 / span 4', gridRow: '2 / span 4', background: '#f8f9fa', overflow: 'hidden', borderRadius: '4px' }}>
            <img src={images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          
          <div style={{ gridColumn: '5 / span 2', gridRow: '2 / span 2', background: '#f8f9fa', overflow: 'hidden', borderRadius: '4px' }}>
            <img src={images[1]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ gridColumn: '5 / span 2', gridRow: '4 / span 2', background: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', borderRadius: '4px', padding: '15px' }}>
            <div style={{ textAlign: 'center' }}>
              <Palette size={24} style={{ marginBottom: '5px' }} />
              <div style={{ fontSize: '10px', fontWeight: 600 }}>{primaryColor}</div>
            </div>
          </div>

          <div style={{ gridColumn: '1 / span 3', gridRow: '6 / span 3', background: '#f8f9fa', overflow: 'hidden', borderRadius: '4px' }}>
            <img src={images[2]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ gridColumn: '4 / span 3', gridRow: '6 / span 2', background: '#f8f9fa', overflow: 'hidden', borderRadius: '4px' }}>
            <img src={images[3]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ gridColumn: '4 / span 3', gridRow: '8 / span 3', background: '#f8f9fa', overflow: 'hidden', borderRadius: '4px' }}>
            <img src={images[4]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ gridColumn: '1 / span 3', gridRow: '9 / span 2', background: '#f8f9fa', overflow: 'hidden', borderRadius: '4px' }}>
            <img src={images[5]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Color swatches at bottom */}
          <div style={{ gridColumn: '1 / span 6', gridRow: '11 / span 1', display: 'flex', gap: '10px', marginTop: '10px' }}>
            {[brandData?.color1, brandData?.color2, brandData?.color3, '#f1f5f9', '#1e293b'].filter(Boolean).map((c, i) => (
              <div key={i} style={{ flex: 1, height: '100%', background: c, borderRadius: '2px' }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
