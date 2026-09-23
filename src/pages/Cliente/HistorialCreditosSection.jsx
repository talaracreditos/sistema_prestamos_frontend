import React, { useEffect, useState, useCallback } from 'react';
import {
    BanknotesIcon, ChevronDownIcon, UserGroupIcon, SparklesIcon,
    ArrowPathIcon, ScaleIcon, UserIcon
} from '@heroicons/react/24/outline';
import { historialCreditos, kardexCredito } from 'services/clienteService';
import KardexCuotas from './KardexCuotas';
import Pagination from 'components/Shared/Pagination';

const fmt = (n) => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const ESTADOS_PRESTAMO = {
    1: { label: 'Vigente',      classes: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20' },
    2: { label: 'Cancelado',    classes: 'bg-slate-100 dark:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted border-slate-200 dark:border-dark-border' },
    3: { label: 'Liquidado',    classes: 'bg-brand-gold-light/20 dark:bg-brand-gold/10 text-brand-gold-dark dark:text-brand-gold border-brand-gold/30 dark:border-brand-gold/20' },
    4: { label: 'Refinanciado', classes: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 line-through' },
};

const CreditoCard = ({ prestamo, clienteId, expanded, onToggle, kardex, kardexLoading }) => {
    const estadoInfo = ESTADOS_PRESTAMO[prestamo.estado] ?? { label: `Estado ${prestamo.estado}`, classes: 'bg-slate-100 dark:bg-dark-surface-alt text-slate-500' };
    const deudaCliente = prestamo.deuda_cliente ?? prestamo.saldo_cliente ?? 0;

    return (
        <div className={`bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm dark:shadow-black/20 overflow-hidden transition-colors ${prestamo.estado === 2 || prestamo.estado === 4 ? 'opacity-70' : ''}`}>
            <button
                onClick={() => onToggle(prestamo.id)}
                className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left hover:bg-slate-50 dark:hover:bg-dark-surface-alt transition-colors"
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-2.5 rounded-xl bg-brand-red-light dark:bg-dark-surface-alt border border-brand-red/20 dark:border-brand-gold/20 shrink-0">
                        <BanknotesIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-black text-slate-800 dark:text-dark-text text-sm">Préstamo #{String(prestamo.id).padStart(5, '0')}</span>
                            
                            {prestamo.cargo_cliente && (
                                <span className="flex items-center gap-1 text-[9px] font-black bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded uppercase border border-purple-200 dark:border-purple-500/20">
                                    <UserIcon className="w-2.5 h-2.5" /> {prestamo.cargo_cliente}
                                </span>
                            )}

                            {prestamo.es_grupal && (
                                <span className="flex items-center gap-1 text-[9px] font-black bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded uppercase border border-indigo-200 dark:border-indigo-500/20">
                                    <UserGroupIcon className="w-3 h-3" /> Grupal
                                </span>
                            )}
                            {prestamo.es_prendario && (
                                <span className="flex items-center gap-1 text-[9px] font-black bg-brand-gold/10 text-brand-gold px-1.5 py-0.5 rounded uppercase border border-brand-gold/20">
                                    <SparklesIcon className="w-3 h-3" /> Prendario
                                </span>
                            )}
                            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase border ${estadoInfo.classes}`}>
                                {estadoInfo.label}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 dark:text-dark-text-muted mt-0.5 truncate">
                            {prestamo.producto} · {prestamo.fecha_generacion}
                            {prestamo.es_grupal && prestamo.grupo && ` · Grupo: ${prestamo.grupo}`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                    {prestamo.es_grupal ? (
                        <>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase">Deuda Cliente</p>
                                <p className={`text-sm font-black ${deudaCliente > 0 ? 'text-brand-red dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                    S/ {fmt(deudaCliente)}
                                </p>
                            </div>
                            <div className="text-right hidden sm:block border-l border-slate-200 dark:border-dark-border pl-4 sm:pl-6">
                                <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase">Deuda Grupal</p>
                                <p className={`text-sm font-black ${prestamo.deuda_actual > 0 ? 'text-brand-red dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                    S/ {fmt(prestamo.deuda_actual)}
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="text-right hidden sm:block">
                                <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase">Monto</p>
                                <p className="text-sm font-black text-slate-800 dark:text-dark-text">S/ {fmt(prestamo.monto_original)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase">Deuda actual</p>
                                <p className={`text-sm font-black ${prestamo.deuda_actual > 0 ? 'text-brand-red dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                    S/ {fmt(prestamo.deuda_actual)}
                                </p>
                            </div>
                        </>
                    )}
                    <ChevronDownIcon className={`w-4 h-4 text-slate-400 dark:text-dark-text-muted transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {expanded && (
                <div className="px-4 sm:px-5 pb-5 border-t border-slate-100 dark:border-dark-border pt-4">
                    {/* Garantía (solo prendario) */}
                    {prestamo.es_prendario && prestamo.garantia && (
                        <div className="mb-4 bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4">
                            <h5 className="flex items-center gap-1.5 text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-3">
                                <ScaleIcon className="w-4 h-4" /> Garantía prendaria
                            </h5>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase">Monto tasación</p>
                                    <p className="text-sm font-black text-slate-800 dark:text-dark-text">S/ {fmt(prestamo.garantia.monto_original)}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase">Monto prestado</p>
                                    <p className="text-sm font-black text-brand-red dark:text-brand-gold">S/ {fmt(prestamo.garantia.monto_utilizado)}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase">Custodia</p>
                                    <p className="text-sm font-black text-slate-800 dark:text-dark-text">S/ {fmt(prestamo.garantia.monto_custodia)}</p>
                                </div>
                            </div>
                            {prestamo.garantia.joyas?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {prestamo.garantia.joyas.map((j, i) => (
                                        <span key={i} className="text-[10px] font-bold bg-white dark:bg-dark-surface px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-500/20 text-slate-600 dark:text-dark-text-muted">
                                            {j.tipo_joya} · {j.subtipo_joya} ({fmt(j.peso_neto)}g) — S/ {fmt(j.valor_tasado)}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Datos generales del crédito */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2 text-xs">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase">N° cuotas</p>
                            <p className="font-bold text-slate-700 dark:text-dark-text">{prestamo.num_cuotas}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase">Valor cuota</p>
                            <p className="font-bold text-slate-700 dark:text-dark-text">S/ {fmt(prestamo.valor_cuota)}</p>
                        </div>
                        
                        {/* 🔥 TASAS JUNTAS EN LA VISTA DE REACT */}
                        <div>
                            <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase">Tasa interés</p>
                            <p className="font-bold text-slate-700 dark:text-dark-text flex items-center gap-1">
                                {prestamo.es_grupal ? (
                                    <>
                                        <span title="Interés del Grupo">{prestamo.tasa_interes}%</span>
                                        {prestamo.tasa_interes_cliente !== null && prestamo.tasa_interes_cliente !== undefined && (
                                            <>
                                                <span className="text-slate-300 dark:text-dark-border mx-0.5">/</span>
                                                <span title="Interés del Socio" className="text-brand-red dark:text-brand-gold">
                                                    {prestamo.tasa_interes_cliente}%
                                                </span>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    `${prestamo.tasa_interes}%`
                                )}
                            </p>
                        </div>
                        
                        <div>
                            <p className="text-[9px] font-black text-slate-400 dark:text-dark-text-muted uppercase">Frecuencia</p>
                            <p className="font-bold text-slate-700 dark:text-dark-text capitalize">{prestamo.frecuencia}</p>
                        </div>
                    </div>

                    {/* Kardex de cuotas */}
                    <KardexCuotas loading={kardexLoading} data={kardex} esGrupal={prestamo.es_grupal} />
                </div>
            )}
        </div>
    );
};

const HistorialCreditosSection = ({ clienteId }) => {
    const [loading, setLoading]     = useState(true);
    const [prestamos, setPrestamos] = useState([]);
    const [expandedId, setExpandedId] = useState(null);
    const [kardexCache, setKardexCache] = useState({});
    const [kardexLoadingId, setKardexLoadingId] = useState(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages]   = useState(1);

    useEffect(() => {
        if (!clienteId) return;
        setLoading(true);
        setExpandedId(null);
        setKardexCache({});
        
        historialCreditos(clienteId, currentPage)
            .then((res) => {
                const responseData = res.data || res;
                const items = responseData.data || [];
                setPrestamos(items);
                setCurrentPage(responseData.current_page || 1);
                setTotalPages(responseData.last_page || 1);
            })
            .catch(() => {
                setPrestamos([]);
                setTotalPages(1);
            })
            .finally(() => setLoading(false));
    }, [clienteId, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [clienteId]);

    const handleToggle = useCallback(async (prestamoId) => {
        if (expandedId === prestamoId) {
            setExpandedId(null);
            return;
        }
        setExpandedId(prestamoId);

        if (!kardexCache[prestamoId]) {
            setKardexLoadingId(prestamoId);
            try {
                const res = await kardexCredito(prestamoId, clienteId);
                setKardexCache(prev => ({ ...prev, [prestamoId]: res.data || res }));
            } catch (err) {
                setKardexCache(prev => ({ ...prev, [prestamoId]: null }));
            } finally {
                setKardexLoadingId(null);
            }
        }
    }, [expandedId, kardexCache, clienteId]);

    if (loading && prestamos.length === 0) {
        return (
            <div className="flex items-center justify-center py-8 text-slate-400 dark:text-dark-text-muted gap-2">
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest">Cargando historial de créditos...</span>
            </div>
        );
    }

    if (!loading && prestamos.length === 0) {
        return (
            <div className="py-8 text-center bg-slate-50 dark:bg-dark-surface-alt rounded-2xl border-2 border-dashed border-slate-200 dark:border-dark-border text-slate-400 dark:text-dark-text-muted/60 text-sm transition-colors">
                Este cliente no registra créditos.
            </div>
        );
    }

    return (
        <div className="space-y-4 relative">
            {loading && prestamos.length > 0 && (
                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center rounded-xl">
                    <ArrowPathIcon className="w-8 h-8 animate-spin text-brand-red dark:text-brand-gold" />
                </div>
            )}
            
            <div className="space-y-3">
                {prestamos.map((p) => (
                    <CreditoCard
                        key={p.id}
                        prestamo={p}
                        clienteId={clienteId}
                        expanded={expandedId === p.id}
                        onToggle={handleToggle}
                        kardex={kardexCache[p.id]}
                        kardexLoading={kardexLoadingId === p.id}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="pt-2">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => {
                            setExpandedId(null);
                            setCurrentPage(page);
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default HistorialCreditosSection;