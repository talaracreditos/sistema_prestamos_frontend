import React from 'react';
import { useStore } from 'hooks/Empleado/useStore';

import DatosPersonalesForm from 'components/Shared/Formularios/Empleado/DatosPersonalesForm';
import UsuarioForm from 'components/Shared/Formularios/Empleado/UsuarioForm';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { UserPlusIcon } from '@heroicons/react/24/outline';

const Store = () => {
    const {
        formData,
        setFormData,
        loading,
        alert,
        setAlert,
        handleNestedChange,
        handleSubmit
    } = useStore();

    return (
        <div className="container mx-auto p-4 sm:p-6 transition-colors">
            <PageHeader 
                title="Nuevo Empleado" 
                icon={UserPlusIcon} 
                buttonText="Volver" 
                buttonLink="/empleado/listar" 
            />
            
            <AlertMessage 
                type={alert?.type} 
                message={alert?.message} 
                details={alert?.details}
                onClose={() => setAlert(null)} 
            />

            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6 mt-6">
                <DatosPersonalesForm 
                    data={formData} 
                    handleNestedChange={handleNestedChange} 
                />

                <UsuarioForm 
                    form={formData} 
                    setForm={setFormData}
                    handleNestedChange={handleNestedChange}
                    isEditing={false}
                />

                <div className="mt-8 flex justify-end">
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full sm:w-auto bg-brand-red dark:bg-brand-red-glow text-white dark:text-black px-10 py-3.5 rounded-xl font-black uppercase shadow-lg shadow-brand-red/30 dark:shadow-black/30 hover:bg-brand-red-dark dark:hover:brightness-110 transition-all disabled:opacity-50 tracking-wide"
                    >
                        {loading ? 'Guardando...' : 'Registrar Empleado'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Store;