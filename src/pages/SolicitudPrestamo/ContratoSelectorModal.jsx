import React, { useState } from 'react';
import { 
    XMarkIcon, 
    DocumentArrowDownIcon, 
    UserIcon,
    ArrowDownTrayIcon 
} from '@heroicons/react/24/outline';

const ContratoSelectorModal = ({ isOpen, onClose, data, onSelectContrato }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    if (!isOpen || !data) return null;

    const { title, pdf, contratos_individuales = [] } = data;

    // FUNCIÓN PARA DESCARGAR TODOS LOS CONTRATOS DE GOLPE 
    const handleDownloadAll = async () => {
        setIsDownloading(true);
        const filesToDownload = [];

        // 1. Agregamos el grupal
        if (pdf) {
            filesToDownload.push({ 
                base64: pdf, 
                name: `Contrato_Grupal_${(title || 'Grupo').replace(/[^a-z0-9]/gi, '_')}.pdf` 
            });
        }

        // 2. Agregamos todos los individuales
        if (contratos_individuales.length > 0) {
            contratos_individuales.forEach(int => {
                if (int.pdf) {
                    filesToDownload.push({ 
                        base64: int.pdf, 
                        name: `Contrato_Individual_${int.cliente_nombre.replace(/[^a-z0-9]/gi, '_')}.pdf` 
                    });
                }
            });
        }

        // 3. Ejecutamos la descarga con un pequeño delay de 300ms 
        // para que el navegador no lo bloquee por "spam de popups"
        for (let i = 0; i < filesToDownload.length; i++) {
            const file = filesToDownload[i];
            const link = document.createElement('a');
            
            // Si el backend te manda el string crudo sin el prefijo "data:...", se lo agregamos
            const isRawBase64 = !file.base64.startsWith('http') && !file.base64.startsWith('data:');
            link.href = isRawBase64 ? `data:application/pdf;base64,${file.base64}` : file.base64;
            
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Esperamos 300ms antes del siguiente
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        setIsDownloading(false);
    };

    const totalContratos = 1 + contratos_individuales.length;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/80 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 transition-colors">
            <div className="bg-white dark:bg-dark-surface rounded-t-2xl sm:rounded-2xl shadow-2xl dark:shadow-black/50 w-full max-w-md flex flex-col overflow-hidden border-t sm:border border-slate-700 dark:border-dark-border max-h-[90vh] transition-colors">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface-alt shrink-0 transition-colors">
                    <div className="min-w-0">
                        <h3 className="text-sm font-black text-slate-800 dark:text-dark-text uppercase tracking-tight truncate transition-colors">
                            {title || 'Contratos disponibles'}
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-dark-text-muted font-medium uppercase transition-colors">
                            Selecciona para ver, o descarga todo
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 dark:text-dark-text-muted hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors shrink-0"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="p-4 space-y-2 overflow-y-auto flex-1 transition-colors">
                    {/* Contrato*/}
                    <button
                        type="button"
                        onClick={() =>
                            onSelectContrato({
                                pdf: pdf,
                                title: title || 'Contrato Grupal',
                            })
                        }
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-dark-border hover:border-brand-red dark:hover:border-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt transition-colors text-left"
                    >
                        <div className="w-10 h-10 rounded-lg bg-brand-red-light dark:bg-brand-gold/10 flex items-center justify-center shrink-0 transition-colors">
                            <DocumentArrowDownIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-dark-text transition-colors">Contrato</p>
                            <p className="text-[11px] text-slate-500 dark:text-dark-text-muted transition-colors">Documento</p>
                        </div>
                    </button>

                    {contratos_individuales.length > 0 && (
                        <>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-dark-text-muted uppercase px-1 pt-3 border-t border-slate-100 dark:border-dark-border mt-2 transition-colors">
                                Integrantes
                            </p>
                            {contratos_individuales.map((integrante) => (
                                <button
                                    type="button"
                                    key={integrante.cliente_id}
                                    onClick={() =>
                                        onSelectContrato({
                                            pdf: integrante.pdf,
                                            title: `Contrato — ${integrante.cliente_nombre}`,
                                        })
                                    }
                                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-dark-border hover:border-blue-400 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-dark-surface-alt transition-colors text-left"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 transition-colors">
                                        <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-bold text-slate-800 dark:text-dark-text truncate transition-colors">
                                            {integrante.cliente_nombre}
                                        </p>
                                        <p className="text-[11px] text-slate-500 dark:text-dark-text-muted uppercase font-medium transition-colors">
                                            {integrante.cargo}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </>
                    )}
                </div>

                {/* Footer con el botón de descarga global */}
                <div className="p-4 border-t border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface shrink-0 transition-colors">
                    <button
                        onClick={handleDownloadAll}
                        disabled={isDownloading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 dark:bg-black hover:bg-slate-900 dark:hover:bg-slate-900 text-white dark:text-dark-text rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-wait shadow-md dark:shadow-black/30"
                    >
                        <ArrowDownTrayIcon className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
                        {isDownloading ? 'Descargando...' : `Descargar Todos (${totalContratos})`}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ContratoSelectorModal;