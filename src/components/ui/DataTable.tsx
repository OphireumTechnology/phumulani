/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * DataTable — Reusable Accessible Responsive Table Component
 * Official Palette: Soft Cream (#EFEBD1), Charcoal (#333333), Deep Earth (#B3340F), White (#FFFFFF)
 */

import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string | number;
  emptyState?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  emptyState,
  isLoading = false,
  className = '',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-phumulani-charcoal/15 p-8 text-center">
        <div className="w-8 h-8 border-2 border-phumulani-earth border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <span className="text-xs text-phumulani-charcoal">Loading data...</span>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-phumulani-charcoal/15 bg-white shadow-2xs ${className}`}>
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-phumulani-cream border-b border-phumulani-charcoal/15">
            {columns.map((col) => {
              const alignClass =
                col.align === 'center'
                  ? 'text-center'
                  : col.align === 'right'
                  ? 'text-right'
                  : 'text-left';
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-4 py-3 font-heading font-bold text-phumulani-earth tracking-wider uppercase text-[11px] ${alignClass} ${col.className || ''}`}
                >
                  {col.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-phumulani-cream tabular-nums">
          {data.map((item, rowIdx) => (
            <tr
              key={keyExtractor(item, rowIdx)}
              className="hover:bg-phumulani-cream/60 transition-colors"
            >
              {columns.map((col) => {
                const alignClass =
                  col.align === 'center'
                    ? 'text-center'
                    : col.align === 'right'
                    ? 'text-right'
                    : 'text-left';
                return (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-phumulani-charcoal align-middle ${alignClass} ${col.className || ''}`}
                  >
                    {col.render
                      ? col.render(item, rowIdx)
                      : String((item as Record<string, any>)[col.key] ?? '')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
