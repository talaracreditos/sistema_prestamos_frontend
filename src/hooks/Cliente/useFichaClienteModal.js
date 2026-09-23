import { useState, useRef, useEffect } from 'react';
import { useAuth } from 'context/AuthContext';
import { descargarFichaPdf, exportarHistorialCreditos } from 'services/clienteService';

/**
 * Hook con toda la lógica de FichaClienteModal: permisos, estado de tabs,
 * generación/descarga de PDF y exportación del historial de créditos.
 */
export default function useFichaClienteModal(data) {
    const { can } = useAuth();
    const puedeVerHistorial = can('cliente.historial');
    const puedeVerKardex = can('cliente.kardex');

    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [pdfData, setPdfData] = useState({ base64: '', title: '' });
    const [isGenerating, setIsGenerating] = useState(false);
    const [tab, setTab] = useState('ficha');

    const [isExporting, setIsExporting] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const exportMenuRef = useRef(null);

    // Cerrar el menú de exportación al hacer click fuera
    useEffect(() => {
        function handleClickOutside(event) {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
                setShowExportMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Si el usuario pierde/no tiene el permiso de historial, nunca lo dejamos quedarse en ese tab
    useEffect(() => {
        if (tab === 'historial' && !puedeVerHistorial) {
            setTab('ficha');
        }
    }, [tab, puedeVerHistorial]);

    const cuentas = data?.cuentasBancarias
        ? (Array.isArray(data.cuentasBancarias) ? data.cuentasBancarias : [data.cuentasBancarias])
        : (data?.cuentas_bancarias
            ? (Array.isArray(data.cuentas_bancarias) ? data.cuentas_bancarias : [data.cuentas_bancarias])
            : []);

    const handleGeneratePdf = async () => {
        setIsGenerating(true);
        try {
            const response = await descargarFichaPdf(data.id);
            const resData = response.data || response;
            setPdfData({ base64: resData.pdf, title: resData.title });
            setPdfModalOpen(true);
        } catch (error) {
            console.error("Error al generar ficha PDF:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExportHistorial = async (formato) => {
        if (!puedeVerHistorial) return; // guarda extra por si acaso
        setShowExportMenu(false);
        setIsExporting(true);
        try {
            const response = await exportarHistorialCreditos(data.usuario.id, formato);
            const resData = response.data || response;

            if (formato === 'pdf') {
                setPdfData({ base64: resData.pdf, title: resData.title || `Historial_${data.dni || data.ruc}` });
                setPdfModalOpen(true);
            } else if (formato === 'excel' && resData.excel) {
                const link = document.createElement("a");
                link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${resData.excel}`;
                link.download = resData.title ? `${resData.title}.xlsx` : `Historial_Creditos_${data.dni || data.ruc}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error(`Error al exportar historial en ${formato}:`, error);
        } finally {
            setIsExporting(false);
        }
    };

    return {
        // permisos
        puedeVerHistorial,
        puedeVerKardex,
        // datos derivados
        cuentas,
        // tabs
        tab,
        setTab,
        // pdf
        pdfModalOpen,
        setPdfModalOpen,
        pdfData,
        isGenerating,
        handleGeneratePdf,
        // exportación historial
        isExporting,
        showExportMenu,
        setShowExportMenu,
        exportMenuRef,
        handleExportHistorial,
    };
}