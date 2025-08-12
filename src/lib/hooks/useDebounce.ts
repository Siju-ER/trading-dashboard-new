// src/hooks/useDebounce.ts
import { useCallback, useRef } from 'react';

export const useDebounce = (func: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  const debouncedFunction = useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => func.apply(null, args), delay);
  }, [func, delay]);
  
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);
  
  return { debouncedFunction, cancel };
};