import React from 'react';
import { useUpdate } from 'hooks/Ciiu/useUpdate';
import CiiuForm from 'components/Shared/Formularios/Ciiu/CiiuForm';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

const Update = () => {
    const { formData, loading, saving, alert, setAlert, handleChange, handleSubmit } = useUpdate();

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-brand-red-light border-t-brand-red rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <PageHeader title="Editar Código CIIU" icon={PencilSquareIcon} buttonText="Volver" buttonLink="/ciiu/listar" />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <form onSubmit={handleSubmit} className="mt-6 max-w-3xl mx-auto">
                <CiiuForm data={formData} handleChange={handleChange} />
                <div className="mt-8 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto bg-brand-red text-white px-10 py-3.5 rounded-xl font-black uppercase hover:bg-brand-red-dark transition-all disabled:opacity-50 shadow-lg shadow-brand-red/30"
                    >
                        {saving ? 'Guardando...' : 'Actualizar CIIU'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Update;