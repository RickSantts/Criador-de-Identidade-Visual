import React, { useState, useRef, useEffect } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
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
    color1Cmyk: '80, 10, 0, 0',
    color2Cmyk: '0, 0, 0, 90',
    color3Cmyk: '0, 35, 100, 0',
    color4Cmyk: '0, 0, 0, 40',
    color5Cmyk: '0, 0, 0, 10',
    color1Pantone: '293 C',
    color2Pantone: 'Neutral Black C',
    color3Pantone: '123 C',
    color4Pantone: 'Cool Gray 7 C',
    color5Pantone: 'Cold Gray 2 C',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter',
    manualContent: DEFAULT_MANUAL,
    showGrid: false,
    gridSize: 20,
    mission: 'Transformar ideias em realidade através do design inovador.',
    vision: 'Ser referência global em branding e identidade visual até 2030.',
    values: 'Criatividade, Integridade, Inovação, Foco no Cliente.',
    showMockups: true,
    clearSpace: '20',
    minSize: '15',
    showPositive: true,
    showNegative: true,
    showMonochrome: true,
    logoNegative: null,
    logoMonochrome: null,
    mockups: [],
    toneOfVoice: 'A marca comunica-se de forma direta, eficiente e inovadora. Valorizamos transparência e resultados.',
    donts: [],
    pattern: null,
    goldenRatio: '1:1.618'
  });

  const [pageCount] = useState(5);
  const TOTAL_PAGES = 5;
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
    const element = document.getElementById('pdf-content');
    const papers = Array.from(element.querySelectorAll('.paper')).slice(0, 6);
    
    if (document.fonts) {
      await document.fonts.ready;
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    for (let i = 0; i < papers.length; i++) {
      const canvas = await html2canvas(papers[i], {
        scale: 1.5,
        useCORS: true,
        letterRendering: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const imgWidth = 210;
      const imgHeight = 297;
      
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
    }

    pdf.save(`Manual_Pro_${formData.brandName || 'Marca'}.pdf`);
  };

  return (
    <div className="app-container">
      <IdentityForm 
        formData={formData} 
        setFormData={setFormData} 
        onGeneratePDF={handleGeneratePDF}
        pageCount={pageCount}
      />
      
      <IdentityPreview 
        ref={previewRef} 
        formData={formData} 
        pageCount={pageCount}
      />
    </div>
  )
}

export default App
