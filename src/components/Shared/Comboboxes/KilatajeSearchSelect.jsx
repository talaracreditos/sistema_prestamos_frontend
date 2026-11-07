import React, { useState, useEffect, useRef } from 'react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { combobox } from 'services/kilatajeService';

/**
 * Combobox de Kilataje. Dispara onSelect con { id, nombre, precio_gramo }.
 *
 * Props:
 * - initialName: nombre precargado (modo edición)
 * - onSelect(kilataje | null)
 * - soloNombre: oro preferencial activo → solo muestra los kilatajes, sin precio
 */
const KilatajeSearchSelect = ({ initialName = '', onSelect, soloNombre = false }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([]);
    const [search, setSearch] = useState(initialName);
    const [selected, setSelected] = useState(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        setSearch(initialName);
    }, [initialName]);

    // Si se marca/desmarca oro preferencial, refresca el texto del elegido
    useEffect(() => {
        if (!selected) return;
        setSearch(soloNombre
            ? selected.nombre
            : `${selected.nombre} — S/ ${Number(selected.precio_gramo).toFixed(2)} x gr`);
    }, [soloNombre, selected]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchOptions = async () => {
        setLoading(true);
        try {
            const response = await combobox();
            setOptions(response.data || response || []);
        } catch (err) {
            setOptions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFocus = () => {
        setOpen(true);
        if (options.length === 0) fetchOptions();
    };

    const handlePick = (kilataje) => {
        setSelected(kilataje);
        setOpen(false);
        onSelect && onSelect(kilataje);
    };

    const handleClear = () => {
        setSelected(null);
        setSearch('');
        onSelect && onSelect(null);
    };

    const filtered = options.filter(k =>
        k.nombre.toLowerCase().includes(search.replace(/ —.*/, '').toLowerCase())
    );

    return (
        <div className="relative" ref={wrapperRef}>
            <div className="relative">
                <input
                    type="text"
                    value={search}
                    onFocus={handleFocus}
                    onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
                    placeholder="Selecciona el kilataje..."
                    className="w-full pl-10 pr-10 p-3.5 text-sm font-bold text-slate-800 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold focus:border-brand-red dark:focus:border-brand-gold outline-none transition-all"
                />
                <button
                    type="button"
                    onClick={() => setOpen(prev => !prev)}
                    className="absolute right-3 top-3.5 text-slate-400 dark:text-dark-text-muted"
                >
                    <ChevronUpDownIcon className="w-5 h-5" />
                </button>
            </div>

            {open && (
                <div className="absolute z-30 mt-1 w-full bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-xl shadow-lg max-h-60 overflow-auto">
                    {loading && (
                        <div className="p-3 text-xs text-slate-400 dark:text-dark-text-muted">Cargando kilatajes...</div>
                    )}
                    {!loading && filtered.length === 0 && (
                        <div className="p-3 text-xs text-slate-400 dark:text-dark-text-muted">Sin resultados.</div>
                    )}
                    {!loading && search && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-slate-400 dark:text-dark-text-muted hover:bg-slate-50 dark:hover:bg-dark-surface-alt"
                        >
                            Limpiar selección
                        </button>
                    )}
                    {!loading && filtered.map((k) => (
                        <button
                            type="button"
                            key={k.id}
                            onClick={() => handlePick(k)}
                            className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold text-slate-700 dark:text-dark-text hover:bg-brand-red-light dark:hover:bg-dark-surface-alt transition-colors"
                        >
                            <span>{k.nombre}</span>
                            <span className="flex items-center gap-2 text-xs text-slate-500 dark:text-dark-text-muted">
                                {!soloNombre && <>S/ {Number(k.precio_gramo).toFixed(2)} / gr</>}
                                {selected?.id === k.id && <CheckIcon className="w-4 h-4 text-brand-red dark:text-brand-gold" />}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default KilatajeSearchSelect;