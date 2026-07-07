import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { show, update } from 'services/clienteService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useUpdate = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setSaving] = useState(true);
    const [saving,  setLoading] = useState(false);
    const [alert,   setAlert]  = useState(null);

    const [formData, setFormData] = useState({
        datos_cliente: {
            tipo: 1, nombre: '', apellidoPaterno: '', apellidoMaterno: '',
            dni: '', fechaNacimiento: '', fechaVencimientoDni: '', no_caduca: false, sexo: '', ruc: '', razon_social: '', nombre_comercial: '',
            ciiu_id: null,
            ciiu: null,
            zona_id: null,
            zona_nombre: ''
        },
        contacto: { telefonoMovil: '', telefonoFijo: '', correo: '' },
        direccion: { direccionFiscal: '', departamento: '', provincia: '', distrito: '', tipoVivienda: '', tiempoResidencia: '' },
        empleo: { centroLaboral: '', ingresoMensual: '', inicioLaboral: '', situacionLaboral: '' },
        usuario:   { username: '', password: '', password_confirmation: '' },
        cuentas_bancarias: [] 
    });

    useEffect(() => {
        const loadCliente = async () => {
            try {
                const response = await show(id);
                const data = response.data || response;
            
                const cuentasBancariasArr = data.cuentas_bancarias.map(cta => ({
                    entidad_bancaria_id: cta.entidad_bancaria_id,
                    entidad_nombre_visual: cta.nombre_entidad,
                    ctaAhorros: cta.ctaAhorros,
                    cci: cta.cci || '',
                    longitud_cuenta: cta.entidad_bancaria?.longitud_cuenta, 
                    longitud_cci: cta.entidad_bancaria?.longitud_cci
                }));

                setFormData({
                    datos_cliente: {
                        tipo: data.tipo || 1, nombre: data.nombre || '', apellidoPaterno: data.apellidoPaterno || '',
                        apellidoMaterno: data.apellidoMaterno || '', dni: data.dni || '',
                        fechaNacimiento: data.fechaNacimiento || '', fechaVencimientoDni: data.fechaVencimientoDni || '',
                        no_caduca: !!data.no_caduca,
                        sexo: data.sexo || '', ruc: data.ruc || '', razon_social: data.razon_social || '', nombre_comercial: data.nombre_comercial || '',
                        ciiu_id: data.ciiu_id || null,
                        ciiu: data.ciiu || null,
                        zona_id: data.zona_id || null,
                        zona_nombre: data.zona?.nombre || ''
                    },
                    contacto: {
                        telefonoMovil: data.contacto?.telefonoMovil || '', telefonoFijo: data.contacto?.telefonoFijo || '', correo: data.contacto?.correo || ''
                    },
                    direccion: {
                        direccionFiscal: data.direccion?.direccionFiscal || '', departamento: data.direccion?.departamento || '',
                        provincia: data.direccion?.provincia || '', distrito: data.direccion?.distrito || '',
                        tipoVivienda: data.direccion?.tipoVivienda || '', tiempoResidencia: data.direccion?.tiempoResidencia || ''
                    },
                    empleo: {
                        centroLaboral: data.empleo?.centroLaboral || '', ingresoMensual: data.empleo?.ingresoMensual || '',
                        inicioLaboral: data.empleo?.inicioLaboral || '', situacionLaboral: data.empleo?.situacionLaboral || ''
                    },
                    usuario: { username: data.usuario?.username || '', password: '', password_confirmation: '' },
                    cuentas_bancarias: cuentasBancariasArr
                });
            } catch (err) {
                setAlert(handleApiError(err, 'No se pudo cargar la información del cliente.'));
            } finally {
                setSaving(false);
            }
        };
        if (id) loadCliente();
    }, [id]);

    const handleNestedChange = (section, field, value) => {
        if (field === null) {
            setFormData(prev => ({ ...prev, [section]: value }));
        } else {
            setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.usuario.password && formData.usuario.password !== formData.usuario.password_confirmation) {
            return setAlert({ type: 'error', message: 'Las contraseñas no coinciden.' });
        }

        if (!formData.datos_cliente.zona_id) {
            return setAlert({ type: 'error', message: 'Por favor, seleccione una Zona Operativa obligatoriamente.' });
        }

        setLoading(true);
        setAlert(null);
        try {
            await update(id, formData);
            setAlert({ type: 'success', message: 'Cliente actualizado correctamente.' });
            setTimeout(() => navigate('/cliente/listar'), 1500);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al actualizar el cliente'));
        } finally {
            setLoading(false);
        }
    };

    return { formData, setFormData, loading, saving, alert, setAlert, handleNestedChange, handleSubmit, navigate };
};