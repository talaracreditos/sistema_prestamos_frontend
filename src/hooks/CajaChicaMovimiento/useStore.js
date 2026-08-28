// hooks/CajaChicaMovimiento/useStore.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from 'services/cajaChicaMovimientoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

const hoy = () => new Date().toISOString().slice(0, 10);

export const useStore = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const [formData, setFormData] = useState({
        fecha: hoy(),
        tipo: 'egreso',
        caja_chica_gasto_id: '',
        concepto: '',
        medio_pago: 'efectivo',
        monto: '',
        numero_comprobante: '',
    });

    const handleChange = (field, value) => {
        setFormData(prev => {
            const next = { ...prev, [field]: value };
            if (field === 'tipo' && value === 'ingreso') {
                next.caja_chica_gasto_id = '';
            }
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setAlert(null);
        try {
            await store(formData);
            setAlert({ type: 'success', message: 'Movimiento registrado exitosamente.' });
            setTimeout(() => navigate('/caja-chica-movimiento/listar'), 1200);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al registrar el movimiento'));
        } finally {
            setLoading(false);
        }
    };

    return { formData, loading, alert, setAlert, handleChange, handleSubmit };
};