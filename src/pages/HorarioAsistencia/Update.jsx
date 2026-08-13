import React from 'react';
import { useUpdate } from 'hooks/HorarioAsistencia/useUpdate';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import HorarioAsistenciaForm from 'components/Shared/Formularios/HorarioAsistencia/HorarioAsistenciaForm';
import { ClockIcon } from '@heroicons/react/24/outline';

const Update = () => {
    const { formData, loading, saving, alert, setAlert, handleChange, handleSubmit } = useUpdate();

    if (loading) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <PageHeader title="Editar Horario de Asistencia" icon={ClockIcon} buttonText="Volver" buttonLink="/horario-asistencia/listar" />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            <HorarioAsistenciaForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                loading={saving}
                isEdit={true}
            />
        </div>
    );
};

export default Update;