import React, { useState, useEffect } from 'react';
import { 
    XMarkIcon, 
    PrinterIcon, 
    MagnifyingGlassPlusIcon, 
    MagnifyingGlassMinusIcon,
    ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

import { Worker, Viewer } from '@react-pdf-viewer/core';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { base64ToPdfUrl } from 'utilities/Helpers/pdfHelper';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';

const isMobile = () =>
    /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

const PdfModal = ({ isOpen, onClose, title, pdfUrl, base64 }) => {
    const zoomPluginInstance = zoomPlugin();
    const { ZoomIn, ZoomOut, ZoomPopover } = zoomPluginInstance;
    
    const [activeUrl, setActiveUrl] = useState(null);

    useEffect(() => {
        if (!isOpen) return;

        let finalUrl = pdfUrl;
        let isBlob = false;

        if (base64) {
            finalUrl = base64ToPdfUrl(base64);
            isBlob = true;
        }

        setActiveUrl(finalUrl);

        const scrollY = window.scrollY;

        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';

        return () => {
            if (isBlob && finalUrl) {
                URL.revokeObjectURL(finalUrl);
            }
            
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, scrollY);
            setActiveUrl(null);
        };
    }, [isOpen, pdfUrl, base64]);

    if (!isOpen || !activeUrl) return null;

    const handlePrint = () => {
        if (isMobile()) {
            window.open(activeUrl, '_blank');
        } else {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = activeUrl;
            document.body.appendChild(iframe);
            iframe.onload = () => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                setTimeout(() => document.body.removeChild(iframe), 60000);
            };
        }
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = activeUrl;
        const safeTitle = title ? title.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'documento';
        link.download = `${safeTitle}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/80 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 transition-colors">

            <div className="bg-white dark:bg-dark-surface rounded-t-2xl sm:rounded-2xl shadow-2xl dark:shadow-black/50 w-full max-w-4xl h-[95vh] sm:h-[90vh] flex flex-col overflow-hidden border-t sm:border border-slate-700 dark:border-dark-border transition-colors">

                <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-surface-alt gap-2 transition-colors">
                    
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black text-slate-800 dark:text-dark-text uppercase tracking-tight truncate transition-colors">{title}</h3>
                        <p className="text-[10px] text-slate-500 dark:text-dark-text-muted font-medium uppercase hidden sm:block transition-colors">Vista Previa HD</p>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        {/* Zoom */}
                        <div className="flex items-center bg-white dark:bg-dark-surface border border-slate-200 dark:border-dark-border rounded-lg p-1 shadow-sm gap-1 transition-colors">
                            <ZoomOut>{(props) => (
                                <button onClick={props.onClick} className="p-1 sm:p-1.5 hover:bg-slate-100 dark:hover:bg-dark-surface-alt rounded text-slate-600 dark:text-dark-text">
                                    <MagnifyingGlassMinusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            )}</ZoomOut>
                            <div className="px-1 sm:px-2 text-[10px] sm:text-xs font-bold text-slate-500 dark:text-dark-text-muted min-w-[40px] sm:min-w-[50px] text-center transition-colors">
                                <ZoomPopover />
                            </div>
                            <ZoomIn>{(props) => (
                                <button onClick={props.onClick} className="p-1 sm:p-1.5 hover:bg-slate-100 dark:hover:bg-dark-surface-alt rounded text-slate-600 dark:text-dark-text">
                                    <MagnifyingGlassPlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            )}</ZoomIn>
                        </div>

                        {/* Botón Cerrar */}
                        <button onClick={onClose} className="p-1.5 sm:p-2 text-slate-400 dark:text-dark-text-muted hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors shrink-0">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 bg-slate-200 dark:bg-black overflow-hidden relative transition-colors">
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <Viewer
                            fileUrl={activeUrl}
                            plugins={[zoomPluginInstance]}
                            defaultScale={isMobile() ? 1.0 : 1.3} 
                            imageResourcesScale={2}
                        />
                    </Worker>
                </div>

                {/* FOOTER */}
                <div className="px-4 sm:px-6 py-4 border-t border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface flex flex-col sm:flex-row justify-end gap-3 transition-colors">
                    
                    <button
                        onClick={handleDownload}
                        className="w-full sm:w-auto justify-center px-6 py-3.5 bg-white dark:bg-dark-surface-alt border-2 border-slate-200 dark:border-dark-border text-slate-700 dark:text-dark-text rounded-xl font-bold hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2 uppercase text-sm tracking-widest"
                    >
                        <ArrowDownTrayIcon className="w-5 h-5 text-slate-500 dark:text-dark-text-muted" />
                        DESCARGAR
                    </button>

                    <button
                        onClick={handlePrint}
                        className="w-full sm:w-auto justify-center px-12 py-3.5 bg-black dark:bg-brand-gold text-white dark:text-black rounded-xl font-bold hover:bg-zinc-800 dark:hover:brightness-110 transition-all shadow-lg flex items-center gap-2 uppercase text-sm tracking-widest"
                    >
                        <PrinterIcon className="w-5 h-5" />
                        {isMobile() ? 'ABRIR PDF' : 'IMPRIMIR AHORA'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PdfModal;