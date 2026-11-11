import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import useDialogFocus from '../utils/useDialogFocus';

export default function DialogSheet({ label, onClose, className = '', children }) {
  const ref = useRef(null);
  useDialogFocus(ref, onClose);
  return createPortal(<div className="budget-sheet-backdrop" onClick={onClose}>
    <section ref={ref} className={`budget-sheet-card ${className}`} role="dialog" aria-modal="true" aria-label={label} onClick={event => event.stopPropagation()}>{children}</section>
  </div>, document.body);
}
