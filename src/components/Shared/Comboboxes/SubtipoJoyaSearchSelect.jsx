import React, { useState, useEffect, useRef } from 'react';
import { combobox } from 'services/subtipoJoyaService';
import { 
    MagnifyingGlassIcon, 
    XMarkIcon, 
    ChevronRightIcon, 
    TagIcon 
} from '@heroicons/react/24/outline';

const SubtipoJoyaSearchSelect = ({ onSelect, disabled, initialName = '' }) => {
    const [inputValue, setInputValue] = useState(initialName);
    const [subtipos, setSubtipos] = useState([]); 
    const [suggestions, setSuggestions] = useState([]); 
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const wrapperRef = useRef(null);

    useEffect(() => {
        setInputValue(initialName || '');
    }, [initialName]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setShowSuggestions(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const fetchSubtipos = async () => {
        if (subtipos.length > 0) {
            setSuggestions(subtipos);
            setShowSuggestions(true);
            return;
        }

        setLoading(true);
        try {
            const response = await combobox();
            const dataSubtipos = response.data || response || [];
            
            setSubtipos(dataSubtipos);
            setSuggestions(dataSubtipos);
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
        
        if (texto.trim() === '') {
            setSuggestions(subtipos);
        } else {
            const filtrados = subtipos.filter(s => 
                s.descripcion.toLowerCase().includes(texto.toLowerCase())
            );
            setSuggestions(filtrados);
        }
        setShowSuggestions(true);
    };

    const handleSelect = (subtipo) => {
        if (onSelect) {
            onSelect(subtipo); 
            setInputValue(subtipo.descripcion); 
        }
        setShowSuggestions(false);
    };

    const handleClear = () => {
        if (disabled) return;
        setInputValue(''); 
        setSuggestions(subtipos); 
        if (onSelect) onSelect(null); 
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div className="relative flex items-center group">
                <input
                    type="text" 
                    value={inputValue} 
                    onChange={handleChange}
                    onClick={() => !showSuggestions && !disabled && fetchSubtipos()}
                    disabled={disabled}
                    placeholder="Buscar subtipo (ej. Cordon, Dije)..."
                    className="w-full border border-slate-300 dark:border-dark-border rounded-lg shadow-sm pl-9 pr-8 py-2.5 text-sm font-bold text-slate-800 dark:text-dark-text focus:ring-2 focus:ring-indigo-500 dark:focus:ring-brand-gold focus:border-indigo-500 dark:focus:border-brand-gold outline-none bg-white dark:bg-dark-surface transition-all disabled:bg-slate-50 dark:disabled:bg-dark-surface-alt disabled:text-slate-400 dark:disabled:text-dark-text-muted/60 disabled:border-slate-200 dark:disabled:border-dark-border disabled:cursor-not-allowed"
                    autoComplete="off"
                />
                <div className={`absolute left-3 transition-colors ${disabled ? 'text-slate-300 dark:text-dark-text-muted/40' : 'text-slate-400 dark:text-dark-text-muted group-focus-within:text-indigo-500 dark:group-focus-within:text-brand-gold'}`}>
                    <TagIcon className="w-4 h-4" />
                </div>
                
                <div className="absolute right-2 flex items-center">
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-slate-300 dark:border-dark-surface-alt border-t-indigo-500 dark:border-t-brand-gold rounded-full animate-spin"></div> 
                    ) : inputValue && !disabled ? (
                        <button onClick={handleClear} type="button" className="text-slate-400 dark:text-dark-text-muted hover:text-indigo-500 dark:hover:text-brand-gold p-1 transition-colors">
                            <XMarkIcon className="w-4 h-4" />
                        </button> 
                    ) : (
                        <MagnifyingGlassIcon className={`w-4 h-4 transition-colors ${disabled ? 'text-slate-300 dark:text-dark-text-muted/40' : 'text-slate-400 dark:text-dark-text-muted'}`} />
                    )}
                </div>

                {showSuggestions && !disabled && (
                    <ul className="absolute z-50 top-full left-0 w-full bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl dark:shadow-black/50 transition-colors">
                        {suggestions.length > 0 ? suggestions.map((s) => (
                            <li 
                                key={s.id} 
                                onClick={() => handleSelect(s)} 
                                className="px-4 py-2.5 cursor-pointer text-sm flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-dark-surface-alt border-b border-slate-100 dark:border-dark-border last:border-0 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-indigo-50 dark:bg-dark-surface-alt p-1.5 rounded-md border border-indigo-200 dark:border-dark-border transition-colors">
                                        <TagIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400 transition-colors" />
                                    </div>
                                    <span className="uppercase font-bold text-slate-800 dark:text-dark-text transition-colors">
                                        {s.descripcion}
                                    </span>
                                </div>
                                <ChevronRightIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted transition-colors" />
                            </li>
                        )) : (
                            <li className="px-4 py-6 text-slate-400 dark:text-dark-text-muted/60 text-xs text-center flex flex-col items-center gap-2 transition-colors">
                                <TagIcon className="w-8 h-8 text-slate-200 dark:text-dark-border transition-colors" />
                                <span>No se encontraron subtipos.</span>
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default SubtipoJoyaSearchSelect;