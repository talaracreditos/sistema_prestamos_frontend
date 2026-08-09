import React from 'react';
import { useUpdate } from 'hooks/MetaAsesor/useUpdate';
import MetaAsesorForm from 'components/Shared/Formularios/MetaAsesor/MetaAsesorForm';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import { ChartBarIcon } from '@heroicons/react/24/outline';

const Update = () => {
    const { loading, saving, alert, setAlert, formData, asesorNombre, handleChange, handleSubmit, navigate } = useUpdate();

    if (loading) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-4 sm:p-6 transition-colors">
            <PageHeader
                title="Editar Meta"
                icon={ChartBarIcon}
                buttonText="← Volver"
                buttonLink="/meta-asesor/listar"
            />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <form onSubmit={handleSubmit} className="mt-6 max-w-2xl mx-auto space-y-4">
                {/* initialAsesorNombre para que el combobox muestre el nombre cargado */}
                <MetaAsesorForm
                    data={formData}
                    handleChange={handleChange}
                    initialAsesorNombre={asesorNombre}
                />
                <div className="flex flex-col sm:flex-row justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/meta-asesor/listar')}
                        className="px-8 py-3.5 bg-slate-100 dark:bg-dark-surface-alt text-slate-600 dark:text-dark-text rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors uppercase text-sm w-full sm:w-auto"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto bg-brand-red dark:bg-brand-red-glow text-white px-10 py-3.5 rounded-xl font-black uppercase shadow-lg shadow-brand-red/30 dark:shadow-black/30 hover:bg-brand-red-dark dark:hover:brightness-110 transition-all disabled:opacity-50"
                    >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Update;