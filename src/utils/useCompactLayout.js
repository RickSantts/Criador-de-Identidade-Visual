import { useEffect, useState } from 'react';

export default function useCompactLayout() {
  const [compact, setCompact] = useState(() => window.innerWidth <= 900);
  useEffect(() => {
    const update = () => setCompact(window.innerWidth <= 900);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return compact;
}
