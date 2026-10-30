import React, { useState, useEffect, useRef, useMemo } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  ArrowLeft, Calculator, Plus, Trash2, Download, Image as ImageIcon, 
  RotateCcw, Check, AlertCircle, Eye, Edit3, DollarSign, FileText, 
  X, Copy, Calendar, Clock, Palette, Layers, Settings2, 
  ChevronDown, ChevronUp, QrCode, Sparkles, ShieldCheck, Scale, 
  ZoomIn, ZoomOut, Maximize2, MoveUp, MoveDown, HelpCircle, CheckCircle2
} from 'lucide-react';

const STORAGE_KEY = 'budget_data';

const PAYMENT_METHODS = [
  { id: 'pix', label: 'PIX', icon: '⚡' },
  { id: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { id: 'debito', label: 'Cartão de Débito', icon: '💳' },
  { id: 'credito', label: 'Cartão de Crédito', icon: '💳' },
  { id: 'transferencia', label: 'Transferência Bancária', icon: '🏦' },
  { id: 'boleto', label: 'Boleto Bancário', icon: '📄' },
];

const COLOR_PRESETS = [
  { id: 'emerald', label: 'Esmeralda', hex: '#10b981' },
  { id: 'sapphire', label: 'Azul Safira', hex: '#2563eb' },
  { id: 'purple', label: 'Roxo Nobre', hex: '#7c3aed' },
  { id: 'ruby', label: 'Vermelho Rubi', hex: '#dc2626' },
  { id: 'graphite', label: 'Grafite Moderno', hex: '#1e293b' },
  { id: 'amber', label: 'Âmbar Dourado', hex: '#d97706' },
  { id: 'magenta', label: 'Rosa Pink', hex: '#db2777' },
];

const INITIAL_BUDGET_DATA = {
  // Client & Project Info
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  projectName: '',
  projectDescription: '',
  
  // Dates & Deadlines
  emissionDate: new Date().toISOString().split('T')[0],
  validity: 7,
  deliveryType: 'prazo', // 'prazo', 'data', 'combinar'
  deliveryDays: 7,
  deliveryDate: '',
  deliveryNotes: '',

  // Items & Values
  items: [
    {
      id: 1,
      name: 'Identidade Visual Completa',
      description: 'Criação de logotipo, manual de uso, tipografia e paleta de cores.',
      price: 1200,
      quantity: 1
    }
  ],
  globalDiscount: 0,
  globalDiscountType: 'fixed', // 'fixed' | 'percent'

  // Payment
  paymentTerms: '',
  paymentPortions: [
    { id: 1, method: 'pix', percentage: 50, installments: 1, label: 'Entrada na aprovação' },
    { id: 2, method: 'pix', percentage: 50, installments: 1, label: 'Na entrega final' }
  ],
  pixKey: '',
  pixKeyType: 'aleatoria', // 'cpf', 'cnpj', 'celular', 'email', 'aleatoria'
  pixReceiver: '',

  // Notes
  additionalNotes: 'Proposta válida pelo período informado. Alterações substanciais no escopo após o início do projeto poderão acarretar em ajuste de valores e prazo.',

  // Customization & PDF Style
  accentColor: '#10b981',
  pdfTheme: 'modern', // 'modern', 'classic', 'compact'
  itemsPerPage: 'auto', // 'auto', '4', '6', '8'
  showLogo: true,
  showValidity: true,
  showDeliveryDate: true,
  showPaymentConditions: true,
  showPixBox: true,
  showNotes: true,
  showAuthBadge: true,

  // Fixed values library
  fixedValues: [
    { id: 1, name: 'Logomarca', price: 150 },
    { id: 2, name: 'Cartão de Visita (100un)', price: 90 },
    { id: 3, name: 'Papel Timbrado A4', price: 80 },
    { id: 4, name: 'Manual de Identidade', price: 450 },
    { id: 5, name: 'Pack Posts Redes Sociais (6 artes)', price: 300 }
  ],

  // Company info
  companyName: '',
  companyEmail: '',
  companyPhone: '',
  companyWebsite: '',
  companyAddress: '',
  logo: null
};

const formatCurrency = (value) => {
  const num = typeof value === 'number' ? value : parseFloat(value) || 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  // Avoid timezone offset bugs when parsing YYYY-MM-DD
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

/**
 * Intelligent Multi-page Pagination Engine
 * Partitions items into clean standard A4 pages without line breaking
 */
function paginateBudget(budgetData, itemsPerPageSetting = 'auto') {
  const items = budgetData.items || [];
  
  if (items.length === 0) {
    return [{
      pageNumber: 1,
      totalPages: 1,
      items: [],
      isFirstPage: true,
      isLastPage: true
    }];
  }

  // If user forced an explicit items per page limit
  if (itemsPerPageSetting !== 'auto') {
    const limit = parseInt(itemsPerPageSetting, 10);
    if (!isNaN(limit) && limit > 0) {
      const chunks = [];
      for (let i = 0; i < items.length; i += limit) {
        chunks.push(items.slice(i, i + limit));
      }
      const total = chunks.length;
      return chunks.map((chunk, idx) => ({
        pageNumber: idx + 1,
        totalPages: total,
        items: chunk,
        isFirstPage: idx === 0,
        isLastPage: idx === total - 1
      }));
    }
  }

  // Dynamic automatic calculation:
  // Estimate visual weight of each item (longer descriptions take more height)
  const getItemWeight = (item) => {
    if (!item.description || item.description.trim().length === 0) return 1.0;
    if (item.description.length <= 40) return 1.2;
    if (item.description.length <= 90) return 1.5;
    return 2.0;
  };

  const totalWeight = items.reduce((acc, it) => acc + getItemWeight(it), 0);
  const hasExtraNotes = Boolean(budgetData.additionalNotes && budgetData.additionalNotes.trim());
  const hasPix = Boolean(budgetData.showPixBox && budgetData.pixKey && budgetData.pixKey.trim());
  
  // On a single page, header + client + table + totals + payments + notes + footer all must fit.
  // Capacity is approx 5.0 weight units (e.g. 4-5 regular items).
  const singlePageCapacity = hasExtraNotes && hasPix ? 4.2 : 5.2;

  if (totalWeight <= singlePageCapacity) {
    return [{
      pageNumber: 1,
      totalPages: 1,
      items: items,
      isFirstPage: true,
      isLastPage: true
    }];
  }

  // Multi-page distribution:
  // Page 1: Has full header + client card + table (capacity ~ 6.0 units)
  // Intermediate pages: Compact continuation header + table (capacity ~ 9.0 units)
  // Final page: Continuation table + Totals + Payments + Notes + Footer (capacity ~ 3.8 units)
  const pages = [];
  const itemsPool = [...items];

  // Helper to slice items up to weight capacity
  const takeChunk = (maxCapacity) => {
    const chunk = [];
    let currentWeight = 0;
    while (itemsPool.length > 0) {
      const nextItem = itemsPool[0];
      const nextWeight = getItemWeight(nextItem);
      if (chunk.length > 0 && (currentWeight + nextWeight > maxCapacity)) {
        break;
      }
      chunk.push(itemsPool.shift());
      currentWeight += nextWeight;
    }
    return chunk;
  };

  // Build Page 1
  const page1Items = takeChunk(5.5);
  pages.push({
    isFirstPage: true,
    isLastPage: false,
    items: page1Items
  });

  // Build remaining pages
  while (itemsPool.length > 0) {
    const remainingWeight = itemsPool.reduce((acc, it) => acc + getItemWeight(it), 0);
    const finalPageCapacity = hasExtraNotes && hasPix ? 3.5 : 4.5;

    // If remaining items fit comfortably on the final page along with summary & payments
    if (remainingWeight <= finalPageCapacity) {
      pages.push({
        isFirstPage: false,
        isLastPage: true,
        items: [...itemsPool]
      });
      itemsPool.length = 0;
      break;
    }

    // Otherwise, create an intermediate continuation page
    const interChunk = takeChunk(8.5);
    pages.push({
      isFirstPage: false,
      isLastPage: itemsPool.length === 0,
      items: interChunk
    });
  }

  const totalPages = pages.length;
  return pages.map((page, index) => ({
    ...page,
    pageNumber: index + 1,
    totalPages: totalPages
  }));
}

export default function BudgetEditor({ brandData, companyData, initialData, onBack, onSave }) {
  // Main Budget State
  const [budgetData, setBudgetData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_BUDGET_DATA, ...parsed };
      } catch (e) {
        console.error('Failed to load budget data from storage:', e);
      }
    }
    return INITIAL_BUDGET_DATA;
  });

  // UI state
  const [activeTab, setActiveTab] = useState('items'); // 'client' | 'items' | 'calc' | 'payment' | 'style' | 'company'
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewZoom, setPreviewZoom] = useState('fit'); // 'fit' | 0.75 | 1
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [notification, setNotification] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showFixedDrawer, setShowFixedDrawer] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const activeScale = useMemo(() => {
    if (previewZoom === 1) return 1;
    if (previewZoom === 0.75) return 0.75;
    const available = Math.min(windowWidth - 32, 794);
    return Math.min(1, Math.max(0.35, available / 794));
  }, [previewZoom, windowWidth]);

  // Cost Calculator State
  const [calcState, setCalcState] = useState({
    itemName: 'Material / Peça Confeccionada',
    materials: [
      { id: 1, name: 'Matéria-Prima Principal', quantity: 1, unit: 'un', unitCost: 45.0 }
    ],
    laborHours: 3,
    laborMinutes: 0,
    hourlyRate: 50.0,
    extraCosts: 15.0, // frete, embalagem, luz
    extraCostsLabel: 'Embalagem e Insumos',
    profitMargin: 40, // %
    marginType: 'margin' // 'margin' (sobre venda) | 'markup' (sobre custo)
  });

  // Sync initialData if provided (e.g. from gallery/history)
  useEffect(() => {
    if (initialData) {
      setBudgetData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // Persist budget data
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(budgetData));
    } catch (e) {
      console.warn('LocalStorage limit reached or error saving:', e);
    }
  }, [budgetData]);

  // Sync brand and company info
  useEffect(() => {
    if (companyData && (companyData.companyName || companyData.logo || companyData.companyEmail || companyData.companyPhone)) {
      setBudgetData(prev => ({
        ...prev,
        companyName: companyData.companyName || prev.companyName,
        companyEmail: companyData.companyEmail || prev.companyEmail,
        companyPhone: companyData.companyPhone || prev.companyPhone,
        companyWebsite: companyData.companyWebsite || prev.companyWebsite,
        companyAddress: companyData.companyAddress || prev.companyAddress,
        logo: companyData.logo || prev.logo
      }));
    } else if (brandData && (brandData.brandName || brandData.logo)) {
      setBudgetData(prev => ({
        ...prev,
        companyName: brandData.brandName || prev.companyName,
        logo: brandData.logo || prev.logo
      }));
    }
  }, [companyData, brandData]);

  const notify = (message, type = 'info') => {
    setNotification({ id: Date.now(), message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleChange = (field, value) => {
    setBudgetData(prev => ({ ...prev, [field]: value }));
  };

  // Financial Calculations
  const calculateSubtotal = () => {
    return budgetData.items.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1)), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    const discountVal = parseFloat(budgetData.globalDiscount) || 0;
    if (budgetData.globalDiscountType === 'percent') {
      return (subtotal * discountVal) / 100;
    }
    return Math.min(discountVal, subtotal);
  };

  const calculateTotal = () => {
    return Math.max(0, calculateSubtotal() - calculateDiscount());
  };

  // Delivery string computation
  const getDeliveryDisplay = () => {
    if (!budgetData.showDeliveryDate) return null;
    if (budgetData.deliveryType === 'combinar') {
      return 'A combinar com o cliente';
    }
    if (budgetData.deliveryType === 'data') {
      return budgetData.deliveryDate ? formatDate(budgetData.deliveryDate) : 'A definir';
    }
    // Default prazo
    const days = parseInt(budgetData.deliveryDays, 10) || 7;
    return `${days} ${days === 1 ? 'dia útil' : 'dias úteis'}`;
  };

  // Item Management
  const addItem = () => {
    const newId = Date.now();
    const newItem = {
      id: newId,
      name: '',
      description: '',
      price: 0,
      quantity: 1
    };
    setBudgetData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    setEditingItem(newId);
  };

  const updateItem = (id, field, value) => {
    setBudgetData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const removeItem = (id) => {
    setBudgetData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
    if (editingItem === id) setEditingItem(null);
  };

  const duplicateItem = (id) => {
    const item = budgetData.items.find(i => i.id === id);
    if (!item) return;
    const cloned = { ...item, id: Date.now(), name: item.name ? `${item.name} (Cópia)` : 'Item (Cópia)' };
    const idx = budgetData.items.findIndex(i => i.id === id);
    const newItems = [...budgetData.items];
    newItems.splice(idx + 1, 0, cloned);
    setBudgetData(prev => ({ ...prev, items: newItems }));
    notify('Item duplicado com sucesso!', 'success');
  };

  const moveItem = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= budgetData.items.length) return;
    const newItems = [...budgetData.items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIdx, 0, moved);
    setBudgetData(prev => ({ ...prev, items: newItems }));
  };

  // Fixed Services Library
  const addFixedValue = () => {
    const newFixed = { id: Date.now(), name: '', price: 0 };
    setBudgetData(prev => ({ ...prev, fixedValues: [...prev.fixedValues, newFixed] }));
  };

  const updateFixedValue = (id, field, value) => {
    setBudgetData(prev => ({
      ...prev,
      fixedValues: prev.fixedValues.map(f => f.id === id ? { ...f, [field]: value } : f)
    }));
  };

  const removeFixedValue = (id) => {
    setBudgetData(prev => ({ ...prev, fixedValues: prev.fixedValues.filter(f => f.id !== id) }));
  };

  const addFixedToItems = (fixed) => {
    const newItem = {
      id: Date.now(),
      name: fixed.name,
      description: '',
      price: fixed.price,
      quantity: 1
    };
    setBudgetData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    notify(`"${fixed.name}" adicionado aos itens!`, 'success');
  };

  // Payment Portions
  const addPortion = () => {
    const newId = Date.now();
    setBudgetData(prev => ({
      ...prev,
      paymentPortions: [
        ...prev.paymentPortions,
        { id: newId, method: 'pix', percentage: 50, installments: 1, label: 'Parcela adicional' }
      ]
    }));
  };

  const updatePortion = (id, field, value) => {
    setBudgetData(prev => ({
      ...prev,
      paymentPortions: prev.paymentPortions.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const removePortion = (id) => {
    setBudgetData(prev => ({
      ...prev,
      paymentPortions: prev.paymentPortions.filter(p => p.id !== id)
    }));
  };

  const getTotalPortionPercentage = () => {
    return budgetData.paymentPortions.reduce((sum, p) => sum + (parseInt(p.percentage, 10) || 0), 0);
  };

  // Image Upload
  const handleLogoUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange('logo', reader.result);
      notify('Logotipo atualizado!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Cost Calculator Calculations
  const calcTotalMaterials = useMemo(() => {
    return calcState.materials.reduce((sum, m) => {
      const q = parseFloat(m.quantity) || 0;
      const c = parseFloat(m.unitCost) || 0;
      return sum + (q * c);
    }, 0);
  }, [calcState.materials]);

  const calcTotalLabor = useMemo(() => {
    const hours = parseFloat(calcState.laborHours) || 0;
    const minutes = parseFloat(calcState.laborMinutes) || 0;
    const rate = parseFloat(calcState.hourlyRate) || 0;
    return (hours + (minutes / 60)) * rate;
  }, [calcState.laborHours, calcState.laborMinutes, calcState.hourlyRate]);

  const calcTotalBaseCost = useMemo(() => {
    const extras = parseFloat(calcState.extraCosts) || 0;
    return calcTotalMaterials + calcTotalLabor + extras;
  }, [calcTotalMaterials, calcTotalLabor, calcState.extraCosts]);

  const calcPriceResult = useMemo(() => {
    const cost = calcTotalBaseCost;
    const margin = parseFloat(calcState.profitMargin) || 0;

    let sellingPrice = 0;
    let profit = 0;

    if (calcState.marginType === 'markup') {
      // Mark-up sobre o custo: Preço = Custo * (1 + Margem%)
      profit = cost * (margin / 100);
      sellingPrice = cost + profit;
    } else {
      // Margem sobre a venda: Preço = Custo / (1 - Margem%)
      if (margin >= 100) {
        sellingPrice = cost * 2;
        profit = sellingPrice - cost;
      } else {
        sellingPrice = margin > 0 ? (cost / (1 - (margin / 100))) : cost;
        profit = sellingPrice - cost;
      }
    }

    return {
      sellingPrice: Math.round(sellingPrice * 100) / 100,
      profit: Math.round(profit * 100) / 100
    };
  }, [calcTotalBaseCost, calcState.profitMargin, calcState.marginType]);

  const applyCalcToBudget = () => {
    const hours = calcState.laborHours || 0;
    const mins = calcState.laborMinutes || 0;
    const timeStr = `${hours}h${mins > 0 ? `${mins}m` : ''}`;
    const matSummary = calcState.materials.filter(m => m.name).map(m => m.name).slice(0, 2).join(', ');
    
    const descParts = [];
    if (matSummary) descParts.push(`Materiais: ${matSummary}`);
    if (hours > 0 || mins > 0) descParts.push(`Tempo de produção: ${timeStr}`);

    const newItem = {
      id: Date.now(),
      name: calcState.itemName || 'Produto / Peça Confeccionada',
      description: descParts.join(' • '),
      price: calcPriceResult.sellingPrice,
      quantity: 1
    };

    setBudgetData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    setActiveTab('items');
    notify(`Item "${newItem.name}" adicionado com o valor de ${formatCurrency(newItem.price)}!`, 'success');
  };

  // Paginated Pages Memo
  const paginatedPages = useMemo(() => {
    return paginateBudget(budgetData, budgetData.itemsPerPage);
  }, [budgetData]);

  // Robust Multi-Page PDF Generation
  const generatePDF = async () => {
    if (budgetData.items.length === 0) {
      notify('Adicione pelo menos um item antes de exportar.', 'error');
      return;
    }

    // Ensure we are in preview mode to render all .budget-page sheets
    const wasPreview = showPreview;
    if (!wasPreview) {
      setShowPreview(true);
      await new Promise(r => setTimeout(r, 400));
    }

    setIsGenerating(true);

    try {
      if (document.fonts) await document.fonts.ready;
      await new Promise(r => setTimeout(r, 200));

      const pageElements = document.querySelectorAll('.budget-page');
      if (!pageElements || pageElements.length === 0) {
        throw new Error('Nenhuma página de orçamento encontrada para exportação.');
      }

      // Initialize standard portrait A4 PDF (210 x 297 mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];
        
        // High quality scale: 2 is sharp without memory crashing
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: pageEl.offsetWidth,
          height: pageEl.offsetHeight,
          windowWidth: pageEl.scrollWidth,
          windowHeight: pageEl.scrollHeight
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.96);

        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      const clientClean = (budgetData.clientName || budgetData.projectName || 'Proposta').replace(/[^a-zA-Z0-9_\-]/g, '_');
      const fileName = `Orcamento_${clientClean}.pdf`;
      pdf.save(fileName);

      // Save to gallery if callback available
      if (onSave) {
        onSave({
          id: Date.now(),
          type: 'budget',
          title: budgetData.projectName || budgetData.clientName || 'Orçamento Comercial',
          client: budgetData.clientName,
          project: budgetData.projectName,
          total: calculateTotal(),
          data: { ...budgetData },
          timestamp: new Date().toISOString()
        });
      }

      notify(`PDF gerado com sucesso! (${pageElements.length} ${pageElements.length === 1 ? 'folha' : 'folhas'})`, 'success');
    } catch (err) {
      console.error('Error generating multi-page PDF:', err);
      notify('Erro ao gerar PDF: ' + err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset budget confirmation
  const handleReset = () => {
    if (window.confirm('Deseja iniciar um novo orçamento? Os dados não salvos serão limpos.')) {
      setBudgetData(INITIAL_BUDGET_DATA);
      localStorage.removeItem(STORAGE_KEY);
      notify('Novo orçamento iniciado!', 'info');
    }
  };

  // RENDER: PDF Page Template Component
  const renderPDFPage = (pageData) => {
    const { pageNumber, totalPages, isFirstPage, isLastPage, items } = pageData;
    const accent = budgetData.accentColor || '#10b981';
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + (parseInt(budgetData.validity, 10) || 7));
    const deliveryDisplay = getDeliveryDisplay();

    return (
      <div 
        key={pageNumber}
        className="budget-page"
        id={`budget-page-${pageNumber}`}
        style={{
          fontFamily: "'Inter', sans-serif",
          color: '#0f172a'
        }}
      >
        {/* Top Decorative Brand Bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: `linear-gradient(90deg, ${accent}, #0f172a)`
        }} />

        {/* ── TOP SECTION: FULL HEADER (PAGE 1) OR COMPACT CONTINUATION (PAGE 2+) ── */}
        {isFirstPage ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
              <div>
                <div style={{ height: '52px', display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  {budgetData.showLogo && budgetData.logo ? (
                    <img src={budgetData.logo} alt="Logo" style={{ maxHeight: '100%', maxWidth: '140px', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ padding: '6px 14px', background: '#f8fafc', borderRadius: '8px', border: `1.5px dashed ${accent}40`, color: accent, fontSize: '0.8rem', fontWeight: 700 }}>
                      {budgetData.companyName || 'SUA EMPRESA'}
                    </div>
                  )}
                </div>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
                  {budgetData.companyName || 'Sua Empresa'}
                </h1>
                <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45 }}>
                  {budgetData.companyEmail && <div>{budgetData.companyEmail}</div>}
                  {budgetData.companyPhone && <div>{budgetData.companyPhone}</div>}
                  {budgetData.companyWebsite && <div>{budgetData.companyWebsite}</div>}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: accent, letterSpacing: '-0.04em', lineHeight: 0.9 }}>
                  PROPOSTA
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.25em', marginTop: '4px', textTransform: 'uppercase' }}>
                  COMERCIAL
                </div>

                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', gap: '6px', fontSize: '0.75rem' }}>
                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>Emissão:</span>
                    <strong style={{ color: '#1e293b' }}>{formatDate(budgetData.emissionDate)}</strong>
                  </div>

                  {budgetData.showValidity && (
                    <div style={{ display: 'flex', gap: '6px', fontSize: '0.75rem' }}>
                      <span style={{ color: '#94a3b8', fontWeight: 600 }}>Validade:</span>
                      <strong style={{ color: accent }}>{formatDate(validUntilDate)} ({budgetData.validity}d)</strong>
                    </div>
                  )}

                  {budgetData.showDeliveryDate && deliveryDisplay && (
                    <div style={{ 
                      marginTop: '4px', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '5px', 
                      padding: '3px 8px', 
                      background: `${accent}15`, 
                      border: `1px solid ${accent}40`, 
                      borderRadius: '6px', 
                      fontSize: '0.72rem', 
                      color: accent, 
                      fontWeight: 700 
                    }}>
                      <span>Prazo:</span>
                      <span>{deliveryDisplay}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Client & Project Box */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr',
              gap: '16px',
              marginBottom: '20px',
              padding: '14px 18px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #f1f5f9'
            }}>
              <div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.06em', marginBottom: '4px' }}>
                  Destinatário / Cliente
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  {budgetData.clientName || 'Cliente não informado'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.4 }}>
                  {budgetData.clientEmail && <div>{budgetData.clientEmail}</div>}
                  {budgetData.clientPhone && <div>{budgetData.clientPhone}</div>}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.06em', marginBottom: '4px' }}>
                  Projeto
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                  {budgetData.projectName || 'Serviços Especializados'}
                </div>
                {budgetData.projectDescription && (
                  <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0, lineHeight: 1.4, maxHeight: '36px', overflow: 'hidden' }}>
                    {budgetData.projectDescription}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Compact Continuation Header for Page 2+ */
          <div style={{ marginBottom: '18px', borderBottom: `2px solid ${accent}30`, paddingBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  {budgetData.companyName || 'Sua Empresa'}
                </span>
                <span style={{ color: '#cbd5e1' }}>•</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: accent }}>
                  PROPOSTA COMERCIAL (Continuação)
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                {budgetData.clientName && <span>Cliente: {budgetData.clientName} • </span>}
                Folha {pageNumber} de {totalPages}
              </div>
            </div>
          </div>
        )}

        {/* ── TABLE OF ITEMS (FOR THIS SPECIFIC PAGE) ── */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderRadius: '8px' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', borderRadius: '6px 0 0 6px' }}>Item / Serviço</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', width: '50px' }}>Qtd</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', width: '100px' }}>Unitário</th>
                <th style={{ padding: '8px 12px', textAlign: 'right', fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', width: '110px', borderRadius: '0 6px 6px 0' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id || idx} style={{ background: '#ffffff' }}>
                  <td style={{ padding: '10px 12px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', borderLeft: '1px solid #f1f5f9', borderRadius: '8px 0 0 8px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.88rem' }}>{item.name || 'Serviço'}</div>
                    {item.description && (
                      <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', lineHeight: 1.35 }}>
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px 10px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', textAlign: 'center', color: '#334155', fontWeight: 600 }}>
                    {item.quantity || 1}
                  </td>
                  <td style={{ padding: '10px 12px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', textAlign: 'right', color: '#334155', fontWeight: 500 }}>
                    {formatCurrency(item.price || 0)}
                  </td>
                  <td style={{ padding: '10px 12px', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9', borderRadius: '0 8px 8px 0', textAlign: 'right', fontWeight: 800, color: accent, fontSize: '0.92rem' }}>
                    {formatCurrency((parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Continuation notice if there are more pages */}
          {!isLastPage && (
            <div style={{ 
              marginTop: '16px', 
              padding: '10px 14px', 
              background: '#f8fafc', 
              borderRadius: '8px', 
              border: '1px dashed #cbd5e1', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#64748b'
            }}>
              <span>Itens continuam na próxima página...</span>
              <strong style={{ color: accent }}>Página {pageNumber} de {totalPages} →</strong>
            </div>
          )}
        </div>

        {/* ── BOTTOM SUMMARY, PAYMENTS & NOTES (RENDERED ONLY ON FINAL PAGE) ── */}
        {isLastPage ? (
          <div>
            {/* Totals Box and Payment Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginTop: '12px', marginBottom: '14px' }}>
              {/* Payment Conditions & Pix */}
              <div>
                {budgetData.showPaymentConditions && budgetData.paymentPortions?.length > 0 && (
                  <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.06em', marginBottom: '6px' }}>
                      Condições de Pagamento
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {budgetData.paymentPortions.map((p, idx) => {
                        const mInfo = PAYMENT_METHODS.find(m => m.id === p.method);
                        const portionVal = (calculateTotal() * (p.percentage || 0)) / 100;
                        return (
                          <div key={idx} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '6px 10px', 
                            background: '#f8fafc', 
                            borderRadius: '6px', 
                            fontSize: '0.72rem',
                            border: '1px solid #f1f5f9'
                          }}>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>
                              {mInfo?.icon} {mInfo?.label || p.method} {p.installments > 1 ? `(${p.installments}x)` : ''}
                              {p.label ? ` • ${p.label}` : ''}
                            </span>
                            <strong style={{ color: '#0f172a' }}>{formatCurrency(portionVal)} ({p.percentage}%)</strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* PIX Key Box */}
                {budgetData.showPixBox && budgetData.pixKey && (
                  <div style={{ 
                    padding: '8px 12px', 
                    background: '#f0fdf4', 
                    border: '1px solid #86efac', 
                    borderRadius: '8px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px' 
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>⚡</span>
                    <div style={{ fontSize: '0.72rem' }}>
                      <span style={{ color: '#15803d', fontWeight: 700 }}>Chave PIX: </span>
                      <code style={{ background: '#dcfce7', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, color: '#166534' }}>
                        {budgetData.pixKey}
                      </code>
                      {budgetData.pixReceiver && <span style={{ color: '#166534', marginLeft: '6px' }}>({budgetData.pixReceiver})</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Total Financial Card */}
              <div style={{ 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                color: '#ffffff', 
                borderRadius: '16px', 
                padding: '14px 18px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', color: '#94a3b8' }}>
                    <span>Subtotal</span>
                    <span style={{ color: '#ffffff', fontWeight: 600 }}>{formatCurrency(calculateSubtotal())}</span>
                  </div>

                  {calculateDiscount() > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '8px', color: '#94a3b8' }}>
                      <span>Desconto</span>
                      <span style={{ color: '#f87171', fontWeight: 700 }}>- {formatCurrency(calculateDiscount())}</span>
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: accent, lineHeight: 1 }}>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            {budgetData.showNotes && budgetData.additionalNotes && (
              <div style={{ marginBottom: '10px', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.7rem', color: '#64748b', lineHeight: 1.4 }}>
                <strong style={{ color: '#334155', display: 'block', marginBottom: '2px' }}>Observações e Prazos:</strong>
                {budgetData.additionalNotes}
                {budgetData.deliveryNotes && <span> • {budgetData.deliveryNotes}</span>}
              </div>
            )}
          </div>
        ) : null}

        {/* ── BOTTOM FOOTER (ON EVERY PAGE) ── */}
        <div style={{ 
          borderTop: '1px solid #f1f5f9', 
          paddingTop: '10px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontSize: '0.68rem',
          color: '#94a3b8'
        }}>
          <div>
            Proposta gerada para {budgetData.clientName || 'Cliente'} • {budgetData.validity} dias de validade
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {budgetData.showAuthBadge && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: accent, fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                <ShieldCheck size={14} /> Documento Oficial
              </div>
            )}
            <div style={{ fontWeight: 700, color: '#475569' }}>
              Página {pageNumber} de {totalPages}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="budget-app-root">
      
      {/* ── TOP HEADER (MOBILE & DESKTOP ENHANCED) ── */}
      <header className="budget-top-nav">
        <div className="budget-top-left">
          <button 
            onClick={onBack} 
            className="budget-nav-back-btn" 
            title="Voltar ao Hub de Serviços"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="budget-brand-badge">
            <h1 className="budget-brand-title">
              {budgetData.projectName || 'Orçamento Profissional'}
            </h1>
            <p className="budget-brand-subtitle">
              <span>{budgetData.clientName || 'Novo Cliente'}</span>
              <span>•</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>{formatCurrency(calculateTotal())}</span>
            </p>
          </div>
        </div>

        {/* Center: Quick Switch between Edit and Preview */}
        <div className="budget-top-center">
          <button 
            className={`budget-view-pill ${!showPreview ? 'active' : ''}`}
            onClick={() => setShowPreview(false)}
          >
            <Edit3 size={15} />
            <span>Editar</span>
          </button>
          <button 
            className={`budget-view-pill ${showPreview ? 'active' : ''}`}
            onClick={() => setShowPreview(true)}
          >
            <Eye size={15} />
            <span>Ver PDF ({paginatedPages.length} {paginatedPages.length === 1 ? 'pág' : 'págs'})</span>
          </button>
        </div>

        <div className="budget-top-right">
          <button 
            onClick={handleReset} 
            className="budget-btn-reset"
            title="Começar Novo Orçamento em Branco"
          >
            <RotateCcw size={14} />
            <span>Novo</span>
          </button>
        </div>
      </header>

      {/* ── SUB-HEADER TABS (HORIZONTAL SCROLL ON MOBILE) ── */}
      {!showPreview && (
        <nav className="budget-tabs-wrapper">
          {[
            { id: 'client', label: 'Dados & Entrega', icon: FileText },
            { id: 'items', label: 'Itens', icon: Layers, badge: budgetData.items.length },
            { id: 'calc', label: 'Calculadora de Custo', icon: Calculator, isNew: true },
            { id: 'payment', label: 'Pagamento & PIX', icon: DollarSign },
            { id: 'style', label: 'Personalizar PDF', icon: Palette },
            { id: 'company', label: 'Minha Empresa', icon: ImageIcon }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`budget-tab-pill ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="budget-tab-badge">{tab.badge}</span>
                )}
                {tab.isNew && (
                  <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: '4px', background: '#dbeafe', color: '#1e40af', fontWeight: 800 }}>NOVO</span>
                )}
              </button>
            );
          })}
        </nav>
      )}

      {/* ── MAIN CONTENT VIEW ── */}
      {showPreview ? (
        /* MULTI-PAGE PREVIEW AREA */
        <div className="budget-preview-screen">
          {/* Preview Toolbar */}
          <div className="budget-preview-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                Visualização do Documento ({paginatedPages.length} {paginatedPages.length === 1 ? 'página' : 'páginas'})
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', background: '#334155', borderRadius: '8px', padding: '2px' }}>
                <button
                  onClick={() => setPreviewZoom('fit')}
                  style={{
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: previewZoom === 'fit' ? '#059669' : 'transparent',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  title="Ajustar à largura da tela"
                >
                  Ajustar
                </button>
                <button
                  onClick={() => setPreviewZoom(0.75)}
                  style={{
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: previewZoom === 0.75 ? '#059669' : 'transparent',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  75%
                </button>
                <button
                  onClick={() => setPreviewZoom(1)}
                  style={{
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: previewZoom === 1 ? '#059669' : 'transparent',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  100%
                </button>
              </div>

              <button 
                onClick={() => setShowPreview(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #475569',
                  background: 'transparent',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Edit3 size={14} /> Voltar a Editar
              </button>
            </div>
          </div>

          {/* Scrollable Stack of A4 Sheets */}
          <div className="budget-preview-scroll-area" id="budget-preview-container">
            {paginatedPages.map(pageData => {
              const pageWidth = 794;
              const pageHeight = 1123;
              return (
                <div 
                  key={pageData.pageNumber} 
                  style={{ 
                    position: 'relative',
                    width: `${pageWidth * activeScale}px`,
                    height: `${pageHeight * activeScale}px`,
                    marginBottom: '24px',
                    flexShrink: 0
                  }}
                >
                  <div className="budget-page-badge" style={{ top: '-22px', left: 0 }}>
                    Folha {pageData.pageNumber} de {pageData.totalPages}
                  </div>
                  
                  <div style={{
                    width: `${pageWidth}px`,
                    height: `${pageHeight}px`,
                    transform: `scale(${activeScale})`,
                    transformOrigin: 'top left',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.35)'
                  }}>
                    {renderPDFPage(pageData)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* EDITING MODE FORM TABS */
        <main className="budget-main-content">
          
          {/* TAB 1: CLIENTE, PROJETO E PRAZO DE ENTREGA */}
          {activeTab === 'client' && (
            <div className="animate-fade-in">
              <div className="budget-card-section">
                <h3 className="budget-card-section-title">
                  <span>Informações do Cliente</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Destinatário da proposta</span>
                </h3>

                <div className="form-group">
                  <label className="form-label">Nome do Cliente ou Empresa</label>
                  <input
                    type="text"
                    className="form-input"
                    value={budgetData.clientName}
                    onChange={(e) => handleChange('clientName', e.target.value)}
                    placeholder="Ex: João da Silva / Padaria Central"
                  />
                </div>

                <div className="budget-grid-2">
                  <div className="form-group">
                    <label className="form-label">E-mail do Cliente</label>
                    <input
                      type="email"
                      className="form-input"
                      value={budgetData.clientEmail}
                      onChange={(e) => handleChange('clientEmail', e.target.value)}
                      placeholder="cliente@exemplo.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">WhatsApp / Telefone</label>
                    <input
                      type="text"
                      className="form-input"
                      value={budgetData.clientPhone}
                      onChange={(e) => handleChange('clientPhone', e.target.value)}
                      placeholder="(11) 98765-4321"
                    />
                  </div>
                </div>
              </div>

              <div className="budget-card-section">
                <h3 className="budget-card-section-title">
                  <span>Dados do Projeto</span>
                </h3>

                <div className="form-group">
                  <label className="form-label">Título do Projeto</label>
                  <input
                    type="text"
                    className="form-input"
                    value={budgetData.projectName}
                    onChange={(e) => handleChange('projectName', e.target.value)}
                    placeholder="Ex: Reformulação de Identidade Visual 2026"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Descrição Resumida do Escopo</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={budgetData.projectDescription}
                    onChange={(e) => handleChange('projectDescription', e.target.value)}
                    placeholder="Breve resumo dos objetivos e entregáveis..."
                  />
                </div>
              </div>

              {/* SECTION: DATA E PRAZO DE ENTREGA (NOVO & EXCLUSIVO) */}
              <div className="budget-card-section" style={{ borderLeft: '4px solid #10b981' }}>
                <h3 className="budget-card-section-title">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} color="#10b981" />
                    Prazo e Data de Entrega
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                    Aparece no PDF
                  </span>
                </h3>

                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '10px' }}>
                  Defina o prazo de entrega prometido para o cliente. Você pode escolher dias úteis, uma data fixa no calendário ou a combinar.
                </p>

                {/* Delivery Type Selector */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                  {[
                    { id: 'prazo', label: '⏱️ Prazo em Dias Úteis' },
                    { id: 'data', label: '📅 Data Específica' },
                    { id: 'combinar', label: '🤝 A Combinar' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleChange('deliveryType', t.id)}
                      className={`budget-chip-btn ${budgetData.deliveryType === t.id ? 'active' : ''}`}
                      style={{ flex: 1, textAlign: 'center', padding: '8px 4px' }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {budgetData.deliveryType === 'prazo' && (
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Selecione o prazo de entrega:</label>
                    <div className="budget-chips-group">
                      {[3, 5, 7, 10, 15, 20, 30].map(days => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => handleChange('deliveryDays', days)}
                          className={`budget-chip-btn ${parseInt(budgetData.deliveryDays, 10) === days ? 'active' : ''}`}
                        >
                          {days} dias úteis
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Ou digite outro prazo:</span>
                      <input
                        type="number"
                        min="1"
                        className="form-input"
                        style={{ width: '90px', padding: '6px 10px' }}
                        value={budgetData.deliveryDays}
                        onChange={(e) => handleChange('deliveryDays', parseInt(e.target.value, 10) || 1)}
                      />
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>dias úteis</span>
                    </div>
                  </div>
                )}

                {budgetData.deliveryType === 'data' && (
                  <div className="form-group" style={{ marginBottom: '10px' }}>
                    <label className="form-label">Data de Entrega Prevista</label>
                    <input
                      type="date"
                      className="form-input"
                      value={budgetData.deliveryDate}
                      onChange={(e) => handleChange('deliveryDate', e.target.value)}
                    />
                  </div>
                )}

                <div className="form-group" style={{ marginTop: '10px', marginBottom: 0 }}>
                  <label className="form-label">Observação sobre o Prazo (opcional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={budgetData.deliveryNotes}
                    onChange={(e) => handleChange('deliveryNotes', e.target.value)}
                    placeholder="Ex: Contados a partir da aprovação da arte final e envio do briefing"
                  />
                </div>
              </div>

              {/* Validity & General Notes */}
              <div className="budget-card-section">
                <h3 className="budget-card-section-title">
                  <span>Validade da Proposta & Observações</span>
                </h3>

                <div className="form-group">
                  <label className="form-label">Validade desta proposta (em dias)</label>
                  <div className="budget-chips-group">
                    {[3, 5, 7, 15, 30].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleChange('validity', d)}
                        className={`budget-chip-btn ${parseInt(budgetData.validity, 10) === d ? 'active' : ''}`}
                      >
                        {d} dias
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Termos Gerais e Observações</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={budgetData.additionalNotes}
                    onChange={(e) => handleChange('additionalNotes', e.target.value)}
                    placeholder="Informações adicionais, políticas de alteração, termos de aceite..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ITENS DO ORÇAMENTO */}
          {activeTab === 'items' && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Itens e Serviços ({budgetData.items.length})
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Adicione serviços individuais ou use a calculadora de custo
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setActiveTab('calc')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', borderColor: '#a7f3d0', color: '#059669' }}
                  >
                    <Calculator size={15} /> Calcular Preço
                  </button>
                  <button
                    onClick={addItem}
                    className="btn btn-primary"
                    style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', background: '#10b981' }}
                  >
                    <Plus size={16} /> Novo Item
                  </button>
                </div>
              </div>

              {/* Quick Fixed Services Bar */}
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                    ⚡ Adicionar Serviço Rápido:
                  </span>
                  <button
                    onClick={() => setShowFixedDrawer(!showFixedDrawer)}
                    style={{ background: 'none', border: 'none', color: '#059669', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {showFixedDrawer ? 'Fechar Gerenciador' : 'Gerenciar Fixos'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {budgetData.fixedValues.map(fixed => (
                    <button
                      key={fixed.id}
                      type="button"
                      onClick={() => addFixedToItems(fixed)}
                      className="budget-chip-btn"
                      style={{ background: '#ffffff', borderColor: '#cbd5e1' }}
                      title={`Clique para adicionar ${fixed.name} (${formatCurrency(fixed.price)})`}
                    >
                      + {fixed.name} <strong style={{ color: '#059669', marginLeft: '4px' }}>{formatCurrency(fixed.price)}</strong>
                    </button>
                  ))}
                </div>

                {showFixedDrawer && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>Serviços Salvos na Biblioteca:</span>
                      <button onClick={addFixedValue} className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>
                        <Plus size={12} /> Novo Fixo
                      </button>
                    </div>
                    {budgetData.fixedValues.map(fixed => (
                      <div key={fixed.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 32px', gap: '6px', marginBottom: '6px' }}>
                        <input
                          type="text"
                          placeholder="Nome do serviço"
                          className="form-input"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          value={fixed.name}
                          onChange={(e) => updateFixedValue(fixed.id, 'name', e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder="R$ 0,00"
                          className="form-input"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          value={fixed.price}
                          onChange={(e) => updateFixedValue(fixed.id, 'price', parseFloat(e.target.value) || 0)}
                        />
                        <button
                          onClick={() => removeFixedValue(fixed.id)}
                          style={{ background: '#fee2e2', border: 'none', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Items List */}
              {budgetData.items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#ffffff', borderRadius: '16px', border: '2px dashed #cbd5e1' }}>
                  <Layers size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                  <h4 style={{ margin: '0 0 6px', color: '#334155' }}>Nenhum item adicionado</h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '14px' }}>
                    Clique no botão abaixo para adicionar o primeiro item do orçamento.
                  </p>
                  <button onClick={addItem} className="btn btn-primary" style={{ background: '#10b981' }}>
                    <Plus size={16} /> Adicionar Item
                  </button>
                </div>
              ) : (
                <div>
                  {budgetData.items.map((item, index) => {
                    const isEditing = editingItem === item.id;
                    const itemTotal = (parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1);

                    return (
                      <div 
                        key={item.id} 
                        className={`budget-item-card ${isEditing ? 'is-editing' : ''}`}
                      >
                        {/* Item Card Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isEditing ? '12px' : '0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                            <div style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: isEditing ? '#10b981' : '#f1f5f9',
                              color: isEditing ? '#ffffff' : '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              flexShrink: 0
                            }}>
                              {index + 1}
                            </div>

                            {!isEditing ? (
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {item.name || 'Item sem nome'}
                                </div>
                                {item.description && (
                                  <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.description}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669' }}>
                                Editando Item #{index + 1}
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            {!isEditing && (
                              <div style={{ textAlign: 'right', marginRight: '6px' }}>
                                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#059669' }}>
                                  {formatCurrency(itemTotal)}
                                </div>
                                {item.quantity > 1 && (
                                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                                    {item.quantity}un x {formatCurrency(item.price)}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Reorder Buttons */}
                            <button
                              onClick={() => moveItem(index, -1)}
                              disabled={index === 0}
                              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '5px', cursor: index === 0 ? 'not-allowed' : 'pointer', color: index === 0 ? '#cbd5e1' : '#64748b' }}
                              title="Mover para cima"
                            >
                              <MoveUp size={13} />
                            </button>
                            <button
                              onClick={() => moveItem(index, 1)}
                              disabled={index === budgetData.items.length - 1}
                              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '5px', cursor: index === budgetData.items.length - 1 ? 'not-allowed' : 'pointer', color: index === budgetData.items.length - 1 ? '#cbd5e1' : '#64748b' }}
                              title="Mover para baixo"
                            >
                              <MoveDown size={13} />
                            </button>

                            <button
                              onClick={() => setEditingItem(isEditing ? null : item.id)}
                              style={{ 
                                background: isEditing ? '#ecfdf5' : '#f8fafc', 
                                border: '1px solid #e2e8f0', 
                                borderRadius: '6px', 
                                padding: '5px 8px', 
                                cursor: 'pointer',
                                color: isEditing ? '#059669' : '#334155',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600
                              }}
                            >
                              {isEditing ? <Check size={14} /> : <Edit3 size={14} />}
                              <span>{isEditing ? 'Concluir' : 'Editar'}</span>
                            </button>

                            <button
                              onClick={() => duplicateItem(item.id)}
                              style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#64748b' }}
                              title="Duplicar"
                            >
                              <Copy size={13} />
                            </button>

                            <button
                              onClick={() => removeItem(item.id)}
                              style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#ef4444' }}
                              title="Excluir"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Inline Edit Form */}
                        {isEditing && (
                          <div style={{ paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                            <div className="form-group">
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Nome do Serviço ou Produto</label>
                              <input
                                type="text"
                                className="form-input"
                                value={item.name}
                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                placeholder="Ex: Criação de Logomarca"
                                autoFocus
                              />
                            </div>

                            <div className="form-group">
                              <label className="form-label" style={{ fontSize: '0.75rem' }}>Descrição Detalhada</label>
                              <textarea
                                className="form-textarea"
                                rows={2}
                                value={item.description}
                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                placeholder="Detalhes do que está incluso neste serviço..."
                              />
                            </div>

                            <div className="budget-grid-2">
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ fontSize: '0.75rem' }}>Valor Unitário (R$)</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  className="form-input"
                                  value={item.price}
                                  onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                />
                              </div>

                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ fontSize: '0.75rem' }}>Quantidade</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <button
                                    type="button"
                                    onClick={() => updateItem(item.id, 'quantity', Math.max(1, (parseInt(item.quantity, 10) || 1) - 1))}
                                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 800, cursor: 'pointer' }}
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="1"
                                    className="form-input"
                                    style={{ textAlign: 'center' }}
                                    value={item.quantity}
                                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value, 10) || 1)}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateItem(item.id, 'quantity', (parseInt(item.quantity, 10) || 1) + 1)}
                                    style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 800, cursor: 'pointer' }}
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Global Discount Card */}
              {budgetData.items.length > 0 && (
                <div className="budget-card-section" style={{ marginTop: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                    Desconto Global da Proposta
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '10px' }}>
                    <select
                      className="form-input"
                      value={budgetData.globalDiscountType}
                      onChange={(e) => handleChange('globalDiscountType', e.target.value)}
                    >
                      <option value="fixed">Valor Fixo (R$)</option>
                      <option value="percent">Porcentagem (%)</option>
                    </select>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="form-input"
                      value={budgetData.globalDiscount}
                      onChange={(e) => handleChange('globalDiscount', parseFloat(e.target.value) || 0)}
                      placeholder="0,00"
                    />
                  </div>

                  <div className="budget-chips-group">
                    {[5, 10, 15, 20].map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => {
                          handleChange('globalDiscountType', 'percent');
                          handleChange('globalDiscount', pct);
                        }}
                        className="budget-chip-btn"
                      >
                        {pct}% de Desconto
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleChange('globalDiscount', 0)}
                      className="budget-chip-btn"
                      style={{ color: '#ef4444' }}
                    >
                      Remover Desconto
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CALCULADORA DE CUSTO (MATERIAL GASTO + TEMPO DE CONFECÇÃO - NOVO) */}
          {activeTab === 'calc' && (
            <div className="animate-fade-in">
              <div style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)', border: '1px solid #a7f3d0', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calculator size={18} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#065f46' }}>
                      Calculadora de Precificação Inteligente
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#047857' }}>
                      Calcule o valor ideal com base nos materiais gastos e no tempo de confecção / mão de obra.
                    </p>
                  </div>
                </div>
              </div>

              {/* Item Name */}
              <div className="budget-card-section">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nome do Produto ou Serviço a Precificar</label>
                  <input
                    type="text"
                    className="form-input"
                    value={calcState.itemName}
                    onChange={(e) => setCalcState(prev => ({ ...prev, itemName: e.target.value }))}
                    placeholder="Ex: Cartão de Visita Especial, Peça em Madeira, Banner Impresso..."
                  />
                </div>
              </div>

              {/* Section 1: Materiais Gastos */}
              <div className="budget-card-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    1. Materiais Gastos
                  </h4>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#059669' }}>
                    Total: {formatCurrency(calcTotalMaterials)}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                  {calcState.materials.map((mat, idx) => {
                    const lineTotal = (parseFloat(mat.quantity) || 0) * (parseFloat(mat.unitCost) || 0);
                    return (
                      <div key={mat.id || idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 70px 100px auto', gap: '6px', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Material (ex: Papel, Tinta, Tecido)"
                          className="form-input"
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                          value={mat.name}
                          onChange={(e) => {
                            const newMats = [...calcState.materials];
                            newMats[idx].name = e.target.value;
                            setCalcState(prev => ({ ...prev, materials: newMats }));
                          }}
                        />
                        <input
                          type="number"
                          placeholder="Qtd"
                          min="0"
                          step="0.1"
                          className="form-input"
                          style={{ padding: '6px 8px', fontSize: '0.8rem', textAlign: 'center' }}
                          value={mat.quantity}
                          onChange={(e) => {
                            const newMats = [...calcState.materials];
                            newMats[idx].quantity = parseFloat(e.target.value) || 0;
                            setCalcState(prev => ({ ...prev, materials: newMats }));
                          }}
                        />
                        <input
                          type="number"
                          placeholder="Custo (R$)"
                          min="0"
                          step="0.01"
                          className="form-input"
                          style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                          value={mat.unitCost}
                          onChange={(e) => {
                            const newMats = [...calcState.materials];
                            newMats[idx].unitCost = parseFloat(e.target.value) || 0;
                            setCalcState(prev => ({ ...prev, materials: newMats }));
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (calcState.materials.length === 1) return;
                            setCalcState(prev => ({ ...prev, materials: prev.materials.filter((_, i) => i !== idx) }));
                          }}
                          disabled={calcState.materials.length === 1}
                          style={{ background: '#fee2e2', border: 'none', color: '#ef4444', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: calcState.materials.length === 1 ? 'not-allowed' : 'pointer', opacity: calcState.materials.length === 1 ? 0.4 : 1 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCalcState(prev => ({
                      ...prev,
                      materials: [...prev.materials, { id: Date.now(), name: '', quantity: 1, unit: 'un', unitCost: 0 }]
                    }));
                  }}
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', borderStyle: 'dashed' }}
                >
                  <Plus size={14} /> Adicionar Outro Material
                </button>
              </div>

              {/* Section 2: Tempo de Confecção & Mão de Obra */}
              <div className="budget-card-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    2. Tempo de Confecção & Mão de Obra
                  </h4>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#059669' }}>
                    Total: {formatCurrency(calcTotalLabor)}
                  </span>
                </div>

                <div className="budget-grid-2" style={{ marginBottom: '10px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Horas de Trabalho / Confecção</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="number"
                        min="0"
                        className="form-input"
                        value={calcState.laborHours}
                        onChange={(e) => setCalcState(prev => ({ ...prev, laborHours: parseInt(e.target.value, 10) || 0 }))}
                      />
                      <span style={{ alignSelf: 'center', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>horas</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        className="form-input"
                        value={calcState.laborMinutes}
                        onChange={(e) => setCalcState(prev => ({ ...prev, laborMinutes: parseInt(e.target.value, 10) || 0 }))}
                      />
                      <span style={{ alignSelf: 'center', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>min</span>
                    </div>
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Valor da Sua Hora de Trabalho (R$/h)</label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      className="form-input"
                      value={calcState.hourlyRate}
                      onChange={(e) => setCalcState(prev => ({ ...prev, hourlyRate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="budget-chips-group">
                  <span style={{ fontSize: '0.72rem', color: '#64748b', alignSelf: 'center', marginRight: '4px' }}>Sugestão de valor/hora:</span>
                  {[30, 40, 50, 75, 100].map(rate => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setCalcState(prev => ({ ...prev, hourlyRate: rate }))}
                      className={`budget-chip-btn ${calcState.hourlyRate === rate ? 'active' : ''}`}
                      style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                    >
                      R$ {rate}/h
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 3: Custos Extras e Margem de Lucro */}
              <div className="budget-card-section">
                <h4 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  3. Custos Extras & Margem de Lucro
                </h4>

                <div className="budget-grid-2" style={{ marginBottom: '12px' }}>
                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Custos Extras (Frete/Embalagem)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="form-input"
                      value={calcState.extraCosts}
                      onChange={(e) => setCalcState(prev => ({ ...prev, extraCosts: parseFloat(e.target.value) || 0 }))}
                      placeholder="0,00"
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Margem de Lucro Desejada (%)</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="number"
                        min="0"
                        max="300"
                        className="form-input"
                        value={calcState.profitMargin}
                        onChange={(e) => setCalcState(prev => ({ ...prev, profitMargin: parseFloat(e.target.value) || 0 }))}
                      />
                      <select
                        className="form-input"
                        style={{ width: '110px' }}
                        value={calcState.marginType}
                        onChange={(e) => setCalcState(prev => ({ ...prev, marginType: e.target.value }))}
                      >
                        <option value="margin">Margem</option>
                        <option value="markup">Mark-up</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="budget-chips-group">
                  <span style={{ fontSize: '0.72rem', color: '#64748b', alignSelf: 'center', marginRight: '4px' }}>Margens comuns:</span>
                  {[20, 30, 40, 50, 100].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setCalcState(prev => ({ ...prev, profitMargin: m }))}
                      className={`budget-chip-btn ${calcState.profitMargin === m ? 'active' : ''}`}
                      style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                    >
                      {m}%
                    </button>
                  ))}
                </div>

                {/* Calculation Summary Box */}
                <div className="calc-result-box">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Custo Total de Produção</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>{formatCurrency(calcTotalBaseCost)}</div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>
                        Materiais: {formatCurrency(calcTotalMaterials)} • Mão de Obra: {formatCurrency(calcTotalLabor)}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Lucro Líquido Estimado</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399' }}>+ {formatCurrency(calcPriceResult.profit)}</div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '2px' }}>
                        Retorno de {calcState.profitMargin}%
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 800 }}>
                        Preço Sugerido de Venda
                      </div>
                      <div className="calc-price-badge">
                        {formatCurrency(calcPriceResult.sellingPrice)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={applyCalcToBudget}
                      style={{
                        padding: '12px 20px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Plus size={18} /> Adicionar aos Itens do Orçamento
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONDIÇÕES DE PAGAMENTO & PIX */}
          {activeTab === 'payment' && (
            <div className="animate-fade-in">
              <div className="budget-card-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                      Formas de Pagamento e Parcelas
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                      Defina como o cliente efetuará o pagamento da proposta.
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Total a Distribuir:</div>
                    <strong style={{ fontSize: '1.1rem', color: '#059669' }}>{formatCurrency(calculateTotal())}</strong>
                  </div>
                </div>

                {/* Portions list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                  {budgetData.paymentPortions.map((portion, idx) => {
                    const portionVal = (calculateTotal() * (portion.percentage || 0)) / 100;

                    return (
                      <div key={portion.id || idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                            Parcela #{idx + 1}
                          </span>
                          {budgetData.paymentPortions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removePortion(portion.id)}
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                              title="Remover parcela"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>

                        <div className="budget-grid-2" style={{ marginBottom: '8px' }}>
                          <div>
                            <label className="form-label" style={{ fontSize: '0.7rem' }}>Método de Pagamento</label>
                            <select
                              className="form-input"
                              style={{ background: '#ffffff' }}
                              value={portion.method}
                              onChange={(e) => updatePortion(portion.id, 'method', e.target.value)}
                            >
                              {PAYMENT_METHODS.map(m => (
                                <option key={m.id} value={m.id}>{m.icon} {m.label}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="form-label" style={{ fontSize: '0.7rem' }}>Porcentagem (%)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                className="form-input"
                                style={{ background: '#ffffff', textAlign: 'center' }}
                                value={portion.percentage}
                                onChange={(e) => updatePortion(portion.id, 'percentage', parseInt(e.target.value, 10) || 0)}
                              />
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669', minWidth: '85px', textAlign: 'right' }}>
                                {formatCurrency(portionVal)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="form-label" style={{ fontSize: '0.7rem' }}>Etiqueta / Vencimento da Parcela</label>
                          <input
                            type="text"
                            className="form-input"
                            style={{ background: '#ffffff' }}
                            placeholder="Ex: Entrada na assinatura, 50% na entrega final..."
                            value={portion.label}
                            onChange={(e) => updatePortion(portion.id, 'label', e.target.value)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={addPortion}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <Plus size={14} /> Adicionar Parcela
                  </button>

                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: getTotalPortionPercentage() === 100 ? '#059669' : '#d97706',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: getTotalPortionPercentage() === 100 ? '#ecfdf5' : '#fef3c7'
                  }}>
                    Total: {getTotalPortionPercentage()}% {getTotalPortionPercentage() === 100 ? '✓' : '(Deve somar 100%)'}
                  </div>
                </div>
              </div>

              {/* PIX Key Section */}
              <div className="budget-card-section" style={{ borderLeft: '4px solid #10b981' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <QrCode size={18} color="#10b981" />
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                    Dados do PIX (Destaque na Proposta)
                  </h3>
                </div>

                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '10px' }}>
                  Cadastre sua chave PIX para que o cliente realize o pagamento com rapidez e facilidade.
                </p>

                <div className="budget-grid-2">
                  <div className="form-group">
                    <label className="form-label">Tipo de Chave PIX</label>
                    <select
                      className="form-input"
                      value={budgetData.pixKeyType}
                      onChange={(e) => handleChange('pixKeyType', e.target.value)}
                    >
                      <option value="aleatoria">Chave Aleatória (EVP)</option>
                      <option value="cnpj">CNPJ</option>
                      <option value="cpf">CPF</option>
                      <option value="celular">Celular / WhatsApp</option>
                      <option value="email">E-mail</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Chave PIX</label>
                    <input
                      type="text"
                      className="form-input"
                      value={budgetData.pixKey}
                      onChange={(e) => handleChange('pixKey', e.target.value)}
                      placeholder="Cole aqui sua chave PIX..."
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nome do Titular da Conta / Banco</label>
                  <input
                    type="text"
                    className="form-input"
                    value={budgetData.pixReceiver}
                    onChange={(e) => handleChange('pixReceiver', e.target.value)}
                    placeholder="Ex: João Silva - Nubank"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PERSONALIZAR PDF (MODIFICAÇÃO SIMPLES DO PDF) */}
          {activeTab === 'style' && (
            <div className="animate-fade-in">
              <div className="budget-card-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Palette size={18} color="#10b981" />
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    Personalização Rápida do PDF
                  </h3>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '14px' }}>
                  Modifique as cores, estilo visual e seções exibidas no orçamento com apenas um clique.
                </p>

                {/* Accent Color Preset Selector */}
                <div className="form-group">
                  <label className="form-label">Cor de Destaque do Documento</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    {COLOR_PRESETS.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleChange('accentColor', c.hex)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: budgetData.accentColor === c.hex ? `2px solid ${c.hex}` : '1px solid #e2e8f0',
                          background: budgetData.accentColor === c.hex ? `${c.hex}15` : '#ffffff',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          color: '#1e293b'
                        }}
                      >
                        <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: c.hex }} />
                        {c.label}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Ou escolha uma cor personalizada:</span>
                    <input
                      type="color"
                      value={budgetData.accentColor || '#10b981'}
                      onChange={(e) => handleChange('accentColor', e.target.value)}
                      style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', cursor: 'pointer', padding: 0 }}
                    />
                    <code style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                      {budgetData.accentColor}
                    </code>
                  </div>
                </div>
              </div>

              {/* Items Per Page (Pagination settings) */}
              <div className="budget-card-section">
                <h4 style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  Paginação e Divisão de Páginas do PDF
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '10px' }}>
                  O sistema agora divide orçamentos grandes automaticamente em múltiplas folhas A4 para não quebrar o layout.
                </p>

                <div className="budget-chips-group">
                  {[
                    { id: 'auto', label: '⚡ Automático Inteligente (Recomendado)' },
                    { id: '4', label: '4 Itens por Folha' },
                    { id: '6', label: '6 Itens por Folha' },
                    { id: '8', label: '8 Itens por Folha' }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleChange('itemsPerPage', opt.id)}
                      className={`budget-chip-btn ${budgetData.itemsPerPage === opt.id ? 'active' : ''}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div style={{ 
                  marginTop: '10px', 
                  padding: '10px 14px', 
                  background: '#f8fafc', 
                  borderRadius: '10px', 
                  border: '1px solid #e2e8f0',
                  fontSize: '0.78rem',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>Total de páginas geradas no momento:</span>
                  <strong style={{ color: '#059669', fontSize: '0.9rem' }}>
                    {paginatedPages.length} {paginatedPages.length === 1 ? 'folha A4' : 'folhas A4'}
                  </strong>
                </div>
              </div>

              {/* Section Visibility Toggles */}
              <div className="budget-card-section">
                <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                  Elementos Visíveis na Proposta
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { key: 'showLogo', label: 'Exibir Logotipo da Empresa' },
                    { key: 'showDeliveryDate', label: 'Exibir Prazo e Data de Entrega' },
                    { key: 'showValidity', label: 'Exibir Data de Validade' },
                    { key: 'showPaymentConditions', label: 'Exibir Condições de Pagamento e Parcelas' },
                    { key: 'showPixBox', label: 'Exibir Bloco de Chave PIX' },
                    { key: 'showNotes', label: 'Exibir Termos e Observações Adicionais' },
                    { key: 'showAuthBadge', label: 'Exibir Carimbo "Documento Oficial"' }
                  ].map(toggle => (
                    <label 
                      key={toggle.key} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        padding: '8px 12px', 
                        background: '#f8fafc', 
                        borderRadius: '8px', 
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        color: '#1e293b'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={budgetData[toggle.key]}
                        onChange={(e) => handleChange(toggle.key, e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
                      />
                      <span>{toggle.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MINHA EMPRESA */}
          {activeTab === 'company' && (
            <div className="animate-fade-in">
              <div className="budget-card-section">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <ImageIcon size={18} color="#10b981" />
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    Dados da Sua Empresa
                  </h3>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '14px' }}>
                  Estes dados aparecem no cabeçalho do orçamento em todas as páginas.
                </p>

                {/* Logo Upload */}
                <div className="form-group">
                  <label className="form-label">Logotipo da Empresa</label>
                  <div style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    textAlign: 'center',
                    background: '#f8fafc',
                    position: 'relative'
                  }}>
                    {budgetData.logo ? (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={budgetData.logo} alt="Logo" style={{ maxHeight: '70px', maxWidth: '200px', objectFit: 'contain' }} />
                        <button
                          type="button"
                          onClick={() => handleChange('logo', null)}
                          style={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Remover logotipo"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <ImageIcon size={28} color="#94a3b8" style={{ margin: '0 auto 6px' }} />
                        <div style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>Clique para selecionar o logo</div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files && handleLogoUpload(e.target.files[0])}
                          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nome Comercial / Razão Social</label>
                  <input
                    type="text"
                    className="form-input"
                    value={budgetData.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    placeholder="Ex: Estudio Criativo Design"
                  />
                </div>

                <div className="budget-grid-2">
                  <div className="form-group">
                    <label className="form-label">E-mail de Contato</label>
                    <input
                      type="email"
                      className="form-input"
                      value={budgetData.companyEmail}
                      onChange={(e) => handleChange('companyEmail', e.target.value)}
                      placeholder="contato@empresa.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Telefone / WhatsApp</label>
                    <input
                      type="text"
                      className="form-input"
                      value={budgetData.companyPhone}
                      onChange={(e) => handleChange('companyPhone', e.target.value)}
                      placeholder="(11) 91234-5678"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Website ou Instagram</label>
                  <input
                    type="text"
                    className="form-input"
                    value={budgetData.companyWebsite}
                    onChange={(e) => handleChange('companyWebsite', e.target.value)}
                    placeholder="www.minhaempresa.com.br / @minhaempresa"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Endereço ou Cidade</label>
                  <input
                    type="text"
                    className="form-input"
                    value={budgetData.companyAddress}
                    onChange={(e) => handleChange('companyAddress', e.target.value)}
                    placeholder="São Paulo - SP"
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ── STICKY BOTTOM ACTION BAR (MOBILE & DESKTOP ENHANCED) ── */}
      <footer className="budget-bottom-bar">
        <div className="budget-bottom-total">
          <span className="budget-total-label">Total da Proposta</span>
          <span className="budget-total-amount">
            {formatCurrency(calculateTotal())}
          </span>
        </div>

        <div className="budget-bottom-buttons">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            {showPreview ? <Edit3 size={16} /> : <Eye size={16} />}
            <span>{showPreview ? 'Voltar ao Editor' : `Prévia (${paginatedPages.length} ${paginatedPages.length === 1 ? 'Folha' : 'Folhas'})`}</span>
          </button>

          <button
            onClick={generatePDF}
            disabled={isGenerating || budgetData.items.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: isGenerating || budgetData.items.length === 0 ? '#cbd5e1' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              cursor: isGenerating || budgetData.items.length === 0 ? 'not-allowed' : 'pointer',
              fontWeight: 800,
              fontSize: '0.9rem',
              boxShadow: isGenerating || budgetData.items.length === 0 ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <Download size={18} />
            <span>{isGenerating ? 'Gerando Páginas...' : 'Exportar PDF'}</span>
          </button>
        </div>
      </footer>

      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 20px',
          borderRadius: '12px',
          background: notification.type === 'success' ? '#10b981' : notification.type === 'error' ? '#ef4444' : '#1e293b',
          color: 'white',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 9999,
          fontWeight: 600,
          fontSize: '0.85rem',
          maxWidth: '90vw'
        }}>
          {notification.type === 'success' ? <Check size={16} /> : notification.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
}