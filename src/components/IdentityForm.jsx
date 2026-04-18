import React, { useState } from 'react';
import { Type, Palette, Image, FileText, Download, Layout, Search, Grid3X3, Layers, Maximize2, Minimize2, Sun, Moon, Zap, Briefcase, Mic, Ban, GitMerge } from 'lucide-react';

const DEFAULT_DONTS = [
  'Não distorcer o logo',
  'Não alterar as cores',
  'Não girar o logo',
  'Não adicionar efeitos',
  'Não usar sobre fundos cluttereds'
];

const POPULAR_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display', 
  'Poppins', 'Oswald', 'Raleway', 'Merriweather', 'Lora', 'PT Sans', 
  'Nunito', 'Ubuntu', 'Arvo', 'Josefin Sans', 'Abril Fatface', 'Dancing Script',
  'Pacifico', 'Kanit', 'Rubik', 'Quicksand', 'Bebas Neue', 'Source Sans Pro'
];

const IdentityForm = ({ formData, setFormData, onGeneratePDF, pageCount }) => {
  const [fontSearch, setFontSearch] = useState({ heading: '', body: '' });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleLogoUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredHeadingFonts = POPULAR_FONTS.filter(f => f.toLowerCase().includes(fontSearch.heading.toLowerCase()));
  const filteredBodyFonts = POPULAR_FONTS.filter(f => f.toLowerCase().includes(fontSearch.body.toLowerCase()));

  return (
    <div className="sidebar animate-fade-in">
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>Visual Identity Creator</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Crie seu manual de identidade visual.</p>
        </div>
        <div className="page-badge">
          {pageCount} {pageCount === 1 ? 'Página' : 'Páginas'}
        </div>
      </div>

      {/* 1. Nome da Marca */}
      <div className="form-group">
        <label className="form-label">Nome da Marca</label>
        <input type="text" name="brandName" className="form-input" value={formData.brandName} onChange={handleChange} placeholder="Ex: Nebula Studio" spellCheck="false" />
      </div>

      {/* 1. Sistema de Logos */}
      <div className="form-group">
        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span><Image size={14} /> 1. Sistema de Logos</span>
          <label className="toggle-switch">
            <input type="checkbox" name="showGrid" checked={formData.showGrid} onChange={handleChange} />
            <span className="toggle-slider"></span>
            <span style={{ fontSize: '0.65rem', marginLeft: '2rem' }}>Gridlines</span>
          </label>
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>Mestra / Principal</label>
            <input type="file" accept="image/*" className="form-input" onChange={(e) => handleLogoUpload(e, 'logo')} />
          </div>
          <div>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>Secundária</label>
            <input type="file" accept="image/*" className="form-input" onChange={(e) => handleLogoUpload(e, 'logoSecondary')} />
          </div>
          <div>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>Ícone / Símbolo</label>
            <input type="file" accept="image/*" className="form-input" onChange={(e) => handleLogoUpload(e, 'logoSymbol')} />
          </div>
        </div>
      </div>

      {/* 1.1 Área de Proteção */}
      <div className="form-group">
        <label className="form-label"><Maximize2 size={14} /> 1.1 Área de Proteção (Clear Space)</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>Área de Respiro (%)</label>
            <input type="number" name="clearSpace" className="form-input" value={formData.clearSpace} onChange={handleChange} min="5" max="50" />
          </div>
          <div>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>Tamanho Mínimo (mm)</label>
            <input type="number" name="minSize" className="form-input" value={formData.minSize} onChange={handleChange} min="5" max="100" />
          </div>
        </div>
      </div>

      {/* 2. Paleta Cromática */}
      <div className="form-group">
        <label className="form-label"><Palette size={14} /> 2. Paleta de Cores (Hex)</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.25rem' }}>
          {[1,2,3,4,5].map(num => (
            <div key={num}>
              <input type="color" name={`color${num}`} value={formData[`color${num}`]} onChange={handleChange} className="form-color-input" />
            </div>
          ))}
        </div>
      </div>

      {/* 2.1 CMYK & Pantone */}
      <div className="form-group">
        <label className="form-label"><Palette size={14} /> 2.1 Cores para Impressão (CMYK & Pantone)</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[1,2,3].map(num => (
            <div key={num} style={{ display: 'grid', gridTemplateColumns: '30px 1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ width: 30, height: 30, borderRadius: 4, backgroundColor: formData[`color${num}`], border: '1px solid #e2e8f0' }}></div>
              <input type="text" name={`color${num}Cmyk`} className="form-input" value={formData[`color${num}Cmyk`]} onChange={handleChange} placeholder="CMYK (ex: 80, 10, 0, 0)" />
              <input type="text" name={`color${num}Pantone`} className="form-input" value={formData[`color${num}Pantone`]} onChange={handleChange} placeholder="Pantone (ex: 293 C)" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Tipografia */}
      <div className="form-group">
        <label className="form-label"><Type size={14} /> 3. Tipografia (Google Fonts)</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div className="font-picker-container">
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>Títulos</label>
            <div className="search-input-wrapper">
              <Search size={12} className="search-icon" />
              <input 
                type="text" 
                className="form-input search-input" 
                placeholder="Buscar..." 
                value={fontSearch.heading} 
                onChange={(e) => setFontSearch(prev => ({...prev, heading: e.target.value}))}
              />
            </div>
            <select 
              name="headingFont" 
              className="form-input font-select" 
              value={formData.headingFont} 
              onChange={handleChange}
              size={4}
            >
              {filteredHeadingFonts.map(f => <option key={f} value={f}>{f}</option>)}
              {!POPULAR_FONTS.includes(formData.headingFont) && <option value={formData.headingFont}>{formData.headingFont}</option>}
            </select>
          </div>
          <div className="font-picker-container">
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>Corpo</label>
            <div className="search-input-wrapper">
              <Search size={12} className="search-icon" />
              <input 
                type="text" 
                className="form-input search-input" 
                placeholder="Buscar..." 
                value={fontSearch.body} 
                onChange={(e) => setFontSearch(prev => ({...prev, body: e.target.value}))}
              />
            </div>
            <select 
              name="bodyFont" 
              className="form-input font-select" 
              value={formData.bodyFont} 
              onChange={handleChange}
              size={4}
            >
              {filteredBodyFonts.map(f => <option key={f} value={f}>{f}</option>)}
              {!POPULAR_FONTS.includes(formData.bodyFont) && <option value={formData.bodyFont}>{formData.bodyFont}</option>}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Variações de Cor */}
      <div className="form-group">
        <label className="form-label"><Zap size={14} /> 4. Variações de Cor</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="checkbox-label">
            <input type="checkbox" name="showPositive" checked={formData.showPositive} onChange={handleChange} />
            <Sun size={14} /> Versão Positiva (cores originais)
          </label>
          <label className="checkbox-label">
            <input type="checkbox" name="showNegative" checked={formData.showNegative} onChange={handleChange} />
            <Moon size={14} /> Versão Negativa (inverso)
          </label>
          <label className="checkbox-label">
            <input type="checkbox" name="showMonochrome" checked={formData.showMonochrome} onChange={handleChange} />
            <Zap size={14} /> Versão Monocromática
          </label>
        </div>
      </div>

      {/* Logos Alternativas */}
      <div className="form-group">
        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span><Image size={14} /> Logos Alternativas</span>
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>Versão Negativa (fundo escuro)</label>
            <input type="file" accept="image/*" className="form-input" onChange={(e) => handleLogoUpload(e, 'logoNegative')} />
          </div>
          <div>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>Versão Monocromática (preto)</label>
            <input type="file" accept="image/*" className="form-input" onChange={(e) => handleLogoUpload(e, 'logoMonochrome')} />
          </div>
        </div>
      </div>

      {/* 5. Mockups */}
      <div className="form-group">
        <label className="form-label"><Briefcase size={14} /> 5. Mockups de Aplicação</label>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Adicione imagens de mockups da marca em ação (papelaria, fachada, etc.)
        </p>
        <input 
          type="file" 
          accept="image/*" 
          multiple 
          className="form-input" 
          onChange={(e) => {
            const files = Array.from(e.target.files);
            const readers = files.map(file => {
              return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
              });
            });
            Promise.all(readers).then(images => {
              setFormData(prev => ({ ...prev, mockups: [...prev.mockups, ...images] }));
            });
          }} 
        />
        {formData.mockups && formData.mockups.length > 0 && (
          <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {formData.mockups.map((m, i) => (
              <div key={i} style={{ position: 'relative', width: '60px', height: '60px' }}>
                <img src={m} alt={`Mockup ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.25rem' }} />
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, mockups: prev.mockups.filter((_, idx) => idx !== i) }))}
                  style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: 'red', color: 'white', border: 'none', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 6. Tom de Voz */}
      <div className="form-group">
        <label className="form-label"><Mic size={14} /> 6. Tom de Voz</label>
        <textarea
          name="toneOfVoice"
          className="form-textarea"
          value={formData.toneOfVoice}
          onChange={handleChange}
          placeholder="Descreva como a marca se comunica..."
          style={{ minHeight: '80px', fontSize: '0.875rem' }}
        />
      </div>

      {/* 7. O Que NÃO Fazer */}
      <div className="form-group">
        <label className="form-label"><Ban size={14} /> 7. O Que NÃO Fazer</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {DEFAULT_DONTS.map((dont, idx) => (
            <label key={idx} className="checkbox-label">
              <input 
                type="checkbox" 
                checked={formData.donts ? formData.donts.includes(dont) : false}
                onChange={(e) => {
                  const currentDonts = formData.donts || [];
                  if (e.target.checked) {
                    setFormData(prev => ({ ...prev, donts: [...currentDonts, dont] }));
                  } else {
                    setFormData(prev => ({ ...prev, donts: currentDonts.filter(d => d !== dont) }));
                  }
                }}
              />
              <Ban size={14} /> {dont}
            </label>
          ))}
        </div>
      </div>

      {/* 8. Padrão Gráfico */}
      <div className="form-group">
        <label className="form-label"><GitMerge size={14} /> 8. Padrão Gráfico (Pattern)</label>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Elemento visual repetível para backgrounds
        </p>
        <input type="file" accept="image/*" className="form-input" onChange={(e) => handleLogoUpload(e, 'pattern')} />
      </div>

      {/* Razão Áurea (anexo ao Pattern) */}
      <div className="form-group">
        <label className="form-label"><Layout size={14} /> Razão Áurea</label>
        <select name="goldenRatio" className="form-input" value={formData.goldenRatio} onChange={handleChange}>
          <option value="1:1.618">1 : 1.618 (Clássica)</option>
          <option value="1:1.414">1 : 1.414 (Raiz de 2)</option>
          <option value="1:1.333">1 : 1.333 (4:3)</option>
          <option value="1:1">1 : 1 (Quadrado)</option>
        </select>
      </div>

      {/* Alma da Marca (MVV) */}
      <div className="form-group">
        <label className="form-label"><Layers size={14} /> Alma da Marca (MVV)</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input type="text" name="mission" className="form-input" value={formData.mission} onChange={handleChange} placeholder="Missão" />
          <input type="text" name="vision" className="form-input" value={formData.vision} onChange={handleChange} placeholder="Visão" />
          <input type="text" name="values" className="form-input" value={formData.values} onChange={handleChange} placeholder="Valores (separados por vírgula)" />
        </div>
      </div>

      {/* 9. Manual & Termos */}
      <div className="form-group">
        <label className="form-label"><FileText size={14} /> 9. Manual & Termos</label>
        <textarea
          name="manualContent"
          className="form-textarea"
          value={formData.manualContent}
          onChange={handleChange}
          style={{ minHeight: '150px', fontSize: '0.875rem' }}
        />
      </div>

      <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={onGeneratePDF}>
        <Download size={18} /> Exportar PDF
      </button>
    </div>
  );
};

export default IdentityForm;