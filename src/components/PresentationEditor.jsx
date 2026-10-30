import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Palette, Type, ChevronDown, ChevronUp, FileText, Layout, Info, CheckCircle2 } from 'lucide-react';

const PAGES = [
  { id: 'cover', name: 'Capa', icon: '🎨' },
  { id: 'concept', name: 'Conceito & Logo', icon: '💡' },
  { id: 'visuals', name: 'Identidade Visual', icon: '👁️' },
  { id: 'deliverables', name: 'Entregáveis', icon: '📦' },
  { id: 'notes', name: 'Observações Finais', icon: '📝' },
];

const SectionHeader = ({ id, icon, title, children, expandedSection, onToggle }) => (
  <div className="social-editor-section">
    <button className="social-section-toggle" onClick={() => onToggle(id)}>
      <span className="social-section-toggle-left">{icon}<span>{title}</span></span>
      {expandedSection === id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
    </button>
    {expandedSection === id && <div className="social-section-content">{children}</div>}
  </div>
);

export default function PresentationEditor({ brandData }) {
  const [activePage, setActivePage] = useState('cover');
  const [rationale, setRationale] = useState('O design foi desenvolvido focando em modernidade e minimalismo, utilizando formas geométricas equilibradas para transmitir confiança e inovação.');
  const [conceptTitle, setConceptTitle] = useState('Conceito de Design');
  const [clientName, setClientName] = useState('Nome do Cliente');
  const [projectDate, setProjectDate] = useState(new Date().toLocaleDateString('pt-BR'));
  const [deliverableNotes, setDeliverableNotes] = useState('Todos os arquivos foram exportados em alta resolução (300 DPI) para garantir a melhor qualidade de impressão e uso digital.');
  const [expandedSection, setExpandedSection] = useState('content');
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef(null);

  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      // We will loop through each page to generate the full PDF
      for (let i = 0; i < PAGES.length; i++) {
        const pageId = PAGES[i].id;
        setActivePage(pageId);
        
        // Small delay to ensure render
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const canvas = await html2canvas(previewRef.current, {
          scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }
      
      pdf.save(`${brandData?.brandName || 'projeto'}_apresentacao.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleSection = (s) => setExpandedSection(prev => prev === s ? null : s);

  const primaryColor = brandData?.color1 || '#1a1a1a';
  const secondaryColor = brandData?.color2 || '#4f46e5';

  const renderPageContent = () => {
    switch (activePage) {
      case 'cover':
        return (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', textAlign: 'center', background: `linear-gradient(135deg, ${primaryColor}05, ${secondaryColor}05)` }}>
            {brandData?.logo && (
              <img src={brandData.logo} alt="" style={{ width: '120px', marginBottom: '30px' }} />
            )}
            <h1 style={{ fontFamily: brandData?.headingFont || 'Inter', fontSize: '32px', fontWeight: 800, color: primaryColor, marginBottom: '10px' }}>
              {brandData?.brandName || 'Sua Marca'}
            </h1>
            <div style={{ width: '60px', height: '4px', background: primaryColor, marginBottom: '30px' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 500, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Apresentação do Projeto</h2>
            <div style={{ marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: '20px', width: '100%', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
              <span>Cliente: {clientName}</span>
              <span>Data: {projectDate}</span>
            </div>
          </div>
        );

      case 'concept':
        return (
          <div style={{ padding: '40px' }}>
            <h3 style={{ fontFamily: brandData?.headingFont || 'Inter', fontSize: '20px', fontWeight: 700, color: primaryColor, borderBottom: `2px solid ${primaryColor}20`, paddingBottom: '10px', marginBottom: '20px' }}>
              {conceptTitle}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'center' }}>
              {brandData?.logo && (
                <div style={{ background: '#f8fafc', padding: '30px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                  <img src={brandData.logo} alt="" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                </div>
              )}
              <div style={{ fontFamily: brandData?.bodyFont || 'Inter', fontSize: '12px', lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-wrap' }}>
                {rationale}
              </div>
            </div>
            <div style={{ marginTop: '40px', padding: '20px', background: `${primaryColor}08`, borderRadius: '8px', borderLeft: `4px solid ${primaryColor}` }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: primaryColor, marginBottom: '8px' }}>Direcionamento Criativo</h4>
              <p style={{ fontSize: '11px', color: '#475569' }}>
                A solução visual foi pensada para se destacar no mercado, mantendo a legibilidade e a versatilidade necessária para diversas aplicações.
              </p>
            </div>
          </div>
        );

      case 'visuals':
        return (
          <div style={{ padding: '40px' }}>
             <h3 style={{ fontFamily: brandData?.headingFont || 'Inter', fontSize: '20px', fontWeight: 700, color: primaryColor, borderBottom: `2px solid ${primaryColor}20`, paddingBottom: '10px', marginBottom: '20px' }}>
              Elementos da Marca
            </h3>
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>Paleta de Cores</h4>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[brandData?.color1, brandData?.color2, brandData?.color3, brandData?.color4, brandData?.color5].filter(Boolean).map((c, i) => (
                  <div key={i} style={{ flex: 1, height: '80px', borderRadius: '8px', background: c, display: 'flex', alignItems: 'flex-end', padding: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: '9px', fontWeight: 600, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>Tipografia</h4>
              <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div style={{ marginBottom: '15px' }}>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>Principal: {brandData?.headingFont || 'Inter'}</span>
                  <div style={{ fontFamily: brandData?.headingFont || 'Inter', fontSize: '24px', fontWeight: 700, color: primaryColor }}>Aa Bb Cc Dd 0123</div>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>Auxiliar: {brandData?.bodyFont || 'Inter'}</span>
                  <div style={{ fontFamily: brandData?.bodyFont || 'Inter', fontSize: '18px', color: '#334155' }}>Aa Bb Cc Dd 0123</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'deliverables':
        return (
          <div style={{ padding: '40px' }}>
            <h3 style={{ fontFamily: brandData?.headingFont || 'Inter', fontSize: '20px', fontWeight: 700, color: primaryColor, borderBottom: `2px solid ${primaryColor}20`, paddingBottom: '10px', marginBottom: '20px' }}>
              Aplicações e Entregáveis
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '25px' }}>
              {['Social Media', 'Banners', 'Camisa', 'Cartão', 'Timbrado', 'Adesivo'].map((item, i) => (
                <div key={i} style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', border: '1px solid #e2e8f0' }}>
                  <CheckCircle2 size={16} color={primaryColor} />
                  <span style={{ fontSize: '11px', fontWeight: 500, color: '#334155' }}>{item}</span>
                  <span style={{ fontSize: '8px', color: '#94a3b8' }}>V1 Final</span>
                </div>
              ))}
            </div>
            <div style={{ padding: '15px', background: '#f1f5f9', borderRadius: '8px', fontSize: '11px', color: '#475569', lineHeight: 1.6 }}>
              <strong>Notas de Entrega:</strong><br />
              {deliverableNotes}
            </div>
          </div>
        );

      case 'notes':
        return (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '40px', background: primaryColor, color: '#fff' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>Considerações Finais</h3>
            <div style={{ fontSize: '13px', lineHeight: 1.8, color: 'rgba(255,255,255,0.8)', flex: 1 }}>
              Ficamos felizes em entregar este projeto. Esperamos que esta nova identidade visual traga resultados excelentes para o seu negócio.
              <br /><br />
              Quaisquer dúvidas sobre a aplicação da marca ou necessidade de novos materiais, nossa equipe está à disposição.
            </div>
            <div style={{ padding: '30px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{brandData?.brandName}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>contato@suaagencia.com.br</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>www.suaagencia.com.br</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="social-editor">
      <div className="social-editor-sidebar">
        <div className="social-editor-header">
          <h2>💼 Apresentação</h2>
          <p>Documento de entrega profissional do projeto</p>
        </div>

        <div className="social-editor-controls">
          <SectionHeader 
            id="pages" 
            icon={<Layout size={14} />} 
            title="Páginas do Documento"
            expandedSection={expandedSection}
            onToggle={toggleSection}
          >
            <div className="social-format-grid">
              {PAGES.map(p => (
                <button key={p.id} className={`social-format-btn ${activePage === p.id ? 'active' : ''}`} onClick={() => setActivePage(p.id)}>
                  <span className="social-format-icon">{p.icon}</span>
                  <span className="social-format-name">{p.name}</span>
                </button>
              ))}
            </div>
          </SectionHeader>

          <SectionHeader 
            id="content" 
            icon={<FileText size={14} />} 
            title="Conteúdo"
            expandedSection={expandedSection}
            onToggle={toggleSection}
          >
            <div className="social-texts-controls">
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b' }}>Nome do Cliente</label>
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="form-input" />
              
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', marginTop: '10px' }}>Título do Conceito</label>
              <input type="text" value={conceptTitle} onChange={e => setConceptTitle(e.target.value)} className="form-input" />
              
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', marginTop: '10px' }}>Racional do Design</label>
              <textarea value={rationale} onChange={e => setRationale(e.target.value)} className="form-textarea" style={{ minHeight: '120px' }} />
              
              <label style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', marginTop: '10px' }}>Notas de Entrega</label>
              <textarea value={deliverableNotes} onChange={e => setDeliverableNotes(e.target.value)} className="form-textarea" style={{ minHeight: '80px' }} />
            </div>
          </SectionHeader>
        </div>

        <div className="social-editor-actions">
          <button className="btn btn-primary" onClick={handleExportPDF} disabled={isExporting} style={{ flex: 1 }}>
            <Download size={16} /> {isExporting ? 'Gerando Documento...' : 'Exportar Apresentação PDF'}
          </button>
        </div>
      </div>

      <div className="social-editor-preview">
        <div className="social-preview-label">
          <span className="social-preview-format-badge">📄 Apresentação Profissional</span>
          <span className="social-preview-dimensions">A4 — 210 × 297mm</span>
        </div>
        <div
          ref={previewRef}
          className="presentation-canvas"
          style={{
            width: 340,
            height: 480,
            background: '#ffffff',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '8px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          {renderPageContent()}
          
          {/* Page numbering in preview */}
          <div style={{ position: 'absolute', bottom: '10px', right: '15px', fontSize: '8px', color: activePage === 'notes' ? 'rgba(255,255,255,0.5)' : '#94a3b8' }}>
            Página {PAGES.findIndex(p => p.id === activePage) + 1} de {PAGES.length}
          </div>
        </div>
      </div>
    </div>
  );
}
