import React from 'react';
import { ScaleIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import TasacionForm from 'components/Shared/Formularios/Tasacion/TasacionForm';
import { useStore } from 'hooks/Tasacion/useStore';

const fmt = (n) => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const Store = () => {
    const {
        cliente, handleSeleccionarCliente, handleCambiarCliente,
        detalles, detalleActual, setDetalleActual, editandoId, montoAnteriorEdicion,
        pesoNeto, valorTasadoNum, porcentajeNum, maximoSugerido, formularioTieneDatos,
        handleAgregarDetalle, handleEditarDetalle, handleCancelarEdicion, handleEliminarDetalle,
        porcentajePrestamo, setPorcentajePrestamo,
        precioOroGramo, setPrecioOroGramo, precioEfectivoGramo,
        camposLimitados, kilatesOpciones,
        totalTasacion, totalMaximoPrestar, handleGuardarTasacion, guardando,
        showCancelarModal, setShowCancelarModal, handleCancelarTasacion,
        alert, setAlert,
    } = useStore();

    return (
        <div className="container mx-auto p-4 sm:p-6 transition-colors">
            <PageHeader
                title="Nueva Tasación"
                icon={ScaleIcon}
                buttonText="← Volver al listado"
                buttonLink="/tasacion/listar"
            />

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <TasacionForm
                cliente={cliente}
                handleSeleccionarCliente={handleSeleccionarCliente}
                handleCambiarCliente={handleCambiarCliente}

                detalles={detalles}
                detalleActual={detalleActual}
                setDetalleActual={setDetalleActual}
                editandoId={editandoId}
                montoAnteriorEdicion={montoAnteriorEdicion}
                pesoNeto={pesoNeto}
                valorTasadoNum={valorTasadoNum}
                porcentajeNum={porcentajeNum}
                maximoSugerido={maximoSugerido}
                formularioTieneDatos={formularioTieneDatos}
                handleAgregarDetalle={handleAgregarDetalle}
                handleEditarDetalle={handleEditarDetalle}
                handleCancelarEdicion={handleCancelarEdicion}
                handleEliminarDetalle={handleEliminarDetalle}

                porcentajePrestamo={porcentajePrestamo}
                setPorcentajePrestamo={setPorcentajePrestamo}
                precioOroGramo={precioOroGramo}
                setPrecioOroGramo={setPrecioOroGramo}
                precioEfectivoGramo={precioEfectivoGramo}
                kilatesOpciones={kilatesOpciones}
                camposLimitados={camposLimitados}
            />

            {/* ── TOTALES + GUARDAR ───────────────────────────────────────────── */}
            {detalles.length > 0 && (
                <div className="mt-6 bg-brand-red rounded-2xl shadow-xl border border-brand-red-dark text-white p-6 flex flex-col sm:flex-row justify-between items-center gap-4 sticky bottom-4 z-20">
                    <div className="flex items-center gap-3">
                        <BanknotesIcon className="w-8 h-8 text-brand-gold" />
                        <div>
                            <p className="text-[10px] font-black text-brand-red-light/80 uppercase tracking-widest">Total tasación ({detalles.length} joyas)</p>
                            <p className="text-lg font-black">S/ {fmt(totalTasacion)}</p>
                        </div>
                    </div>
                    <div className="text-center sm:text-right">
                        <p className="text-[10px] font-black text-brand-gold uppercase tracking-widest">Total máximo a prestar</p>
                        <p className="text-2xl font-black text-brand-gold">S/ {fmt(totalMaximoPrestar)}</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={handleGuardarTasacion}
                            disabled={guardando}
                            className="w-full sm:w-auto bg-brand-gold text-brand-red-dark px-8 py-3.5 rounded-xl font-black uppercase text-sm shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
                        >
                            {guardando ? 'Guardando...' : 'Guardar tasación'}
                        </button>
                        <button
                            onClick={() => setShowCancelarModal(true)}
                            disabled={guardando}
                            className="w-full sm:w-auto bg-transparent border border-white/30 text-white px-8 py-3.5 rounded-xl font-black uppercase text-sm hover:bg-white/10 transition-all disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}

            {showCancelarModal && (
                <ConfirmModal
                    message="¿Seguro que deseas cancelar la tasación? Se perderá el cliente y todas las joyas agregadas."
                    confirmText="Sí, cancelar todo"
                    cancelText="No, seguir tasando"
                    onConfirm={handleCancelarTasacion}
                    onCancel={() => setShowCancelarModal(false)}
                />
            )}
        </div>
    );
};

export default Store;