import React from 'react';

export function Button({ children, variant = 'secondary', className = '', ...props }) {
  return <button type="button" className={`ds-button ds-button--${variant} ${className}`} {...props}>{children}</button>;
}

export function FormField({ label, children }) {
  return <label className="ds-field"><span className="ds-field-label">{label}</span>{children}</label>;
}

export function PageHeading({ eyebrow, title, description, actions }) {
  return <header className="ds-page-heading">
    <div><span className="ds-eyebrow">{eyebrow}</span><h1>{title}</h1>{description && <p>{description}</p>}</div>
    {actions && <div className="ds-page-actions">{actions}</div>}
  </header>;
}

export function EmptyState({ icon: Icon, title, description, children }) {
  return <div className="ds-empty"><span className="ds-empty-icon"><Icon size={26} strokeWidth={1.4} /></span><h2>{title}</h2><p>{description}</p>{children}</div>;
}
