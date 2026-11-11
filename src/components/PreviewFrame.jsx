import React, { useRef } from 'react';
import useElementSize from '../utils/useElementSize';

// Scale the presentation, keeping the artwork's native dimensions for export.
export default function PreviewFrame({ width, height = width, zoom = 'fit', children }) {
  const frameRef = useRef(null);
  const contentRef = useRef(null);
  const frame = useElementSize(frameRef);
  const content = useElementSize(contentRef);
  const scale = zoom === 'fit' ? Math.min(1, (frame.width || width) / width) : Number(zoom);
  return <div ref={frameRef} className="preview-fit-frame" style={{ width: zoom === 'fit' ? '100%' : width * scale, maxWidth: zoom === 'fit' ? width : 'none', height: (content.height || height) * scale }}>
    <div ref={contentRef} data-preview-frame-content style={{ width, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>
  </div>;
}
