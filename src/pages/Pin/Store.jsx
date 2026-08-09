import React from 'react';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import EmpleadoSearchSelect from 'components/Shared/Comboboxes/EmpleadoSearchSelect';
import { useStore } from 'hooks/Pin/useStore';
import { ShieldCheckIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

const Store = () => {
    const {
        loading, alert, setAlert,
        pinGenerado, setPinGenerado,
        copiado, usuarioKey,
        form, handleChange,
        handleGenerar, handleCopiar,
    } = useStore({ isOpen: true });

    return (
        <div className="container mx-auto p-4 sm:p-6 w-full max-w-full xl:max-w-lg transition-colors">
            <PageHeader title="Generar PIN de Autorización" icon={ShieldCheckIcon} />

            <div className="mt-6 bg-white dark:bg-dark-surface rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm dark:shadow-black/25 p-6 transition-colors">
                <AlertMessage type={alert?.type} message={alert?.message} onClose={() => setAlert(null)} />

                {!pinGenerado ? (
                    <div className="flex flex-col gap-5">

                        {/* Usuario destinatario */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase mb-1.5 transition-colors">
                                Usuario Destinatario
                                <span className="text-slate-400 dark:text-dark-text-muted/60 normal-case font-medium ml-1">(vacío = cualquiera)</span>
                            </label>
                            <EmpleadoSearchSelect
                                key={usuarioKey}
                                onSelect={(u) => handleChange('usuario_id', u ? u.id : null)}
                                clearOnSelect={false}
                            />
                            {form.usuario_id && (
                                <p className="text-[9px] text-green-600 dark:text-green-400 font-bold mt-1 transition-colors">
                                    ✓ Solo este usuario podrá usar el PIN
                                </p>
                            )}
                        </div>

                        {/* Usos */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase mb-1.5 transition-colors">
                                Número de Usos
                                <span className="text-slate-400 dark:text-dark-text-muted/60 normal-case font-medium ml-1">(0 = ilimitado)</span>
                            </label>
                            <input
                                type="number" min="0" max="100"
                                value={form.usos_maximos}
                                onChange={e => handleChange('usos_maximos', parseInt(e.target.value) || 0)}
                                className="w-full p-3 border border-slate-200 dark:border-dark-border rounded-xl text-sm font-bold text-slate-700 dark:text-dark-text bg-slate-50 dark:bg-dark-surface-alt focus:ring-2 focus:ring-brand-red dark:focus:ring-brand-gold outline-none transition-colors"
                            />
                        </div>

                        {/* Expiración */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 dark:text-dark-text-muted uppercase mb-1.5 transition-colors">
                                Expiración
                                <span className="text-slate-400 dark:text-dark-text-muted/60 normal-case font-medium ml-1">(0 = sin expiración)</span>
                            </label>
                            <div className="flex gap-2">
                                {[1, 5, 10, 30, 0].map(m => (
                                    <button
                                        key={m} type="button"
                                        onClick={() => handleChange('expira_minutos', m)}
                                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black border-2 transition-all
                                            ${form.expira_minutos === m
                                                ? 'border-brand-red dark:border-brand-gold bg-brand-red-light dark:bg-brand-gold/10 text-brand-red dark:text-brand-gold'
                                                : 'border-slate-200 dark:border-dark-border text-slate-500 dark:text-dark-text-muted hover:border-slate-300 dark:hover:border-slate-600'
                                            }`}
                                    >
                                        {m === 0 ? '∞' : `${m}m`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="button" onClick={handleGenerar} disabled={loading}
                            className="w-full bg-brand-red dark:bg-brand-red-glow text-white dark:text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-brand-red/25 dark:shadow-black/30 hover:bg-brand-red-dark dark:hover:brightness-110 transition-all disabled:opacity-30 flex items-center justify-center gap-2 active:scale-95"
                        >
                            {loading
                                ? <><div className="w-4 h-4 border-2 border-white/20 dark:border-black/20 border-t-white dark:border-t-black rounded-full animate-spin" /> Generando...</>
                                : <><ShieldCheckIcon className="w-4 h-4" /> Generar PIN</>
                            }
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-5 py-2">
                        <div className="p-3 rounded-2xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 transition-colors">
                            <ShieldCheckIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>

                        <p className="text-xs font-black text-slate-700 dark:text-dark-text uppercase transition-colors">PIN Generado Exitosamente</p>

                        {/* PIN grande */}
                        <div className="bg-slate-900 dark:bg-black rounded-2xl px-10 py-6 flex items-center gap-5 border border-transparent dark:border-dark-border transition-colors">
                            <span className="font-mono text-5xl font-black text-white dark:text-dark-text tracking-[0.4em]">
                                {pinGenerado.pin}
                            </span>
                            <button onClick={handleCopiar} type="button" className="text-slate-400 dark:text-dark-text-muted hover:text-white dark:hover:text-dark-text transition-colors">
                                {copiado
                                    ? <CheckIcon className="w-6 h-6 text-green-400" />
                                    : <ClipboardDocumentIcon className="w-6 h-6" />
                                }
                            </button>
                        </div>

                        {/* Detalles */}
                        <div className="w-full space-y-2 bg-slate-50 dark:bg-dark-surface-alt rounded-xl p-4 transition-colors">
                            <div className="flex justify-between text-[10px]">
                                <span className="text-slate-400 dark:text-dark-text-muted font-bold uppercase">Destinatario</span>
                                <span className="font-black text-slate-700 dark:text-dark-text">{pinGenerado.para_usuario}</span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                                <span className="text-slate-400 dark:text-dark-text-muted font-bold uppercase">Usos</span>
                                <span className="font-black text-slate-700 dark:text-dark-text">
                                    {pinGenerado.usos_maximos === 0 ? 'Ilimitado' : pinGenerado.usos_maximos}
                                </span>
                            </div>
                            <div className="flex justify-between text-[10px]">
                                <span className="text-slate-400 dark:text-dark-text-muted font-bold uppercase">Expira</span>
                                <span className="font-black text-slate-700 dark:text-dark-text">
                                    {pinGenerado.expira_at
                                        ? new Date(pinGenerado.expira_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
                                        : 'Sin expiración'}
                                </span>
                            </div>
                        </div>

                        <p className="text-[10px] text-slate-400 dark:text-dark-text-muted text-center font-medium px-4 transition-colors">
                            Comparte este PIN solo con el usuario autorizado. No lo guardes en ningún lugar.
                        </p>

                        <button
                            type="button"
                            onClick={() => setPinGenerado(null)}
                            className="w-full border-2 border-brand-red dark:border-brand-gold text-brand-red dark:text-brand-gold py-3.5 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-brand-red-light dark:hover:bg-brand-gold/10 transition-all"
                        >
                            Generar Otro PIN
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Store;