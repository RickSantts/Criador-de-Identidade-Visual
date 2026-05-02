import React, { useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { 
  Download, Code, History, Maximize, RotateCcw, X, Check, Image, Palette, Type, 
  Layers, Layout, Zap, Sun, Moon, Briefcase, Trash2, Plus, ChevronLeft, 
  ChevronRight, Grid3X3, GitMerge, Ban, Mic, FileText, Sparkles, Building2, 
  FileType, Settings, Wand2, ArrowLeft, Share2, CreditCard, FileSpreadsheet, AlertCircle 
} from 'lucide-react'
import { validateFormData, compressImage, TEMPLATES } from './utils/validation'
import ServiceSelector from './components/ServiceSelector'
import BusinessCardEditor from './components/BusinessCardEditor'
import LetterheadEditor from './components/LetterheadEditor'
import PresentationEditor from './components/PresentationEditor'
import ArtShowcaseEditor from './components/ArtShowcaseEditor'
import MoodboardEditor from './components/MoodboardEditor'
import BudgetEditor from './components/BudgetEditor'
import WiFiSignEditor from './components/WiFiSignEditor'

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
  'Pacifico', 'Kanit', 'Rubik', 'Quicksand', 'Bebas Neue', 'Source Sans Pro',
  'Cormorant Garamond', 'Cinzel', 'Spectral', 'Syne', 'Clash Display', 'General Sans'
];

const DEFAULT_DONTS = [
  'Não distorcer o logo',
  'Não alterar as cores',
  'Não girar o logo',
  'Não adicionar efeitos',
  'Não usar sobre fundos cluttereds'
];

const ARCHETYPES = [
  { id: 'innocent', name: 'O Inocente', icon: '😇', desc: 'Otimismo, pureza e simplicidade.', keywords: ['Bondade', 'Felicidade', 'Confiança'] },
  { id: 'explorer', name: 'O Explorador', icon: '🧗', desc: 'Liberdade, descoberta e autossuficiência.', keywords: ['Aventura', 'Independência', 'Busca'] },
  { id: 'sage', name: 'O Sábio', icon: '🧠', desc: 'Verdade, inteligência e análise.', keywords: ['Sabedoria', 'Conhecimento', 'Verdade'] },
  { id: 'hero', name: 'O Herói', icon: '🦸', desc: 'Coragem, maestria e superação.', keywords: ['Determinação', 'Vencer', 'Força'] },
  { id: 'outlaw', name: 'O Rebelde', icon: '🤘', desc: 'Libertação, quebra de regras e mudança.', keywords: ['Inovação', 'Desafio', 'Liberdade'] },
  { id: 'magician', name: 'O Mago', icon: '🪄', desc: 'Transformação, visão e inovação.', keywords: ['Sonho', 'Carisma', 'Transformação'] },
  { id: 'everyman', name: 'O Cara Comum', icon: '🤝', desc: 'Conexão, igualdade e realismo.', keywords: ['Pertencimento', 'Amizade', 'Honestidade'] },
  { id: 'lover', name: 'O Amante', icon: '❤️', desc: 'Intimidade, paixão e estética.', keywords: ['Beleza', 'Prazer', 'Relacionamento'] },
  { id: 'jester', name: 'O Bobo da Corte', icon: '🤡', desc: 'Alegria, diversão e irreverência.', keywords: ['Humor', 'Espontaneidade', 'Leveza'] },
  { id: 'caregiver', name: 'O Prestativo', icon: '🤲', desc: 'Cuidado, compaixão e proteção.', keywords: ['Generosidade', 'Serviço', 'Apoio'] },
  { id: 'creator', name: 'O Criador', icon: '🎨', desc: 'Inovação, imaginação e execução.', keywords: ['Originalidade', 'Estrutura', 'Autoexpressão'] },
  { id: 'ruler', name: 'O Governante', icon: '👑', desc: 'Controle, liderança e status.', keywords: ['Poder', 'Ordem', 'Sucesso'] }
];

const isLightColor = (hex) => {
  if (!hex || !hex.startsWith('#')) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
};

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
  gridSize: 20,
  watermarkEnabled: false,
  watermarkImage: null,
  watermarkOpacity: 0.15,
  watermarkType: 'center',
  watermarkSize: 120,
  archetype: 'creator',
  formalCasual: 50,
  modernClassic: 50,
  boldCalm: 50
};

