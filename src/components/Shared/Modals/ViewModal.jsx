import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ViewModal = ({ isOpen, onClose, title, children, isLoading = false, size = 'lg', hideFooter = false }) => {

    const sizeClass = {
        sm:   'max-w-md',
        md:   'max-w-2xl',
        lg:   'max-w-4xl',
        xl:   'max-w-6xl',
        '2xl':'max-w-7xl',
        '3xl':'max-w-[92vw]',
        full: 'max-w-[98vw]',
    }[size] ?? 'max-w-4xl';

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all">
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] transition-opacity"
                onClick={onClose}
            />
            <div className={`
                relative bg-white w-full ${sizeClass}
                flex flex-col
                rounded-t-2xl sm:rounded-2xl
                shadow-2xl overflow-hidden
                max-h-[95vh] sm:max-h-[92vh]
                animate-in slide-in-from-bottom sm:zoom-in-95 duration-200
            `}>

                {/* Header */}
                <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100 bg-white shrink-0 rounded-t-2xl">
                    <h3 className="text-sm sm:text-base font-black text-slate-800 uppercase tracking-tight">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Body — siempre con padding p-5 */}
                <div className="bg-white flex-1 min-h-0 overflow-y-auto p-5">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="relative w-12 h-12">
                                <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                                <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin" />
                            </div>
                            <p className="mt-4 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Cargando información...</p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-500">
                            {children}
                        </div>
                    )}
                </div>

                {/* Footer — solo cuando NO es hideFooter */}
                {!hideFooter && (
                    <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0 rounded-b-2xl">
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-slate-200"
                        >
                            Cerrar Ventana
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewModal;