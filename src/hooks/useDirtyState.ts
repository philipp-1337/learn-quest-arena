import { useState, useEffect, useRef } from 'react';

function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
}

export function useDirtyState<T>(initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isDirty, setIsDirty] = useState(false);
  const originalValueRef = useRef<T>(initialValue);

  useEffect(() => {
    const hasChanges = !deepEqual(value, originalValueRef.current);
    setIsDirty(hasChanges);
  }, [value]);

  const reset = () => {
    setValue(originalValueRef.current);
    setIsDirty(false);
  };

  const markAsSaved = () => {
    originalValueRef.current = value;
    setIsDirty(false);
  };

  return {
    value,
    setValue,
    isDirty,
    reset,
    markAsSaved,
  };
}
