import React, { useState } from 'react';
import { useStore } from 'hooks/SolicitudPrestamo/useStore';
import SolicitudForm from 'components/Shared/Formularios/SolicitudPrestamo/SolicitudForm';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';

const Store = () => {
    const {
        formData, loading, alert, setAlert,
        handleChange, handleSubmit,
        addIntegrante, handleRemoveIntegrante,
        updateMontoIntegrante, updateCargoIntegrante,
        esRenovacion, prestamoOrigen, comboKey,
        handleToggleRenovacion, handleSelectPrestamoOrigen, handleLimpiarOrigen
    } = useStore();

    const [isBlocked, setIsBlocked] = useState(false);  // ← sube desde el form

    const puedeEnviar = !loading && !isBlocked && (!esRenovacion || !!prestamoOrigen);

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <PageHeader title="Nueva Solicitud" buttonText="Volver" buttonLink="/solicitudPrestamo/listar" />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <form onSubmit={(e) => handleSubmit(e, isBlocked)} className="mt-6">
                <SolicitudForm
                    data={formData}
                    handleChange={handleChange}
                    addIntegrante={addIntegrante}
                    removeIntegrante={handleRemoveIntegrante}
                    updateMontoIntegrante={updateMontoIntegrante}
                    updateCargoIntegrante={updateCargoIntegrante}
                    onBlockedChange={setIsBlocked}
                    esRenovacion={esRenovacion}
                    prestamoOrigen={prestamoOrigen}
                    comboKey={comboKey}
                    onToggleRenovacion={handleToggleRenovacion}
                    onSelectPrestamo={handleSelectPrestamoOrigen}
                    onLimpiarOrigen={handleLimpiarOrigen}
                />
                <div className="mt-8 flex justify-end">
                    <button
                        type="submit"
                        disabled={!puedeEnviar}
                        className={`px-10 py-4 rounded-xl font-black uppercase transition-all shadow-lg ${
                            !puedeEnviar
                                ? 'bg-slate-300 text-slate-500 shadow-none cursor-not-allowed'
                                : 'bg-brand-red hover:bg-brand-red-dark text-white shadow-brand-red/30'
                        }`}
                    >
                        {loading ? 'Enviando...' : 'Registrar Solicitud'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Store;