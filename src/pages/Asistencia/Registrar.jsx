import React, { useState, useCallback } from 'react';
import { useRegistrar } from 'hooks/Asistencia/useRegistrar';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import EmpleadoSearchSelect from 'components/Shared/Comboboxes/EmpleadoSearchSelect';
import { QrCodeIcon, CheckCircleIcon, ExclamationTriangleIcon, UserIcon } from '@heroicons/react/24/outline';
import { Scanner } from '@yudiel/react-qr-scanner';

const Registrar = () => {
    const {
        loading, alert, resultado,
        handleQrScan, resetearEscaneo,
        modo, cambiarModo,
        empleadoSeleccionado, setEmpleadoSeleccionado,
        handleRegistrarManual,
    } = useRegistrar();

    const [camaraError, setCamaraError] = useState(null);

    const handleScanSuccess = useCallback((detectedCodes) => {
        if (detectedCodes && detectedCodes.length > 0) {
            handleQrScan(detectedCodes[0].rawValue);
        }
    }, [handleQrScan]);

    const handleScanError = useCallback((err) => {
        if (err?.name === 'NotAllowedError') {
            setCamaraError("Permiso de cámara denegado.");
        }
    }, []);

    return (
        <div className="container mx-auto p-4 sm:p-6 transition-colors">
            <PageHeader
                title="Registrar Asistencia"
                icon={QrCodeIcon}
                buttonText="Ver Historial"
                buttonLink="/asistencia/listar"
            />

            <AlertMessage
                type={alert?.type}
                message={alert?.message}
                details={alert?.details}
                onClose={resetearEscaneo}
            />

            <div className="mt-6 max-w-xl mx-auto">

                {/* Toggle QR / Manual */}
                <div className="flex gap-2 mb-4 bg-slate-100 dark:bg-dark-surface-alt p-1.5 rounded-2xl border border-slate-200 dark:border-dark-border transition-colors">
                    <button
                        type="button"
                        onClick={() => cambiarModo('qr')}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
                            ${modo === 'qr'
                                ? 'bg-white dark:bg-dark-surface text-brand-red dark:text-brand-gold shadow-sm'
                                : 'text-slate-400 dark:text-dark-text-muted hover:text-slate-600 dark:hover:text-dark-text'}`}>
                        <QrCodeIcon className="w-4 h-4" /> Escanear QR
                    </button>
                    <button
                        type="button"
                        onClick={() => cambiarModo('manual')}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2
                            ${modo === 'manual'
                                ? 'bg-white dark:bg-dark-surface text-brand-red dark:text-brand-gold shadow-sm'
                                : 'text-slate-400 dark:text-dark-text-muted hover:text-slate-600 dark:hover:text-dark-text'}`}>
                        <UserIcon className="w-4 h-4" /> Registro Manual
                    </button>
                </div>

                {modo === 'qr' ? (
                    <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-100 dark:border-dark-border transition-colors duration-300">

                        <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-dark-border pb-3">
                            <h3 className="text-base font-black text-slate-800 dark:text-dark-text flex items-center gap-2 uppercase tracking-wide transition-colors">
                                <QrCodeIcon className="w-6 h-6 text-brand-red dark:text-brand-gold" />
                                Escáner de Credencial
                            </h3>
                        </div>

                        <div className="relative bg-slate-100 dark:bg-dark-surface-alt rounded-xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-dark-border min-h-[300px] flex items-center justify-center transition-colors">

                            {camaraError ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-dark-surface-alt">
                                    <div className="p-4 bg-amber-100 dark:bg-amber-500/10 rounded-full mb-4 border border-amber-200 dark:border-amber-500/20">
                                        <ExclamationTriangleIcon className="w-10 h-10 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <p className="text-slate-800 dark:text-dark-text font-black uppercase text-sm mb-2">
                                        Cámara no disponible
                                    </p>
                                    <p className="text-slate-500 dark:text-dark-text-muted text-xs font-medium mb-6 max-w-xs leading-relaxed">
                                        Verifica que le diste permiso de cámara a esta página web, o usa el registro manual.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => setCamaraError(null)}
                                        className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 dark:bg-brand-red-glow dark:hover:bg-red-800 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-[0.98]"
                                    >
                                        Reintentar Cámara
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {loading && (
                                        <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center text-white">
                                            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                            <p className="font-black animate-pulse tracking-widest uppercase text-xs">Registrando...</p>
                                        </div>
                                    )}

                                    <Scanner
                                        onScan={handleScanSuccess}
                                        onError={handleScanError}
                                        components={{
                                            audio: true,
                                            finder: true
                                        }}
                                    />
                                </>
                            )}
                        </div>

                    </div>
                ) : (
                    <div className="bg-white dark:bg-dark-surface p-6 sm:p-8 rounded-2xl shadow-sm dark:shadow-black/20 border border-slate-100 dark:border-dark-border transition-colors duration-300">

                        <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-dark-border pb-3">
                            <h3 className="text-base font-black text-slate-800 dark:text-dark-text flex items-center gap-2 uppercase tracking-wide transition-colors">
                                <UserIcon className="w-6 h-6 text-brand-red dark:text-brand-gold" />
                                Registro Manual
                            </h3>
                        </div>

                        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-4 py-2.5 mb-5">
                            Usa esta opción solo si el QR/gafete falló. Queda registrado que la marca fue manual.
                        </p>

                        <div className="mb-4">
                            <label className="block text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest mb-1.5">
                                Empleado
                            </label>
                            <EmpleadoSearchSelect
                                onSelect={setEmpleadoSeleccionado}
                                initialName={empleadoSeleccionado?.nombre_completo || ''}
                            />
                        </div>

                        <button
                            type="button"
                            disabled={!empleadoSeleccionado || loading}
                            onClick={handleRegistrarManual}
                            className="w-full py-3.5 bg-brand-red dark:bg-brand-red-glow text-white dark:text-black font-black uppercase rounded-2xl hover:bg-brand-red-dark
                                dark:hover:brightness-110 transition-all shadow-xl shadow-brand-red/30 dark:shadow-black/30 disabled:opacity-50 tracking-widest active:scale-95"
                        >
                            {loading ? 'Registrando...' : 'Marcar Asistencia'}
                        </button>
                    </div>
                )}

                {/* Tarjeta de Éxito */}
                {resultado && (
                    <div className="mt-6 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl p-6 flex items-center gap-4 transition-colors animate-in fade-in slide-in-from-bottom-4 shadow-sm">
                        <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-xl border border-green-200 dark:border-green-500/30 shrink-0">
                            <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-green-800 dark:text-green-400 font-black uppercase text-sm tracking-wide">
                                {resultado.tipo === 'ingreso' ? 'Ingreso registrado' : 'Salida registrada'}
                                {resultado.usuario ? ` — ${resultado.usuario}` : ''}
                            </p>
                            <p className="text-green-700 dark:text-green-500 text-xs font-bold mt-1 opacity-90">
                                Hora de marca: {resultado.hora}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Registrar;