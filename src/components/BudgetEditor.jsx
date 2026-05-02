import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  Calculator, Plus, Trash2, Download, Image, Save, RotateCcw, 
  Check, AlertCircle, Eye, Edit3, DollarSign, FileText, X
} from 'lucide-react';

const STORAGE_KEY = 'budget_data';

const initialBudgetData = {
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  projectName: '',
  projectDescription: '',
  validity: 7,
  paymentTerms: '50% na aprovação, 50% na entrega',
  additionalNotes: '',
  items: [
    { id: 1, name: 'Logomarca', description: 'Design de logo principal', price: 450, quantity: 1 },
    { id: 2, name: 'Logo Secundária', description: 'Versão alternativa do logo', price: 150, quantity: 1 },
    { id: 3, name: 'Manual de Uso', description: 'Manual de identidade visual', price: 350, quantity: 1 }
  ],
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

export default function BudgetEditor({ brandData, companyData, onBack, onSave }) {
  const [budgetData, setBudgetData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return { ...initialBudgetData, ...JSON.parse(saved) };
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

  const removeItem = (id) => {
    setBudgetData(prev => ({ ...prev, items: prev.items.filter(item => item.id !== id) }));
    setEditingItem(null);
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
    return 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
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
    <div className="sidebar">
      <div className="sidebar-header" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
        <div className="sidebar-header-row">
          <button className="sidebar-back-btn" onClick={onBack}><RotateCcw size={18} /></button>
          <div>
            <h1>Orçamento</h1>
            <p>Crie orçamentos em PDF</p>
          </div>
        </div>
      </div>

      <div className="sidebar-content">
        <div className="tab-navigation">
          <button onClick={() => setActiveTab('client')} className={`tab-nav-btn ${activeTab === 'client' ? 'active' : ''}`}>
            <FileText size={16} />
            <span>Cliente</span>
          </button>
          <button onClick={() => setActiveTab('items')} className={`tab-nav-btn ${activeTab === 'items' ? 'active' : ''}`}>
            <Calculator size={16} />
            <span>Itens</span>
          </button>
          <button onClick={() => setActiveTab('fixed')} className={`tab-nav-btn ${activeTab === 'fixed' ? 'active' : ''}`}>
            <DollarSign size={16} />
            <span>Valores Fixos</span>
          </button>
          <button onClick={() => setActiveTab('company')} className={`tab-nav-btn ${activeTab === 'company' ? 'active' : ''}`}>
            <Edit3 size={16} />
            <span>Empresa</span>
          </button>
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
              <input 
                type="number" 
                className="form-input"
                value={budgetData.validity}
                onChange={(e) => handleChange('validity', parseInt(e.target.value) || 7)}
                min="1"
              />
            </div>

            <div className="form-group">
              <label className="form-label"><DollarSign size={14} /> Forma de Pagamento</label>
              <textarea 
                className="form-textarea"
                value={budgetData.paymentTerms}
                onChange={(e) => handleChange('paymentTerms', e.target.value)}
                placeholder="Ex: 50% na aprovação, 50% na entrega"
                style={{ minHeight: '60px' }}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {budgetData.items.map((item, index) => (
                  <div key={item.id} style={{ padding: '12px', background: editingItem === item.id ? '#f0fdf4' : '#f8fafc', border: `1px solid ${editingItem === item.id ? '#10b981' : '#e2e8f0'}`, borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Item #{index + 1}</span>
                      <button onClick={() => setEditingItem(editingItem === item.id ? null : item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981' }}>
                        {editingItem === item.id ? <Eye size={14} /> : <Edit3 size={14} />}
                      </button>
                    </div>

                    {editingItem === item.id ? (
                      <>
                        <input 
                          type="text" 
                          placeholder="Nome do item"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          className="form-input"
                          style={{ marginBottom: '8px' }}
                        />
                        <input 
                          type="text" 
                          placeholder="Descrição"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          className="form-input"
                          style={{ marginBottom: '8px' }}
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                          <div>
                            <label style={{ fontSize: '0.65rem', color: '#64748b' }}>Valor (R$)</label>
                            <input 
                              type="number"
                              value={item.price}
                              onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                              className="form-input"
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '0.65rem', color: '#64748b' }}>Qtd</label>
                            <input 
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                              className="form-input"
                              min="1"
                            />
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%', padding: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem' }}>
                          <Trash2 size={12} /> Remover Item
                        </button>
                      </>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>{item.name || 'Sem nome'}</p>
                            <p style={{ fontSize: '0.7rem', color: '#64748b' }}>{item.description || 'Sem descrição'}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>{formatCurrency(item.price * item.quantity)}</p>
                            {item.quantity > 1 && (
                              <p style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{item.quantity} x {formatCurrency(item.price)}</p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {budgetData.items.length > 0 && (
              <div style={{ marginTop: '1rem', padding: '12px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>Total</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'fixed' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Valores Fixos Predefinidos</span>
              <button onClick={addFixedValue} className="btn-add-item" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}>
                <Plus size={14} /> Novo
              </button>
            </div>

            <p style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.4 }}>
              Adicione valores fixos recorrentes para adicionar rapidamente aos orçamentos.
            </p>

            {budgetData.fixedValues.length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: '#999', textAlign: 'center', padding: '20px' }}>
                Nenhum valor fixo adicionado.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {budgetData.fixedValues.map((fixed) => (
                  <div key={fixed.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ flex: 1 }}>
                      <input 
                        type="text" 
                        placeholder="Nome"
                        value={fixed.name}
                        onChange={(e) => updateFixedValue(fixed.id, 'name', e.target.value)}
                        className="form-input"
                        style={{ marginBottom: '4px', padding: '6px 8px', fontSize: '0.75rem' }}
                      />
                      <input 
                        type="number" 
                        placeholder="Valor (R$)"
                        value={fixed.price}
                        onChange={(e) => updateFixedValue(fixed.id, 'price', parseFloat(e.target.value) || 0)}
                        className="form-input"
                        style={{ padding: '6px 8px', fontSize: '0.75rem' }}
                      />
                    </div>
                    <button onClick={() => removeFixedValue(fixed.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '4px' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {budgetData.fixedValues.length > 0 && budgetData.items.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Adicionar aos Itens</span>
                <p style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.5rem' }}>
                  Clique em um valor fixo para adicioná-lo aos itens do orçamento.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {budgetData.fixedValues.map((fixed) => (
                    <button 
                      key={fixed.id}
                      onClick={() => addFixedToItems(fixed)}
                      disabled={budgetData.items.some(item => item.name === fixed.name)}
                      style={{ 
                        padding: '8px 12px', 
                        background: budgetData.items.some(item => item.name === fixed.name) ? '#e2e8f0' : '#f0fdf4',
                        color: budgetData.items.some(item => item.name === fixed.name) ? '#94a3b8' : '#10b981',
                        border: `1px solid ${budgetData.items.some(item => item.name === fixed.name) ? '#e2e8f0' : '#10b981'}`,
                        borderRadius: '20px', 
                        cursor: budgetData.items.some(item => item.name === fixed.name) ? 'not-allowed' : 'pointer',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        opacity: budgetData.items.some(item => item.name === fixed.name) ? 0.6 : 1
                      }}
                    >
                      {fixed.name} - {formatCurrency(fixed.price)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
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
          </>
        )}
      </div>
    </div>
  );

  const renderPreview = () => {
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + budgetData.validity);

    return (
      <div className="preview-container" style={{ flex: 1, padding: '2rem', background: '#e5e7eb', display: 'flex', justifyContent: 'center', overflow: 'auto' }}>
        <div id="budget-preview" style={{ width: '210mm', minHeight: '297mm', background: 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', padding: '25mm', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
            <div>
              {budgetData.logo && (
                <img src={budgetData.logo} alt="" style={{ maxWidth: '80px', maxHeight: '60px', marginBottom: '15px' }} />
              )}
              <h1 style={{ fontFamily: budgetData.companyName ? 'Inter, sans-serif' : 'Inter, sans-serif', fontSize: '1.5rem', color: '#1e293b', marginBottom: '5px' }}>
                {budgetData.companyName || 'Empresa'}
              </h1>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {budgetData.companyEmail && `${budgetData.companyEmail}`}
                {budgetData.companyPhone && ` • ${budgetData.companyPhone}`}
                {budgetData.companyWebsite && ` • ${budgetData.companyWebsite}`}
              </p>
              {budgetData.companyAddress && (
                <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>{budgetData.companyAddress}</p>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981', letterSpacing: '-0.02em' }}>ORÇAMENTO</div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                Data: {formatDate(new Date())}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Validade: {formatDate(validUntil)}
              </p>
            </div>
          </div>

          <div style={{ borderTop: '3px solid #10b981', marginBottom: '25px' }} />

          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Cliente
            </h2>
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
                {budgetData.clientName || 'Nome não especificado'}
              </p>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {budgetData.clientEmail && `${budgetData.clientEmail}`}
                {budgetData.clientPhone && ` • ${budgetData.clientPhone}`}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Projeto
            </h2>
            <p style={{ fontSize: '1rem', color: '#1e293b', fontWeight: 600, marginBottom: '8px' }}>
              {budgetData.projectName || 'Projeto'}
            </p>
            {budgetData.projectDescription && (
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>{budgetData.projectDescription}</p>
            )}
          </div>

          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Itens
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase' }}>Item</th>
                  <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', width: '60px' }}>Qtd</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', width: '100px' }}>Valor Unit.</th>
                  <th style={{ padding: '10px 8px', textAlign: 'right', fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', width: '100px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {budgetData.items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{item.name}</p>
                      {item.description && (
                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>{item.description}</p>
                      )}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>{item.quantity}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '0.85rem', color: '#64748b' }}>{formatCurrency(item.price)}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '25px' }}>
            <div style={{ width: '200px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Subtotal</span>
                <span style={{ fontSize: '0.85rem', color: '#1e293b' }}>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Desconto</span>
                <span style={{ fontSize: '0.85rem', color: '#10b981' }}>{formatCurrency(calculateDiscount())}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', background: '#f0fdf4', marginHorizontal: '-12px', paddingHorizontal: '-12px', borderRadius: '4px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>Total</span>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Forma de Pagamento
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.5 }}>{budgetData.paymentTerms || 'A definir'}</p>
          </div>

          {budgetData.additionalNotes && (
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Observações
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>{budgetData.additionalNotes}</p>
            </div>
          )}

          <div style={{ position: 'absolute', bottom: '15mm', left: '25mm', right: '25mm', paddingTop: '15px', borderTop: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'center' }}>
              Este orçamento tem validade de {budgetData.validity} dias. Após aprovação, favor entrar em contato para iniciou dos trabalhos.
            </p>
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
        gap: '0.75rem', 
        padding: '1rem', 
        borderTop: '1px solid #e2e8f0', 
        background: '#fff',
        justifyContent: 'center'
      }}>
        <button 
          onClick={() => setShowPreview(!showPreview)} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px', 
            padding: '14px 24px',
            background: '#fff',
            color: '#1e293b',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            minWidth: '140px'
          }}
        >
          <Eye size={18} />
          {showPreview ? 'Editar' : 'Visualizar'}
        </button>
        <button 
          onClick={generatePDF} 
          disabled={isGenerating || budgetData.items.length === 0} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px', 
            padding: '14px 24px',
            background: isGenerating || budgetData.items.length === 0 ? '#94a3b8' : '#10b981',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: isGenerating || budgetData.items.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            minWidth: '160px'
          }}
        >
          <Download size={18} />
          {isGenerating ? 'Gerando...' : 'Exportar PDF'}
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