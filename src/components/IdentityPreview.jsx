import React, { forwardRef } from 'react';

const IdentityPreview = forwardRef(({ formData }, ref) => {
  return (
    <div className="preview-area">
      <div className="paper" ref={ref} id="identity-pdf" translate="no">
        <header className="template-header">
          <div className="template-logo" style={{ fontFamily: formData.headingFont }}>
            {formData.brandName || 'Nome da Marca'}
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            PRO BRAND IDENTITY GUIDE<br />
            {new Date().toLocaleDateString('pt-BR')}
          </div>
        </header>

        <section className="template-section page-section">
          <h2 className="template-section-title" style={{ fontFamily: formData.headingFont }}>1. Sistema de Logotipos</h2>
          <div className="logo-grid">
            <div className="logo-item">
              <div className="logo-container-small">
                {formData.logo ? <img src={formData.logo} alt="Primary" /> : <div style={{color:'#cbd5e1'}}>Logo Mestra</div>}
              </div>
              <span className="logo-label">Principal / Mestra</span>
            </div>
            <div className="logo-item">
              <div className="logo-container-small">
                {formData.logoSecondary ? <img src={formData.logoSecondary} alt="Secondary" /> : <div style={{color:'#cbd5e1'}}>Horizontal</div>}
              </div>
              <span className="logo-label">Secundária</span>
            </div>
            <div className="logo-item">
              <div className="logo-container-small">
                {formData.logoSymbol ? <img src={formData.logoSymbol} alt="Symbol" /> : <div style={{color:'#cbd5e1'}}>Ícone</div>}
              </div>
              <span className="logo-label">Símbolo / Ícone</span>
            </div>
          </div>
        </section>

        <section className="template-section page-section">
          <h2 className="template-section-title" style={{ fontFamily: formData.headingFont }}>2. Paleta Cromática Pro</h2>
          <div className="color-grid-5">
            {[1,2,3,4,5].map(num => (
              <div key={num} className="color-swatch">
                <div className="swatch-fill" style={{ backgroundColor: formData[`color${num}`] }}></div>
                <div className="swatch-info">
                  <div className="swatch-label" style={{ fontSize: '0.6rem' }}>Cor {num}</div>
                  <div className="swatch-hex" style={{ fontSize: '0.7rem' }}>{formData[`color${num}`]?.toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="template-section page-section">
          <h2 className="template-section-title" style={{ fontFamily: formData.headingFont }}>3. Sistema Tipográfico</h2>
          <div className="specimen-group">
            <div className="specimen-card">
              <span className="specimen-tag">Títulos</span>
              <span className="specimen-font-name" style={{ fontFamily: formData.headingFont }} translate="no">{formData.headingFont}</span>
              <div className="specimen-chars" style={{ fontFamily: formData.headingFont, fontSize: '1.25rem' }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                abcdefghijklmnopqrstuvwxyz<br />
                0123456789!?
              </div>
            </div>
            <div className="specimen-card">
              <span className="specimen-tag">Corpo de Texto</span>
              <span className="specimen-font-name" style={{ fontFamily: formData.bodyFont }} translate="no">{formData.bodyFont}</span>
              <div className="specimen-chars" style={{ fontFamily: formData.bodyFont, fontSize: '1.25rem' }}>
                ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />
                abcdefghijklmnopqrstuvwxyz<br />
                0123456789!?
              </div>
            </div>
          </div>
        </section>

        <section className="template-section page-section">
          <h2 className="template-section-title" style={{ fontFamily: formData.headingFont }}>4. Diretrizes e Termos de Uso</h2>
          <div className="manual-text" style={{ fontFamily: formData.bodyFont, fontSize: '0.9rem' }}>
            {formData.manualContent}
          </div>
        </section>

        <footer style={{ marginTop: 'auto', paddingTop: '2.5rem', fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px dotted var(--border)' }}>
          Este manual pro é uma especificação técnica da identidade visual e deve ser seguido rigorosamente.<br />
          © {new Date().getFullYear()} {formData.brandName || 'Brand Identity'}
        </footer>
      </div>
    </div>
  );
});

IdentityPreview.displayName = 'IdentityPreview';

export default IdentityPreview;
