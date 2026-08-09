import React from 'react';
import { useUpdate } from 'hooks/Cliente/useUpdate';
// Formularios
import DatosPersonalesForm from 'components/Shared/Formularios/Cliente/DatosPersonalesForm';
import ContactoForm from 'components/Shared/Formularios/Cliente/ContactoForm';
import DireccionForm from 'components/Shared/Formularios/Cliente/DireccionForm';
import CuentaBancariaForm from 'components/Shared/Formularios/Cliente/CuentaBancariaForm';
import EmpleoForm from 'components/Shared/Formularios/Cliente/EmpleoForm';
import UsuarioForm from 'components/Shared/Formularios/Cliente/UsuarioForm';
// Componentes UI
import PageHeader from 'components/Shared/Headers/PageHeader';
import LoadingScreen from 'components/Shared/LoadingScreen';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import { PencilSquareIcon } from '@heroicons/react/24/outline';

const Update = () => {
    const { formData, loading, saving, alert, setAlert, handleNestedChange, handleSubmit, navigate } = useUpdate();
    
    // Determinamos si es persona para mostrar el formulario de empleo
    const esPersona = Number(formData.datos_cliente.tipo) === 1;

    if (loading) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-4 sm:p-6 transition-colors">
            <PageHeader
                title="Editar Cliente"
                subtitle={formData.datos_cliente.tipo === 2
                    ? `Editando Empresa: ${formData.datos_cliente.razon_social || ''}`
                    : `Editando Cliente: ${formData.datos_cliente.nombre} ${formData.datos_cliente.apellidoPaterno}`
                }
                icon={PencilSquareIcon}
                buttonText="← Volver al listado"
                buttonLink="/cliente/listar"
            />
            
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            
            <form onSubmit={handleSubmit} className="mt-4">
                {/* Grid idéntico al Store para mantener consistencia */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    
                    {/* Columna Izquierda: Datos Base y Usuario */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <DatosPersonalesForm data={formData} handleNestedChange={handleNestedChange} isEditing={true} />
                        <UsuarioForm form={formData} handleNestedChange={handleNestedChange} isEditing={true} />
                    </div>

                    {/* Columna Central y Derecha: Info Adicional */}
                    <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                        <DireccionForm data={formData} handleNestedChange={handleNestedChange} />
                        <ContactoForm data={formData} handleNestedChange={handleNestedChange} />
                        
                        {esPersona && <EmpleoForm data={formData} handleNestedChange={handleNestedChange} />}
                        <CuentaBancariaForm data={formData} handleNestedChange={handleNestedChange} />
                    </div>
                </div>

                {/* Footer de Acción con botones de Cancelar y Guardar */}
                <div className="mt-8 bg-white dark:bg-dark-surface p-6 rounded-2xl shadow-sm dark:shadow-black/25 border border-slate-200 dark:border-dark-border flex flex-col sm:flex-row justify-end gap-4 sticky bottom-4 z-20 transition-colors">
                    <button 
                        type="button" 
                        onClick={() => navigate('/cliente/listar')}
                        className="px-8 py-3.5 bg-slate-100 dark:bg-dark-surface-alt text-slate-600 dark:text-dark-text rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors uppercase text-sm"
                    >
                        Cancelar cambios
                    </button>
                    <button 
                        type="submit" 
                        disabled={saving}
                        className="bg-brand-red dark:bg-brand-red-glow text-white px-10 py-3.5 rounded-xl font-black uppercase shadow-lg shadow-brand-red/30 dark:shadow-black/30 hover:bg-brand-red-dark dark:hover:brightness-110 transition-all disabled:opacity-50"
                    >
                        {saving ? 'Actualizando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Update;