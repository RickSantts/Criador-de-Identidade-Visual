import React, { useState } from 'react'

const IdentityPreview = ({ formData, pageCount, template }) => {
  const [activePage, setActivePage] = useState(0);

  const renderCover = () => (
    <div className="paper" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      padding: '40px',
      background: template?.coverStyle === 'full-bleed' 
        ? `linear-gradient(135deg, ${formData.color1}20, ${formData.color2}20)`
        : 'white'
    }}>
      {formData.logo && (
        <img 
          src={formData.logo} 
          alt="Logo" 
          style={{ 
            maxWidth: '200px', 
            maxHeight: '150px', 
            objectFit: 'contain',
            marginBottom: '30px' 
          }} 
        />
      )}
      <h1 style={{ 
        fontFamily: formData.headingFont, 
        fontSize: '2.5rem',
        color: formData.color1,
        marginBottom: '10px'
      }}>
        {formData.brandName || 'Nome da Marca'}
      </h1>
      <p style={{ 
        fontFamily: formData.bodyFont, 
        fontSize: '1.2rem',
        color: formData.color2,
        marginBottom: '30px'
      }}>
        Manual de Identidade Visual
      </p>
      <div style={{ 
        width: '60px', 
        height: '4px', 
        background: formData.color3 
      }} />
    </div>
  );

  const renderLogoSystem = () => (
    <div className="paper">
      <h2 style={{ 
        fontFamily: formData.headingFont, 
        fontSize: '1.8rem',
        color: formData.color1,
        marginBottom: '20px',
        borderBottom: `2px solid ${formData.color3}`,
        paddingBottom: '10px'
      }}>
        1. Sistema de Logos
      </h2>
      
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ 
          fontFamily: formData.bodyFont, 
          fontSize: '1rem',
          color: formData.color2,
          marginBottom: '15px',
          fontWeight: 700
        }}>
          Logo Principal
        </h3>
        {formData.logo ? (
          <div style={{ 
            padding: '40px', 
            border: '1px dashed #ccc',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <img src={formData.logo} alt="Logo Principal" style={{ maxWidth: '250px', maxHeight: '120px' }} />
          </div>
        ) : (
          <div style={{ padding: '40px', border: '1px dashed #ccc', textAlign: 'center', color: '#999' }}>
            Carregue o logo principal
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div>
          <h3 style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: formData.color2, marginBottom: '15px', fontWeight: 700 }}>Logo Secundária</h3>
          {formData.logoSecondary ? (
            <div style={{ padding: '30px', border: '1px dashed #ccc', display: 'flex', justifyContent: 'center' }}>
              <img src={formData.logoSecondary} alt="Logo Secundária" style={{ maxWidth: '150px' }} />
            </div>
          ) : (
            <div style={{ padding: '30px', border: '1px dashed #ccc', textAlign: 'center', color: '#999' }}>Carregue</div>
          )}
        </div>
        <div>
          <h3 style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: formData.color2, marginBottom: '15px', fontWeight: 700 }}>Símbolo / Ícone</h3>
          {formData.logoSymbol ? (
            <div style={{ padding: '30px', border: '1px dashed #ccc', display: 'flex', justifyContent: 'center' }}>
              <img src={formData.logoSymbol} alt="Símbolo" style={{ maxWidth: '100px' }} />
            </div>
          ) : (
            <div style={{ padding: '30px', border: '1px dashed #ccc', textAlign: 'center', color: '#999' }}>Carregue</div>
          )}
        </div>
      </div>

      <div style={{ 
        padding: '20px', 
        background: '#f8f9fa', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: formData.color2, marginBottom: '15px', fontWeight: 700 }}>
          Área de Proteção (Clear Space)
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ 
            border: `2px dashed ${formData.color3}`,
            padding: formData.clearSpace || '20px',
            position: 'relative'
          }}>
            {formData.logo && <img src={formData.logo} alt="" style={{ width: '80px' }} />}
            <span style={{ 
              position: 'absolute', 
              fontSize: '0.7rem', 
              color: formData.color4 
            }}>
              x = {formData.clearSpace || 20}% do logo
            </span>
          </div>
          <div>
            <p style={{ fontFamily: formData.bodyFont, fontSize: '0.85rem', color: formData.color2 }}>
              <strong>Tamanho mínimo:</strong> {formData.minSize || 15}mm
            </p>
          </div>
        </div>
      </div>

      {formData.showGrid && (
        <div style={{ 
          padding: '20px', 
          background: '#f8f9fa', 
          borderRadius: '8px' 
        }}>
          <h3 style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: formData.color2, marginBottom: '15px', fontWeight: 700 }}>
            Grid de Construção
          </h3>
          <div style={{ 
            position: 'relative', 
            height: '200px', 
            backgroundImage: `
              linear-gradient(to right, ${formData.color4}20 1px, transparent 1px),
              linear-gradient(to bottom, ${formData.color4}20 1px, transparent 1px)
            `,
            backgroundSize: `${formData.gridSize || 20}px ${formData.gridSize || 20}px`
          }}>
            {formData.logo && (
              <img 
                src={formData.logo} 
                alt="" 
                style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)',
                  width: '120px' 
                }} 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderColors = () => (
    <div className="paper">
      <h2 style={{ 
        fontFamily: formData.headingFont, 
        fontSize: '1.8rem',
        color: formData.color1,
        marginBottom: '20px',
        borderBottom: `2px solid ${formData.color3}`,
        paddingBottom: '10px'
      }}>
        2. Paleta Cromática
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '30px' }}>
        {[1,2,3,4,5].map(num => (
          <div key={num} style={{ textAlign: 'center' }}>
            <div style={{
              width: '100%',
              height: '80px',
              backgroundColor: formData[`color${num}`],
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              marginBottom: '10px'
            }} />
            <p style={{ fontFamily: formData.bodyFont, fontSize: '0.85rem', fontWeight: 700, color: formData.color2 }}>
              {formData[`color${num}`]}
            </p>
            <p style={{ fontFamily: formData.bodyFont, fontSize: '0.7rem', color: '#666' }}>
              {formData[`color${num}Cmyk`] || 'CMYK'}
            </p>
            <p style={{ fontFamily: formData.bodyFont, fontSize: '0.7rem', color: '#666' }}>
              {formData[`color${num}Pantone`] || 'Pantone'}
            </p>
          </div>
        ))}
      </div>

      {formData.extraColors?.length > 0 && (
        <>
          <h3 style={{ 
            fontFamily: formData.bodyFont, 
            fontSize: '1.1rem',
            color: formData.color2,
            marginBottom: '15px',
            marginTop: '20px',
            fontWeight: 700
          }}>
            Cores Adicionais
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px' }}>
            {formData.extraColors.map((color, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '100%',
                  height: '60px',
                  backgroundColor: color.hex,
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '8px'
                }} />
                <p style={{ fontFamily: formData.bodyFont, fontSize: '0.75rem', fontWeight: 600, color: formData.color2 }}>{color.name || 'Cor'}</p>
                <p style={{ fontFamily: formData.bodyFont, fontSize: '0.65rem', color: '#666' }}>{color.hex}</p>
                {color.cmyk && <p style={{ fontFamily: formData.bodyFont, fontSize: '0.65rem', color: '#666' }}>{color.cmyk}</p>}
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: '30px' }}>
        <h3 style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: formData.color2, marginBottom: '15px', fontWeight: 700 }}>
          Aplicações em Contexto
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div style={{ 
            padding: '20px', 
            background: formData.color1, 
            borderRadius: '8px',
            color: 'white',
            textAlign: 'center'
          }}>
            <p style={{ fontFamily: formData.bodyFont, fontSize: '0.8rem' }}>Fundo Claro</p>
            <p style={{ fontFamily: formData.headingFont, fontSize: '1.2rem', marginTop: '10px' }}>Título</p>
          </div>
          <div style={{ 
            padding: '20px', 
            background: formData.color2, 
            borderRadius: '8px',
            color: 'white',
            textAlign: 'center'
          }}>
            <p style={{ fontFamily: formData.bodyFont, fontSize: '0.8rem' }}>Fundo Escuro</p>
            <p style={{ fontFamily: formData.headingFont, fontSize: '1.2rem', marginTop: '10px' }}>Título</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTypography = () => (
    <div className="paper">
      <h2 style={{ 
        fontFamily: formData.headingFont, 
        fontSize: '1.8rem',
        color: formData.color1,
        marginBottom: '20px',
        borderBottom: `2px solid ${formData.color3}`,
        paddingBottom: '10px'
      }}>
        3. Tipografia
      </h2>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: formData.color2, marginBottom: '15px', fontWeight: 700 }}>
          Fonte de Títulos: {formData.headingFont}
        </h3>
        <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <p style={{ fontFamily: formData.headingFont, fontSize: '2rem', color: formData.color1, marginBottom: '10px' }}>
            ABCDEFGHIJKLMNOPQRSTUVWXYZ
          </p>
          <p style={{ fontFamily: formData.headingFont, fontSize: '2rem', color: formData.color1, marginBottom: '10px' }}>
            abcdefghijklmnopqrstuvwxyz
          </p>
          <p style={{ fontFamily: formData.headingFont, fontSize: '2rem', color: formData.color1, marginBottom: '10px' }}>
            0123456789
          </p>
          <p style={{ fontFamily: formData.headingFont, fontSize: '1.2rem', color: formData.color2, marginTop: '15px' }}>
            O rápido jabuti xereta. Título de exemplo.
          </p>
        </div>
      </div>

      <div>
        <h3 style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: formData.color2, marginBottom: '15px', fontWeight: 700 }}>
          Fonte de Corpo: {formData.bodyFont}
        </h3>
        <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <p style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: formData.color2, lineHeight: 1.6, marginBottom: '10px' }}>
            Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. 
            Nullam quis risus eget urna mollis ornare vel eu leo.
          </p>
          <p style={{ fontFamily: formData.bodyFont, fontSize: '0.875rem', color: formData.color2, lineHeight: 1.6 }}>
            Texto de corpo em tamanho padrão (14px). Used for body text and paragraphs.
          </p>
        </div>
      </div>
    </div>
  );

  const renderVariations = () => (
    <div className="paper">
      <h2 style={{ 
        fontFamily: formData.headingFont, 
        fontSize: '1.8rem',
        color: formData.color1,
        marginBottom: '20px',
        borderBottom: `2px solid ${formData.color3}`,
        paddingBottom: '10px'
      }}>
        4. Variações de Cor
      </h2>

      {formData.showPositive && (
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: formData.color2, marginBottom: '15px', fontWeight: 700 }}>
            Versão Positiva (Original)
          </h3>
          <div style={{ 
            padding: '30px', 
            background: '#ffffff', 
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            {formData.logo ? (
              <img src={formData.logo} alt="Positivo" style={{ maxWidth: '200px' }} />
            ) : (
              <span style={{ color: '#999' }}>Carregue o logo</span>
            )}
          </div>
        </div>
      )}

      {formData.showNegative && (
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: formData.color2, marginBottom: '15px', fontWeight: 700 }}>
            Versão Negativa (Branco sobre escuro)
          </h3>
          <div style={{ 
            padding: '30px', 
            background: formData.color2, 
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            {formData.logoNegative || (formData.logo ? (
              <img src={formData.logo} alt="Negativo" style={{ maxWidth: '200px', filter: 'brightness(0) invert(1)' }} />
            ) : (
              <span style={{ color: '#fff' }}>Carregue o logo</span>
            ))}
          </div>
        </div>
      )}

      {formData.showMonochrome && (
        <div>
          <h3 style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: formData.color2, marginBottom: '15px', fontWeight: 700 }}>
            Versão Monocromática (Preto)
          </h3>
          <div style={{ 
            padding: '30px', 
            background: '#ffffff', 
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center'
          }}>
            {formData.logoMonochrome || (formData.logo ? (
              <img src={formData.logo} alt="Monocromático" style={{ maxWidth: '200px', filter: 'grayscale(100%)' }} />
            ) : (
              <span style={{ color: '#999' }}>Carregue o logo</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderApplications = () => (
    <div className="paper">
      <h2 style={{ 
        fontFamily: formData.headingFont, 
        fontSize: '1.8rem',
        color: formData.color1,
        marginBottom: '20px',
        borderBottom: `2px solid ${formData.color3}`,
        paddingBottom: '10px'
      }}>
        5. Aplicações & Mockups
      </h2>

      {formData.mockups?.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          {formData.mockups.map((mockup, idx) => (
            <div key={idx} style={{ 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px', 
              overflow: 'hidden',
              background: '#f8f9fa'
            }}>
              <img 
                src={mockup} 
                alt={`Mockup ${idx + 1}`} 
                style={{ width: '100%', height: '150px', objectFit: 'cover' }} 
              />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ 
          padding: '40px', 
          border: '2px dashed #e2e8f0', 
          borderRadius: '8px',
          textAlign: 'center',
          color: '#999'
        }}>
          <p style={{ fontFamily: formData.bodyFont }}>Adicione mockups para visualizar aplicações da marca</p>
        </div>
      )}

      {formData.pattern && (
        <div style={{ marginTop: '25px' }}>
          <h3 style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: formData.color2, marginBottom: '15px', fontWeight: 700 }}>
            Padrão Gráfico (Pattern)
          </h3>
          <div style={{ 
            padding: '20px', 
            backgroundImage: `url(${formData.pattern})`,
            backgroundSize: 'cover',
            borderRadius: '8px',
            height: '150px'
          }} />
        </div>
      )}

      <div style={{ marginTop: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: formData.color2, marginBottom: '15px', fontWeight: 700 }}>
          Razão Áurea
        </h3>
        <p style={{ fontFamily: formData.bodyFont, fontSize: '0.9rem', color: formData.color2 }}>
          Proporção: <strong>{formData.goldenRatio || '1:1.618'}</strong>
        </p>
        <div style={{ 
          width: '161.8px', 
          height: '100px', 
          background: formData.color3,
          marginTop: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ color: 'white', fontSize: '0.7rem' }}>φ</span>
        </div>
      </div>
    </div>
  );

  const renderBrandDNA = () => (
    <div className="paper">
      <h2 style={{ 
        fontFamily: formData.headingFont, 
        fontSize: '1.8rem',
        color: formData.color1,
        marginBottom: '20px',
        borderBottom: `2px solid ${formData.color3}`,
        paddingBottom: '10px'
      }}>
        6. Alma da Marca
      </h2>

      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ fontFamily: formData.bodyFont, fontSize: '0.9rem', color: formData.color3, marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase' }}>
          Missão
        </h3>
        <p style={{ fontFamily: formData.bodyFont, fontSize: '1.1rem', color: formData.color2, lineHeight: 1.6 }}>
          {formData.mission || 'Missão da empresa'}
        </p>
      </div>

      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ fontFamily: formData.bodyFont, fontSize: '0.9rem', color: formData.color3, marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase' }}>
          Visão
        </h3>
        <p style={{ fontFamily: formData.bodyFont, fontSize: '1.1rem', color: formData.color2, lineHeight: 1.6 }}>
          {formData.vision || 'Visão da empresa'}
        </p>
      </div>

      <div style={{ marginBottom: '25px' }}>
        <h3 style={{ fontFamily: formData.bodyFont, fontSize: '0.9rem', color: formData.color3, marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase' }}>
          Valores
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {(formData.values || '').split(',').map((val, idx) => (
            <span key={idx} style={{ 
              padding: '8px 16px', 
              background: formData.color1, 
              color: 'white',
              borderRadius: '20px',
              fontFamily: formData.bodyFont,
              fontSize: '0.85rem'
            }}>
              {val.trim()}
            </span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ fontFamily: formData.bodyFont, fontSize: '0.9rem', color: formData.color3, marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase' }}>
          Tom de Voz
        </h3>
        <p style={{ fontFamily: formData.bodyFont, fontSize: '0.95rem', color: formData.color2, lineHeight: 1.6, fontStyle: 'italic' }}>
          "{formData.toneOfVoice || 'Descrição do tom de voz da marca'}"
        </p>
      </div>

      {formData.donts?.length > 0 && (
        <div>
          <h3 style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: '#e53e3e', marginBottom: '15px', fontWeight: 700 }}>
            O Que NÃO Fazer
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {formData.donts.map((dont, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                padding: '10px',
                background: '#fff5f5',
                borderRadius: '6px',
                borderLeft: '3px solid #e53e3e'
              }}>
                <span style={{ color: '#e53e3e', fontSize: '1.2rem' }}>✕</span>
                <span style={{ fontFamily: formData.bodyFont, fontSize: '0.9rem', color: formData.color2 }}>{dont}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderManual = () => (
    <div className="paper">
      <h2 style={{ 
        fontFamily: formData.headingFont, 
        fontSize: '1.8rem',
        color: formData.color1,
        marginBottom: '20px',
        borderBottom: `2px solid ${formData.color3}`,
        paddingBottom: '10px'
      }}>
        Manual de Aplicação
      </h2>
      <div style={{ 
        fontFamily: formData.bodyFont, 
        fontSize: '0.95rem', 
        color: formData.color2, 
        lineHeight: 1.8,
        whiteSpace: 'pre-wrap'
      }}>
        {formData.manualContent || 'Conteúdo do manual...'}
      </div>
      
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        background: formData.color1, 
        borderRadius: '8px',
        color: 'white',
        textAlign: 'center'
      }}>
        <p style={{ fontFamily: formData.bodyFont, fontSize: '0.85rem', opacity: 0.9 }}>
          Manual de Identidade Visual
        </p>
        <p style={{ fontFamily: formData.headingFont, fontSize: '1.5rem', marginTop: '5px' }}>
          {formData.brandName || 'Nome da Marca'}
        </p>
        <p style={{ fontFamily: formData.bodyFont, fontSize: '0.75rem', opacity: 0.7, marginTop: '10px' }}>
          © 2024 Todos os direitos reservados
        </p>
      </div>
    </div>
  );

  const pages = [
    { component: renderCover, title: 'Capa' },
    { component: renderLogoSystem, title: 'Sistema de Logos' },
    { component: renderColors, title: 'Cores' },
    { component: renderTypography, title: 'Tipografia' },
    { component: renderVariations, title: 'Variações' },
    { component: renderApplications, title: 'Aplicações' },
    { component: renderBrandDNA, title: 'DNA da Marca' },
    { component: renderManual, title: 'Manual' }
  ];

  return (
    <div className="preview-container" id="pdf-content">
      {pages.slice(0, pageCount + 2).map((page, idx) => (
        <div key={idx} className="paper">
          {page.component()}
        </div>
      ))}
    </div>
  );
};

export default IdentityPreview;