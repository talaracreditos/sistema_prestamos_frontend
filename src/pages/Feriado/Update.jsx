import React from 'react';
import { useUpdate } from 'hooks/Feriado/useUpdate';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import FeriadoForm from 'components/Shared/Formularios/Feriado/FeriadoForm';

const Update = () => {
    const { formData, feriados, loading, saving, alert, setAlert, handleChange, handleSubmit } = useUpdate();

    if (loading) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <PageHeader
                title="Editar Feriado"
                subtitle={`Fecha original: ${formData.fecha}`}
                buttonText="Volver"
                buttonLink="/feriados/listar"
            />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            <FeriadoForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                loading={saving}
                feriados={feriados}
                isEdit={true}
            />
        </div>
    );
};

export default Update;