import React from 'react';
import PrestamoSearchSelect from 'components/Shared/Comboboxes/PrestamoSearchSelect';
import { ArrowPathIcon, XMarkIcon, LockClosedIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const SectionRenovacion = ({
    esRenovacion,
    prestamoOrigen,
    comboKey,
    descuento,
    onToggleRenovacion,
    onSelectPrestamo,
    onLimpiarOrigen,
    soloLectura = false,
}) => (
    <div className="space-y-3">

        {/* ── Toggle ── */}
        <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all duration-200 ${
            esRenovacion
                ? 'bg-amber-50 border-amber-200'
                : 'bg-slate-50 border-slate-200'
        }`}>
            <label className={`flex items-center gap-3 select-none ${soloLectura ? 'cursor-default' : 'cursor-pointer'}`}>
                {!soloLectura && (
                    <input
                        type="checkbox"
                        checked={esRenovacion}
                        onChange={e => onToggleRenovacion?.(e.target.checked)}
                        className="w-4 h-4 accent-amber-500"
                    />
                )}
                <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-slate-700">
                    <ArrowPathIcon className={`w-4 h-4 ${esRenovacion ? 'text-amber-500' : 'text-slate-400'}`} />
                    Renovación de préstamo (RSS)
                </span>
            </label>

            {esRenovacion && (
                <span className="ml-auto text-[9px] font-black text-amber-700 uppercase px-2 py-1 bg-amber-100 border border-amber-200 rounded-lg tracking-widest">
                    RSS
                </span>
            )}
        </div>

        {/* ── Contenido cuando es renovación ── */}
        {esRenovacion && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="px-4 pt-4 pb-2 border-b border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Préstamo a renovar
                    </p>
                </div>

                <div className="p-4">
                    {!prestamoOrigen ? (
                        /* ── Sin seleccionar ── */
                        <div className="space-y-3">
                            <PrestamoSearchSelect
                                key={comboKey}
                                tipoOperacion="renovacion"
                                onSelect={onSelectPrestamo}
                            />
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                                Solo aparecen préstamos en su penúltima o última cuota.
                            </p>
                        </div>
                    ) : (
                        /* ── Préstamo seleccionado ── */
                        <div className="space-y-3">

                            {/* Cabecera préstamo */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-xs font-black text-slate-800 uppercase truncate">
                                            Préstamo #{String(prestamoOrigen.id).padStart(5, '0')}
                                        </p>
                                        <p className="text-[10px] text-slate-500 font-bold truncate">
                                            {prestamoOrigen.cliente}
                                        </p>
                                    </div>
                                </div>
                                {!soloLectura && (
                                    <button
                                        type="button"
                                        onClick={onLimpiarOrigen}
                                        className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                    >
                                        <XMarkIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Pills de info */}
                            <div className="flex flex-wrap gap-2">
                                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                    S/ {parseFloat(prestamoOrigen.monto || 0).toFixed(2)}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                    <LockClosedIcon className="w-3 h-3" />
                                    {prestamoOrigen.es_grupal ? 'Grupal' : 'Individual'}
                                </span>
                                {descuento > 0 && (
                                    <span className="text-[10px] font-black text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-lg">
                                        − S/ {parseFloat(descuento).toFixed(2)} a descontar
                                    </span>
                                )}
                            </div>

                            {/* Integrantes grupal */}
                            {prestamoOrigen.es_grupal && prestamoOrigen.integrantes?.length > 0 && (
                                <div className="border border-slate-100 rounded-xl overflow-hidden">
                                    <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                            Integrantes
                                        </p>
                                    </div>
                                    <div className="divide-y divide-slate-50">
                                        {prestamoOrigen.integrantes.map(i => (
                                            <div key={i.id} className="flex items-center justify-between px-3 py-2.5 gap-3">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    {i.puede_excluirse
                                                        ? <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                                        : <ExclamationCircleIcon className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                                                    }
                                                    <span className="text-[10px] font-bold text-slate-700 truncate">
                                                        {i.nombre.split(' ').slice(0, 2).join(' ')}
                                                    </span>
                                                </div>
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md flex-shrink-0 ${
                                                    i.puede_excluirse
                                                        ? 'text-emerald-700 bg-emerald-50'
                                                        : 'text-red-600 bg-red-50'
                                                }`}>
                                                    {i.puede_excluirse
                                                        ? 'Puede salir'
                                                        : `Debe renovar · S/ ${parseFloat(i.saldo_pendiente).toFixed(2)}`
                                                    }
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )}
    </div>
);

export default SectionRenovacion;