import React from 'react';
import { useStore } from 'hooks/Cliente/useStore';
import DatosPersonalesForm from 'components/Shared/Formularios/Cliente/DatosPersonalesForm';
import ContactoForm from 'components/Shared/Formularios/Cliente/ContactoForm';
import DireccionForm from 'components/Shared/Formularios/Cliente/DireccionForm';
import CuentaBancariaForm from 'components/Shared/Formularios/Cliente/CuentaBancariaForm';
import EmpleoForm from 'components/Shared/Formularios/Cliente/EmpleoForm';
import UsuarioForm from 'components/Shared/Formularios/Cliente/UsuarioForm';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { UserPlusIcon } from '@heroicons/react/24/outline';

const Store = () => {
    const {
        formData, loading,
        alert, setAlert,
        handleNestedChange, handleSubmit,
    } = useStore();

    const esPersona = Number(formData.datos_cliente.tipo) === 1;

    return (
        <div className="container mx-auto p-4 sm:p-6 transition-colors">
            <PageHeader
                title="Registrar Nuevo Cliente"
                icon={UserPlusIcon}
                buttonText="Volver al Listado"
                buttonLink="/cliente/listar"
            />

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <form onSubmit={handleSubmit} className="mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <DatosPersonalesForm
                            data={formData}
                            handleNestedChange={handleNestedChange}
                            isEditing={false}
                        />
                        <UsuarioForm
                            form={formData}
                            handleNestedChange={handleNestedChange}
                            isEditing={false}
                        />
                    </div>

                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <DireccionForm data={formData} handleNestedChange={handleNestedChange} />
                        <ContactoForm  data={formData} handleNestedChange={handleNestedChange} />
                        {esPersona && <EmpleoForm data={formData} handleNestedChange={handleNestedChange} />}
                        <CuentaBancariaForm data={formData} handleNestedChange={handleNestedChange} />
                    </div>
                </div>

                <div className="mt-8 bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm dark:shadow-black/25 border border-slate-200 dark:border-dark-border flex justify-end sticky bottom-4 z-20 transition-colors">
                    <button type="submit" disabled={loading}
                        className="w-full sm:w-auto bg-brand-red dark:bg-brand-red-glow hover:bg-brand-red-dark dark:hover:brightness-110 text-white px-10 py-3.5 rounded-xl font-black uppercase transition-all disabled:opacity-50 shadow-lg shadow-brand-red/30 dark:shadow-black/30">
                        {loading ? 'Procesando...' : 'Guardar Cliente'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Store;