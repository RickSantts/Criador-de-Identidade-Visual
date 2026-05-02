import React from 'react';
import { 
  FileText, Share2, Image, Layout, CreditCard, 
  FileSpreadsheet, ArrowRight, Sparkles, ChevronRight, Briefcase, Monitor, History, Calculator
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
    features: ['Valores Fixos', 'Editar Informações', 'Exportação PDF']
  },
  {
    id: 'moodboard',
    name: 'Moodboard Automático',
    description: 'Curadoria visual e referências estéticas',
    icon: Image,
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
    badge: 'Premium',
    features: ['Grade Inteligente', 'Paleta Dinâmica', 'Exportação HD']
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
    id: 'presentation',
    name: 'Apresentação do Projeto',
    description: 'Documento de entrega profissional',
    icon: Briefcase,
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #a855f7)',
    badge: 'Premium',
    features: ['Conceito do Design', 'Showcase de Ativos', 'Observações Técnicas', 'Exportação PDF']
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
  const hasBrandData = brandData?.brandName && brandData?.logo;

  return (
    <div className="service-selector">
      <div className="service-selector-header">
        <div className="service-selector-title-row">
          <Sparkles size={18} className="service-sparkle" />
          <h2>Serviços de Design</h2>
        </div>
        <p>Selecione o tipo de material que deseja criar</p>
        {!hasBrandData && (
          <div className="service-brand-warning">
            <span>💡</span>
            <span>Preencha a identidade visual primeiro para gerar os moldes automaticamente</span>
          </div>
        )}
      </div>

      <div className="service-grid">
        {SERVICES.map((service) => {
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
