import React, { useState } from 'react';
import ViewModal from 'components/Shared/Modals/ViewModal';
import PdfModal from 'components/Shared/Modals/PdfModal';
import { descargarFichaPdf } from 'services/clienteService';
import { 
    UserIcon, BuildingOfficeIcon, IdentificationIcon, PhoneIcon, 
    MapPinIcon, CreditCardIcon, TagIcon,
    ComputerDesktopIcon, PrinterIcon, ArrowPathIcon, ShieldCheckIcon
} from '@heroicons/react/24/outline';
import BarraRiesgoCrediticio from './BarraRiesgoCrediticio';

const FichaClienteModal = ({ isOpen, onClose, data, isLoading }) => {
    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [pdfData, setPdfData] = useState({ base64: '', title: '' });
    const [isGenerating, setIsGenerating] = useState(false);

    if (!data && !isLoading) return null;

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

    return (
        <>
            <ViewModal isOpen={isOpen} onClose={onClose} hideFooter={true} title="Ficha Detallada del Cliente" isLoading={isLoading}>
                {data && (
                    <div className="space-y-6 relative">
                        
                        <div className="absolute top-0 right-0 z-10">
                            <button 
                                onClick={handleGeneratePdf}
                                disabled={isGenerating}
                                title="Imprimir Ficha PDF"
                                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-md disabled:opacity-50 active:scale-95"
                            >
                                {isGenerating ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <PrinterIcon className="w-4 h-4" />}
                                {isGenerating ? 'Generando...' : 'Imprimir Ficha'}
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row gap-5 border-b border-slate-100 pb-6 pr-32">
                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 shrink-0 ${
                                data.tipo === 2 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'
                            }`}>
                                {data.tipo === 2 
                                    ? <BuildingOfficeIcon className="w-10 h-10 text-amber-600"/> 
                                    : <UserIcon className="w-10 h-10 text-red-600"/>
                                }
                            </div>
                            <div className="flex-1">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase border ${
                                    data.tipo === 2 ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-red-100 text-red-700 border-red-300'
                                }`}>
                                    {data.tipo === 2 ? 'Empresa / RUC' : 'Persona Natural / DNI'}
                                </span>
                                <h2 className="text-2xl font-black text-slate-900 uppercase mt-1 leading-tight">
                                    {data.nombre_completo}
                                </h2>
                                
                                <div className="flex flex-wrap items-center gap-2.5 mt-3">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                                        <IdentificationIcon className="w-4 h-4 text-slate-400"/>
                                        {data.tipo === 2 ? data.ruc : data.dni}
                                        {data.tipo === 1 && data.fechaVencimientoDni && (
                                            <span className="text-[9px] text-red-500 font-black uppercase ml-1">
                                                (Vence: {data.fechaVencimientoDni})
                                            </span>
                                        )}
                                    </div>
                                    
                                    {data.contacto?.telefonoMovil && (
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                                            <PhoneIcon className="w-4 h-4 text-slate-400"/>
                                            {data.contacto.telefonoMovil}
                                        </div>
                                    )}

                                    {data.usuario && (
                                        <div className="flex items-center gap-2 text-xs font-bold text-white bg-slate-900 px-3 py-1.5 rounded-lg shadow-sm border border-slate-800">
                                            <ComputerDesktopIcon className="w-4 h-4 text-slate-400"/>
                                            {data.usuario.username}
                                            <span 
                                                className={`ml-1 flex items-center justify-center w-2 h-2 rounded-full ${
                                                    data.usuario.estado 
                                                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' 
                                                    : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                                                }`} 
                                                title={data.usuario.estado ? 'Acceso Activo' : 'Cuenta Bloqueada'}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {data.riesgo_crediticio && (
                            <div className="md:col-span-2 pt-2 pb-2">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-1.5 bg-slate-100 rounded-lg">
                                        <ShieldCheckIcon className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        Calificación de Riesgo Crediticio
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <BarraRiesgoCrediticio titulo="Riesgo Actual" sbs={data.riesgo_crediticio.actual} />
                                    <BarraRiesgoCrediticio titulo="Peor Atraso Histórico" sbs={data.riesgo_crediticio.historico} />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Residencia</h4>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 relative overflow-hidden h-full">
                                    <MapPinIcon className="w-12 h-12 text-slate-200 absolute -right-2 -bottom-2 transform -rotate-12" />
                                    <p className="text-sm font-bold text-slate-800 relative z-10">{data.direccion?.direccionFiscal || 'No registrada'}</p>
                                    <p className="text-xs text-slate-500 uppercase font-medium mt-1 relative z-10">
                                        {data.direccion?.distrito} - {data.direccion?.provincia}
                                    </p>
                                    {data.zona && (
                                        <span className="inline-block mt-2 text-[10px] font-black bg-red-100 text-red-700 px-2 py-1 rounded-lg border border-red-200">
                                            ZONA: {data.zona.nombre}
                                        </span>
                                    )}
                                    <div className="mt-3 flex gap-2 relative z-10">
                                        <span className="text-[10px] bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-200 text-slate-600 font-bold">
                                            {data.direccion?.tipoVivienda || 'N/A'}
                                        </span>
                                        <span className="text-[10px] bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-200 text-slate-600 font-bold">
                                            {data.direccion?.tiempoResidencia || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Situación Laboral</h4>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 h-full">
                                    {data.tipo === 1 ? (
                                        <div className="space-y-2">
                                            <p className="text-xs text-slate-500 uppercase font-bold">Centro Laboral:</p>
                                            <p className="text-sm font-black text-slate-800">{data.empleo?.centroLaboral || 'No especificado'}</p>
                                            <div className="pt-2 border-t border-slate-200 mt-2">
                                                <p className="text-[10px] text-slate-500 uppercase font-bold">Ingreso Mensual:</p>
                                                <p className="text-lg font-black text-green-600">S/ {data.empleo?.ingresoMensual || '0.00'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400 italic text-xs">
                                            No aplica para empresas
                                        </div>
                                    )}
                                </div>
                            </div>

                            {data.ciiu && (
                                <div className="md:col-span-2 space-y-3 mt-2">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actividad Económica (CIIU)</h4>
                                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-sm">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="bg-blue-600 text-white font-mono font-black px-3 py-1.5 rounded-xl text-sm shadow-sm shrink-0 mt-0.5">
                                                {data.ciiu.codigo}
                                            </div>
                                            <p className="text-sm font-black text-slate-800 leading-snug">
                                                {data.ciiu.descripcion}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-white px-2 py-1 rounded-lg uppercase border border-blue-200 shadow-sm">
                                                <TagIcon className="w-3 h-3" /> Sec {data.ciiu.seccion}
                                            </span>
                                            <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-1 rounded-lg uppercase border border-blue-200 shadow-sm">
                                                Div {data.ciiu.division}
                                            </span>
                                            <span className="text-[10px] font-bold text-blue-700 bg-white px-2 py-1 rounded-lg uppercase border border-blue-200 shadow-sm">
                                                Grp {data.ciiu.grupo}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="md:col-span-2 mt-2 pt-6 border-t border-slate-100 space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Cuentas para Desembolso / Cobro</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {cuentas.length > 0 ? cuentas.map((cta, i) => (
                                        <div key={i} className="group bg-white p-4 rounded-2xl border border-slate-200 hover:border-red-200 transition-all shadow-sm">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-600 transition-colors">
                                                    <CreditCardIcon className="w-5 h-5 text-red-600 group-hover:text-white" />
                                                </div>
                                                <p className="text-xs font-black text-slate-800 uppercase">{cta.nombre_entidad}</p>
                                            </div>
                                            <p className="text-sm font-mono font-bold text-slate-700 tracking-wider bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                {cta.ctaAhorros}
                                            </p>
                                            {cta.cci && (
                                                <p className="text-[10px] text-slate-400 font-mono mt-2 pl-1">CCI: {cta.cci}</p>
                                            )}
                                        </div>
                                    )) : (
                                        <div className="col-span-2 py-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-sm">
                                            No registra cuentas bancarias
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ViewModal>

            <PdfModal 
                isOpen={pdfModalOpen} 
                onClose={() => setPdfModalOpen(false)} 
                title={pdfData.title} 
                base64={pdfData.base64} 
            />
        </>
    );
};

export default FichaClienteModal;