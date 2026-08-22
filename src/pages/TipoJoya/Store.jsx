import React from 'react';
import { useStore } from 'hooks/TipoJoya/useStore';
import TipoJoyaForm from 'components/Shared/Formularios/TipoJoya/TipoJoyaForm';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { SparklesIcon } from '@heroicons/react/24/outline';

const Store = () => {
    const { formData, loading, alert, setAlert, handleChange, handleSubmit } = useStore();

    return (
        <div className="container mx-auto p-4 sm:p-6 transition-colors">
            <PageHeader title="Crear Tipo de Joya" icon={SparklesIcon} buttonText="Volver" buttonLink="/tipo-joya/listar" />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <form onSubmit={handleSubmit} className="mt-6 max-w-2xl mx-auto">
                <TipoJoyaForm data={formData} handleChange={handleChange} />
                <div className="mt-8 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto bg-brand-red dark:bg-brand-red-glow text-white px-10 py-3.5 rounded-xl font-black uppercase hover:bg-brand-red-dark dark:hover:brightness-110 transition-all disabled:opacity-50 shadow-lg shadow-brand-red/30 dark:shadow-black/30"
                    >
                        {loading ? 'Procesando...' : 'Registrar Tipo'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Store;