import React, { useState, useRef, useCallback } from 'react';
import { Type, Palette, Image, FileText, Download, Layout, Search, Grid3X3, Layers, Maximize2, Minimize2, Sun, Moon, Zap, Briefcase, Mic, Ban, GitMerge, Trash2, Plus, Maximize, Code, History, RotateCcw } from 'lucide-react';

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

const ARCHETYPES = [
  { id: 'hero', name: 'O Herói', desc: 'Determinação e Coragem', icon: '🛡️' },
  { id: 'magician', name: 'O Mago', desc: 'Visão e Transformação', icon: '🔮' },
  { id: 'outlaw', name: 'O Rebelde', desc: 'Liberdade e Quebra de Regras', icon: '💀' },
  { id: 'innocent', name: 'O Inocente', desc: 'Otimismo e Pureza', icon: '✨' },
  { id: 'sage', name: 'O Sábio', desc: 'Conhecimento e Análise', icon: '🧠' },
  { id: 'explorer', name: 'O Explorador', desc: 'Descoberta e Aventura', icon: '🏔️' },
  { id: 'creator', name: 'O Criador', desc: 'Inovação e Expressão', icon: '🎨' },
  { id: 'lover', name: 'O Amante', desc: 'Paixão e Conexão', icon: '❤️' },
  { id: 'jester', name: 'O Bobo da Corte', desc: 'Alegria e Humor', icon: '🃏' },
  { id: 'caregiver', name: 'O Prestativo', desc: 'Cuidado e Proteção', icon: '🤲' },
  { id: 'everyman', name: 'O Cara Comum', desc: 'Pertencimento e Empatia', icon: '🤝' },
  { id: 'ruler', name: 'O Governante', desc: 'Poder e Controle', icon: '👑' },
];

