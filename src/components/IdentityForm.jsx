import React from 'react';
import { Type, Palette, Image, FileText, Download, Layout } from 'lucide-react';

const IdentityForm = ({ formData, setFormData, onGeneratePDF }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="sidebar animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>Brand Identity Pro</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Gerador avançado de manual de identidade visual.</p>
      </div>

      <div className="form-group">
        <label className="form-label">Nome da Marca</label>
        <input type="text" name="brandName" className="form-input" value={formData.brandName} onChange={handleChange} placeholder="Ex: Nebula Studio" spellCheck="false" />
      </div>

      <div className="form-group">
        <label className="form-label"><Image size={14} /> Sistema de Logos</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>Mestra / Principal</label>
            <input type="file" accept="image/*" className="form-input" onChange={(e) => handleLogoUpload(e, 'logo')} />
          </div>
          <div>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>Secundária</label>
            <input type="file" accept="image/*" className="form-input" onChange={(e) => handleLogoUpload(e, 'logoSecondary')} />
          </div>
          <div>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>Ícone / Símbolo</label>
            <input type="file" accept="image/*" className="form-input" onChange={(e) => handleLogoUpload(e, 'logoSymbol')} />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label"><Palette size={14} /> Paleta de 5 Cores</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.25rem' }}>
          {[1,2,3,4,5].map(num => (
            <div key={num}>
              <input type="color" name={`color${num}`} value={formData[`color${num}`]} onChange={handleChange} className="form-color-input" />
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label"><Type size={14} /> Tipografia Pro</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>Títulos (Google Font)</label>
            <input type="text" name="headingFont" className="form-input" value={formData.headingFont} onChange={handleChange} placeholder="Ex: Playfair Display" spellCheck="false" />
          </div>
          <div>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>Texto (Google Font)</label>
            <input type="text" name="bodyFont" className="form-input" value={formData.bodyFont} onChange={handleChange} placeholder="Ex: Roboto" spellCheck="false" />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label"><FileText size={14} /> Manual & Termos</label>
        <textarea
          name="manualContent"
          className="form-textarea"
          value={formData.manualContent}
          onChange={handleChange}
          style={{ minHeight: '200px', fontSize: '0.875rem' }}
        />
      </div>

      <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={onGeneratePDF}>
        <Download size={18} /> Exportar Manual Pro
      </button>
    </div>
  );
};

export default IdentityForm;
