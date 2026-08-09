import React, { useState, useEffect, useRef } from 'react';
import { combobox } from 'services/prestamoService';
import { MagnifyingGlassIcon, XMarkIcon, BanknotesIcon, UserIcon, IdentificationIcon } from '@heroicons/react/24/outline';

const PrestamoSearchSelect = ({ onSelect, disabled, tipoOperacion = 'cobro', initialName = '', resetKey }) => {
    const [inputValue, setInputValue] = useState(initialName);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setShowSuggestions(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    useEffect(() => {
        setInputValue('');
        setSuggestions([]);
        if (onSelect) onSelect(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tipoOperacion]);

    // ── Limpiar cuando el padre fuerza reset ──────────────────────────────────
    useEffect(() => {
        if (resetKey === undefined) return;
        setInputValue('');
        setSuggestions([]);
        setShowSuggestions(false);
    }, [resetKey]);

    const fetchPrestamos = async (term = '') => {
        setLoading(true);
        try {
            const response = await combobox(tipoOperacion, term);
            const dataPrestamos = response.data || response || [];
            setSuggestions(dataPrestamos);
            setShowSuggestions(true);
        } catch (error) { 
            setSuggestions([]); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleChange = (e) => {
        const texto = e.target.value;
        setInputValue(texto);
        if (texto.trim().length >= 2) {
            fetchPrestamos(texto);
        } else if (texto.trim() === '') {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelect = (prestamo) => {
        if (onSelect) {
            onSelect(prestamo); 
            setInputValue(prestamo.label); 
        }
        setShowSuggestions(false);
    };

    const handleClear = () => {
        if (disabled) return;
        setInputValue(''); 
        setSuggestions([]); 
        if (onSelect) onSelect(null); 
    };

    const isDesembolso = tipoOperacion === 'desembolso';

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div className="relative flex items-center group">
                <input
                    type="text" 
                    value={inputValue} 
                    onChange={handleChange}
                    onClick={() => {
                        if (!showSuggestions && !disabled && inputValue.length < 2) fetchPrestamos('');
                    }}
                    disabled={disabled}
                    placeholder={isDesembolso ? "Buscar préstamo aprobado para desembolsar..." : "Buscar préstamo para cobrar cuota..."}
                    className="w-full bg-white dark:bg-dark-surface border border-slate-300 dark:border-dark-border text-slate-800 dark:text-dark-text rounded-xl shadow-sm pl-11 pr-8 py-3 text-sm font-bold focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none transition-all disabled:bg-slate-50 dark:disabled:bg-dark-surface-alt disabled:text-slate-400 dark:disabled:text-dark-text-muted/60 disabled:border-slate-200 dark:disabled:border-dark-border disabled:cursor-not-allowed"
                    autoComplete="off"
                />
                <div className={`absolute left-3.5 transition-colors ${disabled ? 'text-slate-300 dark:text-dark-text-muted/40' : 'text-slate-400 dark:text-dark-text-muted group-focus-within:text-brand-red dark:group-focus-within:text-brand-gold'}`}>
                    <BanknotesIcon className="w-5 h-5" />
                </div>
                
                <div className="absolute right-3 flex items-center">
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-slate-300 dark:border-dark-surface-alt rounded-full animate-spin border-t-brand-red dark:border-t-brand-gold"></div> 
                    ) : inputValue && !disabled ? (
                        <button onClick={handleClear} type="button" className="text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold p-1 transition-colors">
                            <XMarkIcon className="w-5 h-5" />
                        </button> 
                    ) : (
                        <MagnifyingGlassIcon className={`w-4 h-4 transition-colors ${disabled ? 'text-slate-300 dark:text-dark-text-muted/40' : 'text-slate-400 dark:text-dark-text-muted'}`} />
                    )}
                </div>

                {showSuggestions && !disabled && (
                    <ul className="absolute z-50 top-full left-0 w-full bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-xl mt-1.5 max-h-72 overflow-y-auto shadow-2xl dark:shadow-black/50 p-1.5 space-y-1 transition-colors">
                        {suggestions.length > 0 ? suggestions.map((prestamo) => (
                            <li 
                                key={prestamo.id} 
                                onClick={() => handleSelect(prestamo)} 
                                className="px-4 py-3 cursor-pointer rounded-lg border border-transparent hover:border-brand-red/20 dark:hover:border-brand-gold/20 hover:bg-brand-red-light dark:hover:bg-dark-surface-alt transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <span className="uppercase font-black text-slate-800 dark:text-dark-text text-xs flex items-center gap-1.5 transition-colors">
                                            <UserIcon className="w-3.5 h-3.5 text-brand-red dark:text-brand-gold transition-colors" /> {prestamo.cliente}
                                        </span>
                                        <span className="text-[10px] text-slate-500 dark:text-dark-text-muted font-bold flex items-center gap-1.5 transition-colors">
                                            <IdentificationIcon className="w-3.5 h-3.5 text-slate-400 dark:text-dark-text-muted transition-colors" /> Doc: {prestamo.documento}
                                        </span>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <span className="text-sm font-black italic text-brand-red dark:text-brand-gold transition-colors">
                                            S/ {prestamo.monto}
                                        </span>
                                        {!isDesembolso && (
                                            <span className="text-[9px] bg-slate-100 dark:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted border border-slate-200 dark:border-dark-border px-2 py-0.5 rounded-full font-bold uppercase transition-colors">
                                                {prestamo.cuotas_pendientes} cuotas pend.
                                            </span>
                                        )}
                                        {isDesembolso && (
                                            <span className="text-[9px] bg-brand-gold-light dark:bg-brand-gold/10 text-brand-gold-dark dark:text-brand-gold border border-brand-gold/30 dark:border-brand-gold/20 px-2 py-0.5 rounded-full font-bold uppercase transition-colors">
                                                Listo para entregar
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </li>
                        )) : (
                            <li className="px-4 py-6 text-slate-400 dark:text-dark-text-muted/60 text-xs text-center flex flex-col items-center gap-2 transition-colors">
                                <BanknotesIcon className="w-8 h-8 text-slate-200 dark:text-dark-border transition-colors" />
                                <span className="font-bold">No se encontraron préstamos para {isDesembolso ? 'desembolsar' : tipoOperacion === 'renovacion' ? 'renovar' : 'cobrar'}.</span>
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default PrestamoSearchSelect;