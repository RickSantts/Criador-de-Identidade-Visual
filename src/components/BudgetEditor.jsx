import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  Calculator, Plus, Trash2, Download, Image, Save, RotateCcw, 
  Check, AlertCircle, Eye, Edit3, DollarSign, FileText, X, Copy, ArrowLeft
} from 'lucide-react';

const STORAGE_KEY = 'budget_data';

const PAYMENT_METHODS = [
  { id: 'pix', label: 'PIX', icon: '📱' },
  { id: 'dinheiro', label: 'Dinheiro', icon: '💵' },
  { id: 'debito', label: 'Débito', icon: '💳' },
  { id: 'credito', label: 'Crédito', icon: '💳' },
  { id: 'transferencia', label: 'Transferência', icon: '🏦' },
  { id: 'boleto', label: 'Boleto', icon: '📄' },
];

const initialBudgetData = {
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  projectName: '',
  projectDescription: '',
  validity: 7,
  paymentTerms: '',
  paymentPortions: [
    { id: 1, method: 'pix', percentage: 100, installments: 1, label: 'Pagamento Único' }
  ],
  additionalNotes: '',
  items: [],
  globalDiscount: 0,
  globalDiscountType: 'fixed',
  accentColor: '#10b981',
  fixedValues: [
    { id: 1, name: 'Logomarca', price: 120 },
    { id: 2, name: 'Cartão de Visita (100un)', price: 80 },
    { id: 3, name: 'Papel Timbrado', price: 150 }
  ],
  companyName: '',
  companyEmail: '',
  companyPhone: '',
  companyWebsite: '',
  companyAddress: '',
  logo: null
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('pt-BR');
};

