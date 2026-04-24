import React, { useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Download, Code, History, Maximize, RotateCcw, X, Check, Image, Palette, Type, Layers, Layout, Zap, Sun, Moon, Briefcase, Trash2, Plus, ChevronLeft, ChevronRight, Grid3X3, GitMerge, Ban, Mic, FileText, Sparkles, Building2, Palette as PaletteIcon, FileType, Settings, Wand2 } from 'lucide-react'
import { validateFormData, compressImage, TEMPLATES } from './utils/validation'

const DEFAULT_MANUAL = `DIRETRIZES DE APLICAÇÃO:
1. O logotipo deve ser utilizado preferencialmente em sua versão mestra sobre fundos claros.
2. É obrigatória a manutenção de uma área de respiro equivalente a 20% do tamanho total da marca.
3. Não é permitido distorcer, rotacionar ou alterar as cores da marca de forma não prevista neste manual.

TERMOS DE USO:
Este manual é de uso exclusivo da marca e seus parceiros autorizados.`;

const STORAGE_KEY = 'brandManual_history';

const POPULAR_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Playfair Display', 
  'Poppins', 'Oswald', 'Raleway', 'Merriweather', 'Lora', 'PT Sans', 
  'Nunito', 'Ubuntu', 'Arvo', 'Josefin Sans', 'Abril Fatface', 'Dancing Script',
  'Pacifico', 'Kanit', 'Rubik', 'Quicksand', 'Bebas Neue', 'Source Sans Pro'
];

const DEFAULT_DONTS = [
  'Não distorcer o logo',
  'Não alterar as cores',
  'Não girar o logo',
  'Não adicionar efeitos',
  'Não usar sobre fundos cluttereds'
];

const initialFormData = {
  brandName: '',
  logo: null,
  logoSecondary: null,
  logoSymbol: null,
  color1: '#1a1a1a',
  color2: '#ffffff',
  color3: '#666666',
  color1Cmyk: '0, 0, 0, 100',
  color2Cmyk: '0, 0, 0, 0',
  color3Cmyk: '0, 0, 0, 60',
  color1Pantone: 'Black C',
  color2Pantone: 'White C',
  color3Pantone: 'Cool Gray 11 C',
  headingFont: 'Inter',
  bodyFont: 'Inter',
  manualContent: DEFAULT_MANUAL,
  mission: 'Transformar ideias em realidade através do design inovador.',
  vision: 'Ser referência global em branding até 2030.',
  values: 'Criatividade, Integridade, Inovação',
  showPositive: true,
  showNegative: true,
  showMonochrome: true,
  mockups: [],
  toneOfVoice: 'A marca comunica-se de forma direta e inovadora.',
  donts: DEFAULT_DONTS.slice(0, 3),
  template: 'minimal',
  paletteColors: [],
  showGrid: false,
  clearSpace: '20%',
  minSize: '15',
  pattern: null,
  gridSize: 20
};

