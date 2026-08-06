import { useState, useEffect } from 'react';

export const usePagoCuota = ({ isOpen, cuota, onClose, onConfirm }) => {
    const [metodo,       setMetodo]       = useState('DEPOSITO');
    const [recibido,     setRecibido]     = useState('');
    const [referencia,   setReferencia]   = useState('');
    const [archivo,      setArchivo]      = useState(null);
    const [preview,      setPreview]      = useState(null);
    const [esParcial,    setEsParcial]    = useState(false);
    const [distribucion, setDistribucion] = useState({});
    const [alertLocal,   setAlertLocal]   = useState(null);
    // ── Comisión ──────────────────────────────────────────────────────────────
    const [tieneComision, setTieneComision] = useState(false);
    const [comision,      setComision]      = useState('');

    // ── PIN de autorización (cuota anterior pendiente) ──────────────────────────
    // pinRequerido: si true, se muestra el campo PIN inline en el MISMO form
    // (no una pantalla aparte). Arranca en true si el front ya sabía de
    // antemano (cuota.requierePinAnticipado, seteado en OperacionForm) y
    // también se activa si el backend lo exige de sorpresa al hacer submit.
    const [pinRequerido, setPinRequerido] = useState(false);
    const [pinContexto,  setPinContexto]  = useState(null);
    const [pin,          setPin]          = useState('');
    const [pinError,     setPinError]     = useState(null);

    const esGrupal               = !!(cuota?.es_grupal);
    const integrantesPendientes  = cuota?.integrantes?.filter(i => ![2, 6].includes(i.estado)) ?? [];
    const soloUnIntegrante       = esGrupal && integrantesPendientes.length === 1;
    const pinAnticipado          = !!cuota?.requierePinAnticipado;

    /* Mora PENDIENTE */
    const mora = esGrupal
        ? integrantesPendientes.reduce((acc, int) => acc + parseFloat(int.mora_pendiente ?? 0), 0)
        : parseFloat(cuota?.mora ?? 0);

    const excedenteIndividual = !esGrupal ? parseFloat(cuota?.excedente_anterior ?? 0) : 0;

    /* Total a pagar */
    const totalAPagar = esGrupal && integrantesPendientes.length > 0
        ? integrantesPendientes.reduce((acc, int) => {
            const saldoCap = parseFloat(int.saldo_capital ?? int.saldo ?? 0);
            const moraPend = parseFloat(int.mora_pendiente ?? 0);
            return acc + saldoCap + moraPend;
        }, 0).toFixed(2)
        : parseFloat(cuota?.saldo_pendiente ?? 0).toFixed(2);

    // ── Validaciones ──────────────────────────────────────────────────────────
    const integrantesSinCubrirMora = (esGrupal && esParcial)
        ? integrantesPendientes.filter(int => {
            const moraPend = parseFloat(int.mora_pendiente ?? 0);
            if (moraPend <= 0) return false;
            const val = distribucion[int.id];
            if (!val || val === '' || parseFloat(val) === 0) return false;
            return parseFloat(val) < moraPend;
        }) : [];

    const montoNum    = parseFloat(recibido || 0);
    const noCubreMora = !esGrupal && mora > 0 && montoNum > 0 && montoNum < mora;

    const comisionNum    = tieneComision ? parseFloat(comision || 0) : 0;
    const comisionValida = !tieneComision || (comisionNum > 0);

    const validacionMetodo = metodo === 'DEPOSITO'
        ? !!referencia?.trim() && !!archivo
        : true;

    const pinCompleto = pin.length === 6;
    const pinValido    = !pinRequerido || pinCompleto;

    const puedeSubmit = !noCubreMora
        && integrantesSinCubrirMora.length === 0
        && validacionMetodo
        && comisionValida
        && pinValido;

    // ── Efectos ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (isOpen) {
            setMetodo('DEPOSITO');
            setRecibido(totalAPagar);
            setReferencia('');
            setArchivo(null);
            setPreview(null);
            setEsParcial(soloUnIntegrante);
            setDistribucion({});
            setAlertLocal(null);
            setTieneComision(false);
            setComision('');
            // PIN: arranca visible si el front ya sabía que hacía falta
            setPinRequerido(pinAnticipado);
            setPinContexto(null);
            setPin('');
            setPinError(null);
        }
    }, [isOpen, totalAPagar, soloUnIntegrante, pinAnticipado]);

    const calcularTotalDistribuido = () => {
        if (integrantesPendientes.length === 0) return parseFloat(totalAPagar);
        const todosEnFull = integrantesPendientes.every(int => !distribucion[int.id] || distribucion[int.id] === '');
        if (todosEnFull) return parseFloat(totalAPagar);
        return integrantesPendientes.reduce((acc, int) => {
            const val        = distribucion[int.id];
            const esCompleto = !val || val === '';
            const saldoCap   = parseFloat(int.saldo_capital ?? int.saldo ?? 0);
            const moraPend   = parseFloat(int.mora_pendiente ?? 0);
            return acc + (esCompleto ? saldoCap + moraPend : parseFloat(val || 0));
        }, 0);
    };

    const totalDistribuido = calcularTotalDistribuido();

    useEffect(() => {
        if (esGrupal && esParcial)  setRecibido(totalDistribuido.toFixed(2));
    }, [totalDistribuido, esGrupal, esParcial]);

    useEffect(() => {
        if (esGrupal && !esParcial) setRecibido(totalAPagar);
    }, [esParcial, esGrupal, totalAPagar]);

    // ── Handlers generales ────────────────────────────────────────────────────
    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (f) { setArchivo(f); setPreview(URL.createObjectURL(f)); }
    };

    const handleMontoIntegrante = (id, valor) => {
        const sanitized = valor.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
        setDistribucion(prev => ({ ...prev, [id]: sanitized }));
    };

    const reset = () => {
        setArchivo(null);
        setPreview(null);
        setPinRequerido(false);
        setPinContexto(null);
        setPin('');
        setPinError(null);
        onClose();
    };

    const handlePinChange = (valor) => {
        setPin(valor.replace(/\D/g, '').slice(0, 6));
        if (pinError) setPinError(null);
    };

    // ── Callback que onConfirm invoca si el backend exige PIN (o el PIN
    // enviado era inválido) ──────────────────────────────────────────────────
    const handleRequierePin = (contexto, mensaje) => {
        setPinContexto(contexto);
        setPinRequerido(true);
        // Si ya había un pin escrito (submit con pin incorrecto), mostramos
        // el motivo devuelto por el backend; si no había pin, es la primera
        // vez que se detecta el bloqueo.
        setPinError(pin ? (mensaje || 'PIN incorrecto o inválido.') : null);
        setAlertLocal(null);
    };

    const buildFormData = () => {
        const formData = new FormData();
        formData.append('cuota_id',        cuota.id);
        formData.append('metodo_pago',     metodo);
        formData.append('monto_recibido',  recibido);
        formData.append('numero_operacion', referencia);
        if (archivo) formData.append('comprobante', archivo);

        if (tieneComision && comisionNum > 0) {
            formData.append('comision', comisionNum.toFixed(2));
        }

        if (pinRequerido && pinCompleto) {
            formData.append('pin', pin);
        }

        if (esGrupal && (esParcial || soloUnIntegrante)) {
            formData.append('es_parcial_grupal', '1');
            formData.append('distribucion', JSON.stringify(
                integrantesPendientes.map(int => ({
                    cliente_id:    int.id,
                    cuota_id:      cuota.id,
                    total_cuota:   parseFloat(int.saldo_capital ?? int.saldo ?? 0),
                    monto:         parseFloat(distribucion[int.id] || 0),
                    pago_completo: !distribucion[int.id] || distribucion[int.id] === '',
                }))
            ));
        }

        return formData;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = buildFormData();

        setAlertLocal(null);
        onConfirm(formData, { setAlertLocal, onRequierePin: handleRequierePin });
    };

    return {
        state: {
            metodo, recibido, referencia, archivo, preview,
            esParcial, distribucion, alertLocal,
            tieneComision, comision,
            pinRequerido, pinContexto, pin, pinError, pinCompleto,
        },
        setters: {
            setMetodo, setRecibido, setReferencia, setEsParcial, setAlertLocal,
            setArchivo, setPreview, setTieneComision, setComision,
        },
        computed: {
            esGrupal, integrantesPendientes, soloUnIntegrante,
            totalAPagar, mora, excedenteIndividual,
            integrantesSinCubrirMora, noCubreMora,
            puedeSubmit, totalDistribuido, comisionNum,
        },
        handlers: {
            handleFileChange, handleMontoIntegrante, reset, handleSubmit, handlePinChange,
        },
    };
};