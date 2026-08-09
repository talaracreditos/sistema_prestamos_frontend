import React from 'react';
import { useDiaOperativo } from 'hooks/DiaOperativo/useDiaOperativo';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { CalendarDaysIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';

const formatFecha = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    const dias = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
    const dia  = dias[d.getDay()];
    const num  = String(d.getDate()).padStart(2, '0');
    const anio = d.getFullYear();
    const hh   = String(d.getHours()).padStart(2, '0');
    const mm   = String(d.getMinutes()).padStart(2, '0');
    return { fecha: `${dia} ${num}/${String(d.getMonth()+1).padStart(2,'0')}/${anio}`, hora: `${hh}:${mm}` };
};

const DiaOperativo = () => {
    const {
        diaActual, loading, actionLoading, alert, setAlert,
        handleAbrir, handleCerrar,
    } = useDiaOperativo();

    const apertura = diaActual?.fecha_apertura ? formatFecha(diaActual.fecha_apertura) : null;
    const fechaOperativa = diaActual?.fecha ? formatFecha(diaActual.fecha) : null;

    return (
        <div className="container mx-auto p-4 sm:p-6 animate-in fade-in duration-500 max-w-2xl transition-colors">
            <PageHeader
                title="Día Operativo"
                subtitle="Apertura y cierre del día. Al cerrar se procesa la mora automáticamente."
                icon={CalendarDaysIcon}
            />

            <AlertMessage
                type={alert?.type}
                message={alert?.message}
                details={alert?.details}
                onClose={() => setAlert(null)}
            />

            <div className="mt-6">
                {loading ? (
                    <div className="text-center text-slate-400 dark:text-dark-text-muted py-12 transition-colors">Cargando estado del día...</div>
                ) : (
                    <div className="bg-white dark:bg-dark-surface rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm dark:shadow-black/25 overflow-hidden transition-colors">

                        {/* Estado actual */}
                        <div className={`p-6 flex items-center gap-4 border-b border-slate-100 dark:border-dark-border transition-colors
                            ${diaActual ? 'bg-green-50 dark:bg-green-500/10' : 'bg-slate-50 dark:bg-dark-surface-alt'}`}>
                            <div className={`p-3 rounded-xl transition-colors ${diaActual ? 'bg-green-100 dark:bg-green-500/20' : 'bg-slate-200 dark:bg-dark-border'}`}>
                                {diaActual
                                    ? <LockOpenIcon className="w-6 h-6 text-green-700 dark:text-green-400" />
                                    : <LockClosedIcon className="w-6 h-6 text-slate-500 dark:text-dark-text-muted" />
                                }
                            </div>
                            <div>
                                <p className={`font-black text-sm uppercase tracking-wide transition-colors
                                    ${diaActual ? 'text-green-700 dark:text-green-400' : 'text-slate-500 dark:text-dark-text-muted'}`}>
                                    {diaActual ? 'Día Operativo ABIERTO' : 'Sin día operativo activo'}
                                </p>
                                {apertura && (
                                    <p className="text-xs text-slate-500 dark:text-dark-text-muted mt-0.5 transition-colors">
                                        Abierto el {apertura.fecha} a las {apertura.hora}
                                        {' · '}por {diaActual.usuario_apertura?.datos_empleado?.nombre + ' ' + diaActual.usuario_apertura?.datos_empleado?.apellidoPaterno + ' ' + diaActual.usuario_apertura?.datos_empleado?.apellidoMaterno ?? 'Desconocido'}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Detalle */}
                        {diaActual && fechaOperativa && (
                            <div className="px-6 py-4 grid grid-cols-2 gap-4 text-sm transition-colors">
                                <div>
                                    <p className="text-xs text-slate-400 dark:text-dark-text-muted uppercase font-bold tracking-widest mb-1">Fecha</p>
                                    <p className="font-black text-slate-700 dark:text-dark-text">{fechaOperativa.fecha}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 dark:text-dark-text-muted uppercase font-bold tracking-widest mb-1">ID</p>
                                    <p className="font-black text-slate-700 dark:text-dark-text">#{diaActual.id}</p>
                                </div>
                            </div>
                        )}

                        {/* Acción */}
                        <div className="px-6 py-5 bg-slate-50/50 dark:bg-dark-surface-alt border-t border-slate-100 dark:border-dark-border transition-colors">
                            {diaActual ? (
                                <button
                                    onClick={handleCerrar}
                                    disabled={actionLoading}
                                    className="w-full bg-brand-red dark:bg-brand-red-glow text-white dark:text-black py-3.5 rounded-xl font-black uppercase
                                        shadow-lg shadow-brand-red/30 dark:shadow-black/30 hover:bg-brand-red-dark dark:hover:brightness-110 transition-all
                                        disabled:opacity-50 tracking-wide text-sm"
                                >
                                    {actionLoading ? 'Cerrando y procesando mora...' : '🔒 Cerrar Día y Procesar Mora'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleAbrir}
                                    disabled={actionLoading}
                                    className="w-full bg-green-600 dark:bg-green-500 text-white dark:text-black py-3.5 rounded-xl font-black uppercase
                                        shadow-lg shadow-green-600/30 dark:shadow-black/30 hover:bg-green-700 dark:hover:bg-green-600 transition-all
                                        disabled:opacity-50 tracking-wide text-sm"
                                >
                                    {actionLoading ? 'Abriendo...' : 'Abrir Día Operativo'}
                                </button>
                            )}
                            {diaActual && (
                                <p className="text-[11px] text-slate-400 dark:text-dark-text-muted text-center mt-3 font-medium transition-colors">
                                    ⚠️ Al cerrar se calculará y aplicará mora a todos los préstamos vigentes con cuotas vencidas.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DiaOperativo;