function App() {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('current_brand_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load brand data:', e);
      }
    }
    return initialFormData;
  });

  useEffect(() => {
    localStorage.setItem('current_brand_data', JSON.stringify(formData));
  }, [formData]);
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
  const [activeService, setActiveService] = useState(null);
  const [showHomeScreen, setShowHomeScreen] = useState(true);
  const [showCompanyEditor, setShowCompanyEditor] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  const [companyData, setCompanyData] = useState(() => {
    const saved = localStorage.getItem('company_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load company data:', e);
      }
    }
    return {
      companyName: '',
      companyEmail: '',
      companyPhone: '',
      companyWebsite: '',
      companyAddress: '',
      logo: null
    };
  });

  useEffect(() => {
    localStorage.setItem('company_data', JSON.stringify(companyData));
  }, [companyData]);

  const notify = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const [finalizedProjects, setFinalizedProjects] = useState(() => {
    try {
      const saved = localStorage.getItem('finalized_projects');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to parse finalized projects:', e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('finalized_projects', JSON.stringify(finalizedProjects));
  }, [finalizedProjects]);

  const removeFinalizedProject = (id) => {
    setFinalizedProjects(prev => prev.filter(p => p.id !== id));
    notify('Projeto removido do histórico.', 'info');
  };

  const handleSaveToGallery = (project) => {
    setFinalizedProjects(prev => {
      const updated = [{ ...project, id: Date.now() }, ...prev].slice(0, 50);
      localStorage.setItem('finalized_projects', JSON.stringify(updated));
      return updated;
    });
    notify('Salvo na galeria!', 'success');
  };

  const NotificationToast = ({ n }) => (
    <div key={n.id} className={`notification-toast ${n.type}`} style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
padding: '12px 20px',
      borderRadius: '12px',
      background: n.type === 'success' ? '#10b981' : n.type === 'error' ? '#ef4444' : '#1e293b',
      color: 'white',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      zIndex: 99,
      animation: 'toast-in 0.3s ease-out forwards',
      fontWeight: 600,
      fontSize: '0.9rem'
    }}>
      {n.type === 'success' ? <Check size={18} /> : n.type === 'error' ? <AlertCircle size={18} /> : <Zap size={18} />}
      {n.message}
    </div>
  );

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
      notify('Preencha os campos obrigatórios.', 'error');
      return;
    }
    setValidationErrors({});
    setIsGenerating(true);

    try {
      if (document.fonts) await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 100));

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const previewEl = document.getElementById('pdf-preview');
      
      if (!previewEl) {
        throw new Error('Preview element not found');
      }
      
      for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        setPreviewPage(pageIndex);
        
        await new Promise(resolve => setTimeout(resolve, 150));
        
        const paperEl = previewEl.querySelector('.paper-page');
        
        if (!paperEl) {
          throw new Error(`Page ${pageIndex} element not found`);
        }
        
        const canvas = await html2canvas(paperEl, { 
          scale: 2, 
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: paperEl.offsetWidth,
          height: paperEl.offsetHeight,
          windowWidth: paperEl.scrollWidth,
          windowHeight: paperEl.scrollHeight
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (pageIndex > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }
      
      pdf.save(`Manual_${formData.brandName || 'Marca'}.pdf`);
      notify('PDF exportado com sucesso!', 'success');
      
      const newEntry = { id: Date.now(), timestamp: new Date().toISOString(), brandName: formData.brandName || 'Sem nome', data: { ...formData } };
      setHistory(prev => {
        const updated = [newEntry, ...prev].slice(0, 10);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      notify('Erro ao gerar PDF: ' + error.message, 'error');
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
        return { bg: '#0c0c0c', text: '#ffffff', accent: '#d4af37', secondary: '#a1a1aa', card: 'rgba(255, 255, 255, 0.05)' };
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
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px', height: '100%', background: '#0c0c0c', position: 'relative', overflow: 'hidden', color: '#ffffff' }}>
          <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: `radial-gradient(circle, ${tc.accent}30 0%, transparent 70%)`, borderRadius: '50%', filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, background: `radial-gradient(circle, ${primaryColor}20 0%, transparent 70%)`, borderRadius: '50%', filter: 'blur(30px)' }} />
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: `url("https://www.transparenttextures.com/patterns/dark-matter.png")` }} />
          
          <div style={{ zIndex: 1, backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
            {formData.logo && <img src={formData.logo} alt="Logo" style={{ maxWidth: '200px', maxHeight: '130px', objectFit: 'contain', marginBottom: '30px', filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.1))' }} />}
            <h1 style={{ fontFamily: formData.headingFont, fontSize: '2.8rem', color: '#ffffff', marginBottom: '10px', letterSpacing: '-0.03em', fontWeight: 800 }}>{formData.brandName || 'Nome da Marca'}</h1>
            <p style={{ fontFamily: formData.bodyFont, fontSize: '0.9rem', color: tc.accent, marginBottom: '30px', fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase' }}>Brand Identity Guidelines</p>
            <div style={{ width: '100px', height: '1px', background: `linear-gradient(90deg, transparent, ${tc.accent}, transparent)`, margin: '0 auto' }} />
          </div>
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

        <div style={{ padding: '20px', background: '#f0f9ff', borderRadius: '8px', marginBottom: '20px', border: `1px solid ${accentColor}30` }}>
          <h3 style={{ fontSize: '0.9rem', color: '#333', marginBottom: '12px', fontWeight: 600 }}>Marca d'Água Padrão</h3>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '12px' }}>Configure uma marca d'água que será aplicada automaticamente em todos os serviços</p>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="watermarkEnabled"
                checked={formData.watermarkEnabled || false} 
                onChange={(e) => setFormData(prev => ({ ...prev, watermarkEnabled: e.target.checked }))}
              />
              <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Ativar marca d'água</span>
            </label>
          </div>

          {formData.watermarkEnabled && (
            <>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <input 
                  type="text" 
                  placeholder="URL da imagem ou carregue..." 
                  value={formData.watermarkImage || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, watermarkImage: e.target.value }))}
                  style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.8rem' }}
                />
                <input 
                  type="file" 
                  accept="image/*" 
                  id="watermark-upload"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const compressed = await compressImage(file, 0.3, 400);
                      const reader = new FileReader();
                      reader.onloadend = () => setFormData(prev => ({ ...prev, watermarkImage: reader.result }));
                      reader.readAsDataURL(compressed);
                    }
                  }}
                />
                <label htmlFor="watermark-upload" style={{ padding: '8px 12px', background: '#1e293b', color: '#fff', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Carregar Imagem
                </label>
                {formData.watermarkImage && (
                  <button 
                    onClick={() => setFormData(prev => ({ ...prev, watermarkImage: null }))}
                    style={{ padding: '8px 12px', background: '#ef4444', color: '#fff', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', border: 'none' }}
                  >
                    Remover
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#64748b' }}>Posição</label>
                  <select 
                    value={formData.watermarkType || 'center'}
                    onChange={(e) => setFormData(prev => ({ ...prev, watermarkType: e.target.value }))}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '0.8rem', marginTop: '4px' }}
                  >
                    <option value="center">Centro</option>
                    <option value="pattern">Padrão (repetir)</option>
                    <option value="corner">Cantos</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#64748b' }}>Tamanho: {formData.watermarkSize || 120}px</label>
                  <input 
                    type="range" 
                    min="30" 
                    max="350" 
                    value={formData.watermarkSize || 120}
                    onChange={(e) => setFormData(prev => ({ ...prev, watermarkSize: parseInt(e.target.value) }))}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '12px' }}>
                <label style={{ fontSize: '0.7rem', color: '#64748b' }}>Opacidade: {Math.round((formData.watermarkOpacity || 0.15) * 100)}%</label>
                <input 
                  type="range" 
                  min="0.05" 
                  max="0.6" 
                  step="0.05" 
                  value={formData.watermarkOpacity || 0.15}
                  onChange={(e) => setFormData(prev => ({ ...prev, watermarkOpacity: parseFloat(e.target.value) }))}
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>

              {formData.watermarkImage && (
                <div style={{ marginTop: '12px', padding: '12px', background: '#fff', borderRadius: '6px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: '#16a34a', marginBottom: '8px' }}>Prévia da marca d'água:</p>
                  <img src={formData.watermarkImage} alt="Watermark" style={{ maxHeight: '60px', maxWidth: '100%', opacity: formData.watermarkOpacity || 0.15 }} />
                </div>
              )}

              {formData.logo && !formData.watermarkImage && (
                <div style={{ marginTop: '12px', padding: '12px', background: '#fff', borderRadius: '6px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '8px' }}>Será usado o logo principal como marca d'água:</p>
                  <img src={formData.logo} alt="Logo" style={{ maxHeight: '50px', maxWidth: '100%', opacity: formData.watermarkOpacity || 0.15 }} />
                </div>
              )}
            </>
          )}
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
    const currentArchetypeId = formData.archetype || 'creator';
    const archetype = ARCHETYPES.find(a => a.id === currentArchetypeId) || ARCHETYPES[10] || ARCHETYPES[0];

    return (
      <div style={{ padding: '25px', height: '100%', overflow: 'auto', background: s.bg }}>
        <h2 style={{ fontFamily: formData.headingFont, fontSize: '1.6rem', color: s.heading, marginBottom: '20px', borderBottom: `3px solid ${s.border}`, paddingBottom: '10px' }}>6. Alma da Marca</h2>
        
        {/* Archetype Section */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', background: s.bg === '#1e293b' ? '#0f172a' : '#fff', padding: '15px', borderRadius: '12px', border: `1px solid ${s.border}40` }}>
          <div style={{ fontSize: '3rem', background: s.bg === '#1e293b' ? '#1e293b' : '#f1f5f9', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
            {archetype.icon}
          </div>
          <div>
            <h3 style={{ fontSize: '0.7rem', color: s.accent, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Arquétipo Dominante</h3>
            <h4 style={{ fontSize: '1.2rem', color: s.heading, margin: '0 0 5px 0' }}>{archetype.name}</h4>
            <p style={{ fontSize: '0.8rem', color: s.text, opacity: 0.8, margin: 0 }}>{archetype.desc}</p>
          </div>
        </div>

        {/* Personality Sliders visualization */}
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '0.75rem', color: s.accent, marginBottom: '15px', fontWeight: 700, textTransform: 'uppercase' }}>Espectro de Personalidade</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { id: 'formalCasual', left: 'Formal', right: 'Casual' },
              { id: 'modernClassic', left: 'Moderno', right: 'Clássico' },
              { id: 'boldCalm', left: 'Ousado', right: 'Sério' }
            ].map(slider => (
              <div key={slider.id} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '0.6rem', color: s.text, width: '60px', textAlign: 'right', fontWeight: 600 }}>{slider.left}</span>
                <div style={{ flex: 1, height: '4px', background: '#e2e8f0', borderRadius: '2px', position: 'relative' }}>
                  <div style={{ 
                    position: 'absolute', 
                    left: `${formData[slider.id]}%`, 
                    top: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    width: '10px', height: '10px', 
                    background: s.accent, 
                    borderRadius: '50%',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span style={{ fontSize: '0.6rem', color: s.text, width: '60px', fontWeight: 600 }}>{slider.right}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
          <div>
            <h3 style={{ fontSize: '0.7rem', color: s.accent, marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase' }}>Missão</h3>
            <p style={{ fontSize: '0.85rem', color: s.text, lineHeight: 1.5, margin: 0 }}>{formData.mission}</p>
          </div>
          <div>
            <h3 style={{ fontSize: '0.7rem', color: s.accent, marginBottom: '4px', fontWeight: 700, textTransform: 'uppercase' }}>Visão</h3>
            <p style={{ fontSize: '0.85rem', color: s.text, lineHeight: 1.5, margin: 0 }}>{formData.vision}</p>
          </div>
        </div>
        
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '0.7rem', color: s.accent, marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase' }}>Valores Nucleares</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {(formData.values || '').split(',').map((v, i) => (
              <span key={i} style={{ padding: '4px 12px', border: `1px solid ${s.accent}40`, color: s.text, borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>{v.trim()}</span>
            ))}
          </div>
        </div>

        {formData.donts?.length > 0 && (
          <div style={{ padding: '15px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fee2e2' }}>
            <h3 style={{ fontSize: '0.75rem', color: '#dc2626', marginBottom: '10px', fontWeight: 800, textTransform: 'uppercase' }}>Restrições Críticas</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {formData.donts.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#7f1d1d' }}>
                  <span style={{ color: '#dc2626' }}>●</span> {d}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRestrictions = () => {
    return (
      <div style={{ padding: '25px', minHeight: '100%', overflow: 'visible', background: '#fafafa' }}>
        <h2 style={{ fontFamily: formData.headingFont, fontSize: '1.6rem', color: '#1e1a1a', marginBottom: '20px', borderBottom: '3px solid #1e1a1a', paddingBottom: '10px' }}>7. Restrições de Uso</h2>
        
        {formData.donts?.length > 0 ? (
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '0.85rem', color: '#dc2626', marginBottom: '12px', fontWeight: 700, textTransform: 'uppercase' }}>O que NÃO fazer</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {formData.donts.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                  <span style={{ color: '#dc2626', fontSize: '1rem' }}>✕</span>
                  <span style={{ fontSize: '0.85rem', color: '#7f1d1d', lineHeight: 1.5 }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding: '40px', border: '2px dashed #e2e8f0', borderRadius: '8px', textAlign: 'center', color: '#999', marginBottom: '20px' }}>
            <p>Adicione restrições na seção de DNA</p>
          </div>
        )}

        {formData.minSize && (
          <div style={{ padding: '15px', background: '#f1f5f9', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '0.8rem', color: '#1e293b', marginBottom: '8px', fontWeight: 600 }}>Tamanho Mínimo</h3>
            <p style={{ fontSize: '0.9rem', color: '#475569' }}>{formData.minSize}mm</p>
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
    { title: 'Restrições', render: renderRestrictions },
    { title: 'Manual', render: renderManual }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const renderGallery = () => {
    return (
      <div className="gallery-container" style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        <div className="gallery-header" style={{ marginBottom: '30px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', color: '#1e293b' }}>🗄️ Histórico de Projetos</h2>
          <p style={{ color: '#64748b' }}>Visualize e gerencie seus ativos exportados</p>
        </div>

        {finalizedProjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
            <History size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
            <p style={{ color: '#94a3b8' }}>Você ainda não salvou nenhum projeto no histórico.</p>
            <button className="btn btn-primary" onClick={() => setActiveService(null)} style={{ marginTop: '20px' }}>Começar a Criar</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {finalizedProjects.map((p) => (
              <div key={p.id} className="gallery-card" style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', transition: 'transform 0.2s' }}>
                <div style={{ height: '200px', background: '#f1f5f9', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                  {p.image ? (
                    <img src={p.image} alt={p.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                      <p style={{ fontSize: '2rem', marginBottom: '8px' }}>{p.type === 'budget' ? '💰' : '📄'}</p>
                      <p style={{ fontSize: '0.8rem' }}>{p.type === 'budget' ? 'Orçamento' : p.type}</p>
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                    <button onClick={() => removeFinalizedProject(p.id)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', border: '1px solid #fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{p.title}</h3>
                    <span style={{ fontSize: '0.65rem', padding: '2px 8px', background: p.type === 'budget' ? '#d1fae5' : '#e0e7ff', color: p.type === 'budget' ? '#059669' : '#4f46e5', borderRadius: '10px', fontWeight: 600 }}>{p.type === 'budget' ? 'Orçamento' : p.type}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px' }}>
                    {p.client && <span>Cliente: {p.client}</span>}
                    {p.client && p.date && <span> • </span>}
                    {p.date && <span>{p.date}</span>}
                    {p.total && <span style={{ display: 'block', marginTop: '8px', fontWeight: 600, color: '#059669' }}>Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.total)}</span>}
                  </p>
                  {p.image ? (
                    <a href={p.image} download={`${p.title}.png`} className="btn btn-secondary" style={{ width: '100%', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <Download size={14} /> Baixar Ativo
                    </a>
                  ) : (
                    <button onClick={() => setActiveService(p.type === 'budget' ? 'budget' : 'identity')} className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem' }}>
                      <Download size={14} /> Abrir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderServiceEditor = () => {
    const brandProps = { brandData: formData, companyData, onNotify: notify };
    switch (activeService) {
      case 'moodboard': return <MoodboardEditor {...brandProps} />;
      case 'businesscard': return <BusinessCardEditor {...brandProps} />;
      case 'letterhead': return <LetterheadEditor {...brandProps} />;
      case 'presentation': return <PresentationEditor {...brandProps} />;
      case 'artshowcase': return <ArtShowcaseEditor {...brandProps} />;
      case 'wifisign': return <WiFiSignEditor {...brandProps} />;
      case 'budget': return <BudgetEditor brandData={formData} companyData={companyData} onBack={() => setActiveService(null)} onSave={handleSaveToGallery} />;
      case 'gallery': return renderGallery();
      default: return null;
    }
  };

  if (activeService && activeService !== 'identity') {
    return (
      <div className="app-container service-mode">
        <div className="service-back-bar">
          <button className="service-back-btn" onClick={() => setActiveService(null)}>
            <ArrowLeft size={18} />
            <span>Voltar ao Hub</span>
          </button>
          <div className="service-back-brand">
            {formData.logo && <img src={formData.logo} alt="" className="service-back-logo" />}
            <span>{formData.brandName || 'Minha Marca'}</span>
          </div>
        </div>
        {renderServiceEditor()}

        {/* Notifications */}
        <div className="notifications-layer">
          {notifications.map(n => <NotificationToast key={n.id} n={n} />)}
        </div>
        
        <style>{`
          @keyframes toast-in {
            from { transform: translate(-50%, 100px); opacity: 0; }
            to { transform: translate(-50%, 0); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Home Screen - Tela inicial */}
      {showHomeScreen && !activeService && (
        <div className="home-screen" style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div className="home-main-card">
            <div className="home-icon">
              <Sparkles size={40} color="white" />
            </div>
            <h1 className="home-title">Criador de PDFs</h1>
            <p className="home-subtitle">Crie materiais profissionais para seus clientes</p>
          </div>

          <div className="home-cards">
            {/* Card Minha Empresa */}
            <button 
              className="home-card"
              onClick={() => setShowCompanyEditor(true)}
            >
              <div className="home-card-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <Briefcase size={24} color="white" />
              </div>
              <h3 className="home-card-title">Minha Empresa</h3>
              <p className="home-card-desc">Configure seus dados que aparecem nos orçamentos</p>
              {companyData.companyName && (
                <div className="home-card-status">
                  ✓ {companyData.companyName}
                </div>
              )}
            </button>

            {/* Card Serviços */}
            <button 
              className="home-card"
              onClick={() => setShowHomeScreen(false)}
            >
              <div className="home-card-icon" style={{ 
                width: 50, height: 50, 
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', 
                borderRadius: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '1rem'
              }}>
                <Layout size={24} color="white" />
              </div>
              <h3 className="home-card-title">Serviços</h3>
              <p className="home-card-desc">Identidade visual, orçamentos, apresentações e mais</p>
            </button>
          </div>

          {/* Área de edição da empresa na própria tela inicial */}
          <div className="home-section">
            <button 
              className={`home-company-btn ${companyData.companyName ? 'saved' : ''}`}
              onClick={() => setShowCompanyEditor(true)}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {companyData.logo ? (
                  <img src={companyData.logo} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'contain' }} />
                ) : (
                  <div style={{ width: 32, height: 32, background: '#f1f5f9', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Briefcase size={16} color="#94a3b8" />
                  </div>
                )}
                {companyData.companyName || 'Configure sua empresa'}
              </span>
              <ChevronRight size={20} color="#64748b" />
            </button>
          </div>
        </div>
      )}

      {/* Company Editor Screen */}
      {showCompanyEditor && (
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          background: '#f8fafc'
        }}>
          <div style={{ 
            padding: '1.5rem 2rem', 
            background: 'white', 
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <button 
              onClick={() => setShowCompanyEditor(false)}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                color: '#64748b',
                fontSize: '0.9rem'
              }}
            >
              <ArrowLeft size={20} />
              Voltar
            </button>
            <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Minha Empresa</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Configure seus dados para orçamentos</p>
            </div>
          </div>

          <div style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div style={{ 
                padding: '1rem 1.5rem', 
                background: 'linear-gradient(135deg, #10b98120, #05966910)', 
                borderRadius: '12px', 
                marginBottom: '2rem', 
                border: '1px solid #10b98130' 
              }}>
                <p style={{ fontSize: '0.85rem', color: '#065f46', fontWeight: 500, margin: 0 }}>
                  Estes dados aparecem automaticamente nos orçamentos e outros documentos gerados.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label"><Building2 size={14} /> Nome da Empresa</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={companyData.companyName}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Ex: Seu Estúdio de Design"
                />
              </div>

              <div className="form-group">
                <label className="form-label"><Image size={14} /> Logo da Empresa</label>
                <div 
                  className="drop-zone"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('drag-over');
                    const file = e.dataTransfer.files[0];
                    if (file && file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onloadend = () => setCompanyData(prev => ({ ...prev, logo: reader.result }));
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ minHeight: '100px' }}
                >
                  {companyData.logo ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                      <img src={companyData.logo} alt="Logo da Empresa" style={{ maxWidth: '80%', maxHeight: '80px' }} />
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCompanyData(prev => ({ ...prev, logo: null })) }} 
                        style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Image size={24} style={{ color: '#ccc' }} />
                      <span style={{ fontSize: '0.7rem', color: '#999' }}>Arraste ou clique para adicionar</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setCompanyData(prev => ({ ...prev, logo: reader.result }));
                            reader.readAsDataURL(file);
                          }
                        }} 
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} 
                      />
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label"><Type size={14} /> E-mail</label>
                  <input 
                    type="email" 
                    className="form-input"
                    value={companyData.companyEmail}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, companyEmail: e.target.value }))}
                    placeholder="seu@email.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label"><Zap size={14} /> Telefone</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={companyData.companyPhone}
                    onChange={(e) => setCompanyData(prev => ({ ...prev, companyPhone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label"><Code size={14} /> Website</label>
                <input 
                  type="text" 
                  className="form-input"
                  value={companyData.companyWebsite}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, companyWebsite: e.target.value }))}
                  placeholder="www.seusite.com.br"
                />
              </div>

              <div className="form-group">
                <label className="form-label"><Layout size={14} /> Endereço</label>
                <textarea 
                  className="form-textarea"
                  value={companyData.companyAddress}
                  onChange={(e) => setCompanyData(prev => ({ ...prev, companyAddress: e.target.value }))}
                  placeholder="Endereço da sua empresa..."
                  style={{ minHeight: '80px' }}
                />
              </div>

              <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #10b98130' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <Check size={18} color="#10b981" />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#065f46' }}>Prévia do Orçamento</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#047857', margin: 0 }}>
                  Assim que um orçamento for gerado, estas informações aparecerão automaticamente no cabeçalho.
                </p>
                {companyData.companyName && (
                  <div style={{ marginTop: '1rem', padding: '12px', background: 'white', borderRadius: '8px' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>{companyData.companyName}</p>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {companyData.companyEmail}{companyData.companyPhone && ` • ${companyData.companyPhone}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Hub Selector - shows when no service is selected but user clicked on Services */}
      {!showHomeScreen && !activeService && (
        <div className="service-hub-overlay">
          <div className="service-hub-header">
            <div className="service-hub-logo" style={{ justifyContent: 'flex-start', gap: '1rem' }}>
              <button 
                onClick={() => setShowHomeScreen(true)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  color: '#1e293b',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                <ArrowLeft size={20} />
                Voltar
              </button>
              <div>
                <h1>Serviços</h1>
                <p>Escolha um serviço para começar</p>
              </div>
            </div>
          </div>
          <ServiceSelector activeService={activeService} onSelectService={setActiveService} brandData={formData} />
        </div>
      )}

      {/* Identity Editor - shows when 'identity' service is selected */}
      {activeService === 'identity' && (
      <>
      <div className="sidebar">
        <div className="sidebar-header" style={{ background: formData.template === 'premium' ? `linear-gradient(135deg, ${primaryColor}, ${accentColor})` : formData.template === 'intermediate' ? `linear-gradient(135deg, ${primaryColor}dd, ${primaryColor})` : '#1a1a1a' }}>
          <div className="sidebar-header-row">
            <button className="sidebar-back-btn" onClick={() => setActiveService(null)}><ArrowLeft size={18} /></button>
            <div>
              <h1>Identidade Visual</h1>
              <p>Manual completo da marca</p>
            </div>
          </div>
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
              <Palette size={16} />
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
                        <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                          <img src={formData[field]} alt="" style={{ maxWidth: '80%', maxHeight: '80%' }} />
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFormData(prev => ({ ...prev, [field]: null })) }} style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30, boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}><Trash2 size={12} /></button>
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
                <label className="form-label"><Wand2 size={14} /> DNA da Marca</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="archetype-select-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                    {ARCHETYPES.map(a => (
                      <button 
                        key={a.id} 
                        className={`archetype-btn ${formData.archetype === a.id ? 'active' : ''}`}
                        onClick={() => setFormData(p => ({ ...p, archetype: a.id }))}
                        title={a.desc}
                        style={{
                          padding: '10px 5px',
                          background: formData.archetype === a.id ? '#1e293b' : '#fff',
                          color: formData.archetype === a.id ? '#fff' : '#1e293b',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>{a.icon}</span>
                        <span style={{ fontSize: '0.6rem', fontWeight: 600 }}>{a.name}</span>
                      </button>
                    ))}
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '10px', lineHeight: 1.4 }}>
                      {ARCHETYPES.find(a => a.id === formData.archetype)?.desc}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {ARCHETYPES.find(a => a.id === formData.archetype)?.keywords?.map(k => (
                        <span key={k} style={{ fontSize: '0.6rem', padding: '2px 8px', background: '#e2e8f0', color: '#475569', borderRadius: '4px' }}>#{k}</span>
                      ))}
                    </div>
                  </div>

                  <div className="personality-sliders" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                    {[
                      { id: 'formalCasual', left: 'Formal', right: 'Casual' },
                      { id: 'modernClassic', left: 'Moderno', right: 'Clássico' },
                      { id: 'boldCalm', left: 'Ousado', right: 'Sério' }
                    ].map(s => (
                      <div key={s.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
                          <span>{s.left}</span>
                          <span>{s.right}</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={formData[s.id]} 
                          onChange={(e) => setFormData(p => ({ ...p, [s.id]: parseInt(e.target.value) }))}
                          style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', appearance: 'none', outline: 'none' }}
                        />
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px', display: 'block' }}>Missão, Visão e Valores</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <input type="text" name="mission" className="form-input" value={formData.mission} onChange={handleChange} placeholder="Missão" />
                      <input type="text" name="vision" className="form-input" value={formData.vision} onChange={handleChange} placeholder="Visão" />
                      <input type="text" name="values" className="form-input" value={formData.values} onChange={handleChange} placeholder="Valores (vírgula)" />
                    </div>
                  </div>
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
                    <div style={{ position: 'relative', width: 44, height: 36, borderRadius: 6, border: '1px solid #e2e8f0', overflow: 'hidden', background: color.hex || '#f3f4f6' }}>
                      <input type="color" value={color.hex || '#ffffff'} onChange={(e) => handleUpdatePaletteColor(idx, 'hex', e.target.value)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', padding: 0, border: 'none', cursor: 'pointer', opacity: 0 }} />
                      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: color.hex ? (isLightColor(color.hex) ? '#000' : '#fff') : '#9ca3af', pointerEvents: 'none' }}>{color.hex ? '' : '?'}</span>
                    </div>
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
                    <div style={{ position: 'relative', width: '100%', height: '60px', zIndex: 10 }}>
                      <img src={formData.pattern} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFormData(prev => ({ ...prev, pattern: null })) }} style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}><Trash2 size={12} /></button>
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
              {pages[previewPage]?.render ? pages[previewPage].render() : <div style={{ padding: '20px', color: '#64748b' }}>Carregando visualização...</div>}
            </div>
          </div>
        </div>
      </div>

      {showFullscreen && (
        <div className="fullscreen-preview">
          <div className="fullscreen-header">
            <span className="fullscreen-title">{pages[previewPage]?.title || 'Página'} ({previewPage + 1}/{pages.length})</span>
            <button onClick={() => setShowFullscreen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={20} /></button>
          </div>
          <div className="fullscreen-content">
            <div className="fullscreen-paper">
              <div style={{ padding: '30px', height: '100%', overflow: 'auto' }}>
                {pages[previewPage]?.render ? pages[previewPage].render() : <div style={{ padding: '20px', color: '#64748b' }}>Carregando visualização...</div>}
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
      {/* Notifications in Main Hub */}
      <div className="notifications-layer">
        {notifications.map(n => <NotificationToast key={n.id} n={n} />)}
      </div>
      
      <style>{`
        @keyframes toast-in {
          from { transform: translate(-50%, 100px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .notification-toast {
          transition: all 0.3s ease;
        }
      `}</style>
      </>
      )}
    </div>
  );
}

export default App;