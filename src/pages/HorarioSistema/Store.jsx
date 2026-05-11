// ── Store.jsx ─────────────────────────────────────────────────────────────────
import React from 'react';
import { useStore } from 'hooks/HorarioSistema/useStore';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import HorarioForm from 'components/Shared/Formularios/HorarioSistema/HorarioForm';
import { ClockIcon } from '@heroicons/react/24/outline';
 
const Store = () => {
    const { formData, loading, alert, setAlert, handleChange, handleSubmit } = useStore();
 
    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <PageHeader title="Nuevo Horario" icon={ClockIcon} buttonText="Volver" buttonLink="/horario-sistema/listar" />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            <HorarioForm
                formData={formData}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                loading={loading}
                isEdit={false}
            />
        </div>
    );
};
 
export default Store;