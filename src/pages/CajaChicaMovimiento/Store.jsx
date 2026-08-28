// pages/CajaChicaMovimiento/Store.jsx
import React from 'react';
import { useStore } from 'hooks/CajaChicaMovimiento/useStore';
import CajaChicaMovimientoForm from 'components/Shared/Formularios/CajaChicaMovimiento/CajaChicaMovimientoForm';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';

const Store = () => {
    const { formData, loading, alert, setAlert, handleChange, handleSubmit } = useStore();

    return (
        <div className="container mx-auto p-6 max-w-3xl transition-colors">
            <PageHeader title="Registrar Movimiento de Caja Chica" buttonText="Volver" buttonLink="/caja-chica-movimiento/listar" />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            <form onSubmit={handleSubmit} className="mt-6">
                <CajaChicaMovimientoForm data={formData} handleChange={handleChange} />
                <div className="mt-8 flex justify-end">
                    <button type="submit" disabled={loading} className="w-full sm:w-auto bg-brand-red dark:bg-brand-red-glow text-white dark:text-black px-10 py-3.5 rounded-xl font-black uppercase shadow-lg shadow-brand-red/30 dark:shadow-black/30 hover:bg-brand-red-dark dark:hover:brightness-110 transition-all disabled:opacity-50 tracking-wide">
                        {loading ? 'Registrando...' : 'Registrar Movimiento'}
                    </button>
                </div>
            </form>
        </div>
    );
};
export default Store;