function App() {
  const [formData, setFormData] = useState(initialFormData);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [history, setHistory] = useState(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) {
      try {
        return JSON.parse(savedHistory);
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
    return [];
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('brand');
  const [showHistory, setShowHistory] = useState(false);
  const [previewPage, setPreviewPage] = useState(0);

  useEffect(() => {
    const loadFont = (fontName) => {
      if (!fontName) return;
      const fontId = `font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
      if (document.getElementById(fontId)) return;
      const link = document.createElement('link');
      link.id = fontId;
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    };
    loadFont(formData.headingFont);
    loadFont(formData.bodyFont);
  }, [formData.headingFont, formData.bodyFont]);

  const handleImageUpload = async (file, field) => {
    try {
      const compressedFile = await compressImage(file, 0.5, 800);
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result }));
      reader.readAsDataURL(compressedFile);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.closest('.drop-zone')?.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.closest('.drop-zone')?.classList.remove('drag-over');
  };

  const handleDrop = (e, field) => {
    e.preventDefault();
    e.currentTarget.closest('.drop-zone')?.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file, field);
    }
  };

  const handleMockupsUpload = async (files) => {
    const readers = await Promise.all(
      Array.from(files).map(async (file) => {
        try {
          const compressed = await compressImage(file, 0.3, 600);
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(compressed);
          });
        } catch {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(file);
          });
        }
      })
    );
    setFormData(prev => ({ ...prev, mockups: [...prev.mockups, ...readers] }));
  };

  const handleGeneratePDF = async () => {
    const validation = validateFormData(formData);
    if (!validation.success) {
      setValidationErrors(validation.errors);
      return;
    }
    setValidationErrors({});
    setIsGenerating(true);

    try {
      if (document.fonts) await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 100));

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        setPreviewPage(pageIndex);
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const element = document.getElementById('pdf-preview');
        const paper = element.querySelector('.paper-page');
        
        const canvas = await html2canvas(paper, { 
          scale: 2, 
          useCORS: true, 
          backgroundColor: '#ffffff',
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }
      
      pdf.save(`Manual_${formData.brandName || 'Marca'}.pdf`);
      
      const newEntry = { id: Date.now(), timestamp: new Date().toISOString(), brandName: formData.brandName || 'Sem nome', data: { ...formData } };
      setHistory(prev => {
        const updated = [newEntry, ...prev].slice(0, 10);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportHTML = () => {
    const element = document.getElementById('pdf-preview');
    const htmlContent = element.innerHTML;
    const fullHTML = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Manual - ${formData.brandName}</title><link href="https://fonts.googleapis.com/css2?family=${(formData.headingFont || 'Inter').replace(/\s+/g, '+')}:wght@300;400;500;600;700&family=${(formData.bodyFont || 'Inter').replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'${formData.bodyFont}',sans-serif;background:#f0f2f5}.paper-page{width:210mm;min-height:297mm;padding:25mm;margin:20px auto;background:white;box-shadow:0 4px 15px rgba(0,0,0,0.1)}h1,h2,h3{font-family:'${formData.headingFont}',serif}</style></head><body>${htmlContent}</body></html>`;
    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Manual_${formData.brandName || 'Marca'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddPaletteColor = () => {
    setFormData(prev => ({
      ...prev,
      paletteColors: [...(prev.paletteColors || []), { hex: '#000000', name: '', cmyk: '', pantone: '' }]
    }));
  };

  const handleUpdatePaletteColor = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      paletteColors: prev.paletteColors.map((c, i) => i === index ? { ...c, [field]: value } : c)
    }));
  };

  const handleRemovePaletteColor = (index) => {
    setFormData(prev => ({
      ...prev,
      paletteColors: prev.paletteColors.filter((_, i) => i !== index)
    }));
  };

  const currentTemplate = TEMPLATES[formData.template] || TEMPLATES.minimal;
  const templateStyle = currentTemplate.style;

  const primaryColor = formData.color1;
  const secondaryColor = formData.color2;
  const accentColor = formData.color3;

  const getTemplateColors = () => {
    switch (templateStyle) {
      case 'minimal':
        return { bg: '#ffffff', text: '#1a1a1a', accent: '#1a1a1a', secondary: '#666666', card: '#f8f9fa' };
      case 'corporate':
        return { bg: '#f8fafc', text: primaryColor, accent: '#2563eb', secondary: '#64748b', card: '#ffffff' };
      case 'premium':
        return { bg: '#faf9f7', text: primaryColor, accent: '#b8860b', secondary: '#78716c', card: '#ffffff' };
      case 'creative':
        return { bg: '#fefefe', text: primaryColor, accent: '#ec4899', secondary: '#6366f1', card: '#fafafa' };
      case 'tech':
        return { bg: '#f0f9ff', text: primaryColor, accent: '#06b6d4', secondary: '#0ea5e9', card: '#ffffff' };
      case 'nature':
        return { bg: '#f7fee7', text: primaryColor, accent: '#22c55e', secondary: '#84cc16', card: '#ffffff' };
      default:
        return { bg: '#ffffff', text: '#1a1a1a', accent: '#1a1a1a', secondary: '#666666', card: '#f8f9fa' };
    }
  };

  const tc = getTemplateColors();

  const renderCover = () => {
    if (templateStyle === 'minimal') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px', height: '100%', background: '#ffffff' }}>
          {formData.logo && <img src={formData.logo} alt="Logo" style={{ maxWidth: '180px', maxHeight: '120px', objectFit: 'contain', marginBottom: '30px' }} />}
          <h1 style={{ fontFamily: formData.headingFont, fontSize: '2.2rem', color: '#1a1a1a', marginBottom: '10px', letterSpacing: '-0.02em' }}>{formData.brandName || 'Nome da Marca'}</h1>
          <p style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: '#666666', marginBottom: '30px' }}>Manual de Identidade Visual</p>
          <div style={{ width: '40px', height: '2px', background: '#1a1a1a' }} />
        </div>
      );
    } else if (templateStyle === 'corporate') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px', height: '100%', background: `linear-gradient(180deg, ${primaryColor} 0%, ${primaryColor}dd 50%, #f8fafc 50%, #f8fafc 100%)` }}>
          <div style={{ width: '100%' }}>
            {formData.logo && <img src={formData.logo} alt="Logo" style={{ maxWidth: '220px', maxHeight: '140px', objectFit: 'contain', marginBottom: '25px', filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.2))' }} />}
            <h1 style={{ fontFamily: formData.headingFont, fontSize: '2.6rem', color: '#ffffff', marginBottom: '10px', letterSpacing: '-0.03em', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{formData.brandName || 'Nome da Marca'}</h1>
            <p style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: 'rgba(255,255,255,0.9)', marginBottom: '25px', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Manual de Identidade Visual</p>
            <div style={{ width: '60px', height: '3px', background: accentColor, margin: '0 auto', borderRadius: '2px' }} />
          </div>
        </div>
      );
    } else if (templateStyle === 'premium') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px', height: '100%', background: tc.bg, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: `linear-gradient(135deg, ${tc.accent}20, transparent)`, borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, background: `linear-gradient(135deg, ${tc.accent}15, transparent)`, borderRadius: '50%' }} />
          {formData.logo && <img src={formData.logo} alt="Logo" style={{ maxWidth: '200px', maxHeight: '130px', objectFit: 'contain', marginBottom: '30px', zIndex: 1 }} />}
          <h1 style={{ fontFamily: formData.headingFont, fontSize: '2.4rem', color: tc.text, marginBottom: '10px', letterSpacing: '-0.02em', zIndex: 1 }}>{formData.brandName || 'Nome da Marca'}</h1>
          <p style={{ fontFamily: formData.bodyFont, fontSize: '1.1rem', color: tc.secondary, marginBottom: '30px', fontWeight: 500, zIndex: 1 }}>Manual de Identidade Visual</p>
          <div style={{ width: '80px', height: '3px', background: `linear-gradient(90deg, ${tc.accent}, ${tc.accent}80)`, borderRadius: '2px', zIndex: 1 }} />
        </div>
      );
    } else if (templateStyle === 'creative') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px', height: '100%', background: `linear-gradient(135deg, ${primaryColor}08, ${accentColor}10)`, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 20, left: 20, width: 0, height: 0, borderLeft: '30px solid transparent', borderRight: '30px solid transparent', borderBottom: `50px solid ${accentColor}20`, transform: 'rotate(-15deg)' }} />
          <div style={{ position: 'absolute', bottom: 40, right: 30, width: 0, height: 0, borderLeft: '25px solid transparent', borderRight: '25px solid transparent', borderBottom: `40px solid ${primaryColor}15`, transform: 'rotate(20deg)' }} />
          {formData.logo && <img src={formData.logo} alt="Logo" style={{ maxWidth: '190px', maxHeight: '120px', objectFit: 'contain', marginBottom: '30px' }} />}
          <h1 style={{ fontFamily: formData.headingFont, fontSize: '2.3rem', color: primaryColor, marginBottom: '10px', letterSpacing: '-0.02em' }}>{formData.brandName || 'Nome da Marca'}</h1>
          <p style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: accentColor, marginBottom: '30px', fontWeight: 600 }}>Manual de Identidade Visual</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ width: 10, height: 10, background: primaryColor, borderRadius: '50%' }} />
            <div style={{ width: 10, height: 10, background: accentColor, borderRadius: '50%' }} />
            <div style={{ width: 10, height: 10, background: secondaryColor, borderRadius: '50%' }} />
          </div>
        </div>
      );
    } else if (templateStyle === 'tech') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px', height: '100%', background: '#0f172a', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 2px 2px, ${accentColor}30 1px, transparent 0)`, backgroundSize: '24px 24px', opacity: 0.5 }} />
          {formData.logo && <img src={formData.logo} alt="Logo" style={{ maxWidth: '180px', maxHeight: '110px', objectFit: 'contain', marginBottom: '30px', filter: 'drop-shadow(0 0 20px rgba(6, 182, 212, 0.5))' }} />}
          <h1 style={{ fontFamily: formData.headingFont, fontSize: '2.4rem', color: '#ffffff', marginBottom: '10px', letterSpacing: '-0.02em' }}>{formData.brandName || 'Nome da Marca'}</h1>
          <p style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: accentColor, marginBottom: '30px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Visual Identity Manual</p>
          <div style={{ width: '100px', height: '2px', background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
        </div>
      );
    } else if (templateStyle === 'nature') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px', height: '100%', background: `linear-gradient(180deg, #f7fee7 0%, #ecfccb 100%)`, position: 'relative' }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, border: `3px solid ${accentColor}30`, borderRadius: '50%' }} />
          <div style={{ position: 'absolute', bottom: 20, left: -10, width: 80, height: 80, border: `2px solid ${primaryColor}20`, borderRadius: '50%' }} />
          {formData.logo && <img src={formData.logo} alt="Logo" style={{ maxWidth: '190px', maxHeight: '120px', objectFit: 'contain', marginBottom: '30px' }} />}
          <h1 style={{ fontFamily: formData.headingFont, fontSize: '2.3rem', color: '#1a1a1a', marginBottom: '10px', letterSpacing: '-0.02em' }}>{formData.brandName || 'Nome da Marca'}</h1>
          <p style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: primaryColor, marginBottom: '30px', fontWeight: 500 }}>Manual de Identidade Visual</p>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '2px' }} />
            <span style={{ width: 8, height: 8, background: '#84cc16', borderRadius: '2px' }} />
            <span style={{ width: 8, height: 8, background: '#a3e635', borderRadius: '2px' }} />
          </div>
        </div>
      );
    } else {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px', height: '100%', background: `linear-gradient(180deg, ${primaryColor} 0%, ${primaryColor}dd 50%, #ffffff 50%, #ffffff 100%)` }}>
          <div style={{ width: '100%' }}>
            {formData.logo && <img src={formData.logo} alt="Logo" style={{ maxWidth: '220px', maxHeight: '140px', objectFit: 'contain', marginBottom: '25px', filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.2))' }} />}
            <h1 style={{ fontFamily: formData.headingFont, fontSize: '2.6rem', color: '#ffffff', marginBottom: '10px', letterSpacing: '-0.03em', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{formData.brandName || 'Nome da Marca'}</h1>
            <p style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: 'rgba(255,255,255,0.9)', marginBottom: '25px', fontWeight: 300, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Manual de Identidade Visual</p>
            <div style={{ width: '60px', height: '3px', background: accentColor, margin: '0 auto', borderRadius: '2px' }} />
          </div>
        </div>
      );
    }
  };

  const renderLogoSystem = () => {
    const getStyles = () => {
      switch (templateStyle) {
        case 'minimal': return { heading: '#1a1a1a', border: '#e5e5e5', bg: '#fafafa' };
        case 'corporate': return { heading: primaryColor, border: accentColor, bg: '#f8fafc' };
        case 'premium': return { heading: tc.text, border: tc.accent, bg: tc.card };
        case 'creative': return { heading: primaryColor, border: accentColor, bg: '#fafafa' };
        case 'tech': return { heading: '#e2e8f0', border: accentColor, bg: '#1e293b' };
        case 'nature': return { heading: primaryColor, border: accentColor, bg: '#f7fee7' };
        default: return { heading: '#1a1a1a', border: '#e5e5e5', bg: '#fafafa' };
      }
    };
    const s = getStyles();
    return (
      <div style={{ padding: '25px', height: '100%', overflow: 'auto', background: s.bg }}>
        <h2 style={{ fontFamily: formData.headingFont, fontSize: '1.6rem', color: s.heading, marginBottom: '20px', borderBottom: `3px solid ${s.border}`, paddingBottom: '10px' }}>1. Sistema de Logos</h2>
        
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontFamily: formData.bodyFont, fontSize: '0.95rem', color: '#333', marginBottom: '12px', fontWeight: 600 }}>Logo Principal</h3>
          {formData.logo ? (
            <div style={{ padding: '35px', border: '1px dashed #ddd', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px', background: '#fafafa' }}>
              <img src={formData.logo} alt="Logo Principal" style={{ maxWidth: '220px', maxHeight: '100px' }} />
            </div>
          ) : (
            <div style={{ padding: '35px', border: '1px dashed #ddd', textAlign: 'center', color: '#999', borderRadius: '8px', background: '#fafafa' }}>Carregue o logo principal</div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#333', marginBottom: '10px', fontWeight: 600 }}>Logo Secundária</h4>
            {formData.logoSecondary ? (
              <div style={{ padding: '25px', border: '1px solid #eee', display: 'flex', justifyContent: 'center', borderRadius: '8px', background: '#fafafa' }}>
                <img src={formData.logoSecondary} alt="Logo Secundária" style={{ maxWidth: '120px' }} />
              </div>
            ) : (
              <div style={{ padding: '25px', border: '1px dashed #ddd', textAlign: 'center', color: '#999', fontSize: '0.75rem', borderRadius: '8px' }}>Carregue</div>
            )}
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#333', marginBottom: '10px', fontWeight: 600 }}>Símbolo / Ícone</h4>
            {formData.logoSymbol ? (
              <div style={{ padding: '25px', border: '1px solid #eee', display: 'flex', justifyContent: 'center', borderRadius: '8px', background: '#fafafa' }}>
                <img src={formData.logoSymbol} alt="Símbolo" style={{ maxWidth: '80px' }} />
              </div>
            ) : (
              <div style={{ padding: '25px', border: '1px dashed #ddd', textAlign: 'center', color: '#999', fontSize: '0.75rem', borderRadius: '8px' }}>Carregue</div>
            )}
          </div>
        </div>

        {formData.showGrid && (
          <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', color: '#333', marginBottom: '12px', fontWeight: 600 }}>Grid de Construção</h3>
            <div style={{ position: 'relative', height: '150px', backgroundImage: `linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px)`, backgroundSize: `${formData.gridSize}px ${formData.gridSize}px` }}>
              {formData.logo && (
                <img src={formData.logo} alt="" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100px' }} />
              )}
            </div>
          </div>
        )}

        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#333', marginBottom: '12px', fontWeight: 600 }}>Área de Proteção e Especificações</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ 
                border: `2px dashed ${s.border}`,
                padding: formData.clearSpace || '20px',
                background: '#fff'
              }}>
                {formData.logo && <img src={formData.logo} alt="" style={{ width: '60px', display: 'block' }} />}
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}><strong>Área de proteção:</strong></p>
                <p style={{ fontSize: '0.75rem', color: '#999' }}>Respiro mínimo de {formData.clearSpace || '20%'} do tamanho do logo</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px' }}><strong>Tamanho mínimo:</strong></p>
              <p style={{ fontSize: '0.75rem', color: '#999' }}>{formData.minSize || '15'}mm de altura</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderColors = () => {
    const getStyles = () => {
      switch (templateStyle) {
        case 'minimal': return { heading: '#1a1a1a', border: '#e5e5e5', bg: '#ffffff', sub: '#666' };
        case 'corporate': return { heading: primaryColor, border: accentColor, bg: '#f8fafc', sub: '#64748b' };
        case 'premium': return { heading: tc.text, border: tc.accent, bg: tc.card, sub: tc.secondary };
        case 'creative': return { heading: primaryColor, border: accentColor, bg: '#fafafa', sub: '#666' };
        case 'tech': return { heading: '#e2e8f0', border: accentColor, bg: '#0f172a', sub: '#94a3b8' };
        case 'nature': return { heading: primaryColor, border: accentColor, bg: '#f7fee7', sub: '#65a30d' };
        default: return { heading: '#1a1a1a', border: '#e5e5e5', bg: '#ffffff', sub: '#666' };
      }
    };
    const s = getStyles();
    return (
      <div style={{ padding: '25px', height: '100%', overflow: 'auto', background: s.bg }}>
        <h2 style={{ fontFamily: formData.headingFont, fontSize: '1.6rem', color: s.heading, marginBottom: '20px', borderBottom: `3px solid ${s.border}`, paddingBottom: '10px' }}>2. Paleta de Cores</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
          {[1,2,3].map(num => (
            <div key={num} style={{ textAlign: 'center' }}>
              <div style={{ width: '100%', height: '80px', backgroundColor: formData[`color${num}`], borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px', boxShadow: templateStyle !== 'monochrome' ? 'inset 0 2px 8px rgba(0,0,0,0.1)' : 'none' }} />
              <p style={{ fontFamily: formData.bodyFont, fontSize: '0.8rem', fontWeight: 700, color: '#1a1a1a', textTransform: 'uppercase' }}>{formData[`color${num}`]}</p>
              <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '4px' }}>{formData[`color${num}Cmyk`]}</p>
              <p style={{ fontSize: '0.7rem', color: '#666' }}>{formData[`color${num}Pantone`]}</p>
            </div>
          ))}
        </div>

        {formData.paletteColors?.length > 0 && (
          <>
            <h3 style={{ fontSize: '0.95rem', color: '#333', marginBottom: '12px', fontWeight: 600 }}>Cores Adicionais</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {formData.paletteColors.map((c, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '12px', background: templateStyle === 'tech' ? '#1e293b' : (templateStyle === 'minimal' ? '#f8f9fa' : `${c.hex}15`), borderRadius: '8px', minWidth: '80px' }}>
                  <div style={{ width: '50px', height: '50px', backgroundColor: c.hex, borderRadius: '6px', border: '1px solid #e2e8f0', margin: '0 auto 8px' }} />
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1a1a1a' }}>{c.name || 'Cor'}</p>
                  <p style={{ fontSize: '0.65rem', color: '#666' }}>{c.cmyk}</p>
                </div>
              ))}
            </div>
          </>
        )}

        <h3 style={{ fontSize: '0.9rem', color: '#333', marginBottom: '12px', fontWeight: 600 }}>Contraste</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ padding: '20px', background: primaryColor, borderRadius: '8px', color: secondaryColor, textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', opacity: 0.9 }}>Fundo Claro</p>
            <p style={{ fontFamily: formData.headingFont, fontSize: '1.1rem', marginTop: '8px' }}>{formData.brandName || 'Título'}</p>
          </div>
          <div style={{ padding: '20px', background: secondaryColor, borderRadius: '8px', color: primaryColor, textAlign: 'center', border: `1px solid ${primaryColor}` }}>
            <p style={{ fontSize: '0.75rem', opacity: 0.9 }}>Fundo Escuro</p>
            <p style={{ fontFamily: formData.headingFont, fontSize: '1.1rem', marginTop: '8px' }}>{formData.brandName || 'Título'}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderTypography = () => {
    const getStyles = () => {
      switch (templateStyle) {
        case 'minimal': return { heading: '#1a1a1a', border: '#e5e5e5', bg: '#fafafa', text: '#333' };
        case 'corporate': return { heading: primaryColor, border: accentColor, bg: '#f8fafc', text: '#333' };
        case 'premium': return { heading: tc.text, border: tc.accent, bg: tc.card, text: '#333' };
        case 'creative': return { heading: primaryColor, border: accentColor, bg: '#fafafa', text: '#333' };
        case 'tech': return { heading: '#e2e8f0', border: accentColor, bg: '#1e293b', text: '#94a3b8' };
        case 'nature': return { heading: primaryColor, border: accentColor, bg: '#f7fee7', text: '#333' };
        default: return { heading: '#1a1a1a', border: '#e5e5e5', bg: '#fafafa', text: '#333' };
      }
    };
    const s = getStyles();
    return (
      <div style={{ padding: '25px', height: '100%', overflow: 'auto', background: s.bg }}>
        <h2 style={{ fontFamily: formData.headingFont, fontSize: '1.6rem', color: s.heading, marginBottom: '20px', borderBottom: `3px solid ${s.border}`, paddingBottom: '10px' }}>3. Tipografia</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '0.9rem', color: s.text, marginBottom: '8px', fontWeight: 600 }}>Fonte de Títulos: {formData.headingFont}</h3>
          <div style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', background: s.bg === '#1e293b' ? '#0f172a' : '#fafafa' }}>
            <p style={{ fontFamily: formData.headingFont, fontSize: '2rem', color: s.heading, marginBottom: '8px', letterSpacing: '0.02em' }}>Aa Bb Cc Dd Ee Ff</p>
            <p style={{ fontFamily: formData.headingFont, fontSize: '1rem', color: s.text, lineHeight: 1.5 }}>O rápido jabuti xereta.</p>
          </div>
        </div>
        
        <div>
          <h3 style={{ fontSize: '0.9rem', color: s.text, marginBottom: '8px', fontWeight: 600 }}>Fonte de Corpo: {formData.bodyFont}</h3>
          <div style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', background: s.bg === '#1e293b' ? '#0f172a' : '#fafafa' }}>
            <p style={{ fontFamily: formData.bodyFont, fontSize: '0.9rem', color: s.text, lineHeight: 1.6 }}>Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.</p>
            <p style={{ fontFamily: formData.bodyFont, fontSize: '0.8rem', color: s.text, lineHeight: 1.6, marginTop: '8px' }}>Texto de corpo em tamanho padrão.</p>
          </div>
        </div>
      </div>
    );
  };

  const renderVariations = () => {
    const getStyles = () => {
      switch (templateStyle) {
        case 'minimal': return { heading: '#1a1a1a', border: '#e5e5e5', bg: '#fafafa', text: '#333' };
        case 'corporate': return { heading: primaryColor, border: accentColor, bg: '#f8fafc', text: '#333' };
        case 'premium': return { heading: tc.text, border: tc.accent, bg: tc.card, text: '#333' };
        case 'creative': return { heading: primaryColor, border: accentColor, bg: '#fafafa', text: '#333' };
        case 'tech': return { heading: '#e2e8f0', border: accentColor, bg: '#1e293b', text: '#94a3b8' };
        case 'nature': return { heading: primaryColor, border: accentColor, bg: '#f7fee7', text: '#333' };
        default: return { heading: '#1a1a1a', border: '#e5e5e5', bg: '#fafafa', text: '#333' };
      }
    };
    const s = getStyles();
    return (
      <div style={{ padding: '25px', minHeight: '100%', background: s.bg }}>
        <h2 style={{ fontFamily: formData.headingFont, fontSize: '1.6rem', color: s.heading, marginBottom: '20px', borderBottom: `3px solid ${s.border}`, paddingBottom: '10px' }}>4. Variações de Cor</h2>
        
        {formData.showPositive && (
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '0.85rem', color: s.text, marginBottom: '10px', fontWeight: 600 }}>Versão Positiva</h3>
            <div style={{ padding: '20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80px' }}>
              {formData.logo ? <img src={formData.logo} alt="" style={{ maxWidth: '160px', maxHeight: '80px', objectFit: 'contain' }} /> : <span style={{ color: '#999' }}>Carregue o logo</span>}
            </div>
          </div>
        )}
        
        {formData.showNegative && (
          <div style={{ marginBottom: '18px' }}>
            <h3 style={{ fontSize: '0.85rem', color: s.text, marginBottom: '10px', fontWeight: 600 }}>Versão Negativa</h3>
            <div style={{ padding: '20px', background: s.heading, borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80px' }}>
              {formData.logo ? <img src={formData.logo} alt="" style={{ maxWidth: '160px', maxHeight: '80px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} /> : <span style={{ color: '#fff' }}>Carregue o logo</span>}
            </div>
          </div>
        )}
        
        {formData.showMonochrome && (
          <div>
            <h3 style={{ fontSize: '0.85rem', color: s.text, marginBottom: '10px', fontWeight: 600 }}>Versão Monocromática</h3>
            <div style={{ padding: '20px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80px' }}>
              {formData.logo ? <img src={formData.logo} alt="" style={{ maxWidth: '160px', maxHeight: '80px', objectFit: 'contain', filter: 'grayscale(100%)' }} /> : <span style={{ color: '#999' }}>Carregue o logo</span>}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderApplications = () => {
    const getStyles = () => {
      switch (templateStyle) {
        case 'minimal': return { heading: '#1a1a1a', border: '#e5e5e5', bg: '#fafafa', text: '#333' };
        case 'corporate': return { heading: primaryColor, border: accentColor, bg: '#f8fafc', text: '#333' };
        case 'premium': return { heading: tc.text, border: tc.accent, bg: tc.card, text: '#333' };
        case 'creative': return { heading: primaryColor, border: accentColor, bg: '#fafafa', text: '#333' };
        case 'tech': return { heading: '#e2e8f0', border: accentColor, bg: '#1e293b', text: '#94a3b8' };
        case 'nature': return { heading: primaryColor, border: accentColor, bg: '#f7fee7', text: '#333' };
        default: return { heading: '#1a1a1a', border: '#e5e5e5', bg: '#fafafa', text: '#333' };
      }
    };
    const s = getStyles();
    return (
      <div style={{ padding: '25px', height: '100%', overflow: 'auto', background: s.bg }}>
        <h2 style={{ fontFamily: formData.headingFont, fontSize: '1.6rem', color: s.heading, marginBottom: '20px', borderBottom: `3px solid ${s.border}`, paddingBottom: '10px' }}>5. Aplicações</h2>
        
        {formData.mockups?.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            {formData.mockups.map((m, i) => (
              <img key={i} src={m} alt="" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
            ))}
          </div>
        ) : (
          <div style={{ padding: '40px', border: '2px dashed #e2e8f0', borderRadius: '8px', textAlign: 'center', color: '#999', marginBottom: '20px' }}>
            <Briefcase size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
            <p>Adicione mockups para visualizar aplicações da marca</p>
          </div>
        )}

        {formData.pattern && (
          <div>
            <h3 style={{ fontSize: '0.9rem', color: s.text, marginBottom: '10px', fontWeight: 600 }}>Padrão Gráfico</h3>
            <div style={{ height: '120px', backgroundImage: `url(${formData.pattern})`, backgroundSize: 'cover', borderRadius: '8px' }} />
          </div>
        )}
      </div>
    );
  };

  const renderBrandDNA = () => {
    const getStyles = () => {
      switch (templateStyle) {
        case 'minimal': return { heading: '#1a1a1a', border: '#e5e5e5', bg: '#fafafa', text: '#333', accent: '#1a1a1a' };
        case 'corporate': return { heading: primaryColor, border: accentColor, bg: '#f8fafc', text: '#333', accent: accentColor };
        case 'premium': return { heading: tc.text, border: tc.accent, bg: tc.card, text: '#333', accent: tc.accent };
        case 'creative': return { heading: primaryColor, border: accentColor, bg: '#fafafa', text: '#333', accent: accentColor };
        case 'tech': return { heading: '#e2e8f0', border: accentColor, bg: '#1e293b', text: '#94a3b8', accent: accentColor };
        case 'nature': return { heading: primaryColor, border: accentColor, bg: '#f7fee7', text: '#333', accent: accentColor };
        default: return { heading: '#1a1a1a', border: '#e5e5e5', bg: '#fafafa', text: '#333', accent: '#1a1a1a' };
      }
    };
    const s = getStyles();
    return (
      <div style={{ padding: '25px', height: '100%', overflow: 'auto', background: s.bg }}>
        <h2 style={{ fontFamily: formData.headingFont, fontSize: '1.6rem', color: s.heading, marginBottom: '20px', borderBottom: `3px solid ${s.border}`, paddingBottom: '10px' }}>6. Alma da Marca</h2>
        
        <div style={{ marginBottom: '18px' }}>
          <h3 style={{ fontSize: '0.75rem', color: s.accent, marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Missão</h3>
          <p style={{ fontSize: '0.95rem', color: s.text, lineHeight: 1.6 }}>{formData.mission}</p>
        </div>
        
        <div style={{ marginBottom: '18px' }}>
          <h3 style={{ fontSize: '0.75rem', color: s.accent, marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Visão</h3>
          <p style={{ fontSize: '0.95rem', color: s.text, lineHeight: 1.6 }}>{formData.vision}</p>
        </div>
        
        <div style={{ marginBottom: '18px' }}>
          <h3 style={{ fontSize: '0.75rem', color: s.accent, marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Valores</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(formData.values || '').split(',').map((v, i) => (
              <span key={i} style={{ padding: '6px 14px', background: s.heading, color: templateStyle === 'tech' ? '#1e293b' : (templateStyle === 'minimal' ? '#fff' : secondaryColor), borderRadius: '20px', fontSize: '0.8rem', fontWeight: 500 }}>{v.trim()}</span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '18px', padding: '15px', background: s.bg === '#1e293b' ? '#0f172a' : '#f8f9fa', borderRadius: '8px', fontStyle: 'italic' }}>
          <p style={{ fontSize: '0.85rem', color: s.text }}>"{formData.toneOfVoice}"</p>
        </div>

        {formData.donts?.length > 0 && (
          <div>
            <h3 style={{ fontSize: '0.9rem', color: '#dc2626', marginBottom: '10px', fontWeight: 600 }}>O Que NÃO Fazer</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {formData.donts.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#fef2f2', borderRadius: '6px', borderLeft: '3px solid #dc2626' }}>
                  <span style={{ color: '#dc2626', fontWeight: 600 }}>✕</span>
                  <span style={{ fontSize: '0.85rem', color: '#333' }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderManual = () => {
    const getStyles = () => {
      switch (templateStyle) {
        case 'minimal': return { heading: '#1a1a1a', border: '#e5e5e5', bg: '#fafafa', text: '#333' };
        case 'corporate': return { heading: primaryColor, border: accentColor, bg: '#f8fafc', text: '#333' };
        case 'premium': return { heading: tc.text, border: tc.accent, bg: tc.card, text: '#333' };
        case 'creative': return { heading: primaryColor, border: accentColor, bg: '#fafafa', text: '#333' };
        case 'tech': return { heading: '#e2e8f0', border: accentColor, bg: '#1e293b', text: '#94a3b8' };
        case 'nature': return { heading: primaryColor, border: accentColor, bg: '#f7fee7', text: '#333' };
        default: return { heading: '#1a1a1a', border: '#e5e5e5', bg: '#fafafa', text: '#333' };
      }
    };
    const s = getStyles();
    return (
      <div style={{ padding: '25px', height: '100%', overflow: 'auto', background: s.bg }}>
        <h2 style={{ fontFamily: formData.headingFont, fontSize: '1.6rem', color: s.heading, marginBottom: '20px', borderBottom: `3px solid ${s.border}`, paddingBottom: '10px' }}>Manual de Aplicação</h2>
        
        <div style={{ fontFamily: formData.bodyFont, fontSize: '0.9rem', color: s.text, lineHeight: 1.8, whiteSpace: 'pre-wrap', marginBottom: '20px' }}>
          {formData.manualContent}
        </div>
        
        <div style={{ padding: '20px', background: s.heading, borderRadius: '8px', color: templateStyle === 'tech' ? '#1e293b' : (templateStyle === 'minimal' ? '#fff' : secondaryColor), textAlign: 'center', marginTop: 'auto' }}>
          <p style={{ fontFamily: formData.bodyFont, fontSize: '0.8rem', opacity: 0.9 }}>Manual de Identidade Visual</p>
          <p style={{ fontFamily: formData.headingFont, fontSize: '1.3rem', marginTop: '4px' }}>{formData.brandName || 'Nome da Marca'}</p>
          <p style={{ fontFamily: formData.bodyFont, fontSize: '0.7rem', opacity: 0.7, marginTop: '8px' }}>© {new Date().getFullYear()} Todos os direitos reservados</p>
        </div>
      </div>
    );
  };

  const pages = [
    { title: 'Capa', render: renderCover },
    { title: 'Logos', render: renderLogoSystem },
    { title: 'Cores', render: renderColors },
    { title: 'Tipografia', render: renderTypography },
    { title: 'Variações', render: renderVariations },
    { title: 'Aplicações', render: renderApplications },
    { title: 'DNA', render: renderBrandDNA },
    { title: 'Manual', render: renderManual }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="sidebar-header" style={{ background: formData.template === 'premium' ? `linear-gradient(135deg, ${primaryColor}, ${accentColor})` : formData.template === 'intermediate' ? `linear-gradient(135deg, ${primaryColor}dd, ${primaryColor})` : '#1a1a1a' }}>
          <h1>Brand Manual Creator</h1>
          <p>Crie a identidade visual da sua marca</p>
        </div>

        <div className="sidebar-content">
          <div className="action-buttons">
            <button onClick={() => setShowHistory(!showHistory)} className="action-btn" title="Histórico">
              <History size={18} />
              <span>Histórico</span>
            </button>
            <button onClick={() => setShowFullscreen(true)} className="action-btn" title="Tela cheia">
              <Maximize size={18} />
              <span>Tela Cheia</span>
            </button>
          </div>

          <div className="tab-navigation">
            <button onClick={() => setActiveTab('brand')} className={`tab-nav-btn ${activeTab === 'brand' ? 'active' : ''}`}>
              <Building2 size={16} />
              <span>Marca</span>
            </button>
            <button onClick={() => setActiveTab('visual')} className={`tab-nav-btn ${activeTab === 'visual' ? 'active' : ''}`}>
              <PaletteIcon size={16} />
              <span>Visual</span>
            </button>
            <button onClick={() => setActiveTab('content')} className={`tab-nav-btn ${activeTab === 'content' ? 'active' : ''}`}>
              <FileType size={16} />
              <span>Conteúdo</span>
            </button>
            <button onClick={() => setActiveTab('advanced')} className={`tab-nav-btn ${activeTab === 'advanced' ? 'active' : ''}`}>
              <Settings size={16} />
              <span>Avançado</span>
            </button>
          </div>

          {showHistory && (
            <div className="history-panel animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Histórico ({history.length})</span>
                <button onClick={() => { setFormData(initialFormData); setShowHistory(false); }} className="btn-new-project">
                  <Plus size={14} /> Novo
                </button>
              </div>
              {history.length === 0 ? <p style={{ fontSize: '0.7rem', color: '#999' }}>Nenhum histórico salvo</p> : history.map(h => (
                <div key={h.id} className="history-item">
                  <button onClick={() => { setFormData(h.data); setShowHistory(false); }} className="history-item-content">
                    <div className="history-item-name">{h.brandName}</div>
                    <div className="history-item-date">{new Date(h.timestamp).toLocaleDateString('pt-BR')}</div>
                  </button>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Apagar o projeto "${h.brandName}"?`)) {
                      const updated = history.filter(item => item.id !== h.id);
                      setHistory(updated);
                      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                    }
                  }} className="history-item-delete" title="Apagar"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'brand' && (
            <>
              <div className="form-group">
                <label className="form-label"><Building2 size={14} /> Nome da Marca</label>
                <input type="text" name="brandName" className={`form-input ${validationErrors.brandName ? 'error' : ''}`} value={formData.brandName} onChange={handleChange} placeholder="Ex: Minha Marca" />
                {validationErrors.brandName && <span className="error-text">{validationErrors.brandName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label"><Image size={14} /> Logotipos</label>
                <div className="logo-upload-grid">
                  {['logo', 'logoSecondary', 'logoSymbol'].map(field => (
                    <div key={field} className="drop-zone" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, field)}>
                      {formData[field] ? (
                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img src={formData[field]} alt="" style={{ maxWidth: '80%', maxHeight: '80%' }} />
                          <button onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, [field]: null })) }} style={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={12} /></button>
                        </div>
                      ) : (
                        <>
                          <Image size={20} style={{ color: '#ccc' }} />
                          <span style={{ fontSize: '0.65rem', color: '#999' }}>{field === 'logo' ? 'Principal' : field === 'logoSecondary' ? 'Secundária' : 'Símbolo'}</span>
                          <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], field)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><Layout size={14} /> Template</label>
                <div className="template-grid">
                  {Object.values(TEMPLATES).map(t => (
                    <button key={t.id} className={`template-btn ${formData.template === t.id ? 'active' : ''}`} onClick={() => setFormData(p => ({ ...p, template: t.id }))} style={formData.template === t.id ? { background: t.accent || primaryColor, color: '#fff' } : {}}>
                      <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{t.icon}</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 600 }}>{t.name}</div>
                      <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>{t.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><Wand2 size={14} /> Alma da Marca</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input type="text" name="mission" className="form-input" value={formData.mission} onChange={handleChange} placeholder="Missão" />
                  <input type="text" name="vision" className="form-input" value={formData.vision} onChange={handleChange} placeholder="Visão" />
                  <input type="text" name="values" className="form-input" value={formData.values} onChange={handleChange} placeholder="Valores (vírgula)" />
                </div>
              </div>
            </>
          )}

          {activeTab === 'visual' && (
            <>
              <div className="form-group">
                <label className="form-label"><Palette size={14} /> Cores Principais</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {[1,2,3].map(n => (
                    <div key={n}>
                      <input type="color" name={`color${n}`} className="form-color-input" value={formData[`color${n}`]} onChange={handleChange} style={{ height: 44 }} />
                      <input type="text" name={`color${n}Cmyk`} className="form-input" value={formData[`color${n}Cmyk`]} onChange={handleChange} placeholder="CMYK" style={{ marginTop: '4px', fontSize: '0.7rem' }} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><Type size={14} /> Tipografia</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>Título</label>
                    <select name="headingFont" className="form-select" value={formData.headingFont} onChange={handleChange}>
                      {POPULAR_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>Corpo</label>
                    <select name="bodyFont" className="form-select" value={formData.bodyFont} onChange={handleChange}>
                      {POPULAR_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'content' && (
            <>
              <div className="form-group">
                <label className="form-label"><FileText size={14} /> Manual</label>
                <textarea name="manualContent" className="form-textarea" style={{ minHeight: '100px' }} value={formData.manualContent} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className="form-label"><Mic size={14} /> Tom de Voz</label>
                <textarea name="toneOfVoice" className="form-textarea" style={{ minHeight: '60px' }} value={formData.toneOfVoice} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label className="form-label"><Zap size={14} /> Variações</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {[
                    { key: 'showPositive', label: 'Positiva', icon: Sun },
                    { key: 'showNegative', label: 'Negativa', icon: Moon },
                    { key: 'showMonochrome', label: 'Monocromática', icon: Zap }
                  ].map(({ key, label }) => (
                    <label key={key} className="checkbox-label">
                      <input type="checkbox" name={key} checked={formData[key]} onChange={handleChange} /> {label}
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'advanced' && (
            <>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}><Palette size={14} /> Paleta de Cores</label>
                  <button onClick={handleAddPaletteColor} style={{ background: 'none', border: 'none', cursor: 'pointer', color: primaryColor }}><Plus size={18} /></button>
                </div>
                {formData.paletteColors?.length === 0 && (
                  <p style={{ fontSize: '0.7rem', color: '#999', marginBottom: '0.5rem' }}>Adicione cores extras para a paleta</p>
                )}
                {formData.paletteColors?.map((color, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '44px 1fr 1fr auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <input type="color" value={color.hex} onChange={(e) => handleUpdatePaletteColor(idx, 'hex', e.target.value)} style={{ width: '100%', height: 36, borderRadius: 6, cursor: 'pointer', border: '1px solid #e2e8f0' }} />
                    <input type="text" placeholder="Nome" value={color.name || ''} onChange={(e) => handleUpdatePaletteColor(idx, 'name', e.target.value)} className="form-input" />
                    <input type="text" placeholder="CMYK" value={color.cmyk || ''} onChange={(e) => handleUpdatePaletteColor(idx, 'cmyk', e.target.value)} className="form-input" />
                    <button onClick={() => handleRemovePaletteColor(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label className="form-label"><GitMerge size={14} /> Padrão Gráfico</label>
                <div className="drop-zone" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); const file = e.dataTransfer.files[0]; if (file) handleImageUpload(file, 'pattern'); }}>
                  {formData.pattern ? (
                    <div style={{ position: 'relative', width: '100%', height: '60px' }}>
                      <img src={formData.pattern} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                      <button onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, pattern: null })) }} style={{ position: 'absolute', top: -8, right: -8, width: 20, height: 20, borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer' }}><Trash2 size={12} /></button>
                    </div>
                  ) : (
                    <>
                      <GitMerge size={20} style={{ color: '#ccc' }} />
                      <span style={{ fontSize: '0.7rem', color: '#999' }}>Arraste ou clique</span>
                      <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], 'pattern')} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                    </>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><Briefcase size={14} /> Mockups</label>
                <div className="drop-zone" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('drag-over'); const files = e.dataTransfer.files; if (files.length > 0) handleMockupsUpload(files); }}>
                  <Briefcase size={20} style={{ color: '#ccc' }} />
                  <span style={{ fontSize: '0.7rem', color: '#999' }}>Arraste múltiplas imagens</span>
                  <input type="file" accept="image/*" multiple onChange={(e) => e.target.files.length > 0 && handleMockupsUpload(e.target.files)} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                </div>
                {formData.mockups.length > 0 && (
                  <div className="mockup-grid" style={{ marginTop: '0.5rem' }}>
                    {formData.mockups.map((m, i) => (
                      <div key={i} className="mockup-item">
                        <img src={m} alt="" />
                        <button onClick={() => setFormData(p => ({ ...p, mockups: p.mockups.filter((_, idx) => idx !== i) }))} className="mockup-remove">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label"><Ban size={14} /> O Que NÃO Fazer</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {DEFAULT_DONTS.map((dont, idx) => (
                    <label key={idx} className="checkbox-label">
                      <input type="checkbox" checked={formData.donts?.includes(dont) || false} onChange={(e) => {
                        const currentDonts = formData.donts || [];
                        if (e.target.checked) {
                          setFormData(prev => ({ ...prev, donts: [...currentDonts, dont] }));
                        } else {
                          setFormData(prev => ({ ...prev, donts: currentDonts.filter(d => d !== dont) }));
                        }
                      }} />
                      <Ban size={12} /> {dont}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><Grid3X3 size={14} /> Área de Proteção</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>Respiro (%)</label>
                    <input type="text" name="clearSpace" className="form-input" value={formData.clearSpace} onChange={handleChange} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '0.35rem' }}>Mín (mm)</label>
                    <input type="text" name="minSize" className="form-input" value={formData.minSize} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="footer-actions">
          <button className="btn btn-primary" onClick={handleGeneratePDF} disabled={isGenerating} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Download size={18} /> {isGenerating ? 'Gerando...' : 'Exportar PDF'}
          </button>
          <button className="btn btn-secondary" onClick={handleExportHTML} title="Exportar HTML"><Code size={18} /></button>
        </div>
      </div>

      <div className="preview-area">
        <div className="preview-header">
          <div className="page-tabs">
            {pages.map((p, i) => (
              <button key={i} className={`page-tab ${previewPage === i ? 'active' : ''}`} onClick={() => setPreviewPage(i)}>{i + 1}</button>
            ))}
          </div>
        </div>

        <div id="pdf-preview">
          <div className="paper" style={{ maxWidth: '500px' }}>
            <div className="paper-page">
              {pages[previewPage].render()}
            </div>
          </div>
        </div>
      </div>

      {showFullscreen && (
        <div className="fullscreen-preview">
          <div className="fullscreen-header">
            <span className="fullscreen-title">{pages[previewPage].title} ({previewPage + 1}/{pages.length})</span>
            <button onClick={() => setShowFullscreen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
          </div>
          <div className="fullscreen-content">
            <div className="fullscreen-paper">
              <div style={{ padding: '30px', height: '100%', overflow: 'auto' }}>
                {pages[previewPage].render()}
              </div>
            </div>
          </div>
          <div className="fullscreen-nav">
            <button className="fullscreen-nav-btn" onClick={() => setPreviewPage(p => Math.max(0, p - 1))} disabled={previewPage === 0}><ChevronLeft size={16} /></button>
            <div className="page-dots">
              {pages.map((_, i) => (
                <button key={i} className={`page-dot ${previewPage === i ? 'active' : ''}`} onClick={() => setPreviewPage(i)} />
              ))}
            </div>
            <button className="fullscreen-nav-btn" onClick={() => setPreviewPage(p => Math.min(pages.length - 1, p + 1))} disabled={previewPage === pages.length - 1}><ChevronRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;