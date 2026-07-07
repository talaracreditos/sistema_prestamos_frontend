import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { convertirProspecto } from 'services/clienteService';
import { show as showProspecto } from 'services/prospectoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

const generarUsername = (nombre, apellidoPaterno, apellidoMaterno) => {
    const n  = (nombre          || '').trim().split(' ')[0].slice(0, 2);
    const ap = (apellidoPaterno || '').trim().split(' ')[0];
    const am = (apellidoMaterno || '').trim().split(' ')[0].slice(0, 1);
    return (n + ap + am).toUpperCase().replace(/[^A-Z0-9]/g, '');
};

const buildInitialForm = (prospectoId) => ({
    prospecto_id: prospectoId,
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
});

export const useConvertir = (prospectoId, onSuccess) => {
    const navigate = useNavigate();
    const [loading,          setLoading]          = useState(false);
    const [loadingProspecto, setLoadingProspecto] = useState(true);
    const [alert,            setAlert]            = useState(null);
    const [formData,         setFormData]         = useState(buildInitialForm(prospectoId));

    // Sincroniza prospecto_id si el modal no se desmonta entre aperturas
    useEffect(() => {
        setFormData(prev => ({ ...prev, prospecto_id: prospectoId }));
    }, [prospectoId]);

    // Username auto para persona
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

    // Precargar datos del prospecto
    useEffect(() => {
        if (!prospectoId) { setLoadingProspecto(false); return; }
        const cargar = async () => {
            setLoadingProspecto(true);
            try {
                const res = await showProspecto(prospectoId);
                const p   = res.data || res;
                setFormData(prev => ({
                    ...prev,
                    prospecto_id: prospectoId,
                    datos_cliente: {
                        ...prev.datos_cliente,
                        tipo:                p.tipo                || 1,
                        dni:                 p.dni                 || '',
                        nombre:              p.nombre              || '',
                        apellidoPaterno:     p.apellidoPaterno     || '',
                        apellidoMaterno:     p.apellidoMaterno     || '',
                        fechaNacimiento:     p.fechaNacimiento     || '',
                        fechaVencimientoDni: p.fechaVencimientoDni || '',
                        no_caduca:         !!p.no_caduca,
                        sexo:                p.sexo                || '',
                        ruc:                 p.ruc                 || '',
                        razon_social:        p.razon_social        || '',
                        nombre_comercial:    p.nombre_comercial    || '',
                        ciiu_id:             p.ciiu_id             || null,
                        ciiu:                p.ciiu                || null,
                        zona_id:             p.zona_id             || null,
                        zona_nombre:         p.zona                || '',
                    },
                    contacto: {
                        telefonoMovil: p.telefono     || '',
                        telefonoFijo:  p.telefonoFijo || '',
                        correo:        p.correo       || '',
                    },
                    direccion: {
                        direccionFiscal:  p.direccionFiscal  || '',
                        departamento:     p.departamento     || '',
                        provincia:        p.provincia        || '',
                        distrito:         p.distrito         || '',
                        tipoVivienda:     p.tipoVivienda     || '',
                        tiempoResidencia: p.tiempoResidencia || '',
                    },
                }));
            } catch (err) {
                setAlert(handleApiError(err, 'No se pudo cargar el prospecto.'));
            } finally {
                setLoadingProspecto(false);
            }
        };
        cargar();
    }, [prospectoId]);

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

        if (!formData.prospecto_id)
            return setAlert({ type: 'error', message: 'No se identificó el prospecto. Cierra y vuelve a intentar.' });
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
            await convertirProspecto(formData);
            setAlert({ type: 'success', message: 'Prospecto convertido a cliente exitosamente.' });
            setTimeout(() => {
                if (onSuccess) onSuccess();
                else navigate('/cliente/listar');
            }, 1200);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al convertir el prospecto'));
        } finally {
            setLoading(false);
        }
    };

    return {
        formData, loading, loadingProspecto,
        alert, setAlert,
        handleNestedChange, handleSubmit,
    };
};