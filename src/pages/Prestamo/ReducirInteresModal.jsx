import React, { useMemo } from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { ScissorsIcon } from '@heroicons/react/24/outline';
import { useReducirInteresModal } from 'hooks/Prestamo/useReducirInteresModal';

const ReducirInteresModal = ({ isOpen, onClose, cuota, cuotaDetalleId = null, integranteNombre = null, onSuccess }) => {

    const interesPendiente = useMemo(() => {
        return parseFloat(cuota?.interes_pendiente ?? 0);
    }, [cuota]);

    const cuotaId = cuota?.id ?? cuota?.cuota_id ?? null;

    const {
        loading, alert, monto, motivo, preview, PORCENTAJES_RAPIDOS,
        setMotivo, handleMontoChange, handlePorcentajeRapido, handleSubmit, reset,
    } = useReducirInteresModal({
        onSuccess: (result) => { if (onSuccess) onSuccess(result); }, isOpen,
    });

    const handleClose = () => { if (!loading) { reset(); onClose(); } };
    const puedeSubmit = !!cuotaId && monto && parseFloat(monto) > 0 && parseFloat(monto) <= interesPendiente;

    const titulo = integranteNombre
        ? `Reducir Interés — ${integranteNombre} (Cuota N° ${cuota?.nro})`
        : `Reducir Interés — Cuota N° ${cuota?.nro}`;

    return (
        <ViewModal isOpen={isOpen} onClose={handleClose} title={titulo} size="sm" hideFooter>
            <div className="relative space-y-5 p-1 transition-colors">

                {loading && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-dark-surface/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3 rounded-2xl transition-colors">
                        <div className="w-8 h-8 border-4 border-brand-red/20 dark:border-brand-gold/20 border-t-brand-red dark:border-t-brand-gold rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase tracking-widest">Aplicando reducción...</p>
                    </div>
                )}

                <div className="bg-slate-900 dark:bg-black rounded-[24px] p-5 text-white dark:text-dark-text border border-transparent dark:border-dark-border transition-colors">
                    {integranteNombre && (
                        <p className="text-[9px] font-black uppercase text-brand-gold/80 tracking-[0.15em] mb-2">
                            Integrante: {integranteNombre}
                        </p>
                    )}
                    <p className="text-[9px] font-black uppercase text-slate-400 dark:text-dark-text-muted tracking-[0.2em] mb-1">Interés Pendiente</p>
                    <p className="text-3xl font-black text-brand-red dark:text-brand-gold italic">S/ {interesPendiente.toFixed(2)}</p>
                    {parseFloat(cuota?.interes_reducido ?? 0) > 0 && (
                        <p className="text-[9px] font-black text-orange-400 dark:text-orange-300 mt-1">
                            Ya reducido antes: S/ {parseFloat(cuota.interes_reducido).toFixed(2)}
                        </p>
                    )}
                    <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold mt-2">Cuota N° {cuota?.nro} — {cuota?.vencimiento}</p>
                    <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold mt-1 italic">Por cancelación anticipada de la cuota</p>
                </div>

                <div>
                    <p className="text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase mb-2">Reducción rápida (% del interés pendiente)</p>
                    <div className="flex gap-2 flex-wrap">
                        {PORCENTAJES_RAPIDOS.map((p) => (
                            <button key={p} type="button" disabled={loading || interesPendiente <= 0}
                                onClick={() => handlePorcentajeRapido(p, interesPendiente)}
                                className="px-3 py-1.5 rounded-xl text-[10px] font-black border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-slate-200 dark:border-dark-border text-slate-500 dark:text-dark-text-muted hover:border-brand-red/50 dark:hover:border-brand-gold/50">
                                {p}%
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase mb-2">Monto a reducir (S/) *</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-dark-text-muted font-black text-sm">S/</span>
                        <input type="text" inputMode="decimal" value={monto} disabled={loading || interesPendiente <= 0}
                            onChange={e => handleMontoChange(e.target.value, interesPendiente)}
                            placeholder="Ej: 25.50"
                            className="w-full p-4 pl-10 bg-slate-50 dark:bg-dark-surface-alt border-2 border-slate-100 dark:border-dark-border rounded-2xl text-sm font-black text-slate-800 dark:text-dark-text focus:border-brand-red dark:focus:border-brand-gold focus:bg-white dark:focus:bg-dark-surface outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed" />
                    </div>
                    {parseFloat(monto) > interesPendiente && (
                        <p className="text-[9px] font-black text-red-500 mt-1">El monto no puede superar el interés pendiente (S/ {interesPendiente.toFixed(2)}).</p>
                    )}
                </div>

                {preview && (
                    <div className="bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-2xl p-4 space-y-2 transition-colors">
                        <p className="text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">Vista previa</p>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted">Interés pendiente</span>
                            <span className="text-sm font-black text-slate-700 dark:text-dark-text">S/ {preview.interesPendiente.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-red-500 dark:text-red-400">Se reduce</span>
                            <span className="text-sm font-black text-red-600 dark:text-red-400 line-through">-S/ {preview.reduccion.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-purple-200 dark:border-purple-500/20 pt-2">
                            <span className="text-[10px] font-black text-purple-700 dark:text-purple-300 uppercase">Interés restante</span>
                            <span className="text-lg font-black text-purple-700 dark:text-purple-300">S/ {preview.restante.toFixed(2)}</span>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase mb-2">Motivo (opcional)</label>
                    <textarea value={motivo} onChange={e => setMotivo(e.target.value)} disabled={loading}
                        placeholder="Ej: Cancelación anticipada de cuota..." rows={2}
                        className="w-full p-3 bg-slate-50 dark:bg-dark-surface-alt border-2 border-slate-100 dark:border-dark-border rounded-2xl text-xs font-bold text-slate-700 dark:text-dark-text focus:border-brand-red dark:focus:border-brand-gold focus:bg-white dark:focus:bg-dark-surface outline-none transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed placeholder-slate-400 dark:placeholder-dark-text-muted/60" />
                </div>

                {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => {}} />}

                <button onClick={() => handleSubmit(cuotaId, interesPendiente, cuotaDetalleId)} disabled={loading || !puedeSubmit}
                    className="w-full bg-brand-red dark:bg-brand-red-glow text-white dark:text-black py-4 rounded-2xl font-black uppercase text-xs shadow-xl shadow-brand-red/30 dark:shadow-black/30 hover:bg-brand-red-dark dark:hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95">
                    {loading ? <div className="w-4 h-4 border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin" /> : <ScissorsIcon className="w-4 h-4" />}
                    {loading ? 'Aplicando...' : 'Aplicar Reducción de Interés'}
                </button>
            </div>
        </ViewModal>
    );
};

export default ReducirInteresModal;