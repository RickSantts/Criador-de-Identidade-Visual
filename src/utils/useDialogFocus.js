import { useEffect, useRef } from 'react';

export default function useDialogFocus(ref, onClose) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const returnFocusRef = useRef(document.activeElement);
  useEffect(() => {
    const previousFocus = returnFocusRef.current;
    const previousOverflow = document.body.style.overflow;
    const dialog = ref.current;
    const focusable = () => Array.from(dialog.querySelectorAll('button:not(:disabled), input:not(:disabled):not([type="hidden"]), textarea:not(:disabled), select:not(:disabled), [href], [tabindex="0"]'));
    focusable()[0]?.focus();
    document.body.style.overflow = 'hidden';
    const handleKey = event => {
      if (event.key === 'Escape') { event.preventDefault(); closeRef.current(); }
      if (event.key !== 'Tab') return;
      const controls = focusable();
      if (event.shiftKey && document.activeElement === controls[0]) { event.preventDefault(); controls.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === controls.at(-1)) { event.preventDefault(); controls[0]?.focus(); }
    };
    dialog.addEventListener('keydown', handleKey);
    return () => {
      dialog.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [ref]);
}
