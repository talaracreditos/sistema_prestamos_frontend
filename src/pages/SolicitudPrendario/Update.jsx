import React, { useState } from 'react';
import { useUpdate } from 'hooks/SolicitudPrendario/useUpdate';
import PrendarioForm from 'components/Shared/Formularios/SolicitudPrendario/PrendarioForm';
import PageHeader from 'components/Shared/Headers/PageHeader';
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';

const Update = () => {
    const { formData, loading, saving, alert, setAlert, handleChange, handleSubmit, navigate } = useUpdate();
    const [isBlocked, setIsBlocked] = useState(false);

    if (loading) return <LoadingScreen />;

    if (!formData) {
        return (
            <div className="container mx-auto p-6 max-w-5xl">
                <PageHeader title="Editar Solicitud Prendaria" buttonText="Volver" buttonLink="/solicitudPrendario/listar" />
                <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-5xl transition-colors">
            <PageHeader
                title="Editar Solicitud Prendaria"
                subtitle={`ID: ${formData.id}`}
                buttonText="Volver"
                buttonLink="/solicitudPrendario/listar"
            />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <form onSubmit={(e) => handleSubmit(e, isBlocked)} className="mt-6">
                <PrendarioForm
                    data={formData}
                    handleChange={handleChange}
                    isUpdate={true}
                    onBlockedChange={setIsBlocked}
                />
                <div className="mt-8 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/solicitudPrendario/listar')}
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