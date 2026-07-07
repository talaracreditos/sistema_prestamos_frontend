import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { show, update } from 'services/prospectoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import peruData from 'utilities/data/peruData';

export const useUpdate = () => {
    const { id }   = useParams();
    const navigate = useNavigate();

    const [loading,  setLoading]  = useState(true);
    const [saving,   setSaving]   = useState(false);
    const [alert,    setAlert]    = useState(null);
    
    const [provincias, setProvincias] = useState([]);
    const [distritos, setDistritos] = useState([]);

    const [formData, setFormData] = useState({
        tipo: 1, dni: '', nombre: '', apellidoPaterno: '', apellidoMaterno: '', fechaNacimiento: '', fechaVencimientoDni: '', no_caduca: false, sexo: '',
        ruc: '', razon_social: '', nombre_comercial: '',
        ciiu_id: null, ciiu: null, zona_id: null, zona_nombre: '',
        telefono: '', telefonoFijo: '', correo: '',
        direccionFiscal: '', departamento: '', provincia: '', distrito: '', tipoVivienda: '', tiempoResidencia: '',
        ingreso_estimado: '', monto_solicitado: '', proposito: '', observaciones: '',
    });
    
    useEffect(() => {
        const load = async () => {
            try {
                const res  = await show(id);
                const data = res.data || res;
                setFormData({
                    tipo:                data.tipo                || 1,
                    dni:                 data.dni                 || '',
                    nombre:              data.nombre              || '',
                    apellidoPaterno:     data.apellidoPaterno     || '',
                    apellidoMaterno:     data.apellidoMaterno     || '',
                    fechaNacimiento:     data.fechaNacimiento     || '',
                    fechaVencimientoDni: data.fechaVencimientoDni || '',
                    no_caduca:          !!data.no_caduca,
                    sexo:                data.sexo                || '',
                    ruc:                 data.ruc                 || '',
                    razon_social:        data.razon_social        || '',
                    nombre_comercial:    data.nombre_comercial    || '',
                    ciiu_id:             data.ciiu_id             || null,
                    ciiu: data.ciiu ? {
                        id: data.ciiu.id,
                        codigo: data.ciiu.codigo,
                        descripcion: data.ciiu.descripcion
                    } : null,
                    zona_id:             data.zona_id             || null,
                    zona_nombre:         data.zona                || '',
                    telefono:            data.telefono            || '',
                    telefonoFijo:        data.telefonoFijo        || '',
                    correo:              data.correo              || '',
                    direccionFiscal:     data.direccionFiscal     || '',
                    departamento:        data.departamento        || '',
                    provincia:           data.provincia           || '',
                    distrito:            data.distrito            || '',
                    tipoVivienda:        data.tipoVivienda        || '',
                    tiempoResidencia:    data.tiempoResidencia    || '',
                    ingreso_estimado:    data.ingreso_estimado    || '',
                    monto_solicitado:    data.monto_solicitado    || '',
                    proposito:           data.proposito           || '',
                    observaciones:       data.observaciones       || '',
                });
            } catch (err) {
                setAlert(handleApiError(err, 'Error al cargar el prospecto'));
            } finally {
                setLoading(false);
            }
        };
        if (id) load();
    }, [id]);

    // Efecto para cargar provincias cuando cambia el departamento
    useEffect(() => {
        const dep = formData.departamento;
        setProvincias(dep && peruData[dep] ? Object.keys(peruData[dep]) : []);
    }, [formData.departamento]);

    // Efecto para cargar distritos cuando cambia la provincia
    useEffect(() => {
        const dep = formData.departamento;
        const prov = formData.provincia;
        setDistritos(dep && prov && peruData[dep][prov] ? peruData[dep][prov] : []);
    }, [formData.provincia, formData.departamento]);

    const handleChange = (field, value) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            if (field === 'departamento') {
                newData.provincia = '';
                newData.distrito = '';
            }
            if (field === 'provincia') {
                newData.distrito = '';
            }
            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setAlert(null);
        try {
            await update(id, formData);
            setAlert({ type: 'success', message: 'Prospecto actualizado correctamente.' });
            setTimeout(() => navigate('/prospecto/listar'), 1500);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al actualizar el prospecto'));
        } finally {
            setSaving(false);
        }
    };

    return { formData, handleChange, loading, saving, alert, setAlert, handleSubmit, navigate, provincias, distritos };
};