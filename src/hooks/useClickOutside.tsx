import { useEffect } from 'react';

export function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void, active: boolean = true) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    if (active) {
      document.addEventListener('mousedown', listener);
    }

    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, handler, active]);
}
