import React from 'react';
import { useIndex } from 'hooks/Parametro/useIndex';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import {
    AdjustmentsHorizontalIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Index = () => {
    const { loading, parametros, alert, setAlert } = useIndex();

    if (loading) return <LoadingScreen />;

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 transition-colors">
            <PageHeader
                title="Parámetros del Sistema"
                icon={AdjustmentsHorizontalIcon}
            />

            <AlertMessage
                type={alert?.type}
                message={alert?.message}
                details={alert?.details}
                onClose={() => setAlert(null)}
            />

            <div className="mt-6 bg-white dark:bg-dark-surface rounded-3xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 overflow-hidden transition-colors">
                {/* Desktop */}
                <div className="hidden md:block">
                    {/* Header */}
                    <div className="grid grid-cols-12 px-6 py-4 bg-slate-50 dark:bg-dark-surface-alt border-b border-slate-100 dark:border-dark-border transition-colors">
                        <span className="col-span-3 text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest">
                            Clave
                        </span>

                        <span className="col-span-3 text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest">
                            Valor
                        </span>

                        <span className="col-span-5 text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest">
                            Descripción
                        </span>

                        <span className="col-span-1"></span>
                    </div>

                    {parametros.length === 0 ? (
                        <div className="py-16 text-center text-slate-400 dark:text-dark-text-muted text-sm font-bold uppercase tracking-widest transition-colors">
                            No hay parámetros registrados
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-dark-border transition-colors">
                            {parametros.map((p) => (
                                <div
                                    key={p.id}
                                    className="grid grid-cols-12 px-6 py-5 items-center hover:bg-slate-50 dark:hover:bg-dark-surface-alt transition-all"
                                >
                                    <div className="col-span-3">
                                        <span className="inline-flex items-center bg-slate-900 dark:bg-black text-white dark:text-dark-text text-[11px] font-black px-4 py-2 rounded-xl uppercase tracking-wide break-all transition-colors">
                                            {p.clave}
                                        </span>
                                    </div>

                                    <div className="col-span-3">
                                        <span className="text-xl font-black text-brand-red dark:text-brand-gold break-words transition-colors">
                                            {p.valor}
                                        </span>
                                    </div>

                                    <div className="col-span-5">
                                        <span className="text-sm text-slate-500 dark:text-dark-text-muted font-medium leading-relaxed transition-colors">
                                            {p.descripcion || '—'}
                                        </span>
                                    </div>

                                    <div className="col-span-1 flex justify-end">
                                        <Link
                                            to={`/parametro/editar/${p.id}`}
                                            className="p-2.5 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all"
                                        >
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Mobile */}
                <div className="md:hidden">
                    {parametros.length === 0 ? (
                        <div className="py-14 text-center text-slate-400 dark:text-dark-text-muted text-sm font-bold uppercase tracking-widest transition-colors">
                            No hay parámetros registrados
                        </div>
                    ) : (
                        <div className="p-4 space-y-4">
                            {parametros.map((p) => (
                                <div
                                    key={p.id}
                                    className="border border-slate-100 dark:border-dark-border rounded-2xl p-4 shadow-sm bg-white dark:bg-dark-surface transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <span className="inline-flex max-w-full bg-slate-900 dark:bg-black text-white dark:text-dark-text text-[10px] font-black px-3 py-2 rounded-xl uppercase tracking-wide break-all transition-colors">
                                                {p.clave}
                                            </span>

                                            <div className="mt-3">
                                                <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-dark-text-muted font-bold mb-1 transition-colors">
                                                    Valor
                                                </p>

                                                <p className="text-2xl font-black text-brand-red dark:text-brand-gold break-words transition-colors">
                                                    {p.valor}
                                                </p>
                                            </div>

                                            <div className="mt-3">
                                                <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-dark-text-muted font-bold mb-1 transition-colors">
                                                    Descripción
                                                </p>

                                                <p className="text-sm text-slate-500 dark:text-dark-text-muted leading-relaxed break-words transition-colors">
                                                    {p.descripcion || '—'}
                                                </p>
                                            </div>
                                        </div>

                                        <Link
                                            to={`/parametro/editar/${p.id}`}
                                            className="shrink-0 p-3 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-slate-100 dark:border-dark-border"
                                        >
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-dark-text-muted font-bold uppercase tracking-widest mt-5 text-center leading-relaxed px-2 transition-colors">
                Los parámetros afectan el comportamiento global del sistema.
                Modifícalos con cuidado.
            </p>
        </div>
    );
};

export default Index;