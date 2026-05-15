import React from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { ScissorsIcon } from '@heroicons/react/24/outline';
import { useReducirMoraModal } from 'hooks/Prestamo/useReducirMoraModal';

const PORCENTAJES_RAPIDOS = [10, 25, 50, 75, 100];

const ReducirMoraModal = ({ isOpen, onClose, cuota, onSuccess }) => {
    const moraCargo = parseFloat(cuota?.mora ?? cuota?.mora_total ?? 0);

    const {
        loading, alert, porcentaje, motivo, preview,
        setMotivo, handlePorcentajeChange, handleSubmit, reset,
    } = useReducirMoraModal({
        onSuccess: (result) => {
            if (onSuccess) onSuccess(result);
        },
    });

    const handleClose = () => { reset(); onClose(); };

    const puedeSubmit = porcentaje && parseFloat(porcentaje) >= 1 && parseFloat(porcentaje) <= 100 && moraCargo > 0;

    return (
        <ViewModal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Reducir Mora — Cuota N° ${cuota?.nro}`}
            size="sm"
            hideFooter
        >
            <div className="space-y-5 p-1">

                {/* Mora actual */}
                <div className="bg-slate-900 rounded-[24px] p-5 text-white">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Mora Pendiente</p>
                    <p className="text-3xl font-black text-brand-red italic">S/ {moraCargo.toFixed(2)}</p>
                    {parseFloat(cuota?.mora_reducida ?? 0) > 0 && (
                        <p className="text-[9px] font-black text-orange-400 mt-1">
                            Ya reducida: S/ {parseFloat(cuota.mora_reducida).toFixed(2)}
                        </p>
                    )}
                    <p className="text-[9px] text-slate-400 font-bold mt-2">
                        Cuota N° {cuota?.nro} — {cuota?.vencimiento}
                    </p>
                </div>

                {/* Porcentajes rápidos */}
                <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Reducción rápida</p>
                    <div className="flex gap-2 flex-wrap">
                        {PORCENTAJES_RAPIDOS.map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => handlePorcentajeChange(String(p), moraCargo)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black border-2 transition-all
                                    ${porcentaje === String(p)
                                        ? 'border-brand-red bg-brand-red text-white'
                                        : 'border-slate-200 text-slate-500 hover:border-brand-red/50'}`}
                            >
                                {p}%
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input porcentaje manual */}
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                        Porcentaje a reducir (1–100) *
                    </label>
                    <div className="relative">
                        <input
                            type="number" min="1" max="100"
                            value={porcentaje}
                            onChange={e => handlePorcentajeChange(e.target.value, moraCargo)}
                            placeholder="Ej: 50"
                            className="w-full p-4 pr-10 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black text-slate-800 focus:border-brand-red focus:bg-white outline-none transition-all"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">%</span>
                    </div>
                </div>

                {/* Preview del cálculo */}
                {preview && (
                    <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 space-y-2">
                        <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest">Vista previa</p>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500">Mora actual</span>
                            <span className="text-sm font-black text-slate-700">S/ {preview.moraCargo.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-red-500">Se reduce</span>
                            <span className="text-sm font-black text-red-600 line-through">-S/ {preview.reduccion.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-purple-200 pt-2">
                            <span className="text-[10px] font-black text-purple-700 uppercase">Mora nueva</span>
                            <span className="text-lg font-black text-purple-700">S/ {preview.nueva.toFixed(2)}</span>
                        </div>
                    </div>
                )}

                {/* Motivo */}
                <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                        Motivo (opcional)
                    </label>
                    <textarea
                        value={motivo}
                        onChange={e => setMotivo(e.target.value)}
                        placeholder="Ej: Acuerdo con cliente, gracia por primera vez..."
                        rows={2}
                        className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold text-slate-700 focus:border-brand-red focus:bg-white outline-none transition-all resize-none"
                    />
                </div>

                {/* Alert */}
                {alert && (
                    <AlertMessage
                        type={alert.type}
                        message={alert.message}
                        onClose={() => {}}
                    />
                )}

                {/* Botón */}
                <button
                    onClick={() => handleSubmit(cuota?.id, moraCargo)}
                    disabled={loading || !puedeSubmit}
                    className="w-full bg-brand-red text-white py-4 rounded-2xl font-black uppercase text-xs shadow-xl shadow-brand-red/30 hover:bg-brand-red-dark transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                >
                    {loading
                        ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        : <ScissorsIcon className="w-4 h-4" />
                    }
                    Aplicar Reducción de Mora
                </button>
            </div>
        </ViewModal>
    );
};

export default ReducirMoraModal;