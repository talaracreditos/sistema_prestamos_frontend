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
        toggleTasaIndividual, updateTasaIntegrante,
        esRenovacion, prestamoOrigen, comboKey,
        handleToggleRenovacion, handleSelectPrestamoOrigen, handleLimpiarOrigen
    } = useStore();

    const [isBlocked, setIsBlocked] = useState(false);

    const puedeEnviar = !loading && !isBlocked && (!esRenovacion || !!prestamoOrigen);

    return (
        <div className="container mx-auto p-6 max-w-5xl transition-colors">
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
                    toggleTasaIndividual={toggleTasaIndividual}
                    updateTasaIntegrante={updateTasaIntegrante}
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
                                ? 'bg-slate-300 dark:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted/60 shadow-none cursor-not-allowed'
                                : 'bg-brand-red dark:bg-brand-red-glow hover:bg-brand-red-dark dark:hover:brightness-110 text-white shadow-brand-red/30 dark:shadow-black/30'
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