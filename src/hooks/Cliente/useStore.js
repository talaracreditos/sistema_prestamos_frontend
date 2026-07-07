import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from 'services/clienteService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

const generarUsername = (nombre, apellidoPaterno, apellidoMaterno) => {
    const n  = (nombre          || '').trim().split(' ')[0].slice(0, 2);
    const ap = (apellidoPaterno || '').trim().split(' ')[0];
    const am = (apellidoMaterno || '').trim().split(' ')[0].slice(0, 1);
    return (n + ap + am).toUpperCase().replace(/[^A-Z0-9]/g, '');
};

const initialForm = {
    datos_cliente: {
        tipo: 1, nombre: '', apellidoPaterno: '', apellidoMaterno: '',
        dni: '', fechaNacimiento: '', fechaVencimientoDni: '', no_caduca: false, sexo: '',
        ruc: '', razon_social: '', nombre_comercial: '',
        ciiu_id: null, ciiu: null, zona_id: null, zona_nombre: '',
    },
    contacto:  { telefonoMovil: '', telefonoFijo: '', correo: '' },
    direccion: { direccionFiscal: '', departamento: '', provincia: '', distrito: '', tipoVivienda: '', tiempoResidencia: '' },
    empleo:    { centroLaboral: '', ingresoMensual: '', inicioLaboral: '', situacionLaboral: '' },
    usuario:   { username: '' },
    cuentas_bancarias: [],
};

export const useStore = () => {
    const navigate   = useNavigate();
    const [loading,  setLoading]  = useState(false);
    const [alert,    setAlert]    = useState(null);
    const [formData, setFormData] = useState(initialForm);

    // Username automático para persona
    useEffect(() => {
        const dc = formData.datos_cliente;
        if (Number(dc.tipo) !== 1) return;
        if (!dc.nombre && !dc.apellidoPaterno && !dc.apellidoMaterno) return;
        const username = generarUsername(dc.nombre, dc.apellidoPaterno, dc.apellidoMaterno);
        setFormData(prev => ({ ...prev, usuario: { ...prev.usuario, username } }));
        // eslint-disable-next-line
    }, [formData.datos_cliente.tipo, formData.datos_cliente.nombre,
        formData.datos_cliente.apellidoPaterno, formData.datos_cliente.apellidoMaterno]);

    // Al cambiar a empresa, limpiar username
    useEffect(() => {
        if (Number(formData.datos_cliente.tipo) === 2) {
            setFormData(prev => ({ ...prev, usuario: { ...prev.usuario, username: '' } }));
        }
        // eslint-disable-next-line
    }, [formData.datos_cliente.tipo]);

    const handleNestedChange = (section, field, value) => {
        if (field === null) {
            setFormData(prev => ({ ...prev, [section]: value }));
        } else {
            setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const esEmpresa = Number(formData.datos_cliente.tipo) === 2;
        const username  = (formData.usuario.username || '').trim();

        if (!formData.datos_cliente.zona_id)
            return setAlert({ type: 'error', message: 'Por favor, seleccione una Zona Operativa obligatoriamente.' });
        if (!username)
            return setAlert({ type: 'error', message: esEmpresa
                ? 'Para empresas debe ingresar el nombre de usuario manualmente.'
                : 'El nombre de usuario es obligatorio.' });
        if (username.length < 3)
            return setAlert({ type: 'error', message: 'El nombre de usuario debe tener al menos 3 caracteres.' });

        setLoading(true);
        setAlert(null);
        try {
            await store(formData);
            setAlert({ type: 'success', message: 'Cliente registrado exitosamente. Redirigiendo...' });
            setTimeout(() => navigate('/cliente/listar'), 1500);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al registrar cliente'));
        } finally {
            setLoading(false);
        }
    };

    return { formData, loading, alert, setAlert, handleNestedChange, handleSubmit };
};