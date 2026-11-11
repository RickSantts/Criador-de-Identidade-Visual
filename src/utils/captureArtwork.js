

export default async function captureArtwork(element, options = {}) {
  const { default: html2canvas } = await import('html2canvas');
  const { width, height, ...rest } = options;
  return html2canvas(element, {
    ...rest,
    ...(width > 0 ? { width } : {}),
    ...(height > 0 ? { height } : {}),
    onclone: async (document, clonedElement) => {
      const frame = clonedElement?.closest('[data-preview-frame-content]');
      if (frame) {
        frame.style.transform = 'none';
        const stage = frame.parentElement;
        // Mobile editing hides the preview; isolate its clone from that hidden
        // parent and from any scrolling/overflow constraints before capture.
        document.body.appendChild(stage);
        Object.assign(stage.style, { position: 'absolute', left: '0', top: '0', width: frame.style.width, maxWidth: 'none', height: 'auto', overflow: 'visible', visibility: 'visible', display: 'block' });
      }
      await options.onclone?.(document, clonedElement);
    },
  });
}
