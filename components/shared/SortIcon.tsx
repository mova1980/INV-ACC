import React from 'react';
import { SortDirection } from '../../hooks/useSortableData';

export const SortIcon: React.FC<{ direction?: SortDirection }> = ({ direction }) => {
  if (!direction) {
    return <span className="inline-block w-4 h-4 ml-1 text-gray-400 opacity-50">↕</span>;
  }
  return <span className="inline-block w-4 h-4 ml-1">{direction === 'ascending' ? '▲' : '▼'}</span>;
};
