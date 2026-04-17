import React, { useState, useRef, useEffect } from 'react'
import html2pdf from 'html2pdf.js'
import IdentityForm from './components/IdentityForm'
import IdentityPreview from './components/IdentityPreview'

const DEFAULT_MANUAL = `DIRETRIZES DE APLICAÇÃO:
1. O logotipo deve ser utilizado preferencialmente em sua versão mestra sobre fundos claros.
2. É obrigatória a manutenção de uma área de respiro equivalente a 20% do tamanho total da marca.
3. Não é permitido distorcer, rotacionar ou alterar as cores da marca de forma não prevista neste manual.

TERMOS DE USO RECOMENDADOS:
Este manual é de uso exclusivo da marca e seus parceiros autorizados. Qualquer reprodução ou alteração dos elementos visuais sem consentimento prévio do detentor da marca poderá resultar em sanções legais. A integridade visual é fundamental para a percepção de valor e profissionalismo do negócio.`;

function App() {
  const [formData, setFormData] = useState({
    brandName: '',
    logo: null,
    logoSecondary: null,
    logoSymbol: null,
    color1: '#2563eb',
    color2: '#1e293b',
    color3: '#f59e0b',
    color4: '#64748b',
    color5: '#e2e8f0',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    manualContent: DEFAULT_MANUAL
  });

  const previewRef = useRef();

  // Dynamic Google Font loading
  useEffect(() => {
    const loadFont = (fontName) => {
      if (!fontName) return;
      const fontId = `font-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
      if (document.getElementById(fontId)) return;

      const link = document.createElement('link');
      link.id = fontId;
      link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    };

    loadFont(formData.headingFont);
    loadFont(formData.bodyFont);
  }, [formData.headingFont, formData.bodyFont]);

  const handleGeneratePDF = async () => {
    const element = previewRef.current;
    
    // Wait for all fonts to be fully loaded before capturing
    if (document.fonts) {
      await document.fonts.ready;
    }

    const opt = {
      margin: [10, 10], // Top/Bottom, Left/Right
      filename: `Manual_Pro_${formData.brandName || 'Marca'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        letterRendering: true,
        scrollY: 0,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="app-container">
      <IdentityForm 
        formData={formData} 
        setFormData={setFormData} 
        onGeneratePDF={handleGeneratePDF}
      />
      
      <IdentityPreview 
        ref={previewRef} 
        formData={formData} 
      />
    </div>
  )
}

export default App
