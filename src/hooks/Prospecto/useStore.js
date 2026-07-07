import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { store, combobox } from 'services/prospectoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';
import peruData from 'utilities/data/peruData';

const initialForm = {
    tipo: 1,
    dni: '', nombre: '', apellidoPaterno: '', apellidoMaterno: '', fechaNacimiento: '', fechaVencimientoDni: '', no_caduca: false, sexo: '',
    ruc: '', razon_social: '', nombre_comercial: '',
    ciiu_id: null, zona_id: null,
    telefono: '', telefonoFijo: '', correo: '',
    direccionFiscal: '', departamento: '', provincia: '', distrito: '', tipoVivienda: '', tiempoResidencia: '',
    ingreso_estimado: '', monto_solicitado: '', proposito: '', observaciones: '',
};

export const useStore = () => {
    const navigate = useNavigate();

    const [documento,      setDocumento]      = useState('');
    const [buscando,       setBuscando]       = useState(false);
    const [busquedaHecha,  setBusquedaHecha]  = useState(false);
    const [busquedaResult, setBusquedaResult] = useState(null);

    const [formData, setFormData] = useState(initialForm);
    const [loading,  setLoading]  = useState(false);
    const [alert,    setAlert]    = useState(null);

    const [provincias, setProvincias] = useState([]);
    const [distritos, setDistritos] = useState([]);

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

    const handleBuscar = async () => {
        if (!documento || documento.length < 8) {
            return setAlert({ type: 'error', message: 'Ingrese un DNI (8 dígitos) o RUC (11 dígitos).' });
        }
        setBuscando(true);
        setAlert(null);
        try {
            const res = await combobox(documento);
            const result = res.data || res;
            setBusquedaResult(result);
            setBusquedaHecha(true);

            if (!result.encontrado) {
                const esRuc = documento.length === 11;
                setFormData(prev => ({
                    ...prev,
                    tipo: esRuc ? 2 : 1,
                    [esRuc ? 'ruc' : 'dni']: documento,
                }));
            }
        } catch (err) {
            setAlert(handleApiError(err, 'Error al buscar el documento'));
        } finally {
            setBuscando(false);
        }
    };

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
        setLoading(true);
        setAlert(null);
        try {
            await store(formData);
            setAlert({ type: 'success', message: 'Prospecto registrado exitosamente. Redirigiendo...' });
            setTimeout(() => navigate('/prospecto/listar'), 1500);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al registrar el prospecto'));
        } finally {
            setLoading(false);
        }
    };

    const resetBusqueda = () => {
        setDocumento('');
        setBusquedaHecha(false);
        setBusquedaResult(null);
        setFormData(initialForm);
        setAlert(null);
    };

    return {
        documento, setDocumento, buscando, busquedaHecha, busquedaResult,
        formData, handleChange, loading, alert, setAlert,
        handleBuscar, handleSubmit, resetBusqueda, navigate,
        provincias, distritos // 🔥 Exportamos para usarlos en el formulario
    };
};