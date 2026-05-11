import React, { useEffect, useRef, useState } from 'react';
import { combobox } from 'services/rolService';
import { MagnifyingGlassIcon, ShieldCheckIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

/**
 * RolesMultiSelect
 * Props:
 *   selectedIds    — array de IDs seleccionados
 *   onChange(ids, rolesObj) — callback con array de IDs y array de {id, nombre}
 *   initialRoles   — array de {id, nombre} para pre-cargar en edición
 *   incluirCliente — bool, si true trae también el rol cliente (default false)
 */
const RolesMultiSelect = ({ selectedIds = [], onChange, initialRoles = [], incluirCliente = false }) => {
    const [input,       setInput]       = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showDrop,    setShowDrop]    = useState(false);
    const [loading,     setLoading]     = useState(false);
    const [rolesObj,    setRolesObj]    = useState(initialRoles);

    const wrapperRef  = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (initialRoles.length > 0) setRolesObj(initialRoles);
         // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialRoles.length]);

    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowDrop(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchRoles = async (search = '') => {
        setLoading(true);
        try {
            const res = await combobox(1, { search }, incluirCliente);
            setSuggestions(res.data || []);
            setShowDrop(true);
        } catch (_) {
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchRoles(e.target.value), 400);
    };

    const handleSelect = (rol) => {
        if (selectedIds.includes(rol.id)) return;
        const newIds  = [...selectedIds, rol.id];
        const newObjs = [...rolesObj, { id: rol.id, nombre: rol.nombre }];
        setRolesObj(newObjs);
        onChange(newIds, newObjs);
        setInput('');
        setShowDrop(false);
    };

    const handleRemove = (id) => {
        const newIds  = selectedIds.filter(i => i !== id);
        const newObjs = rolesObj.filter(r => r.id !== id);
        setRolesObj(newObjs);
        onChange(newIds, newObjs);
    };

    const visibleSuggestions = suggestions.filter(r => !selectedIds.includes(r.id));

    return (
        <div ref={wrapperRef} className="w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">
                Roles que aplican
            </label>

            {rolesObj.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {rolesObj.map(r => (
                        <span key={r.id}
                            className="flex items-center gap-1 px-2.5 py-1 bg-brand-red-light border border-brand-red/20 rounded-xl text-[10px] font-black text-brand-red uppercase">
                            <ShieldCheckIcon className="w-3 h-3" />
                            {r.nombre}
                            <button type="button" onClick={() => handleRemove(r.id)}
                                className="ml-0.5 text-brand-red/60 hover:text-brand-red">
                                <XMarkIcon className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onClick={() => { if (!showDrop) fetchRoles(input); }}
                    placeholder="Buscar rol..."
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 pl-9 pr-8 text-sm font-bold
                        focus:ring-2 focus:ring-brand-red outline-none transition-all bg-white"
                    autoComplete="off"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <ShieldCheckIcon className="w-4 h-4" />
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {loading
                        ? <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        : <MagnifyingGlassIcon className="w-4 h-4" />
                    }
                </div>

                {showDrop && (
                    <ul className="absolute z-50 top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-52 overflow-y-auto">
                        {visibleSuggestions.length > 0
                            ? visibleSuggestions.map(r => (
                                <li key={r.id} onClick={() => handleSelect(r)}
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 cursor-pointer hover:bg-brand-red-light hover:text-brand-red transition-colors">
                                    <ShieldCheckIcon className="w-4 h-4 opacity-50" />
                                    {r.nombre}
                                </li>
                            ))
                            : <li className="px-4 py-3 text-xs text-center text-slate-400 italic">
                                {loading ? 'Buscando...' : 'Sin resultados'}
                              </li>
                        }
                    </ul>
                )}
            </div>

            {selectedIds.length === 0 && (
                <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">
                    Sin roles = cualquier rol puede ingresar sin restricción de horario
                </p>
            )}
        </div>
    );
};

export default RolesMultiSelect;