export default function BudgetEditor({ brandData, companyData, initialData, onBack, onSave }) {
  const [budgetData, setBudgetData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.paymentPortions || parsed.paymentPortions.length === 0) {
          if (parsed.paymentTerms && typeof parsed.paymentTerms === 'string' && parsed.paymentTerms.length > 0) {
            return { 
              ...initialBudgetData, 
              ...parsed,
              paymentPortions: [
                { id: 1, method: 'pix', percentage: 100, installments: 1, label: parsed.paymentTerms }
              ]
            };
          }
        }
        if (parsed.paymentMethods && parsed.paymentMethods.length > 0) {
          const newPortions = parsed.paymentMethods.flatMap((pm, idx) => 
            pm.portions.map((p, pIdx) => ({
              id: idx * 10 + pIdx + 1,
              method: pm.method,
              percentage: p.percentage,
              installments: pm.installments || 1,
              label: p.label || ''
            }))
          );
          parsed.paymentPortions = newPortions.length > 0 ? newPortions : initialBudgetData.paymentPortions;
        }
        return { ...initialBudgetData, ...parsed };
      } catch (e) {
        console.error('Failed to load budget data:', e);
      }
    }
    return initialBudgetData;
  });

  const [activeTab, setActiveTab] = useState('items');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [notification, setNotification] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [idCounter, setIdCounter] = useState(0);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  useEffect(() => {
    if (initialData) {
      setBudgetData({ ...initialBudgetData, ...initialData });
    }
  }, [initialData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgetData));
  }, [budgetData]);

  const generateId = () => {
    const newId = idCounter + 1;
    setIdCounter(newId);
    return newId;
  };

  useEffect(() => {
    if (companyData && (companyData.logo || companyData.companyName || companyData.companyEmail || companyData.companyPhone || companyData.companyWebsite || companyData.companyAddress)) {
      setBudgetData(prev => ({
        ...prev,
        logo: companyData?.logo || prev.logo,
        companyName: companyData?.companyName || prev.companyName,
        companyEmail: companyData?.companyEmail || prev.companyEmail,
        companyPhone: companyData?.companyPhone || prev.companyPhone,
        companyWebsite: companyData?.companyWebsite || prev.companyWebsite,
        companyAddress: companyData?.companyAddress || prev.companyAddress
      }));
    } else if (brandData?.logo || brandData?.brandName) {
      setBudgetData(prev => ({
        ...prev,
        logo: brandData?.logo || prev.logo,
        companyName: brandData?.brandName || prev.companyName
      }));
    }
  }, [companyData?.logo, companyData?.companyName, companyData?.companyEmail, companyData?.companyPhone, companyData?.companyWebsite, companyData?.companyAddress, brandData?.logo, brandData?.brandName]);

  const notify = (message, type = 'info') => {
    const newId = idCounter + 1;
    setIdCounter(newId);
    setNotification({ id: newId, message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleChange = (field, value) => {
    setBudgetData(prev => ({ ...prev, [field]: value }));
  };

  const addItem = () => {
    const newId = generateId();
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
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleDragStartItem = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOverItem = (e, index) => {
    e.preventDefault();
  };

  const handleDropItem = (e, index) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    
    const newItems = [...budgetData.items];
    const item = newItems[draggedItemIndex];
    newItems.splice(draggedItemIndex, 1);
    newItems.splice(index, 0, item);
    
    setBudgetData(prev => ({ ...prev, items: newItems }));
    setDraggedItemIndex(null);
  };

  const removeItem = (id) => {
    setBudgetData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
    setEditingItem(null);
  };

  const duplicateItem = (id) => {
    const itemToClone = budgetData.items.find(item => item.id === id);
    if (!itemToClone) return;
    const clonedItem = {
      ...itemToClone,
      id: generateId(),
      name: itemToClone.name ? `${itemToClone.name} (Cópia)` : 'Item (Cópia)'
    };
    const itemIndex = budgetData.items.findIndex(item => item.id === id);
    const newItems = [...budgetData.items];
    newItems.splice(itemIndex + 1, 0, clonedItem);
    setBudgetData(prev => ({ ...prev, items: newItems }));
    notify('Item duplicado com sucesso!', 'success');
  };

  const addFixedValue = () => {
    const newId = generateId();
    const newFixed = {
      id: newId,
      name: '',
      price: 0
    };
    setBudgetData(prev => ({ ...prev, fixedValues: [...prev.fixedValues, newFixed] }));
  };

  const updateFixedValue = (id, field, value) => {
    setBudgetData(prev => ({
      ...prev,
      fixedValues: prev.fixedValues.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeFixedValue = (id) => {
    setBudgetData(prev => ({ ...prev, fixedValues: prev.fixedValues.filter(item => item.id !== id) }));
  };

  const addFixedToItems = (fixed) => {
    const existingItem = budgetData.items.find(item => item.name === fixed.name);
    if (existingItem) {
      notify('Item já existe na lista', 'error');
      return;
    }
    const newId = generateId();
    const newItem = {
      id: newId,
      name: fixed.name,
      description: '',
      price: fixed.price,
      quantity: 1
    };
    setBudgetData(prev => ({ ...prev, items: [...prev.items, newItem] }));
    notify(`"${fixed.name}" adicionado`, 'success');
  };

  const handleImageUpload = async (file, field) => {
    const reader = new FileReader();
    reader.onloadend = () => setBudgetData(prev => ({ ...prev, [field]: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e, field) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file, field);
    }
  };

  const calculateSubtotal = () => {
    return budgetData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    if (budgetData.globalDiscountType === 'percent') {
      return subtotal * (parseFloat(budgetData.globalDiscount) || 0) / 100;
    }
    return parseFloat(budgetData.globalDiscount) || 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const addPortion = () => {
    const newId = generateId();
    setBudgetData(prev => ({
      ...prev,
      paymentPortions: [
        ...prev.paymentPortions,
        { id: newId, method: 'pix', percentage: 50, installments: 1, label: '' }
      ]
    }));
  };

  const removePortion = (id) => {
    setBudgetData(prev => ({
      ...prev,
      paymentPortions: prev.paymentPortions.filter(p => p.id !== id)
    }));
  };

  const updatePortion = (id, field, value) => {
    setBudgetData(prev => ({
      ...prev,
      paymentPortions: prev.paymentPortions.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    }));
  };

  const getPaymentMethodLabel = (methodId) => {
    const method = PAYMENT_METHODS.find(m => m.id === methodId);
    return method ? method.label : methodId;
  };

  const getPaymentMethodIcon = (methodId) => {
    const method = PAYMENT_METHODS.find(m => m.id === methodId);
    return method ? method.icon : '💰';
  };

  const getTotalPercentage = () => {
    return budgetData.paymentPortions.reduce((sum, p) => sum + (p.percentage || 0), 0);
  };

  const renderPaymentMethodsEditor = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {budgetData.paymentPortions.map((portion, index) => (
          <div key={portion.id} style={{ padding: '14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Parcela #{index + 1}</span>
              {budgetData.paymentPortions.length > 1 && (
                <button 
                  onClick={() => removePortion(portion.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '4px' }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <label style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '4px', display: 'block' }}>Forma de Pagamento</label>
                <select 
                  value={portion.method}
                  onChange={(e) => updatePortion(portion.id, 'method', e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem', background: 'white' }}
                >
                  {PAYMENT_METHODS.map(m => (
                    <option key={m.id} value={m.id}>{m.icon} {m.label}</option>
                  ))}
                </select>
              </div>

              {(portion.method === 'credito' || portion.method === 'debito') ? (
                <div>
                  <label style={{ fontSize: '0.65rem', color: '#64748b', marginBottom: '4px', display: 'block' }}>Parcelas</label>
                  <select 
                    value={portion.installments || 1}
                    onChange={(e) => updatePortion(portion.id, 'installments', parseInt(e.target.value))}
                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem', background: 'white' }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                      <option key={n} value={n}>{n}x</option>
                    ))}
                  </select>
                  {portion.method === 'credito' && portion.installments > 1 && (
                    <p style={{ fontSize: '0.6rem', color: '#f59e0b', marginTop: '4px', fontStyle: 'italic' }}>
                      Obs: Juros da maquininha são pagos pelo cliente
                    </p>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', background: '#f1f5f9', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{portion.installments > 1 ? `${portion.installments}x` : 'À vista'}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ flex: '0 0 60px' }}>
                <input 
                  type="number"
                  value={portion.percentage}
                  onChange={(e) => updatePortion(portion.id, 'percentage', parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem', textAlign: 'center' }}
                />
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>%</span>
              <input 
                type="text"
                value={portion.label}
                onChange={(e) => updatePortion(portion.id, 'label', e.target.value)}
                placeholder="Ex: Na aprovação, Na entrega..."
                style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}
              />
              <div style={{ minWidth: '85px', textAlign: 'right' }}>
                <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
                  {formatCurrency(calculateTotal() * portion.percentage / 100)}
                </span>
              </div>
            </div>
          </div>
        ))}

        <button 
          onClick={addPortion}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', background: 'white', color: '#10b981', border: '2px dashed #10b981', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
        >
          <Plus size={16} /> Adicionar Parcela
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: getTotalPercentage() === 100 ? '#f0fdf4' : '#fef3c7', borderRadius: '8px', border: `1px solid ${getTotalPercentage() === 100 ? '#10b981' : '#f59e0b'}` }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>Total Distribuído</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: getTotalPercentage() === 100 ? '#10b981' : '#f59e0b' }}>
            {getTotalPercentage()}%
          </span>
        </div>
      </div>
    );
  };

  const generatePDF = async () => {
    const wasPreview = showPreview;
    if (!wasPreview) {
      setShowPreview(true);
      // Wait for the state update and render
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setIsGenerating(true);
    
    try {
      if (document.fonts) await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 100));

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const previewEl = document.getElementById('budget-preview');
      
      if (!previewEl) {
        throw new Error('Preview element not found');
      }

      const canvas = await html2canvas(previewEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: previewEl.offsetWidth,
        height: previewEl.offsetHeight,
        windowWidth: previewEl.scrollWidth,
        windowHeight: previewEl.scrollHeight
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

      const fileName = `Orçamento_${budgetData.clientName || budgetData.projectName || 'Projeto'}.pdf`;
      pdf.save(fileName);
      
      // Salvar na galeria
      if (onSave) {
        onSave({
          id: Date.now(),
          type: 'budget',
          title: budgetData.projectName || budgetData.clientName || 'Orçamento',
          client: budgetData.clientName,
          project: budgetData.projectName,
          total: calculateTotal(),
          data: { ...budgetData },
          timestamp: new Date().toISOString()
        });
      }
      
      notify('PDF exportado com sucesso!', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      notify('Erro ao gerar PDF: ' + error.message, 'error');
    } finally {
      setIsGenerating(false);
      // Don't switch back automatically as the user might want to see the preview
    }
  };

  const renderSidebar = () => (
    <div className="sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fcfcfd' }}>
      <div className="sidebar-header" style={{ 
        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        padding: '1.5rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(40px)' }} />
        <div className="sidebar-header-row" style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              className="sidebar-back-btn" 
              onClick={onBack}
              title="Voltar ao Hub"
              style={{ 
                background: 'rgba(255,255,255,0.2)', 
                border: 'none', 
                borderRadius: '10px', 
                padding: '8px', 
                color: 'white', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                transition: 'all 0.2s ease'
              }}
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>Orçamento Profissional</h1>
              <p style={{ fontSize: '0.75rem', opacity: 0.9, margin: '2px 0 0 0' }}>Gestão de propostas e valores</p>
            </div>
          </div>
          
          <button 
            onClick={() => {
              if (window.confirm('Tem certeza que deseja limpar todo o orçamento atual e começar um novo?')) {
                setBudgetData(initialBudgetData);
                localStorage.removeItem(STORAGE_KEY);
                notify('Orçamento resetado!', 'info');
              }
            }}
            title="Começar Novo Orçamento"
            style={{ 
              background: 'rgba(255,255,255,0.15)', 
              border: 'none', 
              borderRadius: '10px', 
              padding: '8px 12px', 
              color: 'white', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
              transition: 'all 0.2s ease'
            }}
          >
            <RotateCcw size={14} />
            Novo
          </button>
        </div>
      </div>

      <div className="sidebar-content" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
        <div className="tab-navigation" style={{ 
          display: 'flex', 
          gap: '4px', 
          marginBottom: '1.5rem', 
          background: '#f1f5f9', 
          padding: '4px', 
          borderRadius: '12px',
          overflowX: 'auto'
        }}>
          {[
            { id: 'client', icon: FileText, label: 'Cliente' },
            { id: 'items', icon: Calculator, label: 'Itens' },
            { id: 'payment', icon: DollarSign, label: 'Pgto' },
            { id: 'fixed', icon: Edit3, label: 'Fixos' },
            { id: 'company', icon: Image, label: 'Empresa' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`tab-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 4px',
                border: 'none',
                borderRadius: '8px',
                background: activeTab === tab.id ? 'white' : 'transparent',
                color: activeTab === tab.id ? '#059669' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
                minWidth: '60px'
              }}
            >
              <tab.icon size={16} />
              <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'client' && (
          <>
            <div className="form-group">
              <label className="form-label"><FileText size={14} /> Nome do Cliente</label>
              <input 
                type="text" 
                className="form-input"
                value={budgetData.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
                placeholder="Nome ou empresas"
              />
            </div>

            <div className="form-group">
              <label className="form-label"><Image size={14} /> E-mail</label>
              <input 
                type="email" 
                className="form-input"
                value={budgetData.clientEmail}
                onChange={(e) => handleChange('clientEmail', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label"><Image size={14} /> Telefone</label>
              <input 
                type="text" 
                className="form-input"
                value={budgetData.clientPhone}
                onChange={(e) => handleChange('clientPhone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="form-group">
              <label className="form-label"><FileText size={14} /> Nome do Projeto</label>
              <input 
                type="text" 
                className="form-input"
                value={budgetData.projectName}
                onChange={(e) => handleChange('projectName', e.target.value)}
                placeholder="Projeto"
              />
            </div>

            <div className="form-group">
              <label className="form-label"><Edit3 size={14} /> Descrição do Projeto</label>
              <textarea 
                className="form-textarea"
                value={budgetData.projectDescription}
                onChange={(e) => handleChange('projectDescription', e.target.value)}
                placeholder="Descrição do projeto..."
                style={{ minHeight: '80px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label"><Calculator size={14} /> Validade (dias)</label>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                {[5, 7, 15, 30].map(days => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => handleChange('validity', days)}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: budgetData.validity === days ? `${budgetData.accentColor || '#10b981'}15` : '#f1f5f9',
                      border: budgetData.validity === days ? `1px solid ${budgetData.accentColor || '#10b981'}` : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: budgetData.validity === days ? (budgetData.accentColor || '#10b981') : '#64748b',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    {days}d
                  </button>
                ))}
              </div>
              <input 
                type="number" 
                className="form-input"
                value={budgetData.validity}
                onChange={(e) => handleChange('validity', parseInt(e.target.value) || 7)}
                min="1"
              />
            </div>

            <div className="form-group">
              <label className="form-label"><AlertCircle size={14} /> Observações Adicionais</label>
              <textarea 
                className="form-textarea"
                value={budgetData.additionalNotes}
                onChange={(e) => handleChange('additionalNotes', e.target.value)}
                placeholder="Observações..."
                style={{ minHeight: '60px' }}
              />
            </div>
          </>
        )}

        {activeTab === 'payment' && (
          <>
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Configuração de Pagamento</span>
              <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                Adicione diferentes formas de pagamento e divida em parcelas.
              </p>
            </div>

            <div style={{ marginBottom: '1rem', padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>Total do Orçamento</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>

            {renderPaymentMethodsEditor()}
          </>
        )}

        {activeTab === 'items' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Itens do Orçamento</span>
              <button onClick={addItem} className="btn-add-item" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>
                <Plus size={14} /> Adicionar
              </button>
            </div>

            {budgetData.items.length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: '#999', textAlign: 'center', padding: '20px' }}>
                Nenhum item adicionado. Clique em "Adicionar" para criar um item.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {budgetData.items.map((item, index) => (
                  <div 
                    key={item.id} 
                    draggable
                    onDragStart={(e) => handleDragStartItem(e, index)}
                    onDragOver={(e) => handleDragOverItem(e, index)}
                    onDrop={(e) => handleDropItem(e, index)}
                    style={{ 
                    padding: '16px', 
                    background: editingItem === item.id ? '#ffffff' : (draggedItemIndex === index ? '#f1f5f9' : '#f8fafc'), 
                    border: `1px solid ${editingItem === item.id ? (budgetData.accentColor || '#10b981') : '#e2e8f0'}`, 
                    borderRadius: '16px',
                    boxShadow: editingItem === item.id ? `0 10px 20px ${(budgetData.accentColor || '#10b981')}15` : 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: editingItem === item.id ? 'default' : 'grab',
                    opacity: draggedItemIndex === index ? 0.5 : 1
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editingItem === item.id ? '12px' : '0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', background: editingItem === item.id ? (budgetData.accentColor || '#10b981') : '#e2e8f0', color: editingItem === item.id ? 'white' : '#64748b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                          {index + 1}
                        </div>
                        {!editingItem || editingItem !== item.id ? (
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{item.name || 'Novo Item'}</span>
                        ) : null}
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          onClick={() => setEditingItem(editingItem === item.id ? null : item.id)} 
                          style={{ 
                            background: editingItem === item.id ? `${budgetData.accentColor || '#10b981'}15` : 'transparent', 
                            border: 'none', 
                            borderRadius: '8px',
                            padding: '6px',
                            cursor: 'pointer', 
                            color: editingItem === item.id ? (budgetData.accentColor || '#10b981') : '#94a3b8',
                            transition: 'all 0.2s'
                          }}
                        >
                          {editingItem === item.id ? <Check size={16} /> : <Edit3 size={16} />}
                        </button>
                        {editingItem === item.id && (
                          <>
                            <button 
                              onClick={() => duplicateItem(item.id)} 
                              style={{ 
                                background: '#f0fdf4', 
                                border: 'none', 
                                borderRadius: '8px',
                                padding: '6px',
                                cursor: 'pointer', 
                                color: '#10b981',
                                marginRight: '4px'
                              }}
                              title="Duplicar item"
                            >
                              <Copy size={16} />
                            </button>
                            <button 
                              onClick={() => removeItem(item.id)} 
                              style={{ 
                                background: '#fef2f2', 
                                border: 'none', 
                                borderRadius: '8px',
                                padding: '6px',
                                cursor: 'pointer', 
                                color: '#ef4444' 
                              }}
                              title="Excluir item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {editingItem === item.id ? (
                      <div className="animate-fade-in">
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>Nome do Serviço</label>
                          <input 
                            type="text" 
                            placeholder="Ex: Identidade Visual"
                            value={item.name}
                            onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                            className="form-input"
                            style={{ background: '#f9fafb' }}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>Descrição</label>
                          <input 
                            type="text" 
                            placeholder="Breve detalhamento..."
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            className="form-input"
                            style={{ background: '#f9fafb' }}
                          />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <div>
                            <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>Preço (R$)</label>
                            <input 
                              type="number"
                              value={item.price}
                              onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                              className="form-input"
                              style={{ background: '#f9fafb' }}
                            />
                          </div>
                          <div>
                            <label className="form-label" style={{ fontSize: '0.7rem', marginBottom: '4px' }}>Quantidade</label>
                            <input 
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                              className="form-input"
                              style={{ background: '#f9fafb' }}
                              min="1"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          {item.description && <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{item.description}</p>}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '1rem', fontWeight: 700, color: '#10b981' }}>{formatCurrency(item.price * item.quantity)}</p>
                          {item.quantity > 1 && (
                            <p style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{item.quantity} un x {formatCurrency(item.price)}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {budgetData.items.length > 0 && (
              <div style={{ marginTop: '2rem', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem', display: 'block', color: '#1e293b' }}>Desconto Global</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select 
                    className="form-input" 
                    style={{ width: '80px', padding: '8px', background: 'white' }}
                    value={budgetData.globalDiscountType}
                    onChange={(e) => handleChange('globalDiscountType', e.target.value)}
                  >
                    <option value="fixed">R$</option>
                    <option value="percent">%</option>
                  </select>
                  <input 
                    type="number"
                    className="form-input"
                    style={{ flex: 1, background: 'white' }}
                    placeholder="0,00"
                    value={budgetData.globalDiscount || ''}
                    onChange={(e) => handleChange('globalDiscount', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
            )}
          </>
        )}
        {activeTab === 'fixed' && (
          <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>Valores Predefinidos</span>
              <button 
                onClick={addFixedValue} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '8px 16px', 
                  background: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '10px', 
                  cursor: 'pointer', 
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)'
                }}
              >
                <Plus size={14} /> Novo Valor
              </button>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Salve seus serviços recorrentes para adicioná-los rapidamente aos novos orçamentos.
            </p>

            {budgetData.fixedValues.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #e2e8f0' }}>
                <Edit3 size={24} style={{ color: '#cbd5e1', marginBottom: '8px' }} />
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Nenhum valor salvo</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {budgetData.fixedValues.map((fixed) => (
                  <div key={fixed.id} style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '8px', 
                    padding: '14px', 
                    background: '#ffffff', 
                    borderRadius: '14px', 
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <input 
                        type="text" 
                        placeholder="Nome do serviço"
                        value={fixed.name}
                        onChange={(e) => updateFixedValue(fixed.id, 'name', e.target.value)}
                        className="form-input"
                        style={{ border: 'none', padding: '0', fontSize: '0.85rem', fontWeight: 600, background: 'transparent' }}
                      />
                      <button 
                        onClick={() => removeFixedValue(fixed.id)} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', padding: '4px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>R$</span>
                      <input 
                        type="number" 
                        placeholder="0,00"
                        value={fixed.price}
                        onChange={(e) => updateFixedValue(fixed.id, 'price', parseFloat(e.target.value) || 0)}
                        className="form-input"
                        style={{ border: 'none', padding: '0', fontSize: '0.9rem', fontWeight: 700, color: '#10b981', background: 'transparent' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {budgetData.fixedValues.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem', display: 'block' }}>Rápido Adicionar</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {budgetData.fixedValues.map((fixed) => (
                    <button 
                      key={fixed.id}
                      onClick={() => addFixedToItems(fixed)}
                      disabled={budgetData.items.some(item => item.name === fixed.name)}
                      style={{ 
                        padding: '8px 14px', 
                        background: budgetData.items.some(item => item.name === fixed.name) ? '#f1f5f9' : '#ecfdf5',
                        color: budgetData.items.some(item => item.name === fixed.name) ? '#94a3b8' : '#059669',
                        border: 'none',
                        borderRadius: '10px', 
                        cursor: budgetData.items.some(item => item.name === fixed.name) ? 'not-allowed' : 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                      }}
                    >
                      {fixed.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'company' && (
          <>
            <div className="form-group">
              <label className="form-label"><FileText size={14} /> Nome da Empresa</label>
              <input 
                type="text" 
                className="form-input"
                value={budgetData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="Sua empresa"
              />
            </div>

            <div className="form-group">
              <label className="form-label"><Image size={14} /> Logo</label>
              <div 
                className="drop-zone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'logo')}
                style={{ minHeight: '60px' }}
              >
                {budgetData.logo ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={budgetData.logo} alt="" style={{ maxWidth: '80%', maxHeight: '50px' }} />
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleChange('logo', null); }}
                      style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Image size={20} style={{ color: '#ccc' }} />
                    <span style={{ fontSize: '0.65rem', color: '#999' }}>Arraste ou clique</span>
                    <input type="file" accept="image/*" onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], 'logo')} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                  </>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label"><Image size={14} /> E-mail</label>
              <input 
                type="email" 
                className="form-input"
                value={budgetData.companyEmail}
                onChange={(e) => handleChange('companyEmail', e.target.value)}
                placeholder="seu@email.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label"><Image size={14} /> Telefone</label>
              <input 
                type="text" 
                className="form-input"
                value={budgetData.companyPhone}
                onChange={(e) => handleChange('companyPhone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="form-group">
              <label className="form-label"><Image size={14} /> Website</label>
              <input 
                type="text" 
                className="form-input"
                value={budgetData.companyWebsite}
                onChange={(e) => handleChange('companyWebsite', e.target.value)}
                placeholder="www.seusite.com.br"
              />
            </div>

            <div className="form-group">
              <label className="form-label"><FileText size={14} /> Endereço</label>
              <textarea 
                className="form-textarea"
                value={budgetData.companyAddress}
                onChange={(e) => handleChange('companyAddress', e.target.value)}
                placeholder="Endereço da empresa..."
                style={{ minHeight: '60px' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cor de Destaque</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="color" 
                  value={budgetData.accentColor || '#10b981'}
                  onChange={(e) => handleChange('accentColor', e.target.value)}
                  style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{budgetData.accentColor || '#10b981'}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderPreview = () => {
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + budgetData.validity);

    return (
      <div className="preview-container" style={{ 
        flex: 1, 
        padding: '3rem 2rem', 
        background: '#f1f5f9', 
        display: 'flex', 
        justifyContent: 'center', 
        overflow: 'auto',
        perspective: '1000px'
      }}>
        <div id="budget-preview" style={{ 
          width: '210mm', 
          minHeight: '297mm', 
          background: 'white', 
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', 
          padding: '25mm', 
          position: 'relative',
          borderRadius: '4px'
        }}>
          {/* Subtle Background Pattern */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', background: `linear-gradient(90deg, ${budgetData.accentColor || '#10b981'}, ${budgetData.accentColor || '#059669'})` }} />
          <div style={{ position: 'absolute', top: '10mm', right: '10mm', width: '100mm', height: '100mm', background: `radial-gradient(circle, ${budgetData.accentColor || '#10b981'}08 0%, transparent 70%)`, zIndex: 0 }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ height: '60px', display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                {budgetData.logo ? (
                  <img src={budgetData.logo} alt="" style={{ maxHeight: '100%', maxWidth: '120px', objectFit: 'contain' }} />
                ) : (
                  <div style={{ padding: '8px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                    LOGO MARCA
                  </div>
                )}
              </div>
              <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                {budgetData.companyName || 'Sua Empresa'}
              </h1>
              <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.6 }}>
                {budgetData.companyEmail && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{budgetData.companyEmail}</div>}
                {budgetData.companyPhone && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{budgetData.companyPhone}</div>}
                {budgetData.companyWebsite && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>{budgetData.companyWebsite}</div>}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: budgetData.accentColor || '#059669', letterSpacing: '-0.04em', lineHeight: 0.9 }}>PROPOSTA</div>
              <div style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b', letterSpacing: '0.3em', marginTop: '6px', textTransform: 'uppercase' }}>COMERCIAL</div>
              
              <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Emissão</div>
                <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 }}>{formatDate(new Date())}</div>
                
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginTop: '12px' }}>Válido até</div>
                <div style={{ fontSize: '0.9rem', color: budgetData.accentColor || '#059669', fontWeight: 700 }}>{formatDate(validUntil)}</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '12px', letterSpacing: '0.05em' }}>Cliente</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                {budgetData.clientName || 'Nome do Cliente'}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {budgetData.clientEmail && <span>{budgetData.clientEmail}</span>}
                {budgetData.clientPhone && <span>{budgetData.clientPhone}</span>}
              </div>
            </div>
            <div style={{ padding: '8px 0' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '12px', letterSpacing: '0.05em' }}>Projeto</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                {budgetData.projectName || 'Identidade Visual Premium'}
              </div>
              {budgetData.projectDescription && (
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>{budgetData.projectDescription}</p>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '40px', position: 'relative', zIndex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>Serviços</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', width: '80px' }}>Qtd</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', width: '120px' }}>Valor Unit.</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em', width: '140px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {budgetData.items.map((item) => (
                  <tr key={item.id} style={{ transition: 'all 0.2s' }}>
                    <td style={{ padding: '16px', background: '#fff', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', borderLeft: '1px solid #f1f5f9', borderRadius: '12px 0 0 12px' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{item.name}</div>
                      {item.description && (
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>{item.description}</div>
                      )}
                    </td>
                    <td style={{ padding: '16px', background: '#fff', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', textAlign: 'center', fontSize: '1rem', color: '#475569', fontWeight: 500 }}>{item.quantity}</td>
                    <td style={{ padding: '16px', background: '#fff', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontSize: '1rem', color: '#475569' }}>{formatCurrency(item.price)}</td>
                    <td style={{ padding: '16px', background: '#fff', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9', borderRadius: '0 12px 12px 0', textAlign: 'right', fontSize: '1.1rem', fontWeight: 800, color: budgetData.accentColor || '#059669' }}>{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
            <div style={{ width: '280px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', border: '1px solid rgba(255,255,255,0.05)', padding: '24px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>Subtotal</span>
                <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>Desconto</span>
                <span style={{ fontSize: '0.9rem', color: budgetData.accentColor || '#10b981', fontWeight: 700 }}>{formatCurrency(calculateDiscount())}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 900, color: budgetData.accentColor || '#10b981', lineHeight: 1 }}>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '16px', letterSpacing: '0.05em' }}>Condições de Pagamento</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {budgetData.paymentPortions?.map((portion, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.25rem' }}>{getPaymentMethodIcon(portion.method)}</span>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>{getPaymentMethodLabel(portion.method)} {portion.installments > 1 ? `(${portion.installments}x)` : ''}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{portion.percentage}% {portion.label ? `• ${portion.label}` : ''}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{formatCurrency(calculateTotal() * portion.percentage / 100)}</div>
                    </div>
                    {(portion.method === 'credito' || portion.method === 'debito') && portion.installments > 1 && (
                      <div style={{ fontSize: '0.6rem', color: '#f59e0b', fontWeight: 600, marginTop: '4px', borderTop: '1px dashed #e2e8f0', paddingTop: '4px' }}>
                        * Juros da maquininha por conta do cliente
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {budgetData.additionalNotes && (
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, marginBottom: '16px', letterSpacing: '0.05em' }}>Observações</div>
                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{budgetData.additionalNotes}</p>
              </div>
            )}
          </div>



          <div style={{ position: 'absolute', bottom: '15mm', left: '25mm', right: '25mm', borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.65rem', color: '#94a3b8', maxWidth: '300px', lineHeight: 1.5 }}>
              Proposta sujeita a alterações caso haja mudança no escopo. {budgetData.validity} dias de validade.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', background: budgetData.accentColor || '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Check size={16} />
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase' }}>Documento Autenticado</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      
      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {showPreview ? renderPreview() : renderSidebar()}
      </div>

      {/* Bottom Action Bar - Always Visible */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        padding: '1.25rem 2rem', 
        borderTop: '1px solid #f1f5f9', 
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(20px)',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <button 
          onClick={() => setShowPreview(!showPreview)} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '10px', 
            padding: '12px 28px',
            background: '#fff',
            color: '#475569',
            border: '1.5px solid #e2e8f0',
            borderRadius: '14px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 700,
            minWidth: '160px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s ease'
          }}
          className="hover-lift"
        >
          {showPreview ? <Edit3 size={20} /> : <Eye size={20} />}
          {showPreview ? 'Voltar a Editar' : 'Visualizar Proposta'}
        </button>
        <button 
          onClick={generatePDF} 
          disabled={isGenerating || budgetData.items.length === 0} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '10px', 
            padding: '12px 32px',
            background: isGenerating || budgetData.items.length === 0 ? '#cbd5e1' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '14px',
            cursor: isGenerating || budgetData.items.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '0.95rem',
            fontWeight: 700,
            minWidth: '200px',
            boxShadow: isGenerating || budgetData.items.length === 0 ? 'none' : '0 10px 15px -3px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.2s ease'
          }}
          className="hover-lift"
        >
          <Download size={20} />
          {isGenerating ? 'Preparando Arquivo...' : 'Exportar Orçamento PDF'}
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          borderRadius: '12px',
          background: notification.type === 'success' ? '#10b981' : notification.type === 'error' ? '#ef4444' : '#1e293b',
          color: 'white',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 99,
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          {notification.type === 'success' ? <Check size={18} /> : notification.type === 'error' ? <AlertCircle size={18} /> : <Calculator size={18} />}
          {notification.message}
        </div>
      )}
    </div>
  );
}