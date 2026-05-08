import React, { useState, useEffect } from 'react';
import { 
    XMarkIcon, 
    PrinterIcon, 
    MagnifyingGlassPlusIcon, 
    MagnifyingGlassMinusIcon 
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
    
    // Estado interno para manejar la URL final (sea web o Blob)
    const [activeUrl, setActiveUrl] = useState(null);

    useEffect(() => {
        if (!isOpen) return;

        let finalUrl = pdfUrl;
        let isBlob = false;

        // Usamos el helper si viene Base64
        if (base64) {
            finalUrl = base64ToPdfUrl(base64);
            isBlob = true;
        }

        setActiveUrl(finalUrl);

        // Guardar posición actual del scroll
        const scrollY = window.scrollY;

        // Bloquear scroll en body y html
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';

        return () => {
            // Destruimos el archivo temporal al cerrar el modal
            if (isBlob && finalUrl) {
                URL.revokeObjectURL(finalUrl);
            }
            
            // Restaurar todo al cerrar
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

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">

            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-4xl h-[95vh] sm:h-[90vh] flex flex-col overflow-hidden border-t sm:border border-slate-700">

                <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-50 gap-2">
                    
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">{title}</h3>
                        <p className="text-[10px] text-slate-500 font-medium uppercase hidden sm:block">Vista Previa HD</p>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        {/* Zoom */}
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 shadow-sm gap-1">
                            <ZoomOut>{(props) => (
                                <button onClick={props.onClick} className="p-1 sm:p-1.5 hover:bg-slate-100 rounded text-slate-600">
                                    <MagnifyingGlassMinusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            )}</ZoomOut>
                            {/* min-w ajustado en móvil para que no quite tanto espacio */}
                            <div className="px-1 sm:px-2 text-[10px] sm:text-xs font-bold text-slate-500 min-w-[40px] sm:min-w-[50px] text-center">
                                <ZoomPopover />
                            </div>
                            <ZoomIn>{(props) => (
                                <button onClick={props.onClick} className="p-1 sm:p-1.5 hover:bg-slate-100 rounded text-slate-600">
                                    <MagnifyingGlassPlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                </button>
                            )}</ZoomIn>
                        </div>

                        {/* Botón Cerrar */}
                        <button onClick={onClose} className="p-1.5 sm:p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors shrink-0">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 bg-slate-200 overflow-hidden relative">
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                        <Viewer
                            fileUrl={activeUrl}
                            plugins={[zoomPluginInstance]}
                            defaultScale={isMobile() ? 1.0 : 1.3} 
                            imageResourcesScale={2}
                        />
                    </Worker>
                </div>

                <div className="px-4 sm:px-6 py-4 border-t border-slate-200 bg-white flex justify-end">
                    <button
                        onClick={handlePrint}
                        className="w-full sm:w-auto justify-center px-12 py-3.5 bg-black text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg flex items-center gap-2 uppercase text-sm tracking-widest"
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