import React, { useState, useEffect, useRef } from 'react';
import { combobox } from 'services/ciiuService';
import { MagnifyingGlassIcon, XMarkIcon, BriefcaseIcon, TagIcon } from '@heroicons/react/24/outline';

const CiiuSelect = ({ onSelect, disabled, initialCiiu = null }) => {
    const [inputValue, setInputValue] = useState(initialCiiu ? `${initialCiiu.codigo} - ${initialCiiu.descripcion}` : '');
    const [suggestions, setSuggestions] = useState([]); 
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (initialCiiu && initialCiiu.codigo) {
            setInputValue(`${initialCiiu.codigo} - ${initialCiiu.descripcion}`);
        } else {
            setInputValue('');
        }
    }, [initialCiiu]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setShowSuggestions(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    useEffect(() => {
        if (!inputValue || inputValue.length < 2 || !showSuggestions) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await combobox({ search: inputValue });
                setSuggestions(response.data || response || []);
            } catch (error) { 
                setSuggestions([]); 
            } finally { 
                setLoading(false); 
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [inputValue, showSuggestions]);

    const handleChange = (e) => {
        setInputValue(e.target.value);
        setShowSuggestions(true);
    };

    const handleSelect = (ciiu) => {
        if (onSelect) {
            onSelect(ciiu); 
            setInputValue(`${ciiu.codigo} - ${ciiu.descripcion}`); 
        }
        setShowSuggestions(false);
    };

    const handleClear = () => {
        if (disabled) return;
        setInputValue(''); 
        setSuggestions([]); 
        if (onSelect) onSelect(null); 
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <label className="block text-[10px] font-black uppercase text-slate-400 dark:text-dark-text-muted mb-1.5 tracking-widest ml-1 transition-colors">
                Actividad Económica (CIIU)
            </label>
            <div className="relative flex items-center group">
                <input
                    type="text" 
                    value={inputValue} 
                    onChange={handleChange}
                    onClick={() => { if (!disabled && !inputValue) setShowSuggestions(true); }}
                    disabled={disabled}
                    placeholder="Escribe el código (ej: 4771) o palabra (ej: ropa)..."
                    className="w-full border border-slate-300 dark:border-dark-border rounded-xl shadow-sm pl-10 pr-10 py-3 text-sm text-slate-800 dark:text-dark-text focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none bg-white dark:bg-dark-surface transition-all disabled:bg-slate-50 dark:disabled:bg-dark-surface-alt disabled:text-slate-400 dark:disabled:text-dark-text-muted/60 disabled:border-slate-200 dark:disabled:border-dark-border disabled:cursor-not-allowed font-medium"
                    autoComplete="off"
                />
                <div className={`absolute left-3.5 transition-colors ${disabled ? 'text-slate-300 dark:text-dark-text-muted/40' : 'text-brand-red dark:text-brand-gold'}`}>
                    <BriefcaseIcon className="w-5 h-5" />
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

                {showSuggestions && !disabled && (inputValue.length >= 2) && (
                    <ul className="absolute z-[9999] top-full left-0 w-full bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-xl mt-2 max-h-72 overflow-y-auto shadow-2xl dark:shadow-black/50 animate-in fade-in slide-in-from-top-2 duration-200 transition-colors">
                        {loading && suggestions.length === 0 ? (
                            <li className="px-4 py-4 text-center text-sm font-bold text-slate-400 dark:text-dark-text-muted animate-pulse">Buscando...</li>
                        ) : suggestions.length > 0 ? (
                            suggestions.map((ciiu) => (
                                <li 
                                    key={ciiu.id} 
                                    onClick={() => handleSelect(ciiu)} 
                                    className="px-4 py-3 cursor-pointer flex flex-col gap-1 hover:bg-brand-red-light dark:hover:bg-dark-surface-alt border-b border-slate-100 dark:border-dark-border last:border-0 transition-colors"
                                >
                                    <div className="flex items-start gap-2">
                                        <span className="bg-white dark:bg-dark-surface-alt border border-brand-red/20 dark:border-brand-gold/20 text-brand-red dark:text-brand-gold font-mono font-black px-2 py-0.5 rounded text-xs shrink-0 mt-0.5 shadow-sm transition-colors">
                                            {ciiu.codigo}
                                        </span>
                                        <span className="font-bold text-slate-700 dark:text-dark-text text-sm leading-tight transition-colors">
                                            {ciiu.descripcion}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 pl-[52px] text-[10px] text-slate-400 dark:text-dark-text-muted font-bold uppercase tracking-tighter transition-colors">
                                        <span className="flex items-center gap-0.5" title={`Sección ${ciiu.seccion}`}><TagIcon className="w-3 h-3"/> Sec {ciiu.seccion}</span>
                                        <span>•</span>
                                        <span title={`División ${ciiu.division}`}>Div {ciiu.division}</span>
                                        <span>•</span>
                                        <span title={`Grupo ${ciiu.grupo}`}>Grp {ciiu.grupo}</span>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-6 text-slate-400 dark:text-dark-text-muted/60 text-xs text-center flex flex-col items-center gap-2 transition-colors">
                                <BriefcaseIcon className="w-8 h-8 text-slate-200 dark:text-dark-border" />
                                <span>No se encontraron actividades. Intenta otra palabra.</span>
                            </li>
                        )}
                    </ul>
                )}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-dark-text-muted mt-1.5 ml-1 transition-colors">Escribe al menos 2 letras para buscar en el catálogo oficial.</p>
        </div>
    );
};

export default CiiuSelect;