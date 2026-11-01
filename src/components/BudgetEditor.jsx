import React, { useState, useEffect, useRef, useMemo } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  ArrowLeft, Calculator, Plus, Trash2, Download, Image as ImageIcon, 
  RotateCcw, Check, AlertCircle, Eye, Edit3, DollarSign, FileText, 
  X, Copy, Calendar, Clock, Palette, Layers, Settings2, 
  ChevronDown, ChevronUp, QrCode, Sparkles, ShieldCheck, Scale, 
  ZoomIn, ZoomOut, Maximize2, MoveUp, MoveDown, MessageCircle, Share2,
  CheckCircle2, ChevronRight, User, Briefcase
} from 'lucide-react';

const STORAGE_KEY = 'budget_data';

const PAYMENT_METHODS = [
  { id: 'pix', label: 'PIX', icon: '⚡' },
  { id: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { id: 'debito', label: 'Débito', icon: '💳' },
  { id: 'credito', label: 'Crédito', icon: '💳' },
  { id: 'transferencia', label: 'Transferência', icon: '🏦' },
  { id: 'boleto', label: 'Boleto', icon: '📄' },
];

const COLOR_PRESETS = [
  { id: 'emerald', label: 'Esmeralda', hex: '#10b981' },
  { id: 'sapphire', label: 'Safira', hex: '#2563eb' },
  { id: 'purple', label: 'Roxo Nobre', hex: '#7c3aed' },
  { id: 'ruby', label: 'Rubi', hex: '#dc2626' },
  { id: 'graphite', label: 'Grafite', hex: '#1e293b' },
  { id: 'amber', label: 'Âmbar', hex: '#d97706' },
  { id: 'magenta', label: 'Pink', hex: '#db2777' },
];

const QUICK_SERVICE_SUGGESTIONS = [
  { name: 'Criação de Logomarca', price: 180, desc: 'Logo principal, variações e arquivos em vetor' },
  { name: 'Identidade Visual Completa', price: 650, desc: 'Logo, paleta, tipografia, manual e papelaria' },
  { name: 'Cartão de Visita (Arte)', price: 90, desc: 'Frente e verso pronto para impressão' },
  { name: 'Pack Redes Sociais (6 posts)', price: 300, desc: 'Templates para feed e stories no Canva/PSD' },
  { name: 'Banner Promocional', price: 120, desc: 'Arte para lona ou digital em alta resolução' },
  { name: 'Papel Timbrado A4', price: 80, desc: 'Modelo institucional em Word e PDF' }
];

const INITIAL_BUDGET_DATA = {
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  projectName: '',
  projectDescription: '',
  
  emissionDate: new Date().toISOString().split('T')[0],
  validity: 7,
  deliveryType: 'prazo', // 'prazo', 'data', 'combinar'
  deliveryDays: 7,
  deliveryDate: '',
  deliveryNotes: '',

  items: [
    {
      id: 1,
      name: 'Identidade Visual Profissional',
      description: 'Criação de logotipo mestre, manual de marca, paleta de cores e tipografia.',
      price: 950,
      quantity: 1
    }
  ],
  globalDiscount: 0,
  globalDiscountType: 'fixed', // 'fixed' | 'percent'

  paymentTerms: '',
  paymentPortions: [
    { id: 1, method: 'pix', percentage: 50, installments: 1, label: 'Entrada na aprovação' },
    { id: 2, method: 'pix', percentage: 50, installments: 1, label: 'Na entrega final' }
  ],
  pixKey: '',
  pixKeyType: 'aleatoria',
  pixReceiver: '',

  additionalNotes: 'Proposta sujeita a alterações caso haja mudança no escopo acordado.',

  accentColor: '#10b981',
  pdfTheme: 'modern',
  itemsPerPage: 'auto',
  showLogo: true,
  showValidity: true,
  showDeliveryDate: true,
  showPaymentConditions: true,
  showPixBox: true,
  showNotes: true,
  showAuthBadge: true,

  fixedValues: [
    { id: 1, name: 'Logomarca', price: 180 },
    { id: 2, name: 'Cartão de Visita', price: 90 },
    { id: 3, name: 'Banner Digital', price: 120 },
    { id: 4, name: 'Pack 6 Posts', price: 300 },
    { id: 5, name: 'Papel Timbrado', price: 80 }
  ],

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
  if (typeof dateStr === 'string' && dateStr.includes('-')) {
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

/**
 * Intelligent Multi-page Pagination Engine
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

  const getItemWeight = (item) => {
    if (!item.description || item.description.trim().length === 0) return 1.0;
    if (item.description.length <= 40) return 1.2;
    if (item.description.length <= 90) return 1.5;
    return 2.0;
  };

  const totalWeight = items.reduce((acc, it) => acc + getItemWeight(it), 0);
  const hasExtraNotes = Boolean(budgetData.additionalNotes && budgetData.additionalNotes.trim());
  const hasPix = Boolean(budgetData.showPixBox && budgetData.pixKey && budgetData.pixKey.trim());
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

  const pages = [];
  const itemsPool = [...items];

  const takeChunk = (maxCapacity) => {
    const chunk = [];
    let currentWeight = 0;
    while (itemsPool.length > 0) {
      const nextItem = itemsPool[0];
      const nextWeight = getItemWeight(nextItem);
      if (chunk.length > 0 && (currentWeight + nextWeight > maxCapacity)) break;
      chunk.push(itemsPool.shift());
      currentWeight += nextWeight;
    }
    return chunk;
  };

  const page1Items = takeChunk(5.5);
  pages.push({
    isFirstPage: true,
    isLastPage: false,
    items: page1Items
  });

  while (itemsPool.length > 0) {
    const remainingWeight = itemsPool.reduce((acc, it) => acc + getItemWeight(it), 0);
    const finalPageCapacity = hasExtraNotes && hasPix ? 3.5 : 4.5;

    if (remainingWeight <= finalPageCapacity) {
      pages.push({
        isFirstPage: false,
        isLastPage: true,
        items: [...itemsPool]
      });
      itemsPool.length = 0;
      break;
    }

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
  const [budgetData, setBudgetData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_BUDGET_DATA, ...parsed };
      } catch (e) {
        console.error('Failed to load budget data:', e);
      }
    }
    return INITIAL_BUDGET_DATA;
  });

  // Navigation: 'client' | 'items' | 'calc' | 'payment' | 'pdf' | 'style' | 'company'
  const [activeTab, setActiveTab] = useState('items');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewZoom, setPreviewZoom] = useState('fit'); // 'fit' | 0.75 | 1
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const [notification, setNotification] = useState(null);
  
  // Mobile Modal / Sheet State for Item Add/Edit
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItemData, setEditingItemData] = useState(null);

  // Cost Calculator State
  const [calcState, setCalcState] = useState({
    itemName: 'Serviço Especial / Peça Confeccionada',
    materials: [
      { id: 1, name: 'Material Principal', quantity: 1, unit: 'un', unitCost: 40.0 }
    ],
    laborHours: 2,
    laborMinutes: 30,
    hourlyRate: 50.0,
    extraCosts: 10.0,
    extraCostsLabel: 'Insumos e Embalagem',
    profitMargin: 40,
    marginType: 'margin'
  });

  // Track window size for mobile detection & preview auto-scaling
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  // Persist budget data
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(budgetData));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [budgetData]);

  // Sync initialData if provided
  useEffect(() => {
    if (initialData) {
      setBudgetData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

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

  const getDeliveryDisplay = () => {
    if (!budgetData.showDeliveryDate) return null;
    if (budgetData.deliveryType === 'combinar') return 'A combinar com o cliente';
    if (budgetData.deliveryType === 'data') {
      return budgetData.deliveryDate ? formatDate(budgetData.deliveryDate) : 'A definir';
    }
    const days = parseInt(budgetData.deliveryDays, 10) || 7;
    return `${days} ${days === 1 ? 'dia útil' : 'dias úteis'}`;
  };

  // Item Management with Modal
  const openAddItemModal = () => {
    setEditingItemData({
      id: null,
      name: '',
      description: '',
      price: 0,
      quantity: 1
    });
    setItemModalOpen(true);
  };

  const openEditItemModal = (item) => {
    setEditingItemData({ ...item });
    setItemModalOpen(true);
  };

  const saveItemModal = () => {
    if (!editingItemData.name.trim()) {
      notify('Digite o nome do serviço ou produto.', 'error');
      return;
    }

    if (editingItemData.id) {
      // Update
      setBudgetData(prev => ({
        ...prev,
        items: prev.items.map(it => it.id === editingItemData.id ? editingItemData : it)
      }));
      notify('Serviço atualizado com sucesso!', 'success');
    } else {
      // Create
      const newItem = {
        ...editingItemData,
        id: Date.now()
      };
      setBudgetData(prev => ({ ...prev, items: [...prev.items, newItem] }));
      notify('Serviço adicionado ao orçamento!', 'success');
    }
    setItemModalOpen(false);
    setEditingItemData(null);
  };

  const removeItem = (id) => {
    setBudgetData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
    notify('Item removido.', 'info');
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

  const updateItemQuantity = (id, delta) => {
    setBudgetData(prev => ({
      ...prev,
      items: prev.items.map(it => {
        if (it.id === id) {
          const newQty = Math.max(1, (parseInt(it.quantity, 10) || 1) + delta);
          return { ...it, quantity: newQty };
        }
        return it;
      })
    }));
  };

  // Fixed Services
  const addFixedToItems = (fixed) => {
    const newItem = {
      id: Date.now(),
      name: fixed.name,
      description: '',
      price: fixed.price,
      quantity: 1
    };
    setBudgetData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    notify(`"${fixed.name}" adicionado!`, 'success');
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

  // Logo Upload
  const handleLogoUpload = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleChange('logo', reader.result);
      notify('Logotipo atualizado!', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Cost Calculator
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
      profit = cost * (margin / 100);
      sellingPrice = cost + profit;
    } else {
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
    notify(`Item "${newItem.name}" adicionado com valor de ${formatCurrency(newItem.price)}!`, 'success');
  };

  // WhatsApp Share Message
  const shareViaWhatsApp = () => {
    const total = calculateTotal();
    const client = budgetData.clientName || 'Cliente';
    const delivery = getDeliveryDisplay();
    const itemsText = budgetData.items
      .map(it => `• *${it.name || 'Serviço'}* (${it.quantity || 1}x): ${formatCurrency((it.price || 0) * (it.quantity || 1))}`)
      .join('\n');
    
    let msg = `Olá, *${client}*! Tudo bem?\n\n`;
    msg += `Segue a proposta comercial para o projeto *${budgetData.projectName || 'Serviços'}*:\n\n`;
    msg += `${itemsText}\n\n`;
    msg += `*Total:* ${formatCurrency(total)}\n`;
    if (delivery) msg += `*Prazo de Entrega:* ${delivery}\n`;
    if (budgetData.validity) msg += `*Validade:* ${budgetData.validity} dias\n`;
    if (budgetData.pixKey) msg += `\n*Chave PIX:* \`${budgetData.pixKey}\` (${budgetData.pixReceiver || budgetData.companyName || ''})\n`;
    msg += `\nO PDF completo e oficial também foi gerado. Fico à disposição para iniciarmos!`;

    const encoded = encodeURIComponent(msg);
    const phone = (budgetData.clientPhone || '').replace(/\D/g, '');
    if (phone.length >= 10) {
      window.open(`https://wa.me/55${phone}?text=${encoded}`, '_blank');
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(msg);
        notify('Resumo copiado! Cole no WhatsApp do cliente.', 'success');
      }
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
    }
  };

  // Paginated Pages Memo
  const paginatedPages = useMemo(() => {
    return paginateBudget(budgetData, budgetData.itemsPerPage);
  }, [budgetData]);

  // Preview Scale Calculation
  const activeScale = useMemo(() => {
    if (previewZoom === 1) return 1;
    if (previewZoom === 0.75) return 0.75;
    const available = Math.min(windowWidth - 28, 794);
    return Math.min(1, Math.max(0.35, available / 794));
  }, [previewZoom, windowWidth]);

  /**
   * DEFINITIVE MULTI-PAGE PDF GENERATION FIX
   * Captures untransformed elements from offscreen stage #budget-export-stage.
   * Completely solves the "corner grouping" issue!
   */
  const generatePDF = async () => {
    if (budgetData.items.length === 0) {
      notify('Adicione pelo menos um item antes de exportar.', 'error');
      return;
    }

    setIsGenerating(true);

    try {
      if (document.fonts) await document.fonts.ready;
      await new Promise(r => setTimeout(r, 250));

      const stageEl = document.getElementById('budget-export-stage');
      if (!stageEl) {
        throw new Error('Estágio de exportação não encontrado.');
      }

      const pageElements = stageEl.querySelectorAll('.budget-export-page');
      if (!pageElements || pageElements.length === 0) {
        throw new Error('Nenhuma folha encontrada para exportação.');
      }

      // Standard A4: 210 x 297 mm
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      for (let i = 0; i < pageElements.length; i++) {
        const pageEl = pageElements[i];

        // Capture offscreen untransformed pristine 794x1123px element
        const canvas = await html2canvas(pageEl, {
          scale: 2, // ~300 DPI high resolution
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: 794,
          height: 1123,
          windowWidth: 794,
          windowHeight: 1123,
          x: 0,
          y: 0
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.98);

        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }

        // Exact standard A4 dimensions (210 x 297 mm)
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      const clientClean = (budgetData.clientName || budgetData.projectName || 'Proposta').replace(/[^a-zA-Z0-9_\-]/g, '_');
      const fileName = `Orcamento_${clientClean}.pdf`;
      pdf.save(fileName);

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

      notify(`PDF exportado com sucesso! (${pageElements.length} ${pageElements.length === 1 ? 'folha A4' : 'folhas A4'})`, 'success');
    } catch (err) {
      console.error('Error generating PDF:', err);
      notify('Erro ao gerar PDF: ' + err.message, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset confirmation
  const handleReset = () => {
    if (window.confirm('Deseja iniciar um novo orçamento? Os dados atuais serão limpos.')) {
      setBudgetData(INITIAL_BUDGET_DATA);
      localStorage.removeItem(STORAGE_KEY);
      notify('Novo orçamento iniciado!', 'info');
    }
  };

  /**
   * RENDER: Standard A4 PDF Sheet Template
   */
  const renderPDFPage = (pageData, isForExport = false) => {
    const { pageNumber, totalPages, isFirstPage, isLastPage, items } = pageData;
    const accent = budgetData.accentColor || '#10b981';
    const validUntilDate = new Date();
    validUntilDate.setDate(validUntilDate.getDate() + (parseInt(budgetData.validity, 10) || 7));
    const deliveryDisplay = getDeliveryDisplay();

    return (
      <div 
        key={pageNumber}
        className={isForExport ? 'budget-export-page' : 'budget-page'}
        id={isForExport ? `export-page-${pageNumber}` : `budget-page-${pageNumber}`}
        style={{
          width: '794px',
          height: '1123px',
          minHeight: '1123px',
          maxHeight: '1123px',
          boxSizing: 'border-box',
          padding: '48px 54px 54px 54px',
          background: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
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

        {/* ── TOP HEADER ── */}
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
          /* Continuation Header for Page 2+ */
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

        {/* ── TABLE OF ITEMS ── */}
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

        {/* ── BOTTOM FINANCIALS (ON FINAL PAGE ONLY) ── */}
        {isLastPage ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginTop: '12px', marginBottom: '14px' }}>
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
                              {mInfo?.label || p.method} {p.installments > 1 ? `(${p.installments}x)` : ''}
                              {p.label ? ` • ${p.label}` : ''}
                            </span>
                            <strong style={{ color: '#0f172a' }}>{formatCurrency(portionVal)} ({p.percentage}%)</strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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

            {budgetData.showNotes && budgetData.additionalNotes && (
              <div style={{ marginBottom: '10px', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.7rem', color: '#64748b', lineHeight: 1.4 }}>
                <strong style={{ color: '#334155', display: 'block', marginBottom: '2px' }}>Observações e Prazos:</strong>
                {budgetData.additionalNotes}
                {budgetData.deliveryNotes && <span> • {budgetData.deliveryNotes}</span>}
              </div>
            )}
          </div>
        ) : null}

        {/* ── FOOTER ── */}
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
      
      {/* ── TOP APP BAR ── */}
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
              {budgetData.projectName || 'Orçamento'}
            </h1>
            <p className="budget-brand-subtitle">
              <span>{budgetData.clientName || 'Novo Cliente'}</span>
            </p>
          </div>
        </div>

        {/* Live Total Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div 
            onClick={() => setActiveTab('pdf')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '50px',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '0.68rem', color: '#047857', fontWeight: 600 }}>Total</span>
            <strong style={{ fontSize: '0.92rem', color: '#059669', fontWeight: 800 }}>
              {formatCurrency(calculateTotal())}
            </strong>
          </div>

          <button 
            onClick={handleReset} 
            className="budget-btn-reset"
            title="Novo Orçamento em Branco"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </header>

      {/* ── DESKTOP SUB-HEADER TABS (Hidden on mobile) ── */}
      {!isMobile && (
        <nav className="budget-tabs-wrapper">
          {[
            { id: 'items', label: 'Itens', icon: Layers, badge: budgetData.items.length },
            { id: 'client', label: 'Dados & Entrega', icon: FileText },
            { id: 'calc', label: 'Calculadora de Custo', icon: Calculator, isNew: true },
            { id: 'payment', label: 'Pagamento & PIX', icon: DollarSign },
            { id: 'pdf', label: 'Visualizar PDF', icon: Eye, badge: `${paginatedPages.length}p` },
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

      {/* ── MAIN SCROLLABLE APP BODY ── */}
      <main className="budget-main-content" style={{ paddingBottom: isMobile ? '80px' : '24px' }}>
        
        {/* TAB: ITENS */}
        {activeTab === 'items' && (
          <div className="animate-fade-in">
            {/* Quick Carousel of Fixed Services */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                  ⚡ Toque para adicionar serviço rápido:
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Deslize →</span>
              </div>
              <div className="budget-quick-carousel">
                {budgetData.fixedValues.map(fixed => (
                  <button
                    key={fixed.id}
                    type="button"
                    onClick={() => addFixedToItems(fixed)}
                    className="budget-quick-chip"
                  >
                    <span>+ {fixed.name}</span>
                    <strong style={{ color: '#059669' }}>{formatCurrency(fixed.price)}</strong>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons Header */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <button
                onClick={openAddItemModal}
                className="btn btn-primary"
                style={{ 
                  flex: 1, 
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: 700
                }}
              >
                <Plus size={18} /> Novo Serviço
              </button>

              <button
                onClick={() => setActiveTab('calc')}
                className="btn btn-secondary"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '6px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  background: '#f0fdf4',
                  borderColor: '#bbf7d0',
                  color: '#059669'
                }}
              >
                <Calculator size={18} />
                <span>Calcular Custo</span>
              </button>
            </div>

            {/* Items Cards */}
            {budgetData.items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#ffffff', borderRadius: '20px', border: '2px dashed #cbd5e1' }}>
                <Layers size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ margin: '0 0 6px', color: '#1e293b', fontSize: '1rem', fontWeight: 700 }}>Nenhum serviço adicionado</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '16px' }}>
                  Adicione os serviços que você vai prestar ou utilize a calculadora de custos.
                </p>
                <button onClick={openAddItemModal} className="btn btn-primary" style={{ background: '#10b981', padding: '10px 20px' }}>
                  <Plus size={16} /> Adicionar Primeiro Serviço
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {budgetData.items.map((item, index) => {
                  const itemTotal = (parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1);
                  return (
                    <div 
                      key={item.id} 
                      className="budget-item-card"
                      style={{ padding: '14px', borderRadius: '16px' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 }}>
                          <span style={{ 
                            width: '24px', 
                            height: '24px', 
                            borderRadius: '50%', 
                            background: '#f1f5f9', 
                            color: '#475569', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontSize: '0.72rem', 
                            fontWeight: 700,
                            flexShrink: 0,
                            marginTop: '2px'
                          }}>
                            {index + 1}
                          </span>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                              {item.name || 'Serviço sem nome'}
                            </div>
                            {item.description && (
                              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px', lineHeight: 1.4 }}>
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '12px' }}>
                          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#059669' }}>
                            {formatCurrency(itemTotal)}
                          </div>
                          {item.quantity > 1 && (
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                              {item.quantity}x {formatCurrency(item.price)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Bottom Controls */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9', marginTop: '4px' }}>
                        {/* Stepper */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.id, -1)}
                            style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            -
                          </button>
                          <span style={{ minWidth: '24px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                            {item.quantity || 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(item.id, 1)}
                            style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            +
                          </button>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => openEditItemModal(item)}
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#334155', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            <Edit3 size={13} /> Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => duplicateItem(item.id)}
                            style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer' }}
                            title="Duplicar"
                          >
                            <Copy size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid #fee2e2', background: '#fff5f5', color: '#ef4444', cursor: 'pointer' }}
                            title="Excluir"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Global Discount Accordion */}
            {budgetData.items.length > 0 && (
              <div className="budget-card-section" style={{ marginTop: '14px', borderRadius: '16px' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                  Desconto do Orçamento
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '8px', marginBottom: '10px' }}>
                  <select
                    className="form-input"
                    value={budgetData.globalDiscountType}
                    onChange={(e) => handleChange('globalDiscountType', e.target.value)}
                  >
                    <option value="fixed">Fixo (R$)</option>
                    <option value="percent">Porcento (%)</option>
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
                      {pct}%
                    </button>
                  ))}
                  {budgetData.globalDiscount > 0 && (
                    <button
                      type="button"
                      onClick={() => handleChange('globalDiscount', 0)}
                      className="budget-chip-btn"
                      style={{ color: '#ef4444' }}
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: GERAL (CLIENTE, PROJETO E PRAZOS) */}
        {activeTab === 'client' && (
          <div className="animate-fade-in">
            {/* Delivery Card */}
            <div className="budget-card-section" style={{ borderLeft: '4px solid #10b981', borderRadius: '16px' }}>
              <h3 className="budget-card-section-title">
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} color="#10b981" />
                  Prazo e Data de Entrega
                </span>
                <span style={{ fontSize: '0.7rem', color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                  No PDF
                </span>
              </h3>

              {/* Segmented Control */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                {[
                  { id: 'prazo', label: '⏱️ Dias Úteis' },
                  { id: 'data', label: '📅 Data Fixa' },
                  { id: 'combinar', label: '🤝 A Combinar' }
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleChange('deliveryType', t.id)}
                    className={`budget-chip-btn ${budgetData.deliveryType === t.id ? 'active' : ''}`}
                    style={{ flex: 1, textAlign: 'center', padding: '8px 4px', fontSize: '0.75rem' }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {budgetData.deliveryType === 'prazo' && (
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Escolha o prazo com 1 toque:</label>
                  <div className="budget-chips-group">
                    {[3, 5, 7, 10, 15, 20, 30].map(days => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => handleChange('deliveryDays', days)}
                        className={`budget-chip-btn ${parseInt(budgetData.deliveryDays, 10) === days ? 'active' : ''}`}
                      >
                        {days} dias
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {budgetData.deliveryType === 'data' && (
                <div className="form-group" style={{ marginBottom: '10px' }}>
                  <label className="form-label">Data de Entrega Prometida</label>
                  <input
                    type="date"
                    className="form-input"
                    value={budgetData.deliveryDate}
                    onChange={(e) => handleChange('deliveryDate', e.target.value)}
                  />
                </div>
              )}

              <div className="form-group" style={{ marginTop: '10px', marginBottom: 0 }}>
                <label className="form-label">Observação sobre o Prazo</label>
                <input
                  type="text"
                  className="form-input"
                  value={budgetData.deliveryNotes}
                  onChange={(e) => handleChange('deliveryNotes', e.target.value)}
                  placeholder="Ex: A partir da aprovação da arte final"
                />
              </div>
            </div>

            {/* Client Card */}
            <div className="budget-card-section" style={{ borderRadius: '16px' }}>
              <h3 className="budget-card-section-title">
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={18} color="#4f46e5" />
                  Cliente / Destinatário
                </span>
              </h3>

              <div className="form-group">
                <label className="form-label">Nome do Cliente ou Empresa</label>
                <input
                  type="text"
                  className="form-input"
                  value={budgetData.clientName}
                  onChange={(e) => handleChange('clientName', e.target.value)}
                  placeholder="Ex: Carlos Silva / Loja Bella"
                />
              </div>

              <div className="budget-grid-2">
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

                <div className="form-group">
                  <label className="form-label">E-mail</label>
                  <input
                    type="email"
                    className="form-input"
                    value={budgetData.clientEmail}
                    onChange={(e) => handleChange('clientEmail', e.target.value)}
                    placeholder="cliente@email.com"
                  />
                </div>
              </div>
            </div>

            {/* Project Card */}
            <div className="budget-card-section" style={{ borderRadius: '16px' }}>
              <h3 className="budget-card-section-title">
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={18} color="#059669" />
                  Dados do Projeto
                </span>
              </h3>

              <div className="form-group">
                <label className="form-label">Título do Projeto</label>
                <input
                  type="text"
                  className="form-input"
                  value={budgetData.projectName}
                  onChange={(e) => handleChange('projectName', e.target.value)}
                  placeholder="Ex: Identidade Visual & Papelaria"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descrição do Escopo</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={budgetData.projectDescription}
                  onChange={(e) => handleChange('projectDescription', e.target.value)}
                  placeholder="Breve detalhamento dos objetivos..."
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Validade da Proposta (Dias)</label>
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
            </div>
          </div>
        )}

        {/* TAB: CALCULADORA DE CUSTO */}
        {activeTab === 'calc' && (
          <div className="animate-fade-in">
            {/* Banner */}
            <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: 'white', borderRadius: '18px', padding: '16px', marginBottom: '14px', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.25)' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '1.05rem', fontWeight: 800 }}>
                🧮 Calculadora de Precificação
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', opacity: 0.9 }}>
                Calcule o valor de venda exato somando matéria-prima gasta, tempo de confecção e margem de lucro.
              </p>
            </div>

            {/* Product Name */}
            <div className="budget-card-section" style={{ borderRadius: '16px' }}>
              <label className="form-label">Nome da Peça ou Serviço a Precificar</label>
              <input
                type="text"
                className="form-input"
                value={calcState.itemName}
                onChange={(e) => setCalcState(prev => ({ ...prev, itemName: e.target.value }))}
                placeholder="Ex: Caixa Personalizada, Arte de Fachada, Banner..."
              />
            </div>

            {/* Section 1: Materiais */}
            <div className="budget-card-section" style={{ borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                  1. Materiais Gastos
                </h4>
                <strong style={{ fontSize: '0.9rem', color: '#059669' }}>
                  {formatCurrency(calcTotalMaterials)}
                </strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
                {calcState.materials.map((mat, idx) => (
                  <div key={mat.id || idx} style={{ display: 'grid', gridTemplateColumns: '1.4fr 60px 85px auto', gap: '6px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Material"
                      className="form-input"
                      style={{ padding: '6px 8px', fontSize: '0.78rem' }}
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
                      style={{ padding: '6px 4px', fontSize: '0.78rem', textAlign: 'center' }}
                      value={mat.quantity}
                      onChange={(e) => {
                        const newMats = [...calcState.materials];
                        newMats[idx].quantity = parseFloat(e.target.value) || 0;
                        setCalcState(prev => ({ ...prev, materials: newMats }));
                      }}
                    />
                    <input
                      type="number"
                      placeholder="R$"
                      min="0"
                      step="0.01"
                      className="form-input"
                      style={{ padding: '6px 8px', fontSize: '0.78rem' }}
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
                      style={{ background: '#fee2e2', border: 'none', color: '#ef4444', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
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
                <Plus size={14} /> Adicionar Outro Insumo
              </button>
            </div>

            {/* Section 2: Tempo de Confecção */}
            <div className="budget-card-section" style={{ borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                  2. Tempo de Confecção & Mão de Obra
                </h4>
                <strong style={{ fontSize: '0.9rem', color: '#059669' }}>
                  {formatCurrency(calcTotalLabor)}
                </strong>
              </div>

              <div className="budget-grid-2" style={{ marginBottom: '10px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Tempo Gasto (Horas e Minutos)</label>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={calcState.laborHours}
                      onChange={(e) => setCalcState(prev => ({ ...prev, laborHours: parseInt(e.target.value, 10) || 0 }))}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>h</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      className="form-input"
                      value={calcState.laborMinutes}
                      onChange={(e) => setCalcState(prev => ({ ...prev, laborMinutes: parseInt(e.target.value, 10) || 0 }))}
                    />
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>min</span>
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Valor da Sua Hora (R$/h)</label>
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
                <span style={{ fontSize: '0.72rem', color: '#64748b', alignSelf: 'center' }}>Hora:</span>
                {[30, 50, 75, 100].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setCalcState(prev => ({ ...prev, hourlyRate: r }))}
                    className={`budget-chip-btn ${calcState.hourlyRate === r ? 'active' : ''}`}
                    style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                  >
                    R$ {r}/h
                  </button>
                ))}
              </div>
            </div>

            {/* Section 3: Margem de Lucro & Resumo Fintech */}
            <div className="budget-card-section" style={{ borderRadius: '16px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.92rem', fontWeight: 700, color: '#0f172a' }}>
                3. Margem de Lucro Desejada
              </h4>

              <div className="budget-chips-group" style={{ marginBottom: '14px' }}>
                {[20, 30, 40, 50, 100].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setCalcState(prev => ({ ...prev, profitMargin: m }))}
                    className={`budget-chip-btn ${calcState.profitMargin === m ? 'active' : ''}`}
                    style={{ flex: 1, textAlign: 'center', padding: '8px' }}
                  >
                    {m}%
                  </button>
                ))}
              </div>

              {/* Fintech Card */}
              <div className="calc-result-box" style={{ borderRadius: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.12)', paddingBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Custo de Produção</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>{formatCurrency(calcTotalBaseCost)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Lucro Estimado</div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399' }}>+ {formatCurrency(calcPriceResult.profit)}</div>
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', fontWeight: 800 }}>
                    Preço de Venda Sugerido
                  </div>
                  <div className="calc-price-badge" style={{ fontSize: '1.9rem' }}>
                    {formatCurrency(calcPriceResult.sellingPrice)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={applyCalcToBudget}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Plus size={18} /> Adicionar aos Itens do Orçamento
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PAGAMENTO & PIX */}
        {activeTab === 'payment' && (
          <div className="animate-fade-in">
            {/* PIX Highlight Card */}
            <div className="budget-card-section" style={{ borderLeft: '4px solid #10b981', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <QrCode size={18} color="#10b981" />
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  Chave PIX (Destaque na Proposta)
                </h3>
              </div>

              <div className="budget-grid-2">
                <div className="form-group">
                  <label className="form-label">Tipo de Chave</label>
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

            {/* Payment Portions */}
            <div className="budget-card-section" style={{ borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>
                  Divisão de Pagamento & Parcelas
                </h3>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  color: getTotalPortionPercentage() === 100 ? '#059669' : '#d97706',
                  background: getTotalPortionPercentage() === 100 ? '#ecfdf5' : '#fef3c7',
                  padding: '3px 8px',
                  borderRadius: '10px'
                }}>
                  {getTotalPortionPercentage()}%
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {budgetData.paymentPortions.map((portion, idx) => {
                  const portionVal = (calculateTotal() * (portion.percentage || 0)) / 100;
                  return (
                    <div key={portion.id || idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                          Parcela #{idx + 1}
                        </span>
                        {budgetData.paymentPortions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePortion(portion.id)}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>

                      <div className="budget-grid-2" style={{ marginBottom: '6px' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '0.68rem' }}>Forma</label>
                          <select
                            className="form-input"
                            style={{ background: '#ffffff', fontSize: '0.78rem' }}
                            value={portion.method}
                            onChange={(e) => updatePortion(portion.id, 'method', e.target.value)}
                          >
                            {PAYMENT_METHODS.map(m => (
                              <option key={m.id} value={m.id}>{m.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="form-label" style={{ fontSize: '0.68rem' }}>Porcentagem (%)</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              className="form-input"
                              style={{ background: '#ffffff', textAlign: 'center', fontSize: '0.78rem' }}
                              value={portion.percentage}
                              onChange={(e) => updatePortion(portion.id, 'percentage', parseInt(e.target.value, 10) || 0)}
                            />
                            <strong style={{ fontSize: '0.82rem', color: '#059669', minWidth: '75px', textAlign: 'right' }}>
                              {formatCurrency(portionVal)}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <input
                        type="text"
                        className="form-input"
                        style={{ background: '#ffffff', fontSize: '0.75rem' }}
                        placeholder="Ex: Entrada na assinatura, restante na entrega..."
                        value={portion.label}
                        onChange={(e) => updatePortion(portion.id, 'label', e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={addPortion}
                className="btn btn-secondary"
                style={{ width: '100%', fontSize: '0.78rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Plus size={14} /> Adicionar Parcela
              </button>
            </div>
          </div>
        )}

        {/* TAB: VISUALIZADOR DE PDF MOBILE */}
        {activeTab === 'pdf' && (
          <div className="animate-fade-in" style={{ paddingBottom: '30px' }}>
            {/* Mobile PDF Action Card */}
            <div style={{ 
              background: '#1e293b', 
              color: 'white', 
              borderRadius: '16px', 
              padding: '14px', 
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700 }}>
                    Documento A4 Oficial ({paginatedPages.length} {paginatedPages.length === 1 ? 'Folha' : 'Folhas'})
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    Layout sem quebras • Formato padrão A4
                  </span>
                </div>

                {/* Zoom Controls */}
                <div style={{ display: 'flex', background: '#334155', borderRadius: '8px', padding: '2px' }}>
                  <button
                    onClick={() => setPreviewZoom('fit')}
                    style={{ border: 'none', padding: '4px 8px', borderRadius: '6px', background: previewZoom === 'fit' ? '#059669' : 'transparent', color: 'white', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Ajustar
                  </button>
                  <button
                    onClick={() => setPreviewZoom(1)}
                    style={{ border: 'none', padding: '4px 8px', borderRadius: '6px', background: previewZoom === 1 ? '#059669' : 'transparent', color: 'white', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    100%
                  </button>
                </div>
              </div>

              {/* Action Buttons: Download PDF & WhatsApp */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '8px' }}>
                <button
                  onClick={generatePDF}
                  disabled={isGenerating || budgetData.items.length === 0}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: isGenerating ? '#64748b' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <Download size={16} />
                  <span>{isGenerating ? 'Gerando...' : 'Baixar PDF'}</span>
                </button>

                <button
                  onClick={shareViaWhatsApp}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    background: '#25D366',
                    color: 'white',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <MessageCircle size={16} />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Interactive Preview Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }} id="budget-preview-container">
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
                      flexShrink: 0
                    }}
                  >
                    <div className="budget-page-badge" style={{ top: '-20px', left: 0, color: '#334155' }}>
                      Folha {pageData.pageNumber} de {pageData.totalPages}
                    </div>
                    
                    <div style={{
                      width: `${pageWidth}px`,
                      height: `${pageHeight}px`,
                      transform: `scale(${activeScale})`,
                      transformOrigin: 'top left',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                      borderRadius: '4px'
                    }}>
                      {renderPDFPage(pageData, false)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: PERSONALIZAR PDF */}
        {activeTab === 'style' && (
          <div className="animate-fade-in">
            <div className="budget-card-section" style={{ borderRadius: '16px' }}>
              <h3 className="budget-card-section-title">
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Palette size={18} color="#10b981" />
                  Cor e Identidade do PDF
                </span>
              </h3>

              <div className="budget-chips-group" style={{ marginBottom: '12px' }}>
                {COLOR_PRESETS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleChange('accentColor', c.hex)}
                    className={`budget-chip-btn ${budgetData.accentColor === c.hex ? 'active' : ''}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.hex }} />
                    {c.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Cor Personalizada:</span>
                <input
                  type="color"
                  value={budgetData.accentColor || '#10b981'}
                  onChange={(e) => handleChange('accentColor', e.target.value)}
                  style={{ width: '36px', height: '36px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div className="budget-card-section" style={{ borderRadius: '16px' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                Elementos Visíveis na Proposta
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { key: 'showLogo', label: 'Logotipo da Empresa' },
                  { key: 'showDeliveryDate', label: 'Prazo e Data de Entrega' },
                  { key: 'showValidity', label: 'Data de Validade da Proposta' },
                  { key: 'showPaymentConditions', label: 'Condições de Pagamento e Parcelas' },
                  { key: 'showPixBox', label: 'Bloco de Chave PIX Destacada' },
                  { key: 'showNotes', label: 'Termos e Observações Adicionais' },
                  { key: 'showAuthBadge', label: 'Selo Oficial "Documento Autenticado"' }
                ].map(toggle => (
                  <label 
                    key={toggle.key} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px', 
                      padding: '8px 12px', 
                      background: '#f8fafc', 
                      borderRadius: '10px', 
                      cursor: 'pointer',
                      fontSize: '0.8rem',
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

        {/* TAB: MINHA EMPRESA */}
        {activeTab === 'company' && (
          <div className="animate-fade-in">
            <div className="budget-card-section" style={{ borderRadius: '16px' }}>
              <h3 className="budget-card-section-title">
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={18} color="#10b981" />
                  Sua Empresa / Emissor
                </span>
              </h3>

              <div className="form-group">
                <label className="form-label">Logotipo</label>
                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '16px', textAlign: 'center', background: '#f8fafc', position: 'relative' }}>
                  {budgetData.logo ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={budgetData.logo} alt="Logo" style={{ maxHeight: '60px', maxWidth: '180px', objectFit: 'contain' }} />
                      <button
                        type="button"
                        onClick={() => handleChange('logo', null)}
                        style={{ position: 'absolute', top: -8, right: -8, background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon size={24} color="#94a3b8" style={{ margin: '0 auto 4px' }} />
                      <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>Toque para escolher logo</div>
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
                <label className="form-label">Nome da Sua Empresa</label>
                <input
                  type="text"
                  className="form-input"
                  value={budgetData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="Ex: Estudio Alfa Design"
                />
              </div>

              <div className="budget-grid-2">
                <div className="form-group">
                  <label className="form-label">E-mail</label>
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
            </div>
          </div>
        )}
      </main>

      {/* ── NATIVE MOBILE BOTTOM NAVIGATION BAR ── */}
      {isMobile && (
        <nav className="budget-mobile-bottom-nav">
          {[
            { id: 'items', label: 'Itens', icon: Layers, badge: budgetData.items.length },
            { id: 'client', label: 'Dados', icon: FileText },
            { id: 'calc', label: 'Custos', icon: Calculator },
            { id: 'payment', label: 'Pgto', icon: DollarSign },
            { id: 'pdf', label: 'Ver PDF', icon: Eye },
            { id: 'style', label: 'Design', icon: Palette },
            { id: 'company', label: 'Empresa', icon: ImageIcon }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`budget-mobile-nav-btn ${isActive ? 'active' : ''}`}
              >
                <div className="budget-nav-icon-wrapper">
                  <Icon size={18} />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="budget-nav-badge">{tab.badge}</span>
                  )}
                </div>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* ── MOBILE BOTTOM SHEET MODAL (ADD / EDIT SERVICE) ── */}
      {itemModalOpen && editingItemData && (
        <div className="budget-sheet-backdrop" onClick={() => setItemModalOpen(false)}>
          <div className="budget-sheet-card" onClick={(e) => e.stopPropagation()}>
            <div className="budget-sheet-handle" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                {editingItemData.id ? 'Editar Serviço' : 'Novo Serviço no Orçamento'}
              </h3>
              <button
                type="button"
                onClick={() => setItemModalOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Suggestions for new service */}
            {!editingItemData.id && (
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Sugestões Rápidas:
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {QUICK_SERVICE_SUGGESTIONS.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setEditingItemData(prev => ({
                        ...prev,
                        name: sug.name,
                        description: sug.desc,
                        price: sug.price
                      }))}
                      className="budget-chip-btn"
                      style={{ fontSize: '0.72rem', padding: '5px 10px' }}
                    >
                      + {sug.name} ({formatCurrency(sug.price)})
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Nome do Serviço ou Produto *</label>
              <input
                type="text"
                className="form-input"
                value={editingItemData.name}
                onChange={(e) => setEditingItemData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Identidade Visual Completa"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descrição dos Entregáveis (opcional)</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={editingItemData.description}
                onChange={(e) => setEditingItemData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Ex: Inclui logotipo principal, manual e arquivos vetorizados..."
              />
            </div>

            <div className="budget-grid-2" style={{ marginBottom: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Valor Unitário (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  style={{ fontSize: '1.05rem', fontWeight: 700, color: '#059669' }}
                  value={editingItemData.price}
                  onChange={(e) => setEditingItemData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Quantidade</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    className="budget-stepper-btn"
                    onClick={() => setEditingItemData(prev => ({ ...prev, quantity: Math.max(1, (parseInt(prev.quantity, 10) || 1) - 1) }))}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    style={{ textAlign: 'center', fontSize: '1rem', fontWeight: 700 }}
                    value={editingItemData.quantity}
                    onChange={(e) => setEditingItemData(prev => ({ ...prev, quantity: parseInt(e.target.value, 10) || 1 }))}
                  />
                  <button
                    type="button"
                    className="budget-stepper-btn"
                    onClick={() => setEditingItemData(prev => ({ ...prev, quantity: (parseInt(prev.quantity, 10) || 1) + 1 }))}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Total of Item */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#f8fafc', borderRadius: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Total deste item:</span>
              <strong style={{ fontSize: '1.15rem', color: '#059669', fontWeight: 800 }}>
                {formatCurrency((parseFloat(editingItemData.price) || 0) * (parseInt(editingItemData.quantity, 10) || 1))}
              </strong>
            </div>

            <button
              type="button"
              onClick={saveItemModal}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
              }}
            >
              Salvar Serviço
            </button>
          </div>
        </div>
      )}

      {/* ── GUARANTEED 100% UNTRANSFORMED OFFSCREEN EXPORT STAGE ── */}
      {/* Solves the corner grouping bug by rendering exact 794x1123px sheets without CSS scale */}
      <div 
        id="budget-export-stage" 
        style={{ 
          position: 'fixed', 
          left: '-9999px', 
          top: 0, 
          width: '794px', 
          zIndex: -9999,
          pointerEvents: 'none',
          visibility: 'visible',
          opacity: 1
        }}
      >
        {paginatedPages.map(pageData => renderPDFPage(pageData, true))}
      </div>

      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: isMobile ? '76px' : '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '10px 18px',
          borderRadius: '12px',
          background: notification.type === 'success' ? '#10b981' : notification.type === 'error' ? '#ef4444' : '#1e293b',
          color: 'white',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 9999,
          fontWeight: 600,
          fontSize: '0.82rem',
          maxWidth: '90vw'
        }}>
          {notification.type === 'success' ? <Check size={16} /> : notification.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
}
