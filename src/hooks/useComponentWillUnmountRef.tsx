import { useEffect, useRef } from 'react';

export default function useComponentWillUnmount() {
  const componentWillUnmount = useRef(false);
  useEffect(() => {
    return () => {
      componentWillUnmount.current = true;
    };
  }, []);

  return componentWillUnmount;
}
