import React, { useState, useEffect, useRef } from 'react';
import { combobox } from 'services/entidadBancariaService';
import { MagnifyingGlassIcon, XMarkIcon, ChevronRightIcon, BuildingLibraryIcon, HashtagIcon } from '@heroicons/react/24/outline';

const EntidadBancariaSelect = ({ onSelect, disabled, initialName = '' }) => {
    const [inputValue, setInputValue] = useState(initialName);
    const [bancos, setBancos] = useState([]); 
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

    const fetchBancos = async () => {
        if (bancos.length > 0) {
            setSuggestions(bancos);
            setShowSuggestions(true);
            return;
        }

        setLoading(true);
        try {
            const response = await combobox();
            const dataBancos = response.data || response || [];
            
            setBancos(dataBancos);
            setSuggestions(dataBancos);
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
            setSuggestions(bancos);
        } else {
            const filtrados = bancos.filter(b => b.nombre.toLowerCase().includes(texto.toLowerCase()));
            setSuggestions(filtrados);
        }
        setShowSuggestions(true);
    };

    const handleSelect = (banco) => {
        if (onSelect) {
            onSelect(banco); 
            setInputValue(banco.nombre); 
        }
        setShowSuggestions(false);
    };

    const handleClear = () => {
        if (disabled) return;
        setInputValue(''); 
        setSuggestions(bancos); 
        if (onSelect) onSelect(null); 
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div className="relative flex items-center group">
                <input
                    type="text" 
                    value={inputValue} 
                    onChange={handleChange}
                    onClick={() => !showSuggestions && !disabled && fetchBancos()}
                    disabled={disabled}
                    placeholder="Buscar banco (ej. BCP, Interbank)..."
                    className="w-full border border-slate-300 dark:border-dark-border rounded-lg shadow-sm pl-9 pr-8 py-2.5 text-sm text-slate-800 dark:text-dark-text focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none bg-white dark:bg-dark-surface transition-all disabled:bg-slate-50 dark:disabled:bg-dark-surface-alt disabled:text-slate-400 dark:disabled:text-dark-text-muted/60 disabled:border-slate-200 dark:disabled:border-dark-border disabled:cursor-not-allowed font-medium"
                    autoComplete="off"
                />
                <div className={`absolute left-3 transition-colors ${disabled ? 'text-slate-300 dark:text-dark-text-muted/40' : 'text-slate-400 dark:text-dark-text-muted group-focus-within:text-brand-red dark:group-focus-within:text-brand-gold'}`}>
                    <BuildingLibraryIcon className="w-4 h-4" />
                </div>
                
                <div className="absolute right-2 flex items-center">
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-slate-300 dark:border-dark-surface-alt border-t-brand-red dark:border-t-brand-gold rounded-full animate-spin"></div> 
                    ) : inputValue && !disabled ? (
                        <button onClick={handleClear} type="button" className="text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold p-1 transition-colors">
                            <XMarkIcon className="w-4 h-4" />
                        </button> 
                    ) : (
                        <MagnifyingGlassIcon className={`w-4 h-4 transition-colors ${disabled ? 'text-slate-300 dark:text-dark-text-muted/40' : 'text-slate-400 dark:text-dark-text-muted'}`} />
                    )}
                </div>

                {showSuggestions && !disabled && (
                    <ul className="absolute z-50 top-full left-0 w-full bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl dark:shadow-black/50 transition-colors">
                        {suggestions.length > 0 ? suggestions.map((banco) => (
                            <li 
                                key={banco.id} 
                                onClick={() => handleSelect(banco)} 
                                className="px-4 py-2.5 cursor-pointer text-sm flex items-center justify-between hover:bg-brand-red-light dark:hover:bg-dark-surface-alt border-b border-slate-100 dark:border-dark-border last:border-0 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="bg-slate-100 dark:bg-dark-surface-alt p-1.5 rounded-md border border-slate-200 dark:border-dark-border transition-colors">
                                        <BuildingLibraryIcon className="w-5 h-5 text-slate-600 dark:text-dark-text-muted" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="uppercase font-bold text-slate-800 dark:text-dark-text transition-colors">
                                            {banco.nombre}
                                        </span>
                                        <span className="text-[10px] text-slate-500 dark:text-dark-text-muted font-medium flex items-center gap-2 mt-0.5 transition-colors">
                                            <span className="flex items-center gap-0.5"><HashtagIcon className="w-3 h-3" /> Cta: {banco.longitud_cuenta} díg.</span>
                                            <span className="flex items-center gap-0.5"><HashtagIcon className="w-3 h-3" /> CCI: {banco.longitud_cci} díg.</span>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ChevronRightIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted transition-colors" />
                                </div>
                            </li>
                        )) : (
                            <li className="px-4 py-6 text-slate-400 dark:text-dark-text-muted/60 text-xs text-center flex flex-col items-center gap-2 transition-colors">
                                <BuildingLibraryIcon className="w-8 h-8 text-slate-200 dark:text-dark-border" />
                                <span>No se encontraron bancos.</span>
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default EntidadBancariaSelect;