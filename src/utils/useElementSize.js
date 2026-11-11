import { useLayoutEffect, useState } from 'react';

export default function useElementSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const measure = () => {
      const next = { width: element.clientWidth, height: element.offsetHeight };
      setSize(previous => previous.width === next.width && previous.height === next.height ? previous : next);
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(element);
    window.addEventListener('resize', measure);
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, [ref]);
  return size;
}
