import React from 'react';
import { useStore } from 'hooks/Feriado/useStore';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import FeriadoForm from 'components/Shared/Formularios/Feriado/FeriadoForm';

const Store = () => {
    const { formData, feriados, loading, alert, setAlert, handleChange, handleSubmit } = useStore();

    return (
        <div className="container mx-auto p-6 max-w-6xl transition-colors">
            <PageHeader title="Agregar Feriado" buttonText="Volver" buttonLink="/feriados/listar" />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            <FeriadoForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                loading={loading}
                feriados={feriados}
                isEdit={false}
            />
        </div>
    );
};

export default Store;