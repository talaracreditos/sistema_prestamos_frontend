import React from 'react';
import { useUpdate } from 'hooks/Empleado/useUpdate';

import DatosPersonalesForm from 'components/Shared/Formularios/Empleado/DatosPersonalesForm';
import UsuarioForm from 'components/Shared/Formularios/Empleado/UsuarioForm';
import PageHeader from 'components/Shared/Headers/PageHeader';
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

const Update = () => {
    const {
        formData,
        setFormData,
        loading,
        saving,
        alert,
        setAlert,
        handleNestedChange,
        handleSubmit,
        navigate
    } = useUpdate();

    if (loading) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-4 sm:p-6 transition-colors">
            <PageHeader
                title="Editar Empleado"
                subtitle={`Editando a: ${formData.datos_empleado.nombre} ${formData.datos_empleado.apellidoPaterno}`}
                icon={PencilSquareIcon}
                buttonText="← Volver al listado"
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
                    isEditing={true}
                />

                <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
                    <button
                        type="button"
                        onClick={() => navigate('/empleado/listar')}
                        className="px-8 py-3.5 bg-slate-100 dark:bg-dark-surface-alt text-slate-600 dark:text-dark-text rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors uppercase text-sm w-full sm:w-auto"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto bg-brand-red dark:bg-brand-red-glow text-white dark:text-black px-10 py-3.5 rounded-xl font-black uppercase shadow-lg shadow-brand-red/30 dark:shadow-black/30 hover:bg-brand-red-dark dark:hover:brightness-110 transition-all disabled:opacity-50 tracking-wide"
                    >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Update;