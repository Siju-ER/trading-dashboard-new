// src/components/shared/loaders/TableLoaders.tsx
import React from 'react';

interface TableLoaderProps {
  rows?: number;
  columns?: number;
}

const TableLoader: React.FC<TableLoaderProps> = ({ rows = 5, columns = 7 }) => {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 py-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div 
              key={colIndex} 
              className="h-4 bg-slate-200 rounded flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default TableLoader;