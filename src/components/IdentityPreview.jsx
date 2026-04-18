import React, { forwardRef, useMemo } from 'react';

const A4_HEIGHT = 1122;
const A4_WIDTH = 794;

const PageHeader = ({ title, pageNum }) => (
  <header className="template-header">
    <div className="template-logo">
      {title}
    </div>
    <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
      PRO BRAND IDENTITY GUIDE<br />
      {new Date().toLocaleDateString('pt-BR')}<br />
      Página {pageNum}
    </div>
  </header>
);

const Page = ({ children, pageNum, brandName }) => (
  <div className="paper" style={{ marginBottom: '2rem' }}>
    <PageHeader title={brandName} pageNum={pageNum} />
    {children}
  </div>
);

const PageFooter = ({ pageNum, brandName }) => (
  <footer style={{ marginTop: 'auto', paddingTop: '2rem', fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px dotted var(--border)' }}>
    Este manual pro é uma especificação técnica da identidade visual e deve ser seguido rigorosamente.<br />
    © {new Date().getFullYear()} {brandName || 'Brand Identity'} | Página {pageNum}
  </footer>
);

const TOTAL_PAGES = 5;

const IdentityPreview = forwardRef(({ formData, pageCount = TOTAL_PAGES }, ref) => {
  const pages = useMemo(() => {
    const p = [];
    let currentPage = 1;

    p.push(
      <Page key={currentPage} pageNum={currentPage} totalPages={TOTAL_PAGES} brandName={formData.brandName}>
        <section className="template-section">
          <h2 className="template-section-title">1. Sistema de Logotipos</h2>
          <div className="logo-grid">
            <div className="logo-item">
              <div className="logo-container-small">
                {formData.showGrid && <div className="grid-overlay"></div>}
                {formData.logo ? <img src={formData.logo} alt="Primary" /> : <div style={{color:'#cbd5e1'}}>Logo Mestra</div>}
              </div>
              <span className="logo-label">Principal / Mestra</span>
            </div>
            <div className="logo-item">
              <div className="logo-container-small">
                {formData.showGrid && <div className="grid-overlay"></div>}
                {formData.logoSecondary ? <img src={formData.logoSecondary} alt="Secondary" /> : <div style={{color:'#cbd5e1'}}>Horizontal</div>}
              </div>
              <span className="logo-label">Secundária</span>
            </div>
            <div className="logo-item">
              <div className="logo-container-small">
                {formData.showGrid && <div className="grid-overlay"></div>}
                {formData.logoSymbol ? <img src={formData.logoSymbol} alt="Symbol" /> : <div style={{color:'#cbd5e1'}}>Ícone</div>}
              </div>
              <span className="logo-label">Símbolo / Ícone</span>
            </div>
          </div>

          <div className="clear-space-section">
            <h3 className="template-section-subtitle">1.1 Área de Proteção</h3>
            <div className="clear-space-diagram">
              <div className="clear-space-box" style={{ padding: `${formData.clearSpace || 20}mm` }}>
                <div className="clear-space-inner"><span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>x</span></div>
              </div>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Margem de segurança: <strong>{formData.clearSpace || 20}%</strong>
            </p>
          </div>

          <div className="min-size-section">
            <h3 className="template-section-subtitle">1.2 Tamanho Mínimo</h3>
            <div className="min-size-demo">
              <div className="min-size-box" style={{ width: `${formData.minSize || 15}mm`, height: `${formData.minSize || 15}mm` }}>
                <span style={{ fontSize: '0.5rem' }}>{formData.minSize || 15}mm</span>
              </div>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Largura mínima: <strong>{formData.minSize || 15}mm</strong>
            </p>
          </div>
        </section>
        <PageFooter pageNum={currentPage} totalPages={pageCount} brandName={formData.brandName} />
      </Page>
    );

    p.push(
      <Page key={++currentPage} title={formData.brandName} pageNum={currentPage} totalPages={pageCount} brandName={formData.brandName}>
        <section className="template-section">
          <h2 className="template-section-title">2. Paleta Cromática</h2>
          <div className="color-grid-5">
            {[1,2,3,4,5].map(num => (
              <div key={num} className="color-swatch">
                <div className="swatch-fill" style={{ backgroundColor: formData[`color${num}`] }}></div>
                <div className="swatch-info">
                  <div className="swatch-label" style={{ fontSize: '0.6rem' }}>Cor {num}</div>
                  <div className="swatch-hex">{formData[`color${num}`]?.toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="cmyk-section">
            <h3 className="template-section-subtitle">2.1 Cores para Impressão (CMYK)</h3>
            <div className="cmyk-grid">
              {[1,2,3].map(num => (
                <div key={num} className="cmyk-item">
                  <div className="cmyk-swatch" style={{ backgroundColor: formData[`color${num}`] }}></div>
                  <div className="cmyk-info">
                    <span className="cmyk-label">Cor {num}</span>
                    <span className="cmyk-values">CMYK: {formData[`color${num}Cmyk`] || 'N/A'}</span>
                    <span className="cmyk-pantone">PMS: {formData[`color${num}Pantone`] || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <PageFooter pageNum={currentPage} totalPages={pageCount} brandName={formData.brandName} />
      </Page>
    );

    p.push(
      <Page key={++currentPage} title={formData.brandName} pageNum={currentPage} totalPages={pageCount} brandName={formData.brandName}>
        <section className="template-section">
          <h2 className="template-section-title">3. Sistema Tipográfico</h2>
          <div className="specimen-group">
            <div className="specimen-card">
              <span className="specimen-tag">Títulos</span>
              <span className="specimen-font-name">{formData.headingFont}</span>
              <div className="specimen-chars">
                ABCDEFGHIJKLMNOP<br />
                abcdefghijklmnop<br />
                0123456789!?
              </div>
            </div>
            <div className="specimen-card">
              <span className="specimen-tag">Corpo de Texto</span>
              <span className="specimen-font-name">{formData.bodyFont}</span>
              <div className="specimen-chars">
                ABCDEFGHIJKLMNOP<br />
                abcdefghijklmnop<br />
                0123456789!?
              </div>
            </div>
          </div>
        </section>

        <section className="template-section" style={{ marginTop: '1.5rem' }}>
          <h2 className="template-section-title">4. Variações de Cores</h2>
          <div className="color-variations-grid">
            {formData.showPositive !== false && (
              <div className="variation-card">
                <span className="specimen-tag">Positiva</span>
                <span className="variation-label">Versão Original</span>
                <div className="variation-preview" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                  {formData.logo ? <img src={formData.logo} alt="Positive" /> : <span style={{color:'#cbd5e1'}}>Logo</span>}
                </div>
                <span className="variation-desc">Fundos claros</span>
              </div>
            )}
            {formData.showNegative !== false && (
              <div className="variation-card">
                <span className="specimen-tag" style={{ backgroundColor: '#1e293b' }}>Negativa</span>
                <span className="variation-label">Versão Invertida</span>
                <div className="variation-preview" style={{ backgroundColor: '#1e293b' }}>
                  {formData.logoNegative ? <img src={formData.logoNegative} alt="Negative" /> : formData.logo ? <img src={formData.logo} alt="Negative" style={{ filter: 'brightness(0) invert(1)' }} /> : <span style={{color:'#64748b'}}>Logo</span>}
                </div>
                <span className="variation-desc">Fundos escuros</span>
              </div>
            )}
            {formData.showMonochrome !== false && (
              <div className="variation-card">
                <span className="specimen-tag" style={{ backgroundColor: '#0f172a' }}>Mono</span>
                <span className="variation-label">Preto</span>
                <div className="variation-preview" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}>
                  {formData.logoMonochrome ? <img src={formData.logoMonochrome} alt="Mono" /> : formData.logo ? <img src={formData.logo} alt="Mono" style={{ filter: 'grayscale(100%)' }} /> : <span style={{color:'#cbd5e1'}}>Logo</span>}
                </div>
                <span className="variation-desc">Preto e branco</span>
              </div>
            )}
          </div>
        </section>
        <PageFooter pageNum={currentPage} totalPages={pageCount} brandName={formData.brandName} />
      </Page>
    );

    p.push(
      <Page key={++currentPage} title={formData.brandName} pageNum={currentPage} totalPages={pageCount} brandName={formData.brandName}>
        <section className="template-section">
          <h2 className="template-section-title">5. Mockups de Aplicação</h2>
          {formData.mockups && formData.mockups.length > 0 ? (
            <div className="mockups-grid">
              {formData.mockups.map((mockup, index) => (
                <div key={index} className="mockup-card">
                  <img src={mockup} alt={`Mockup ${index + 1}`} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-section">
              <span>Nenhum mockup adicionado</span>
              <p>Adicione imagens de aplicação da marca</p>
            </div>
          )}
        </section>

        <section className="template-section" style={{ marginTop: '1.5rem' }}>
          <h2 className="template-section-title">6. Tom de Voz</h2>
          <div className="tone-of-voice-box">
            <p>{formData.toneOfVoice || 'A marca comunica-se de forma direta, eficiente e inovadora.'}</p>
          </div>
        </section>
        <PageFooter pageNum={currentPage} totalPages={pageCount} brandName={formData.brandName} />
      </Page>
    );

    p.push(
      <Page key={++currentPage} title={formData.brandName} pageNum={currentPage} totalPages={pageCount} brandName={formData.brandName}>
        <section className="template-section">
          <h2 className="template-section-title">7. O Que NÃO Fazer</h2>
          {formData.donts && formData.donts.length > 0 ? (
            <div className="donts-grid">
              {formData.donts.map((dont, idx) => (
                <div key={idx} className="dont-item">
                  <span className="dont-icon">✕</span>
                  <span className="dont-text">{dont}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Nenhuma restrição definida</p>
          )}
        </section>

        <section className="template-section" style={{ marginTop: '1.5rem' }}>
          <h2 className="template-section-title">8. Padrão Gráfico</h2>
          {formData.pattern ? (
            <div className="pattern-preview">
              <img src={formData.pattern} alt="Pattern" />
            </div>
          ) : (
            <div className="empty-section">
              <span>Nenhum padrão adicionado</span>
            </div>
          )}
          <div className="golden-ratio-section">
            <h3 className="template-section-subtitle">Razão Áurea</h3>
            <div className="golden-ratio-visual">
              <div className="golden-rectangle">
                <div className="golden-square"></div>
                <div className="golden-rectangle-inner"></div>
              </div>
              <span className="golden-ratio-label">{formData.goldenRatio || '1:1.618'}</span>
            </div>
          </div>
        </section>
        <PageFooter pageNum={currentPage} totalPages={pageCount} brandName={formData.brandName} />
      </Page>
    );

    p.push(
      <Page key={++currentPage} title={formData.brandName} pageNum={currentPage} totalPages={pageCount} brandName={formData.brandName}>
        <section className="template-section">
          <h2 className="template-section-title">Alma da Marca</h2>
          <div className="mvv-grid">
            <div className="mvv-item">
              <span className="mvv-label">MISSÃO</span>
              <p className="mvv-text">{formData.mission || 'Não definida'}</p>
            </div>
            <div className="mvv-item">
              <span className="mvv-label">VISÃO</span>
              <p className="mvv-text">{formData.vision || 'Não definida'}</p>
            </div>
            <div className="mvv-item">
              <span className="mvv-label">VALORES</span>
              <p className="mvv-text">{formData.values || 'Não definidos'}</p>
            </div>
          </div>
        </section>

        <section className="template-section" style={{ marginTop: '1.5rem' }}>
          <h2 className="template-section-title">9. Diretrizes e Termos de Uso</h2>
          <div className="manual-text">
            {formData.manualContent}
          </div>
        </section>
        <PageFooter pageNum={currentPage} totalPages={pageCount} brandName={formData.brandName} />
      </Page>
    );

    return p;
  }, [formData, pageCount]);

  return (
    <div className="preview-area" ref={ref} id="pdf-content">
      <div className="pages-container">
        {pages}
      </div>
    </div>
  );
});

IdentityPreview.displayName = 'IdentityPreview';

export default IdentityPreview;