import React from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ConfirmModal = ({ 
    title = "¿Estás seguro?", 
    message, 
    onConfirm, 
    onCancel, 
    confirmText = 'Sí, continuar', 
    cancelText = 'Cancelar' 
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                onClick={onCancel}
            ></div>

            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 border border-slate-100">
                
                <div className="p-6">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 mb-5">
                        <ExclamationTriangleIcon className="h-7 w-7 text-brand-red" aria-hidden="true" />
                    </div>

                    <div className="text-center">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                            {title}
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-slate-500 font-medium">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 px-4 py-4 flex flex-col-reverse sm:flex-row justify-center gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-slate-300 bg-white px-6 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 transition-all active:scale-95 uppercase tracking-wide"
                    >
                        {cancelText}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full sm:w-auto inline-flex justify-center rounded-lg border border-transparent bg-brand-red px-6 py-2 text-sm font-bold text-white shadow-lg hover:bg-brand-red-dark focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 transition-all active:scale-95 uppercase tracking-wide"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;