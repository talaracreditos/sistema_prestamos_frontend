// components/Shared/Comboboxes/GastoSearchSelect.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { combobox } from 'services/cajaChicaGastoService';
import { MagnifyingGlassIcon, XMarkIcon, ReceiptPercentIcon } from '@heroicons/react/24/outline';

const GastoSearchSelect = ({ onSelect, disabled, initialGasto = null }) => {
    const [inputValue, setInputValue] = useState(initialGasto ? initialGasto.nombre : '');
    const [gastos, setGastos] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(true);
    const wrapperRef = useRef(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const response = await combobox();
                setGastos(response.data || response || []);
            } catch (error) {
                setGastos([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setShowSuggestions(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const filtered = useMemo(() => {
        if (!inputValue) return gastos;
        const term = inputValue.toLowerCase();
        return gastos.filter(g => g.nombre.toLowerCase().includes(term));
    }, [gastos, inputValue]);

    const handleSelect = (gasto) => {
        if (onSelect) onSelect(gasto);
        setInputValue(gasto.nombre);
        setShowSuggestions(false);
    };

    const handleClear = () => {
        if (disabled) return;
        setInputValue('');
        if (onSelect) onSelect(null);
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-dark-text-muted mb-1.5 tracking-widest ml-1 transition-colors">
                Concepto de Gasto
            </label>
            <div className="relative flex items-center group">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => { setInputValue(e.target.value); setShowSuggestions(true); }}
                    onClick={() => { if (!disabled) setShowSuggestions(true); }}
                    disabled={disabled}
                    placeholder="Busca un concepto de gasto..."
                    className="w-full border border-slate-300 dark:border-dark-border rounded-xl shadow-sm pl-10 pr-10 py-3 text-sm text-slate-800 dark:text-dark-text focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none bg-white dark:bg-dark-surface transition-all disabled:bg-slate-50 dark:disabled:bg-dark-surface-alt disabled:text-slate-400 dark:disabled:text-dark-text-muted/60 disabled:border-slate-200 dark:disabled:border-dark-border disabled:cursor-not-allowed font-medium"
                    autoComplete="off"
                />
                <div className={`absolute left-3.5 transition-colors ${disabled ? 'text-slate-300 dark:text-dark-text-muted/40' : 'text-brand-red dark:text-brand-gold'}`}>
                    <ReceiptPercentIcon className="w-5 h-5" />
                </div>
                <div className="absolute right-3 flex items-center">
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-slate-200 dark:border-dark-surface-alt border-t-brand-red dark:border-t-brand-gold rounded-full animate-spin"></div>
                    ) : inputValue && !disabled ? (
                        <button onClick={handleClear} type="button" className="text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold p-1 transition-colors">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    ) : (
                        <MagnifyingGlassIcon className={`w-5 h-5 transition-colors ${disabled ? 'text-slate-300 dark:text-dark-text-muted/40' : 'text-slate-400 dark:text-dark-text-muted'}`} />
                    )}
                </div>

                {showSuggestions && !disabled && (
                    <ul className="absolute z-[9999] top-full left-0 w-full bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-xl mt-2 max-h-72 overflow-y-auto shadow-2xl dark:shadow-black/50 animate-in fade-in slide-in-from-top-2 duration-200 transition-colors">
                        {loading ? (
                            <li className="px-4 py-4 text-center text-sm font-bold text-slate-400 dark:text-dark-text-muted animate-pulse">Cargando...</li>
                        ) : filtered.length > 0 ? (
                            filtered.map((gasto) => (
                                <li
                                    key={gasto.id}
                                    onClick={() => handleSelect(gasto)}
                                    className="px-4 py-3 cursor-pointer flex items-center gap-2 hover:bg-brand-red-light dark:hover:bg-dark-surface-alt border-b border-slate-100 dark:border-dark-border last:border-0 transition-colors"
                                >
                                    <ReceiptPercentIcon className="w-4 h-4 text-brand-red dark:text-brand-gold shrink-0" />
                                    <span className="font-bold text-slate-700 dark:text-dark-text text-sm leading-tight transition-colors">
                                        {gasto.nombre}
                                    </span>
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-6 text-slate-400 dark:text-dark-text-muted/60 text-xs text-center flex flex-col items-center gap-2 transition-colors">
                                <ReceiptPercentIcon className="w-8 h-8 text-slate-200 dark:text-dark-border" />
                                <span>No se encontraron conceptos de gasto.</span>
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default GastoSearchSelect;