import React, { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'

const FullscreenPreview = ({ formData, pageCount, onClose }) => {
  const [activePage, setActivePage] = useState(0);

  const pages = [
    { component: 'cover', title: 'Capa' },
    { component: 'logoSystem', title: 'Sistema de Logos' },
    { component: 'colors', title: 'Cores' },
    { component: 'typography', title: 'Tipografia' },
    { component: 'variations', title: 'Variações' },
    { component: 'applications', title: 'Aplicações' },
    { component: 'brandDNA', title: 'DNA da Marca' }
  ];

  const renderPage = (pageComponent) => {
    switch(pageComponent) {
      case 'cover':
        return (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '40px', background: formData.template === 'modern' ? `linear-gradient(135deg, ${formData.color1}20, ${formData.color2}20)` : 'white' }}>
            {formData.logo && <img src={formData.logo} alt="Logo" style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'contain', marginBottom: '30px' }} />}
            <h1 style={{ fontFamily: formData.headingFont, fontSize: '2.5rem', color: formData.color1, marginBottom: '10px' }}>{formData.brandName || 'Nome da Marca'}</h1>
            <p style={{ fontFamily: formData.bodyFont, fontSize: '1.2rem', color: formData.color2, marginBottom: '30px' }}>Manual de Identidade Visual</p>
            <div style={{ width: '60px', height: '4px', background: formData.color3 }} />
          </div>
        );
      case 'logoSystem':
        return (
          <div style={{ padding: '30px', overflow: 'auto', height: '100%' }}>
            <h2 style={{ fontFamily: formData.headingFont, fontSize: '1.6rem', color: formData.color1, marginBottom: '20px', borderBottom: `2px solid ${formData.color3}`, paddingBottom: '10px' }}>1. Sistema de Logos</h2>
            <div style={{ marginBottom: '25px' }}>
              <h3 style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: formData.color2, marginBottom: '12px', fontWeight: 700 }}>Logo Principal</h3>
              {formData.logo ? (
                <div style={{ padding: '30px', border: '1px dashed #ccc', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px' }}>
                  <img src={formData.logo} alt="Logo Principal" style={{ maxWidth: '200px', maxHeight: '100px' }} />
                </div>
              ) : (
                <div style={{ padding: '30px', border: '1px dashed #ccc', textAlign: 'center', color: '#999', borderRadius: '8px' }}>Carregue o logo principal</div>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px' }}>
              <div>
                <h3 style={{ fontFamily: formData.bodyFont, fontSize: '0.9rem', color: formData.color2, marginBottom: '10px', fontWeight: 700 }}>Logo Secundária</h3>
                {formData.logoSecondary ? (
                  <div style={{ padding: '20px', border: '1px dashed #ccc', display: 'flex', justifyContent: 'center', borderRadius: '8px' }}>
                    <img src={formData.logoSecondary} alt="Logo Secundária" style={{ maxWidth: '120px' }} />
                  </div>
                ) : (
                  <div style={{ padding: '20px', border: '1px dashed #ccc', textAlign: 'center', color: '#999', borderRadius: '8px' }}>Carregue</div>
                )}
              </div>
              <div>
                <h3 style={{ fontFamily: formData.bodyFont, fontSize: '0.9rem', color: formData.color2, marginBottom: '10px', fontWeight: 700 }}>Símbolo / Ícone</h3>
                {formData.logoSymbol ? (
                  <div style={{ padding: '20px', border: '1px dashed #ccc', display: 'flex', justifyContent: 'center', borderRadius: '8px' }}>
                    <img src={formData.logoSymbol} alt="Símbolo" style={{ maxWidth: '80px' }} />
                  </div>
                ) : (
                  <div style={{ padding: '20px', border: '1px dashed #ccc', textAlign: 'center', color: '#999', borderRadius: '8px' }}>Carregue</div>
                )}
              </div>
            </div>
            <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ fontFamily: formData.bodyFont, fontSize: '0.9rem', color: formData.color2, marginBottom: '10px', fontWeight: 700 }}>Área de Proteção</h3>
              <p style={{ fontFamily: formData.bodyFont, fontSize: '0.8rem', color: formData.color2 }}>Tamanho mínimo: {formData.minSize || 15}mm</p>
            </div>
          </div>
        );
      case 'colors':
        return (
          <div style={{ padding: '30px', overflow: 'auto', height: '100%' }}>
            <h2 style={{ fontFamily: formData.headingFont, fontSize: '1.6rem', color: formData.color1, marginBottom: '20px', borderBottom: `2px solid ${formData.color3}`, paddingBottom: '10px' }}>2. Paleta Cromática</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '25px' }}>
              {[1,2,3,4,5].map(num => (
                <div key={num} style={{ textAlign: 'center' }}>
                  <div style={{ width: '100%', height: '60px', backgroundColor: formData[`color${num}`], borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '8px' }} />
                  <p style={{ fontFamily: formData.bodyFont, fontSize: '0.75rem', fontWeight: 700, color: formData.color2 }}>{formData[`color${num}`]}</p>
                  <p style={{ fontFamily: formData.bodyFont, fontSize: '0.65rem', color: '#666' }}>{formData[`color${num}Cmyk`]}</p>
                  <p style={{ fontFamily: formData.bodyFont, fontSize: '0.65rem', color: '#666' }}>{formData[`color${num}Pantone`]}</p>
                </div>
              ))}
            </div>
            {formData.extraColors?.length > 0 && (
              <>
                <h3 style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: formData.color2, marginBottom: '12px', fontWeight: 700 }}>Cores Adicionais</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                  {formData.extraColors.map((color, idx) => (
                    <div key={idx} style={{ textAlign: 'center' }}>
                      <div style={{ width: '100%', height: '50px', backgroundColor: color.hex, borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '6px' }} />
                      <p style={{ fontFamily: formData.bodyFont, fontSize: '0.7rem', fontWeight: 600, color: formData.color2 }}>{color.name || 'Cor'}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      case 'typography':
        return (
          <div style={{ padding: '30px', overflow: 'auto', height: '100%' }}>
            <h2 style={{ fontFamily: formData.headingFont, fontSize: '1.6rem', color: formData.color1, marginBottom: '20px', borderBottom: `2px solid ${formData.color3}`, paddingBottom: '10px' }}>3. Tipografia</h2>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontFamily: formData.bodyFont, fontSize: '0.9rem', color: formData.color2, marginBottom: '10px', fontWeight: 700 }}>Fonte de Títulos: {formData.headingFont}</h3>
              <div style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <p style={{ fontFamily: formData.headingFont, fontSize: '1.8rem', color: formData.color1 }}>Aa Bb Cc Dd Ee</p>
                <p style={{ fontFamily: formData.headingFont, fontSize: '1rem', color: formData.color2, marginTop: '8px' }}>O rápido jabuti xereta.</p>
              </div>
            </div>
            <div>
              <h3 style={{ fontFamily: formData.bodyFont, fontSize: '0.9rem', color: formData.color2, marginBottom: '10px', fontWeight: 700 }}>Fonte de Corpo: {formData.bodyFont}</h3>
              <div style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <p style={{ fontFamily: formData.bodyFont, fontSize: '0.9rem', color: formData.color2, lineHeight: 1.6 }}>Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.</p>
              </div>
            </div>
          </div>
        );
      case 'variations':
        return (
          <div style={{ padding: '30px', overflow: 'auto', height: '100%' }}>
            <h2 style={{ fontFamily: formData.headingFont, fontSize: '1.6rem', color: formData.color1, marginBottom: '20px', borderBottom: `2px solid ${formData.color3}`, paddingBottom: '10px' }}>4. Variações de Cor</h2>
            {formData.showPositive && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontFamily: formData.bodyFont, fontSize: '0.9rem', color: formData.color2, marginBottom: '10px', fontWeight: 700 }}>Versão Positiva</h3>
                <div style={{ padding: '25px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'center' }}>
                  {formData.logo ? <img src={formData.logo} alt="Positivo" style={{ maxWidth: '180px' }} /> : <span style={{ color: '#999' }}>Carregue o logo</span>}
                </div>
              </div>
            )}
            {formData.showNegative && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontFamily: formData.bodyFont, fontSize: '0.9rem', color: formData.color2, marginBottom: '10px', fontWeight: 700 }}>Versão Negativa</h3>
                <div style={{ padding: '25px', background: formData.color2, borderRadius: '8px', display: 'flex', justifyContent: 'center' }}>
                  {formData.logo ? <img src={formData.logo} alt="Negativo" style={{ maxWidth: '180px', filter: 'brightness(0) invert(1)' }} /> : <span style={{ color: '#fff' }}>Carregue o logo</span>}
                </div>
              </div>
            )}
            {formData.showMonochrome && (
              <div>
                <h3 style={{ fontFamily: formData.bodyFont, fontSize: '0.9rem', color: formData.color2, marginBottom: '10px', fontWeight: 700 }}>Versão Monocromática</h3>
                <div style={{ padding: '25px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'center' }}>
                  {formData.logo ? <img src={formData.logo} alt="Monocromático" style={{ maxWidth: '180px', filter: 'grayscale(100%)' }} /> : <span style={{ color: '#999' }}>Carregue o logo</span>}
                </div>
              </div>
            )}
          </div>
        );
      case 'applications':
        return (
          <div style={{ padding: '30px', overflow: 'auto', height: '100%' }}>
            <h2 style={{ fontFamily: formData.headingFont, fontSize: '1.6rem', color: formData.color1, marginBottom: '20px', borderBottom: `2px solid ${formData.color3}`, paddingBottom: '10px' }}>5. Aplicações & Mockups</h2>
            {formData.mockups?.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {formData.mockups.map((mockup, idx) => (
                  <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: '#f8f9fa' }}>
                    <img src={mockup} alt={`Mockup ${idx + 1}`} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '30px', border: '2px dashed #e2e8f0', borderRadius: '8px', textAlign: 'center', color: '#999' }}>Adicione mockups</div>
            )}
            {formData.pattern && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontFamily: formData.bodyFont, fontSize: '0.9rem', color: formData.color2, marginBottom: '10px', fontWeight: 700 }}>Padrão Gráfico</h3>
                <div style={{ padding: '20px', backgroundImage: `url(${formData.pattern})`, backgroundSize: 'cover', borderRadius: '8px', height: '120px' }} />
              </div>
            )}
          </div>
        );
      case 'brandDNA':
        return (
          <div style={{ padding: '30px', overflow: 'auto', height: '100%' }}>
            <h2 style={{ fontFamily: formData.headingFont, fontSize: '1.6rem', color: formData.color1, marginBottom: '20px', borderBottom: `2px solid ${formData.color3}`, paddingBottom: '10px' }}>6. Alma da Marca</h2>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontFamily: formData.bodyFont, fontSize: '0.8rem', color: formData.color3, marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>Missão</h3>
              <p style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: formData.color2, lineHeight: 1.5 }}>{formData.mission}</p>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontFamily: formData.bodyFont, fontSize: '0.8rem', color: formData.color3, marginBottom: '6px', fontWeight: 700, textTransform: 'uppercase' }}>Visão</h3>
              <p style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: formData.color2, lineHeight: 1.5 }}>{formData.vision}</p>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontFamily: formData.bodyFont, fontSize: '0.8rem', color: formData.color3, marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase' }}>Valores</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(formData.values || '').split(',').map((val, idx) => (
                  <span key={idx} style={{ padding: '6px 14px', background: formData.color1, color: 'white', borderRadius: '20px', fontFamily: formData.bodyFont, fontSize: '0.8rem' }}>{val.trim()}</span>
                ))}
              </div>
            </div>
            {formData.donts?.length > 0 && (
              <div>
                <h3 style={{ fontFamily: formData.bodyFont, fontSize: '0.9rem', color: '#e53e3e', marginBottom: '10px', fontWeight: 700 }}>O Que NÃO Fazer</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {formData.donts.map((dont, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', background: '#fff5f5', borderRadius: '6px', borderLeft: '3px solid #e53e3e' }}>
                      <span style={{ color: '#e53e3e', fontSize: '1rem' }}>✕</span>
                      <span style={{ fontFamily: formData.bodyFont, fontSize: '0.85rem', color: formData.color2 }}>{dont}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const currentPage = pages[activePage];

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: '#1a1a1a', borderBottom: '1px solid #333' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Maximize2 size={18} color="#fff" />
          <span style={{ color: '#fff', fontFamily: formData.bodyFont, fontSize: '0.9rem' }}>{currentPage.title}</span>
          <span style={{ color: '#666', fontFamily: formData.bodyFont, fontSize: '0.8rem' }}>{activePage + 1} / {pages.length}</span>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={22} color="#fff" />
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '600px', maxHeight: '100%', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }}>
          {renderPage(currentPage.component)}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', padding: '12px', background: '#1a1a1a', borderTop: '1px solid #333' }}>
        <button onClick={() => setActivePage(prev => Math.max(0, prev - 1))} disabled={activePage === 0} style={{ background: activePage === 0 ? '#333' : formData.color1, border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: activePage === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontFamily: formData.bodyFont, fontSize: '0.8rem', opacity: activePage === 0 ? 0.5 : 1 }}>
          <ChevronLeft size={16} /> Anterior
        </button>
        
        <div style={{ display: 'flex', gap: '6px' }}>
          {pages.map((_, idx) => (
            <button key={idx} onClick={() => setActivePage(idx)} style={{ width: '8px', height: '8px', borderRadius: '50%', border: 'none', background: idx === activePage ? formData.color1 : '#444', cursor: 'pointer', padding: 0 }} />
          ))}
        </div>

        <button onClick={() => setActivePage(prev => Math.min(pages.length - 1, prev + 1))} disabled={activePage === pages.length - 1} style={{ background: activePage === pages.length - 1 ? '#333' : formData.color1, border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: activePage === pages.length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#fff', fontFamily: formData.bodyFont, fontSize: '0.8rem', opacity: activePage === pages.length - 1 ? 0.5 : 1 }}>
          Próxima <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default FullscreenPreview;