const IdentityForm = ({ 
  formData, 
  setFormData, 
  onGeneratePDF, 
  onExportHTML, 
  onImageUpload, 
  onMockupsUpload,
  onAddExtraColor,
  onUpdateExtraColor,
  onRemoveExtraColor,
  pageCount, 
  validationErrors,
  history,
  onLoadHistory,
  onClearHistory,
  isGenerating,
  onOpenFullscreen,
  templates
}) => {
  const [fontSearch, setFontSearch] = useState({ heading: '', body: '' });
  const [localFonts, setLocalFonts] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const logoInputRefs = useRef({});
  const mockupsRef = useRef();
  const patternRef = useRef();

  React.useEffect(() => {
    if ('queryLocalFonts' in window) {
      window.queryLocalFonts().then(fonts => {
        const uniqueFamilies = [...new Set(fonts.map(f => f.family))].sort();
        setLocalFonts(uniqueFamilies.filter(f => f && f.trim()));
      }).catch(err => {
        console.log('Could not query local fonts:', err);
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleLogoUpload = (e, field) => {
    const file = e.target.files[0];
    if (file && onImageUpload) {
      onImageUpload(file, field);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, field) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/') && onImageUpload) {
      onImageUpload(file, field);
    }
  };

  const handleMockupsDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0 && onMockupsUpload) {
      onMockupsUpload(files);
    }
  };

  const filteredHeadingFonts = POPULAR_FONTS.filter(f => f.toLowerCase().includes(fontSearch.heading.toLowerCase()));
  const filteredBodyFonts = POPULAR_FONTS.filter(f => f.toLowerCase().includes(fontSearch.body.toLowerCase()));

  const fontSelectStyle = { fontFamily: formData.bodyFont || 'Inter' };
  const inputStyle = { fontFamily: formData.bodyFont || 'Inter' };
  const headingStyle = { fontFamily: formData.headingFont || 'Inter' };

  return (
    <div className="sidebar animate-fade-in">
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', ...headingStyle }}>Visual Identity Creator</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Crie seu manual de identidade visual.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            type="button"
            className="icon-btn" 
            onClick={() => setShowHistory(!showHistory)}
            title="Histórico"
          >
            <History size={18} />
          </button>
          <button 
            type="button"
            className="icon-btn"
            onClick={onOpenFullscreen}
            title="Preview tela cheia"
          >
            <Maximize size={18} />
          </button>
          <div className="page-badge">
            {pageCount + 2} páginas
          </div>
        </div>
      </div>

      {showHistory && (
        <div style={{ 
          marginBottom: '1rem', 
          padding: '1rem', 
          background: 'var(--bg-secondary)', 
          borderRadius: '8px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Histórico</span>
            {history.length > 0 && (
              <button 
                type="button"
                onClick={onClearHistory}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Nenhum histórico salvo</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {history.map(entry => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => { onLoadHistory(entry); setShowHistory(false); }}
                  style={{
                    padding: '0.5rem',
                    background: 'white',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{entry.brandName}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {new Date(entry.timestamp).toLocaleDateString('pt-BR')}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button 
          type="button"
          onClick={() => setActiveTab('basic')}
          style={{
            padding: '0.5rem 1rem',
            background: activeTab === 'basic' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'basic' ? 'white' : 'var(--text)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          Básico
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('advanced')}
          style={{
            padding: '0.5rem 1rem',
            background: activeTab === 'advanced' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'advanced' ? 'white' : 'var(--text)',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          Avançado
        </button>
      </div>

      {activeTab === 'basic' && (
        <>
          <div className="form-group">
            <label className="form-label" style={headingStyle}>Nome da Marca</label>
            <input 
              type="text" 
              name="brandName" 
              className={`form-input ${validationErrors.brandName ? 'error' : ''}`} 
              style={inputStyle} 
              value={formData.brandName} 
              onChange={handleChange} 
              placeholder="Ex: Nebula Studio" 
              spellCheck="false" 
            />
            {validationErrors.brandName && <span className="error-text">{validationErrors.brandName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', ...headingStyle }}>
              <span><Image size={14} /> Logos</span>
              <label className="toggle-switch">
                <input type="checkbox" name="showGrid" checked={formData.showGrid} onChange={handleChange} />
                <span className="toggle-slider"></span>
                <span style={{ fontSize: '0.65rem', marginLeft: '2rem' }}>Grid</span>
              </label>
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['logo', 'logoSecondary', 'logoSymbol'].map((field) => (
                <div 
                  key={field}
                  className="drop-zone"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, field)}
                >
                  {formData[field] ? (
                    <div style={{ position: 'relative', width: '100%', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={formData[field]} alt="" style={{ maxHeight: '100%', maxWidth: '100%' }} />
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, [field]: null }))}
                        style={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, borderRadius: '50%', background: '#e53e3e', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Image size={16} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {field === 'logo' ? 'Mestra' : field === 'logoSecondary' ? 'Secundária' : 'Símbolo'}
                      </span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="form-input" 
                        onChange={(e) => handleLogoUpload(e, field)}
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={headingStyle}><Palette size={14} /> Cores (Hex)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
              {[1,2,3,4,5].map(num => (
                <div key={num}>
                  <input 
                    type="color" 
                    name={`color${num}`} 
                    value={formData[`color${num}`]} 
                    onChange={handleChange} 
                    className="form-color-input" 
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={headingStyle}><Palette size={14} /> CMYK & Pantone</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[1,2,3].map(num => (
                <div key={num} style={{ display: 'grid', gridTemplateColumns: '35px 1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ width: 35, height: 35, borderRadius: 4, backgroundColor: formData[`color${num}`], border: '1px solid #e2e8f0', flexShrink: 0 }}></div>
                  <input type="text" name={`color${num}Cmyk`} className="form-input" style={inputStyle} value={formData[`color${num}Cmyk`]} onChange={handleChange} placeholder="CMYK" />
                  <input type="text" name={`color${num}Pantone`} className="form-input" style={inputStyle} value={formData[`color${num}Pantone`]} onChange={handleChange} placeholder="Pantone" />
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={headingStyle}><Type size={14} /> Tipografia</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {['headingFont', 'bodyFont'].map(fontType => (
                <div key={fontType}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    {fontType === 'headingFont' ? 'Títulos' : 'Corpo'}
                  </label>
                  <select 
                    name={fontType} 
                    className="form-input" 
                    value={formData[fontType]} 
                    onChange={handleChange}
                    style={{ fontFamily: formData[fontType], height: '38px' }}
                  >
                    <optgroup label="Fonts do Sistema">
                      {localFonts.slice(0, 15).map(f => <option key={f} value={f}>{f}</option>)}
                    </optgroup>
                    <optgroup label="Google Fonts">
                      {POPULAR_FONTS.slice(0, 15).map(f => <option key={f} value={f}>{f}</option>)}
                    </optgroup>
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={headingStyle}><Maximize2 size={14} /> Área de Proteção</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Respiro (%)</label>
                <input type="number" name="clearSpace" className="form-input" style={inputStyle} value={formData.clearSpace} onChange={handleChange} min="5" max="50" />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Mín (mm)</label>
                <input type="number" name="minSize" className="form-input" style={inputStyle} value={formData.minSize} onChange={handleChange} min="5" max="100" />
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'advanced' && (
        <>
          <div className="form-group">
            <label className="form-label" style={headingStyle}><Layout size={14} /> Template</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {Object.values(templates).map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, template: t.id }))}
                  style={{
                    padding: '0.75rem',
                    background: formData.template === t.id ? 'var(--primary)' : 'white',
                    color: formData.template === t.id ? 'white' : 'var(--text)',
                    border: `1px solid ${formData.template === t.id ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{t.name}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={headingStyle}><Zap size={14} /> Variações de Cor</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { key: 'showPositive', label: 'Positiva', icon: Sun },
                { key: 'showNegative', label: 'Negativa', icon: Moon },
                { key: 'showMonochrome', label: 'Monocromática', icon: Zap }
              ].map(({ key, label, icon: Icon }) => (
                <label key={key} className="checkbox-label">
                  <input type="checkbox" name={key} checked={formData[key]} onChange={handleChange} />
                  <Icon size={14} /> {label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={headingStyle}>
              <span>Cores Adicionais</span>
              <button type="button" onClick={onAddExtraColor} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}>
                <Plus size={16} />
              </button>
            </label>
            {formData.extraColors?.map((color, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '30px 1fr 1fr auto', gap: '0.25rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input 
                  type="color" 
                  value={color.hex} 
                  onChange={(e) => onUpdateExtraColor(idx, 'hex', e.target.value)}
                  className="form-color-input" 
                />
                <input 
                  type="text" 
                  placeholder="Nome"
                  value={color.name || ''}
                  onChange={(e) => onUpdateExtraColor(idx, 'name', e.target.value)}
                  className="form-input"
                  style={inputStyle}
                />
                <input 
                  type="text" 
                  placeholder="CMYK/Pantone"
                  value={color.cmyk || ''}
                  onChange={(e) => onUpdateExtraColor(idx, 'cmyk', e.target.value)}
                  className="form-input"
                  style={inputStyle}
                />
                <button type="button" onClick={() => onRemoveExtraColor(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label" style={headingStyle}><GitMerge size={14} /> Padrão Gráfico</label>
            <div 
              className="drop-zone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); const file = e.dataTransfer.files[0]; if (file && onImageUpload) onImageUpload(file, 'pattern'); }}
            >
              {formData.pattern ? (
                <div style={{ position: 'relative', width: '100%', height: '60px' }}>
                  <img src={formData.pattern} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, pattern: null }))}
                    style={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, borderRadius: '50%', background: '#e53e3e', color: 'white', border: 'none', cursor: 'pointer' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <GitMerge size={16} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Arraste ou clique</span>
                  <input type="file" accept="image/*" ref={patternRef} onChange={(e) => e.target.files[0] && onImageUpload(e.target.files[0], 'pattern')} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                </>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={headingStyle}><GitMerge size={14} /> Padrão Gráfico</label>
            <div 
              className="drop-zone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); const file = e.dataTransfer.files[0]; if (file && onImageUpload) onImageUpload(file, 'pattern'); }}
            >
              {formData.pattern ? (
                <div style={{ position: 'relative', width: '100%', height: '60px' }}>
                  <img src={formData.pattern} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, pattern: null }))}
                    style={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, borderRadius: '50%', background: '#e53e3e', color: 'white', border: 'none', cursor: 'pointer' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ) : (
                <>
                  <GitMerge size={16} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Arraste ou clique</span>
                  <input type="file" accept="image/*" ref={patternRef} onChange={(e) => e.target.files[0] && onImageUpload(e.target.files[0], 'pattern')} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                </>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={headingStyle}><Layers size={14} /> Alma & Arquétipo</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>Arquétipo de Marca</label>
                <select 
                  name="archetype" 
                  className="form-input" 
                  value={formData.archetype || 'creator'} 
                  onChange={handleChange}
                  style={inputStyle}
                >
                  {ARCHETYPES.map(a => (
                    <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>Personalidade</label>
                {[
                  { key: 'formalCasual', left: 'Formal', right: 'Casual' },
                  { key: 'modernClassic', left: 'Moderno', right: 'Clássico' },
                  { key: 'playfulSerious', left: 'Ousado', right: 'Sério' },
                ].map(p => (
                  <div key={p.key} style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', marginBottom: '2px' }}>
                      <span>{p.left}</span>
                      <span>{p.right}</span>
                    </div>
                    <input 
                      type="range" 
                      name={p.key} 
                      min="0" max="100" 
                      value={formData[p.key] || 50} 
                      onChange={handleChange}
                      style={{ width: '100%', height: '4px' }} 
                    />
                  </div>
                ))}
              </div>

              <input type="text" name="mission" className="form-input" style={inputStyle} value={formData.mission} onChange={handleChange} placeholder="Missão" />
              <input type="text" name="vision" className="form-input" style={inputStyle} value={formData.vision} onChange={handleChange} placeholder="Visão" />
              <input type="text" name="values" className="form-input" style={inputStyle} value={formData.values} onChange={handleChange} placeholder="Valores (vírgula)" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={headingStyle}><Briefcase size={14} /> Mockups</label>
            <div 
              className="drop-zone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleMockupsDrop}
            >
              <Briefcase size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Arraste múltiplas imagens</span>
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                ref={mockupsRef}
                onChange={(e) => e.target.files.length > 0 && onMockupsUpload(e.target.files)}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
              />
            </div>
            {formData.mockups?.length > 0 && (
              <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {formData.mockups.map((m, i) => (
                  <div key={i} style={{ position: 'relative', width: '50px', height: '50px' }}>
                    <img src={m} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, mockups: prev.mockups.filter((_, idx) => idx !== i) }))}
                      style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#e53e3e', color: 'white', border: 'none', cursor: 'pointer', fontSize: '10px' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" style={headingStyle}><Ban size={14} /> O Que NÃO Fazer</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {DEFAULT_DONTS.map((dont, idx) => (
                <label key={idx} className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={formData.donts?.includes(dont) || false}
                    onChange={(e) => {
                      const currentDonts = formData.donts || [];
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, donts: [...currentDonts, dont] }));
                      } else {
                        setFormData(prev => ({ ...prev, donts: currentDonts.filter(d => d !== dont) }));
                      }
                    }}
                  />
                  <Ban size={12} /> {dont}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={headingStyle}><Mic size={14} /> Tom de Voz</label>
            <textarea name="toneOfVoice" className="form-textarea" style={{ minHeight: '70px', ...inputStyle }} value={formData.toneOfVoice} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label" style={headingStyle}><FileText size={14} /> Manual</label>
            <textarea name="manualContent" className="form-textarea" style={{ minHeight: '120px', ...inputStyle }} value={formData.manualContent} onChange={handleChange} />
          </div>
        </>
      )}

      <div style={{ marginTop: '1rem' }}>
        {isGenerating && (
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              <span>Gerando páginas...</span>
              <span>Exportando PDF</span>
            </div>
            <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: 'var(--primary)', animation: 'progress-shimmer 1.5s ease-in-out infinite', backgroundImage: 'linear-gradient(90deg, var(--primary) 0%, var(--accent) 50%, var(--primary) 100%)', backgroundSize: '200% 100%' }} />
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary" 
            style={{ flex: 1, minWidth: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', position: 'relative', overflow: 'hidden' }} 
            onClick={onGeneratePDF}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span>Gerando PDF...</span>
              </>
            ) : (
              <>
                <Download size={18} />
                <span>Exportar PDF</span>
              </>
            )}
          </button>
          
          <button 
            className="btn btn-secondary" 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            onClick={onExportHTML}
            title="Exportar como HTML"
            disabled={isGenerating}
          >
            <Code size={18} />
            <span style={{ fontSize: '0.85rem' }}>HTML</span>
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes progress-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default IdentityForm;