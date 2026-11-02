import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

const VARIANT_ICONS = {
  danger: AlertTriangle,
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
};

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'info',
  icon,
  showCancel = true,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel?.();
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        onConfirm?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onConfirm, onCancel]);

  if (!open) return null;

  const Icon = icon || VARIANT_ICONS[variant] || Info;

  return (
    <div className="confirm-backdrop" onClick={onCancel} role="presentation">
      <div
        className={`confirm-dialog confirm-${variant}`}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="confirm-close" onClick={onCancel} aria-label="Fechar">
          <X size={16} />
        </button>

        <div className="confirm-icon">
          <Icon size={22} />
        </div>

        <div className="confirm-content">
          {title && <h3>{title}</h3>}
          {message && <p>{message}</p>}
        </div>

        <div className="confirm-actions">
          {showCancel && (
            <button type="button" className="confirm-btn confirm-btn-ghost" onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
          <button type="button" className="confirm-btn confirm-btn-primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
