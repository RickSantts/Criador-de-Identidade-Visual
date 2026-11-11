import React, { useState } from 'react';
import { 
  FileText, Share2, Image, Layout, CreditCard, 
  FileSpreadsheet, ArrowRight, Sparkles, ChevronRight, Briefcase, Monitor, History, Calculator, Search, X
} from 'lucide-react';

const SERVICES = [
  {
    id: 'identity',
    name: 'Identidade Visual',
    description: 'Manual completo da marca',
    icon: FileText,
    color: '#4f46e5',
    gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    badge: 'Essencial',
    features: ['Logo System', 'Paleta de Cores', 'Tipografia', 'Manual de Uso']
  },
  {
    id: 'budget',
    name: 'Orçamento',
    description: 'Criação de orçamentos em PDF',
    icon: Calculator,
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    badge: 'Novo',
    features: ['Presets editáveis', 'Margem personalizada', 'Exportação PDF']
  },
  {
    id: 'businesscard',
    name: 'Cartão de Visita',
    description: 'Frente e verso profissional',
    icon: CreditCard,
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    badge: 'Clássico',
    features: ['Frente', 'Verso', 'Vertical', 'Horizontal']
  },
  {
    id: 'letterhead',
    name: 'Papel Timbrado',
    description: 'Documentos oficiais da marca',
    icon: FileSpreadsheet,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    badge: 'Formal',
    features: ['A4 Completo', 'Envelope', 'Pasta', 'Assinatura de E-mail']
  },
  {
    id: 'artshowcase',
    name: 'Showcase de Arte',
    description: 'Moldura profissional para suas artes',
    icon: Monitor,
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)',
    badge: 'Essencial',
    features: ['Moldura Minimalista', 'Identificação da Marca', 'Labels Profissionais', 'Exportação PNG']
  },
  {
    id: 'wifisign',
    name: 'Placa de Balcão',
    description: 'Wi-Fi e Pix para bares e lojas',
    icon: Share2,
    color: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
    badge: 'Brinde',
    features: ['Placa Wi-Fi', 'Placa Pix', 'QR Code Estilizado', 'Exportação PDF/PNG']
  },
  {
    id: 'presentation', name: 'Apresenta\u00e7\u00e3o', description: 'Apresenta\u00e7\u00f5es profissionais para sua marca',
    icon: Layout, color: '#0284c7', gradient: 'linear-gradient(135deg, #0284c7, #0369a1)',
    badge: 'Apresentar', features: ['Slides', 'Identidade da marca', 'Exporta\u00e7\u00e3o PDF']
  },
  {
    id: 'moodboard', name: 'Moodboard', description: 'Organize refer\u00eancias e dire\u00e7\u00f5es visuais',
    icon: Image, color: '#0f766e', gradient: 'linear-gradient(135deg, #0f766e, #115e59)',
    badge: 'Inspirar', features: ['Refer\u00eancias', 'Composi\u00e7\u00e3o visual', 'Cores da marca']
  },
  {
    id: 'gallery',
    name: 'Galeria de Projetos',
    description: 'Histórico de projetos finalizados',
    icon: History,
    color: '#64748b',
    gradient: 'linear-gradient(135deg, #64748b, #475569)',
    badge: 'Histórico',
    features: ['Ativos Salvos', 'Visualização Rápida', 'Gerenciamento', 'Re-exportação']
  }
];

export default function ServiceSelector({ activeService, onSelectService, brandData }) {
  const [query, setQuery] = useState('');
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const filteredServices = SERVICES.filter(service => normalize([service.name, service.description, ...service.features].join(' ')).includes(normalize(query)));
  const hasBrandData = brandData?.brandName && brandData?.logo;

  return (
    <div className="service-selector" role="main" id="main-content" tabIndex={-1}>
      <div className="service-selector-header">
        <div className="service-selector-title-row">
          <Sparkles size={18} className="service-sparkle" />
          <h2>Serviços de Design</h2>
        </div>
        <p>Selecione o tipo de material que deseja criar</p>
        {!hasBrandData && (
          <div className="service-brand-warning">
            <span>💡</span>
            <span>Configure sua identidade visual para reutilizar a marca e as cores nos materiais.</span>
          </div>
        )}
      </div>

      <div className="service-search" role="search">
        <Search size={19} aria-hidden="true" />
        <input aria-label="Buscar materiais" placeholder="Busque um material, como cartão ou orçamento" value={query} onChange={event => setQuery(event.target.value)} />
        {query && <button type="button" onClick={() => setQuery('')} aria-label="Limpar busca"><X size={18} /></button>}
      </div>
      <p className="service-results" role="status">{filteredServices.length} materiais dispon&#237;veis</p>
      {filteredServices.length === 0 && <div className="service-search-empty"><Search size={28} /><h3>Nenhum material encontrado</h3><p>Tente outro nome ou limpe a busca.</p><button className="btn btn-secondary" onClick={() => setQuery('')}>Ver todos os materiais</button></div>}
      <div className="service-grid">
        {filteredServices.map((service) => {
          const Icon = service.icon;
          const isActive = activeService === service.id;
          
          return (
            <button
              key={service.id}
              className={`service-card ${isActive ? 'active' : ''}`}
              onClick={() => onSelectService(service.id)}
              style={{
                '--service-color': service.color,
                '--service-gradient': service.gradient,
              }}
            >
              <div className="service-card-badge">{service.badge}</div>
              <div className="service-card-icon">
                <Icon size={24} />
              </div>
              <div className="service-card-info">
                <h3>{service.name}</h3>
                <p>{service.description}</p>
              </div>
              <div className="service-card-features">
                {service.features.map((f, i) => (
                  <span key={i} className="service-feature-tag">{f}</span>
                ))}
              </div>
              <div className="service-card-arrow">
                <ChevronRight size={16} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { SERVICES };
