import React, { useState } from 'react';
import { useStore } from 'hooks/SolicitudPrendario/useStore';
import PrendarioForm from 'components/Shared/Formularios/SolicitudPrendario/PrendarioForm';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';

const Store = () => {
    const { formData, loading, alert, setAlert, handleChange, handleSubmit } = useStore();
    const [isBlocked, setIsBlocked] = useState(false);

    const puedeEnviar = !loading && !isBlocked;

    return (
        <div className="container mx-auto p-6 max-w-5xl transition-colors">
            <PageHeader title="Nueva Solicitud Prendaria" buttonText="Volver" buttonLink="/solicitudPrendario/listar" />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <form onSubmit={(e) => handleSubmit(e, isBlocked)} className="mt-6">
                <PrendarioForm
                    data={formData}
                    handleChange={handleChange}
                    onBlockedChange={setIsBlocked}
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