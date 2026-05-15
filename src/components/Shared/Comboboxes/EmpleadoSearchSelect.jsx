import React, { useState, useEffect, useRef } from 'react';
import { combobox } from 'services/empleadoService';
import { XMarkIcon, UserIcon } from '@heroicons/react/24/outline';

const EmpleadoSearchSelect = ({ 
    onSelect, 
    disabled, 
    initialName = '', 
    clearOnSelect = false,
    rol = ''
}) => {
    const [inputValue, setInputValue]           = useState(initialName);
    const [suggestions, setSuggestions]         = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading]                 = useState(false);

    const wrapperRef  = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => { setInputValue(initialName || ''); }, [initialName]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target))
                setShowSuggestions(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchEmpleados = async (searchTerm = '') => {
        setLoading(true);
        try {
            const response = await combobox(1, { search: searchTerm, estado: 1, rol });
            setSuggestions(response.data || []);
            setShowSuggestions(true);
        } catch {
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const texto = e.target.value;
        setInputValue(texto);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchEmpleados(texto), 400);
    };

    const handleSelect = (empleado) => {
        if (onSelect) {
            onSelect(empleado);
            setInputValue(clearOnSelect ? '' : empleado.nombre_completo);
        }
        setShowSuggestions(false);
    };

    const handleClear = () => {
        if (disabled) return;
        setInputValue('');
        if (onSelect) onSelect(null);
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <div className="relative flex items-center group">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    onClick={() => !showSuggestions && !disabled && fetchEmpleados(inputValue)}
                    disabled={disabled}
                    placeholder={rol ? `Buscar ${rol}...` : 'Buscar empleado...'}
                    className="w-full border border-slate-300 rounded-xl shadow-sm pl-10 pr-10 py-2.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-red focus:border-brand-red outline-none bg-white transition-all disabled:bg-slate-50 disabled:text-slate-400"
                    autoComplete="off"
                />
                <div className={`absolute left-3.5 ${disabled ? 'text-slate-300' : 'text-slate-400 group-focus-within:text-brand-red transition-colors'}`}>
                    <UserIcon className="w-5 h-5" />
                </div>

                <div className="absolute right-3">
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-slate-200 border-t-brand-red rounded-full animate-spin" />
                    ) : inputValue && !disabled && (
                        <button onClick={handleClear} type="button" className="text-slate-400 hover:text-brand-red transition-colors">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {showSuggestions && !disabled && (
                    <ul className="absolute z-50 top-full left-0 w-full bg-white border border-slate-200 rounded-xl mt-1.5 max-h-56 overflow-y-auto shadow-2xl p-1">
                        {suggestions.length > 0 ? suggestions.map((empleado) => (
                            <li
                                key={empleado.id}
                                onClick={() => handleSelect(empleado)}
                                className="px-3 py-2 cursor-pointer flex items-center justify-between hover:bg-brand-red-light rounded-lg border-b border-slate-50 last:border-0 transition-colors"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="flex-shrink-0 bg-slate-100 p-1 rounded-md">
                                        <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[11px] font-black text-slate-700 truncate uppercase leading-tight">
                                            {empleado.nombre_completo}
                                        </span>
                                        <span className="text-[9px] text-slate-400 font-bold">
                                            {empleado.dni}
                                        </span>
                                    </div>
                                </div>
                                <span className="flex-shrink-0 text-[8px] font-black px-1.5 py-0.5 rounded border bg-slate-100 text-slate-600 border-slate-200 uppercase">
                                    {empleado.rol}
                                </span>
                            </li>
                        )) : (
                            <li className="px-3 py-4 text-slate-400 text-[10px] font-bold text-center uppercase">
                                Sin resultados
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default EmpleadoSearchSelect;