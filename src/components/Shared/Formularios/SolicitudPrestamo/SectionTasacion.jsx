import React, { useState, useEffect, useCallback } from 'react';
import { ScaleIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { listarTasacionesCliente } from 'services/solicitudPrestamoService';

const fmt = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const etiquetaTasacion = (t) => {
    const items = t.items || t.detalles?.map(d => d.descripcion_detallada) || [];
    return items.filter(Boolean).length > 0 ? items.filter(Boolean).join(', ') : `Tasación #${t.id}`;
};

const SectionTasacion = ({ data, handleChange, isBlocked }) => {
    const [tasaciones, setTasaciones] = useState([]);
    const [loading, setLoading]       = useState(false);
    const [errorMsg, setErrorMsg]     = useState(null);

    const cargar = useCallback(async () => {
        if (!data.cliente_id) {
            setTasaciones([]);
            return;
        }
        setLoading(true);
        setErrorMsg(null);
        try {
            const res = await listarTasacionesCliente(data.cliente_id, data.id || null);
            setTasaciones(res.data || []);
        } catch (err) {
            setErrorMsg('No se pudieron cargar las tasaciones del cliente.');
            setTasaciones([]);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.cliente_id]);

    useEffect(() => {
        cargar();
    }, [cargar]);

    const handlePick = (tasacion) => {
        if (isBlocked) return;
        handleChange('tasacion_id', tasacion.id);
        handleChange('tasacion_nombre', etiquetaTasacion(tasacion));
        handleChange('tasacion_monto_maximo', tasacion.total_maximo_prestar);
        handleChange('monto_solicitado', tasacion.total_maximo_prestar);
    };

    return (
        <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm dark:shadow-black/25 p-5 space-y-3 transition-colors">
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase text-slate-400 dark:text-dark-text-muted tracking-widest flex items-center gap-2">
                    <ScaleIcon className="w-4 h-4 text-brand-red dark:text-brand-gold" />
                    Tasación de la Garantía
                </h3>
                {data.cliente_id && (
                    <button
                        type="button"
                        onClick={cargar}
                        disabled={loading || isBlocked}
                        className="p-1 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold transition-colors disabled:opacity-40"
                        title="Recargar tasaciones"
                    >
                        <ArrowPathIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                )}
            </div>

            {!data.cliente_id && (
                <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold uppercase py-2">
                    Selecciona un cliente para ver sus tasaciones disponibles.
                </p>
            )}

            {data.cliente_id && loading && (
                <p className="text-[9px] text-slate-400 dark:text-dark-text-muted font-bold uppercase py-2">
                    Cargando tasaciones...
                </p>
            )}

            {data.cliente_id && !loading && errorMsg && (
                <p className="text-[9px] text-brand-red dark:text-red-400 font-bold uppercase py-2">{errorMsg}</p>
            )}

            {data.cliente_id && !loading && !errorMsg && tasaciones.length === 0 && (
                <p className="text-[9px] text-brand-red dark:text-brand-gold font-bold uppercase py-2">
                    Este cliente no tiene tasaciones disponibles (todas ya están usadas en otro préstamo, expiradas, abandonadas, o no tiene ninguna registrada).
                </p>
            )}

            {data.cliente_id && !loading && tasaciones.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {tasaciones.map((t) => {
                        const seleccionada = String(data.tasacion_id) === String(t.id);
                        return (
                            <button
                                type="button"
                                key={t.id}
                                onClick={() => handlePick(t)}
                                disabled={isBlocked}
                                className={`text-left p-3 rounded-xl border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                    seleccionada
                                        ? 'border-brand-red dark:border-brand-gold bg-brand-red-light/40 dark:bg-brand-gold/10'
                                        : 'border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface-alt hover:border-brand-red/40 dark:hover:border-brand-gold/40'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-[10px] font-black text-slate-700 dark:text-dark-text uppercase leading-tight">
                                        {etiquetaTasacion(t)}
                                    </p>
                                    {seleccionada && <CheckCircleIcon className="w-4 h-4 text-brand-red dark:text-brand-gold flex-shrink-0" />}
                                </div>
                                <p className="text-xs font-black text-brand-red dark:text-brand-gold mt-1">
                                    S/ {fmt(t.total_maximo_prestar)}
                                </p>
                                {t.fecha_tasacion && (
                                    <p className="text-[8px] text-slate-400 dark:text-dark-text-muted font-bold uppercase mt-1">
                                        Tasada: {t.fecha_tasacion}
                                    </p>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {data.tasacion_id && (
                <div className="mt-2 flex items-center gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-3">
                    <CheckCircleIcon className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase">
                            Seleccionada: {data.tasacion_nombre}
                        </p>
                        <p className="text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase">
                            Monto máximo tasado: S/ {fmt(data.tasacion_monto_maximo)}
                        </p>
                    </div>
                </div>
            )}

            {data.cliente_id && !data.tasacion_id && !loading && tasaciones.length > 0 && (
                <p className="text-[9px] text-brand-red dark:text-brand-gold font-bold uppercase">
                    * Selecciona una tasación para continuar
                </p>
            )}
        </div>
    );
};

export default SectionTasacion;