import React from 'react';
import Pagination from '../Pagination';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Table = ({ 
    columns, 
    data, 
    loading = false, 
    pagination = null, 
    filterConfig = [], 
    filters = {},       
    onFilterChange,    
    onFilterSubmit,    
    onFilterClear,     
    searchPlaceholder = "Buscar..."
}) => {

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onFilterSubmit();
        }
    };

    const renderFilterInput = (config) => {
        const baseClass = "block w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md text-sm text-gray-900 dark:text-dark-text shadow-sm focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-brand-gold focus:border-black dark:focus:border-brand-gold disabled:bg-gray-50 dark:disabled:bg-dark-surface-alt transition-all";

        if (config.type === 'custom' || config.render) {
            return config.render ? config.render() : null;
        }

        switch (config.type) {
            case 'select':
                return (
                    <select
                        name={config.name}
                        value={filters[config.name] || ''}
                        onChange={(e) => onFilterChange(config.name, e.target.value)}
                        disabled={loading}
                        className={`${baseClass} bg-white dark:bg-dark-surface cursor-pointer h-[38px]`}
                    >
                        {config.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );
            case 'date':
                return (
                    <input
                        type="date"
                        name={config.name}
                        value={filters[config.name] || ''}
                        onChange={(e) => onFilterChange(config.name, e.target.value)}
                        disabled={loading}
                        className={`${baseClass} bg-white dark:bg-dark-surface h-[38px]`}
                    />
                );
            case 'text':
            default:
                return (
                    <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 dark:text-dark-text-muted" />
                        </div>
                        <input
                            type="text"
                            name={config.name}
                            placeholder={config.placeholder || searchPlaceholder}
                            className={`${baseClass} bg-white dark:bg-dark-surface pl-10 h-[38px]`}
                            value={filters[config.name] || ''}
                            onChange={(e) => onFilterChange(config.name, e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="w-full flex flex-col gap-4">
            
            {/* --- SECCIÓN DE FILTROS --- */}
            {filterConfig.length > 0 && (
                <div className="bg-gray-50 dark:bg-dark-surface-alt p-4 rounded-lg border border-gray-200 dark:border-dark-border transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-end">
                        {filterConfig.map((config, index) => (
                            <div key={index} className={config.colSpan || "col-span-12 md:col-span-3"}>
                                {config.label && config.type !== 'custom' && (
                                    <label className="block text-xs font-semibold text-gray-600 dark:text-dark-text-muted mb-1">
                                        {config.label}
                                    </label>
                                )}
                                {renderFilterInput(config)}
                            </div>
                        ))}
                        <div className="col-span-12 md:col-span-2 flex gap-2">
                            <button
                                onClick={onFilterSubmit}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-black dark:bg-brand-gold text-white dark:text-black rounded-md hover:bg-zinc-800 dark:hover:brightness-110 transition-all text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 h-[38px]"
                            >
                                <MagnifyingGlassIcon className="h-4 w-4" />
                                Buscar
                            </button>

                            <button 
                                type="button"
                                onClick={onFilterClear}
                                disabled={loading}
                                className="px-3 py-2 text-gray-500 dark:text-dark-text-muted hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md border border-gray-300 dark:border-dark-border transition-all h-[38px]"
                                title="Limpiar filtros"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TABLA RESPONSIVA (CARDS EN MÓVIL) --- */}
            <div className={`transition-opacity duration-300 overflow-x-auto ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <table className="min-w-full md:divide-y md:divide-gray-200 dark:md:divide-dark-border w-full block md:table">
                    
                    <thead className="hidden md:table-header-group bg-gray-100 dark:bg-dark-surface-alt transition-colors">
                        <tr>
                            {columns.map((col, index) => (
                                <th key={index} className="px-6 py-3 text-left text-xs font-bold text-gray-600 dark:text-dark-text-muted uppercase tracking-wider">
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody className="block md:table-row-group md:divide-y md:divide-gray-100 dark:md:divide-dark-border bg-transparent md:bg-white dark:md:bg-transparent">
                        {data.length > 0 ? (
                            data.map((row, rowIndex) => (
                                <tr 
                                    key={row.id || rowIndex} 
                                    className="block md:table-row mb-4 md:mb-0 border border-gray-200 dark:border-dark-border md:border-none rounded-lg md:rounded-none shadow-sm md:shadow-none bg-white dark:bg-dark-surface md:hover:bg-gray-50 dark:md:hover:bg-dark-surface-alt transition-colors"
                                >
                                    {columns.map((col, colIndex) => (
                                        <td 
                                            key={`${rowIndex}-${colIndex}`} 
                                            className="block md:table-cell px-4 py-3 md:px-6 md:py-4 text-sm text-gray-700 dark:text-dark-text border-b dark:border-dark-border last:border-b-0 md:border-b-0 flex justify-between md:block items-center"
                                        >
                                            <span className="font-bold text-gray-600 dark:text-dark-text-muted text-xs uppercase md:hidden mr-2">
                                                {col.header}
                                            </span>

                                            <span className="text-right md:text-left truncate max-w-[70%] md:max-w-none">
                                                {col.render ? col.render(row, col, data) : row[col.accessor]}
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr className="block md:table-row bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border md:border-none p-4 md:p-0 transition-colors">
                                <td colSpan={columns.length} className="block md:table-cell px-6 py-12 text-center text-gray-400 dark:text-dark-text-muted/60">
                                    <div className="flex flex-col items-center gap-2">
                                        <MagnifyingGlassIcon className="w-8 h-8 opacity-20" />
                                        <span>No se encontraron registros</span>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- FOOTER: TOTAL REGISTROS Y PAGINACIÓN JUNTOS --- */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-2">
                
                {/* Total de registros a la izquierda (o arriba en móvil) */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border shadow-sm text-xs font-medium text-slate-500 dark:text-dark-text-muted w-full md:w-auto justify-center md:justify-start transition-colors">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                    <p>Total de registros: <span className="font-black text-slate-900 dark:text-dark-text">{pagination?.total || data.length || 0}</span></p>
                </div>

                {/* Paginación a la derecha */}
                {pagination && (
                    <div className="w-full md:w-auto flex justify-center md:justify-end">
                        <Pagination
                            currentPage={pagination.currentPage}
                            totalPages={pagination.totalPages}
                            onPageChange={pagination.onPageChange}
                        />
                    </div>
                )}
            </div>

        </div>
    );
};

export default Table;