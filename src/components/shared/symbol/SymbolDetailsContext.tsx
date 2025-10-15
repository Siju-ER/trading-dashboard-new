'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import SymbolDetailsModal from '@/components/shared/ui/modal/SymbolDetailsModal';

type SymbolDetailsContextValue = {
  openSymbol: (symbol: string) => void;
  close: () => void;
};

const SymbolDetailsContext = createContext<SymbolDetailsContextValue | undefined>(undefined);

export const useSymbolDetails = (): SymbolDetailsContextValue => {
  const ctx = useContext(SymbolDetailsContext);
  if (!ctx) {
    throw new Error('useSymbolDetails must be used within a SymbolDetailsProvider');
  }
  return ctx;
};

type ProviderProps = {
  children: React.ReactNode;
};

export const SymbolDetailsProvider: React.FC<ProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [symbol, setSymbol] = useState<string | undefined>(undefined);

  const openSymbol = useCallback((s: string) => {
    setSymbol(s);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSymbol(undefined);
  }, []);

  const value = useMemo(() => ({ openSymbol, close }), [openSymbol, close]);

  return (
    <SymbolDetailsContext.Provider value={value}>
      {children}
      <SymbolDetailsModal isOpen={isOpen} symbol={symbol} onClose={close} />
    </SymbolDetailsContext.Provider>
  );
};

export default SymbolDetailsContext;


