import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import DatosPersonalesForm from 'components/Shared/Formularios/Cliente/DatosPersonalesForm';
import ContactoForm from 'components/Shared/Formularios/Cliente/ContactoForm';
import DireccionForm from 'components/Shared/Formularios/Cliente/DireccionForm';
import CuentaBancariaForm from 'components/Shared/Formularios/Cliente/CuentaBancariaForm';
import EmpleoForm from 'components/Shared/Formularios/Cliente/EmpleoForm';
import UsuarioForm from 'components/Shared/Formularios/Cliente/UsuarioForm';
import { useConvertir } from 'hooks/Cliente/useConvertir';
import {
    ArrowRightCircleIcon,
    XMarkIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

const ConvertirProspectoModal = ({ isOpen, onClose, prospectoId, onSuccess }) => {
    const [fullscreen, setFullscreen] = useState(false);

    const {
        formData, loading, loadingProspecto,
        alert, setAlert,
        handleNestedChange, handleSubmit,
    } = useConvertir(prospectoId, () => { onClose(); if (onSuccess) onSuccess(); });

    const esPersona = Number(formData.datos_cliente.tipo) === 1;

    // Bloquear scroll del body mientras está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Cerrar con Escape
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape' && !loading) onClose(); };
        if (isOpen) window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, loading, onClose]);

    if (!isOpen) return null;

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-colors">

            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-colors"
                onClick={() => !loading && onClose()}
            />

            {/* Panel */}
            <div className={`
                relative z-10 bg-white dark:bg-dark-surface shadow-2xl dark:shadow-black/50 flex flex-col
                transition-all duration-300 ease-out
                w-full border-0 dark:border dark:border-dark-border
                ${fullscreen
                    ? 'inset-0 fixed rounded-none h-screen'
                    : 'rounded-t-[28px] sm:rounded-[28px] max-h-[95dvh] sm:max-h-[90dvh] sm:w-[98vw] sm:max-w-7xl'
                }
            `}>

                {/* ── Barra superior ── */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-dark-border shrink-0 transition-colors">

                    {/* Tirador móvil */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-200 dark:bg-dark-border rounded-full sm:hidden" />

                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-100 dark:border-green-500/20 transition-colors">
                            <ArrowRightCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-800 dark:text-dark-text uppercase tracking-tight transition-colors">
                                Convertir Prospecto a Cliente
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase tracking-widest transition-colors">
                                Prospecto #{prospectoId}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Fullscreen toggle — solo desktop */}
                        <button
                            type="button"
                            onClick={() => setFullscreen(v => !v)}
                            className="hidden sm:flex p-2 text-slate-400 dark:text-dark-text-muted hover:text-slate-600 dark:hover:text-dark-text hover:bg-slate-100 dark:hover:bg-dark-surface-alt rounded-xl transition-all"
                            title={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                        >
                            {fullscreen
                                ? <ArrowsPointingInIcon  className="w-4 h-4" />
                                : <ArrowsPointingOutIcon className="w-4 h-4" />
                            }
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-slate-700 dark:hover:text-dark-text hover:bg-slate-100 dark:hover:bg-dark-surface-alt rounded-xl transition-all disabled:opacity-40"
                        >
                            <XMarkIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* ── Contenido ── */}
                <div className="flex-1 overflow-y-auto overscroll-contain transition-colors">

                    {/* Estado: cargando datos del prospecto */}
                    {loadingProspecto ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <div className="w-10 h-10 border-4 border-brand-red-light dark:border-dark-surface-alt border-t-brand-red dark:border-t-brand-gold rounded-full animate-spin" />
                            <p className="text-[11px] font-black text-slate-400 dark:text-dark-text-muted uppercase tracking-widest">
                                Cargando datos del prospecto...
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} id="form-convertir" className="p-5 flex flex-col gap-5">

                            <AlertMessage
                                type={alert?.type}
                                message={alert?.message}
                                details={alert?.details}
                                onClose={() => setAlert(null)}
                            />

                            {/* Banner */}
                            <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl transition-colors">
                                <ArrowRightCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-black text-green-700 dark:text-green-400 uppercase">Conversión desde Prospecto</p>
                                    <p className="text-[11px] text-green-600 dark:text-green-400/80 mt-0.5">
                                        Los datos del prospecto han sido precargados. Completa los campos faltantes y guarda.
                                    </p>
                                </div>
                            </div>

                            {/* Grid formularios */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                <div className="lg:col-span-1 flex flex-col gap-5">
                                    <DatosPersonalesForm
                                        data={formData}
                                        handleNestedChange={handleNestedChange}
                                        isEditing={true}
                                    />
                                    <UsuarioForm
                                        form={formData}
                                        handleNestedChange={handleNestedChange}
                                        isEditing={false}
                                    />
                                </div>

                                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <DireccionForm     data={formData} handleNestedChange={handleNestedChange} />
                                    <ContactoForm      data={formData} handleNestedChange={handleNestedChange} />
                                    {esPersona && <EmpleoForm data={formData} handleNestedChange={handleNestedChange} />}
                                    <CuentaBancariaForm data={formData} handleNestedChange={handleNestedChange} />
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* ── Footer con botón ── */}
                {!loadingProspecto && (
                    <div className="shrink-0 px-5 py-4 border-t border-slate-100 dark:border-dark-border bg-white dark:bg-dark-surface flex items-center justify-between gap-3 rounded-b-[28px] transition-colors">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-2.5 text-slate-500 dark:text-dark-text-muted hover:text-slate-700 dark:hover:text-dark-text border border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-600 rounded-xl font-black text-xs uppercase transition-all disabled:opacity-40"
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            form="form-convertir"
                            disabled={loading}
                            className="flex items-center gap-2 px-8 py-2.5 bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white rounded-xl font-black uppercase text-xs shadow-lg shadow-green-500/30 dark:shadow-black/30 transition-all disabled:opacity-50 active:scale-95"
                        >
                            {loading
                                ? <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Procesando...
                                  </>
                                : <>
                                    <ArrowRightCircleIcon className="w-4 h-4" />
                                    Convertir a Cliente
                                  </>
                            }
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default ConvertirProspectoModal;