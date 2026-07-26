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

    const esGrupal               = !!(cuota?.es_grupal);
    const integrantesPendientes  = cuota?.integrantes?.filter(i => ![2, 6].includes(i.estado)) ?? [];
    const soloUnIntegrante       = esGrupal && integrantesPendientes.length === 1;

    const mora = esGrupal
        ? integrantesPendientes.reduce((acc, int) => acc + parseFloat(int.mora_pendiente ?? 0), 0)
        : parseFloat(cuota?.mora_total ?? cuota?.mora ?? 0);

    const excedenteIndividual = !esGrupal ? parseFloat(cuota?.excedente_anterior ?? 0) : 0;

    const totalAPagar = esGrupal && integrantesPendientes.length > 0
        ? integrantesPendientes.reduce((acc, int) => {
            const saldoCap = parseFloat(int.saldo_capital ?? int.saldo ?? 0);
            const moraPend = parseFloat(int.mora_pendiente ?? 0);
            return acc + saldoCap + moraPend;
        }, 0).toFixed(2)
        : Math.max(0,
            parseFloat(cuota?.capital_pendiente ?? 0) +
            parseFloat(cuota?.interes_pendiente  ?? 0) +
            parseFloat(cuota?.seguro_pendiente   ?? 0) +
            mora - excedenteIndividual
        ).toFixed(2);

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

    const puedeSubmit = !noCubreMora
        && integrantesSinCubrirMora.length === 0
        && validacionMetodo
        && comisionValida;

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
        }
    }, [isOpen, totalAPagar, soloUnIntegrante]);

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

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleFileChange = (e) => {
        const f = e.target.files[0];
        if (f) { setArchivo(f); setPreview(URL.createObjectURL(f)); }
    };

    const handleMontoIntegrante = (id, valor) => {
        const sanitized = valor.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1');
        setDistribucion(prev => ({ ...prev, [id]: sanitized }));
    };

    const reset = () => { setArchivo(null); setPreview(null); onClose(); };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('cuota_id',        cuota.id);
        formData.append('metodo_pago',     metodo);
        formData.append('monto_recibido',  recibido);
        formData.append('numero_operacion', referencia);
        if (archivo) formData.append('comprobante', archivo);

        // Comisión — solo si el usuario la marcó y tiene valor
        if (tieneComision && comisionNum > 0) {
            formData.append('comision', comisionNum.toFixed(2));
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

        setAlertLocal(null);
        onConfirm(formData, setAlertLocal);
    };

    return {
        state: {
            metodo, recibido, referencia, archivo, preview,
            esParcial, distribucion, alertLocal,
            tieneComision, comision,
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
        handlers: { handleFileChange, handleMontoIntegrante, reset, handleSubmit },
    };
};