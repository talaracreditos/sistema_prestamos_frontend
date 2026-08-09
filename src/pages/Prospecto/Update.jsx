import React from 'react';
import { useUpdate } from 'hooks/Prospecto/useUpdate';
import ProspectoForm from 'components/Shared/Formularios/Prospecto/ProspectoForm';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

const ProspectoUpdate = () => {
    const { formData, handleChange, loading, saving, alert, setAlert, handleSubmit, navigate } = useUpdate();

    if (loading) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-4 sm:p-6 transition-colors">
            <PageHeader
                title="Editar Prospecto"
                subtitle={`Editando: ${formData.nombre_completo || ''}`}
                icon={PencilSquareIcon}
                buttonText="← Volver al Listado"
                buttonLink="/prospecto/listar"
            />

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <form onSubmit={handleSubmit} className="mt-4">
                <div className="bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm dark:shadow-black/25 border border-slate-100 dark:border-dark-border transition-colors">
                    <ProspectoForm data={formData} onChange={handleChange} isEditing={true} />
                </div>

                <div className="mt-4 bg-white dark:bg-dark-surface p-4 rounded-2xl shadow-sm dark:shadow-black/25 border border-slate-100 dark:border-dark-border flex justify-end gap-3 sticky bottom-4 z-10 transition-colors">
                    <button type="button" onClick={() => navigate('/prospecto/listar')}
                        className="px-6 py-3 bg-slate-100 dark:bg-dark-surface-alt text-slate-600 dark:text-dark-text rounded-xl font-bold text-sm uppercase hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                        Cancelar
                    </button>
                    <button type="submit" disabled={saving}
                        className="px-8 py-3 bg-black dark:bg-brand-gold text-white dark:text-black rounded-xl font-black text-sm uppercase hover:bg-zinc-800 dark:hover:brightness-110 transition-all disabled:opacity-50 shadow-lg dark:shadow-black/30">
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProspectoUpdate;