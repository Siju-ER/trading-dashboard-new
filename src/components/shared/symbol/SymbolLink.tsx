'use client';

import React from 'react';
import { useSymbolDetails } from './SymbolDetailsContext';

type SymbolLinkProps = {
  symbol: string;
  className?: string;
  title?: string;
  children?: React.ReactNode;
};

const SymbolLink: React.FC<SymbolLinkProps> = ({ symbol, className, title = 'View equity details', children }) => {
  const { openSymbol } = useSymbolDetails();
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        openSymbol(symbol);
      }}
      className={className || 'text-violet-600 hover:text-violet-800 hover:underline font-medium'}
      title={title}
    >
      {children || symbol}
    </button>
  );
};

export default SymbolLink;


