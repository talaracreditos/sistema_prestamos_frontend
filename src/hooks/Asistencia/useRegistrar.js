import { useState, useCallback, useRef } from 'react';
import { registrar } from 'services/asistenciaService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useRegistrar = () => {
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [resultado, setResultado] = useState(null);

    const yaEscaneadoRef = useRef(false);


    const handleQrScan = useCallback(async (contenidoQr) => {
        if (!contenidoQr?.trim() || yaEscaneadoRef.current) return;

        yaEscaneadoRef.current = true;
        setAlert(null);
        setResultado(null);
        setLoading(true);

        try {
            const response = await registrar(contenidoQr.trim());

            setResultado(response.data);
            setAlert({
                type: 'success',
                message: response.message || 'Asistencia registrada correctamente.'
            });

        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo registrar la asistencia.'));
        } finally {
            setLoading(false);
            
            // A los 1.5 segundos abrimos el candado para que el siguiente asesor pase
            setTimeout(() => {
                yaEscaneadoRef.current = false;
            }, 1500);
        }
    }, []); 

    const resetearEscaneo = () => {
        setAlert(null);
        setResultado(null);
        yaEscaneadoRef.current = false;
    };

    return { 
        loading, 
        alert, 
        resultado, 
        handleQrScan, 
        resetearEscaneo 
    };
};