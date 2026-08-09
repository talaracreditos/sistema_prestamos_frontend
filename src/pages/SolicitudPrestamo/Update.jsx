import React, { useState } from 'react';
import { useUpdate } from 'hooks/SolicitudPrestamo/useUpdate';
import SolicitudForm from 'components/Shared/Formularios/SolicitudPrestamo/SolicitudForm';
import PageHeader from 'components/Shared/Headers/PageHeader';
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';

const Update = () => {
    const {
        formData, loading, saving, alert, setAlert,
        handleChange, handleSubmit, navigate,
        addIntegrante, removeIntegrante,
        updateMontoIntegrante, updateCargoIntegrante,
        toggleTasaIndividual, updateTasaIntegrante,
    } = useUpdate();

    const [isBlocked, setIsBlocked] = useState(false);

    if (loading || !formData) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-6 max-w-5xl transition-colors">
            <PageHeader
                title="Editar Solicitud"
                subtitle={`ID: ${formData?.id}`}
                buttonText="Volver"
                buttonLink="/solicitudPrestamo/listar"
            />
            <AlertMessage
                type={alert?.type}
                message={alert?.message}
                details={alert?.details}
                onClose={() => setAlert(null)}
            />

            <form onSubmit={(e) => handleSubmit(e, isBlocked)} className="mt-6">
                <SolicitudForm
                    data={formData}
                    handleChange={handleChange}
                    addIntegrante={addIntegrante}
                    removeIntegrante={removeIntegrante}
                    updateMontoIntegrante={updateMontoIntegrante}
                    updateCargoIntegrante={updateCargoIntegrante}
                    toggleTasaIndividual={toggleTasaIndividual}
                    updateTasaIntegrante={updateTasaIntegrante}
                    isUpdate={true}
                    onBlockedChange={setIsBlocked}
                />
                <div className="mt-8 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/solicitudPrestamo/listar')}
                        className="px-8 py-4 bg-slate-100 dark:bg-dark-surface-alt text-slate-600 dark:text-dark-text hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold uppercase transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={saving || isBlocked}
                        className={`px-10 py-4 rounded-xl font-black uppercase transition-all shadow-xl ${
                            isBlocked
                                ? 'bg-slate-300 dark:bg-dark-surface-alt text-slate-500 dark:text-dark-text-muted/60 shadow-none'
                                : 'bg-brand-red dark:bg-brand-red-glow hover:bg-brand-red-dark dark:hover:brightness-110 text-white shadow-brand-red/30 dark:shadow-black/30'
                        }`}
                    >
                        {saving ? 'Guardando...' : 'Actualizar'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Update;