import React, { useState } from 'react'

const ARCHETYPES = [
  { id: 'hero', name: 'O Herói', desc: 'Determinação e Coragem', icon: '🛡️', keywords: ['Coragem', 'Força', 'Superação'] },
  { id: 'magician', name: 'O Mago', desc: 'Visão e Transformação', icon: '🔮', keywords: ['Visão', 'Mistério', 'Transformação'] },
  { id: 'outlaw', name: 'O Rebelde', desc: 'Liberdade e Quebra de Regras', icon: '💀', keywords: ['Rebelião', 'Liberdade', 'Mudança'] },
  { id: 'innocent', name: 'O Inocente', desc: 'Otimismo e Pureza', icon: '✨', keywords: ['Felicidade', 'Confiança', 'Bondade'] },
  { id: 'sage', name: 'O Sábio', desc: 'Conhecimento e Análise', icon: '🧠', keywords: ['Sabedoria', 'Inteligência', 'Verdade'] },
  { id: 'explorer', name: 'O Explorador', desc: 'Descoberta e Aventura', icon: '🏔️', keywords: ['Aventura', 'Descoberta', 'Independência'] },
  { id: 'creator', name: 'O Criador', desc: 'Inovação e Expressão', icon: '🎨', keywords: ['Inovação', 'Criatividade', 'Expressão'] },
  { id: 'lover', name: 'O Amante', desc: 'Paixão e Conexão', icon: '❤️', keywords: ['Paixão', 'Intimidade', 'Beleza'] },
  { id: 'jester', name: 'O Bobo da Corte', desc: 'Alegria e Humor', icon: '🃏', keywords: ['Diversão', 'Alegria', 'Humor'] },
  { id: 'caregiver', name: 'O Prestativo', desc: 'Cuidado e Proteção', icon: '🤲', keywords: ['Cuidado', 'Proteção', 'Generosidade'] },
  { id: 'everyman', name: 'O Cara Comum', desc: 'Pertencimento e Empatia', icon: '🤝', keywords: ['Pertencimento', 'Amizade', 'Empatia'] },
  { id: 'ruler', name: 'O Governante', desc: 'Poder e Controle', icon: '👑', keywords: ['Liderança', 'Poder', 'Organização'] },
];

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
          Família Tipográfica Principal: {formData.headingFont}
        </h3>
        <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <p style={{ fontFamily: formData.headingFont, fontSize: '2.5rem', color: formData.color1, marginBottom: '10px' }}>
            {formData.brandName || 'Brand Name'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <div style={{ fontFamily: formData.headingFont, fontSize: '1.5rem', color: formData.color1 }}>
              Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz
            </div>
            <div style={{ fontFamily: formData.headingFont, fontSize: '1.5rem', color: formData.color1 }}>
              0123456789 !@#$%&*()
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: formData.color2, marginBottom: '15px', fontWeight: 700 }}>
          Hierarquia e Aplicação
        </h3>
        <div style={{ padding: '25px', background: '#f8f9fa', borderRadius: '8px' }}>
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '0.65rem', color: '#999', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>H1 - Título Principal</span>
            <h1 style={{ fontFamily: formData.headingFont, fontSize: '2.2rem', color: formData.color1, margin: 0 }}>Título de Destaque</h1>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '0.65rem', color: '#999', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>H2 - Subtítulos</span>
            <h2 style={{ fontFamily: formData.headingFont, fontSize: '1.5rem', color: formData.color2, margin: 0 }}>Subtítulo de Seção</h2>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '0.65rem', color: '#999', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>P - Texto de Corpo ({formData.bodyFont})</span>
            <p style={{ fontFamily: formData.bodyFont, fontSize: '0.95rem', color: formData.color2, lineHeight: 1.6, margin: 0 }}>
              O texto de corpo deve ser legível e equilibrado. Utilizamos a fonte {formData.bodyFont} para garantir conforto visual em leituras longas, mantendo a consistência em todos os pontos de contato da marca.
            </p>
          </div>
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

const renderApplications = () => {
    const mockupCount = formData.mockups?.length || 0;
    const hasMockups = mockupCount > 0;
    const hasPattern = !!formData.pattern;
    
    return (
    <div className="paper" style={{ minHeight: 'auto', height: 'auto', paddingBottom: '30px' }}>
      <h2 style={{ 
        fontFamily: formData.headingFont, 
        fontSize: '1.8rem',
        color: formData.color1,
        marginBottom: '25px',
        borderBottom: `2px solid ${formData.color3}`,
        paddingBottom: '10px'
      }}>
        5. Aplicações & Mockups
      </h2>

      {hasMockups && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: formData.color2, marginBottom: '15px', fontWeight: 700 }}>
            Mockups
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: mockupCount === 1 ? '1fr' : '1fr 1fr', 
            gap: '20px',
            justifyItems: 'center'
          }}>
            {formData.mockups.map((mockup, idx) => (
              <div key={idx} style={{ 
                border: '1px solid #e2e8f0', 
                borderRadius: '12px', 
                overflow: 'hidden',
                background: '#f8f9fa',
                width: mockupCount === 1 ? '80%' : '100%',
                maxWidth: mockupCount === 1 ? '400px' : 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <img 
                  src={mockup} 
                  alt={`Mockup ${idx + 1}`} 
                  style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} 
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasMockups && (
        <div style={{ 
          padding: '40px', 
          border: '2px dashed #e2e8f0', 
          borderRadius: '8px',
          textAlign: 'center',
          color: '#999',
          marginBottom: '25px'
        }}>
          <p style={{ fontFamily: formData.bodyFont }}>Adicione mockups para visualizar aplicações da marca</p>
        </div>
      )}

      {hasPattern && (
        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontFamily: formData.bodyFont, fontSize: '1rem', color: formData.color2, marginBottom: '12px', fontWeight: 700 }}>
            Padrão Gráfico
          </h3>
          <div style={{ 
            padding: '25px', 
            backgroundImage: `url(${formData.pattern})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '8px',
            height: '120px',
            width: '100%'
          }} />
        </div>
      )}

      <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ fontFamily: formData.bodyFont, fontSize: '0.9rem', color: formData.color2, marginBottom: '10px', fontWeight: 700 }}>
          Razão Áurea
        </h3>
        <p style={{ fontFamily: formData.bodyFont, fontSize: '0.85rem', color: formData.color2 }}>
          Proporção: <strong>{formData.goldenRatio || '1:1.618'}</strong>
        </p>
        <div style={{ 
          width: '161.8px', 
          height: '80px', 
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
};

export default IdentityPreview;