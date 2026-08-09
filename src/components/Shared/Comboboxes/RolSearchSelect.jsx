import React, { useState, useEffect, useRef } from 'react';
import { combobox } from 'services/rolService'; 
import { MagnifyingGlassIcon, ShieldCheckIcon, UserGroupIcon, XMarkIcon } from '@heroicons/react/24/outline';

const RolSearchSelect = ({ form, setForm, disabled, isFilter = false }) => {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const wrapperRef = useRef(null);
    const debounceRef = useRef(null); 

    useEffect(() => {
        if (form && form.rolNombre) {
            setInputValue(form.rolNombre);
        } else if (form && !form.rol_id) {
            setInputValue('');
        }
    }, [form]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const fetchRoles = async (searchTerm = '') => {
        setLoading(true);
        try {
            const response = await combobox(1, { search: searchTerm });
            const lista = response.data || [];
            setSuggestions(lista);
            setShowSuggestions(true);
        } catch (error) {
            console.error("Error al buscar roles", error);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const texto = e.target.value;
        setInputValue(texto);

        if (form.rol_id) {
            setForm(prev => ({ ...prev, rol_id: '', rolNombre: '' }));
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);
        
        debounceRef.current = setTimeout(() => {
            fetchRoles(texto);
        }, 500);
    };

    const handleInputClick = () => {
        if (!showSuggestions) {
            if (suggestions.length === 0) {
                fetchRoles('');
            } else {
                setShowSuggestions(true);
            }
        }
    };

    const handleSelect = (rol) => {
        setInputValue(rol.nombre);
        setForm(prev => ({ 
            ...prev, 
            rol_id: rol.id, 
            rolNombre: rol.nombre 
        }));
        setShowSuggestions(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        setInputValue('');
        setForm(prev => ({ ...prev, rol_id: '', rolNombre: '' }));
        fetchRoles('');
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            
            {!isFilter && (
                <label className="block text-sm font-black text-slate-700 dark:text-dark-text uppercase mb-2 transition-colors">
                    Rol de Usuario <span className="text-red-500 dark:text-red-400">*</span>
                </label>
            )}
            
            <div className="relative flex items-center group">

                <input
                    type="text"
                    value={inputValue}
                    onChange={handleChange}
                    onClick={handleInputClick}
                    disabled={disabled}
                    placeholder={isFilter ? "Todos los roles" : "Ej: Administrador, Editor..."}
                    className={`w-full border border-slate-300 dark:border-dark-border rounded-md shadow-sm pl-9 pr-8 text-sm focus:ring-1 focus:ring-black dark:focus:ring-brand-gold focus:border-black dark:focus:border-brand-gold outline-none transition-all placeholder-slate-400 dark:placeholder-dark-text-muted text-slate-800 dark:text-dark-text bg-white dark:bg-dark-surface
                        ${isFilter ? 'py-2' : 'py-3'} 
                        ${disabled ? 'bg-gray-100 dark:bg-dark-surface-alt cursor-not-allowed text-slate-400 dark:text-dark-text-muted/60' : ''}
                    `}
                    autoComplete="off"
                />

                {/* Icono izquierdo (Escudo para Roles) */}
                <div className="absolute left-3 text-slate-400 dark:text-dark-text-muted transition-colors">
                    <ShieldCheckIcon className="w-4 h-4" />
                </div>

                <div className="absolute right-2 flex items-center">
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-slate-300 dark:border-dark-surface-alt border-t-black dark:border-t-brand-gold rounded-full animate-spin"></div>
                    ) : inputValue ? (
                        <button onClick={handleClear} type="button" className="text-slate-400 dark:text-dark-text-muted hover:text-red-500 dark:hover:text-red-400 transition-colors">
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    ) : (
                        <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 dark:text-dark-text-muted transition-colors" />
                    )}
                </div>


                {showSuggestions && (
                    <ul className="absolute z-50 top-full left-0 w-full bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg mt-1 max-h-60 overflow-y-auto shadow-xl dark:shadow-black/50 animate-in fade-in zoom-in duration-100 transition-colors">
                        {suggestions.length > 0 ? (
                            suggestions.map((rol) => (
                                <li
                                    key={rol.id}
                                    onClick={() => handleSelect(rol)}
                                    className={`px-4 py-2.5 cursor-pointer text-sm flex items-center gap-2 transition-colors ${
                                        form.rol_id === rol.id 
                                            ? 'bg-slate-100 dark:bg-dark-surface-alt text-black dark:text-dark-text font-bold' 
                                            : 'text-slate-600 dark:text-dark-text-muted hover:bg-slate-50 dark:hover:bg-dark-surface-alt hover:text-black dark:hover:text-dark-text'
                                    }`}
                                >
                                    {/* Icono en la lista (Grupo de usuarios) */}
                                    <UserGroupIcon className="w-4 h-4 opacity-50" />
                                    {rol.nombre}
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-3 text-slate-400 dark:text-dark-text-muted/60 text-xs text-center italic transition-colors">
                                {loading ? 'Buscando...' : 'No se encontraron roles'}
                            </li>
                        )}
                    </ul>
                )}
            </div>

            {!isFilter && (
                <div className="mt-2 text-xs h-4">
                    {form.rol_id ? (
                        <span className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1 animate-pulse transition-colors">
                            ✓ Seleccionado: {form.rolNombre}
                        </span>
                    ) : (
                        <span className="text-gray-400 dark:text-dark-text-muted/60 italic transition-colors">
                            {inputValue && !loading ? 'Selecciona una opción de la lista' : 'Busca y selecciona un rol'}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default RolSearchSelect;