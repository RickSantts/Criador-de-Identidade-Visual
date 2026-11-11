import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = dialogRef.current;
    (dialog?.querySelector('.confirm-btn-ghost') || dialog?.querySelector('.confirm-close'))?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel?.();
      }
      if (event.key === 'Tab') {
        const controls = Array.from(dialog.querySelectorAll('button:not(:disabled), [href], input, [tabindex="0"]'));
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open, onConfirm, onCancel]);

  if (!open) return null;

  const Icon = icon || VARIANT_ICONS[variant] || Info;

  return createPortal(
    <div className="confirm-backdrop" onClick={onCancel} role="presentation">
      <div
        className={`confirm-dialog confirm-${variant}`}
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        aria-describedby="confirm-dialog-message"
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
          {message && <p id="confirm-dialog-message">{message}</p>}
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
    </div>, document.body
  );
}
