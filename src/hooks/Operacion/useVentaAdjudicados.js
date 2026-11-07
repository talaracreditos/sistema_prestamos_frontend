import { useState, useCallback } from 'react';
import { lotes as listarLotes, showLote as verLote } from 'services/garantiaPrendariaService';
import { store as registrarVenta } from 'services/ventaAdjudicadoService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

const fmt = n => parseFloat(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 });

const COMPRADOR_VACIO = { documento: '', nombres: '', apellidos: '' };


export const useVentaAdjudicados = ({ onVentaRegistrada } = {}) => {
    const [documentoBusqueda, setDocumentoBusqueda] = useState('');
    const [documentoBuscado, setDocumentoBuscado]   = useState(null);
    const [clienteBusqueda, setClienteBusqueda]     = useState(null);
    const [prestamos, setPrestamos]                 = useState([]);
    const [loading, setLoading]                     = useState(false);
    const [alert, setAlert]                         = useState(null);

    const [loteDetalle, setLoteDetalle]       = useState(null);
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    const [modalLoteOpen, setModalLoteOpen]   = useState(false);

    const [carrito, setCarrito] = useState([]);

    const [clienteGenerico, setClienteGenerico] = useState(true);
    const [comprador, setComprador]             = useState(COMPRADOR_VACIO);
    const [clienteRegistrado, setClienteRegistrado] = useState(null);
    const [clienteKey, setClienteKey]           = useState(Date.now());

    const [metodoPago, setMetodoPago]           = useState('EFECTIVO');
    const [numeroOperacion, setNumeroOperacion] = useState('');
    const [procesando, setProcesando]           = useState(false);


    const cargarLotes = useCallback(async (documento, { silencioso = false } = {}) => {
        const doc = String(documento ?? '').trim();

        if (!/^\d{8,11}$/.test(doc)) {
            if (!silencioso) setAlert({ type: 'error', message: 'Ingresa un DNI (8 dígitos) o RUC (11) válido.' });
            return;
        }

        setLoading(true);
        if (!silencioso) setAlert(null);
        try {
            const res  = await listarLotes(doc);
            const data = res?.data ?? res ?? {};
            const lista = data.prestamos ?? [];

            setClienteBusqueda(data.cliente ?? null);
            setPrestamos(lista);
            setDocumentoBuscado(doc);

            if (!silencioso && lista.length === 0) {
                setAlert({ type: 'info', message: `El documento ${doc} no tiene préstamos prendarios con lotes adjudicados.` });
            }
        } catch (err) {
            if (!silencioso) setAlert(handleApiError(err, 'No se pudieron cargar los lotes adjudicados.'));
        } finally {
            setLoading(false);
        }
    }, []);

    const handleBuscar = () => cargarLotes(documentoBusqueda);

    const limpiarBusqueda = () => {
        setDocumentoBusqueda('');
        setDocumentoBuscado(null);
        setClienteBusqueda(null);
        setPrestamos([]);
        setAlert(null);
    };

    // ── Detalle de lote ──────────────────────────────────────────────────────
    const abrirDetalleLote = async (lote) => {
        setModalLoteOpen(true);
        setLoadingDetalle(true);
        try {
            const res = await verLote(lote);
            setLoteDetalle(res.data ?? res);
        } catch (err) {
            setAlert(handleApiError(err, 'No se pudo cargar el detalle del lote.'));
            setModalLoteOpen(false);
        } finally {
            setLoadingDetalle(false);
        }
    };

    const cerrarDetalleLote = () => {
        setModalLoteOpen(false);
        setLoteDetalle(null);
    };

    // ── Carrito ──────────────────────────────────────────────────────────────
    const enCarrito = (lote) => carrito.some(c => c.lote === lote);

    const agregarAlCarrito = (loteConPrecio) => {
        if (enCarrito(loteConPrecio.lote)) return;
        setCarrito(prev => [...prev, {
            lote: loteConPrecio.lote,
            prestamo_id: loteConPrecio.prestamo_id ?? null,
            cantidad_piezas: loteConPrecio.cantidad_piezas ?? loteConPrecio.piezas?.length ?? 1,
            valor_tasado: loteConPrecio.valor_total,
            precio_venta: loteConPrecio.precio_venta ?? loteConPrecio.valor_total,
        }]);
        cerrarDetalleLote();
    };

    const quitarDelCarrito = (lote) => {
        setCarrito(prev => prev.filter(c => c.lote !== lote));
    };

    const vaciarCarrito = () => setCarrito([]);

    const totalCarrito = carrito.reduce((acc, c) => acc + parseFloat(c.precio_venta ?? 0), 0);

    // ── Comprador ────────────────────────────────────────────────────────────
    const cambiarTipoCliente = (esGenerico) => {
        setClienteGenerico(esGenerico);
        setComprador(COMPRADOR_VACIO);
        setClienteRegistrado(null);
        setClienteKey(Date.now());
    };

    const resetVenta = () => {
        setCarrito([]);
        setClienteGenerico(true);
        setComprador(COMPRADOR_VACIO);
        setClienteRegistrado(null);
        setClienteKey(Date.now());
        setMetodoPago('EFECTIVO');
        setNumeroOperacion('');
    };

    // ── Venta ────────────────────────────────────────────────────────────────
    const procesarVenta = async () => {
        if (procesando) return;

        if (carrito.length === 0) {
            setAlert({ type: 'error', message: 'Agrega al menos un lote al carrito.' });
            return;
        }

        if (clienteGenerico) {
            if (!/^\d{8,11}$/.test(comprador.documento)) {
                setAlert({ type: 'error', message: 'Ingresa el DNI del comprador (8 dígitos) o RUC (11).' });
                return;
            }
            if (!comprador.nombres.trim() || !comprador.apellidos.trim()) {
                setAlert({ type: 'error', message: 'Ingresa los nombres y apellidos del comprador.' });
                return;
            }
        }

        // El combobox de clientes puede devolver usuario_id o id según el endpoint
        const clienteId = clienteRegistrado ? (clienteRegistrado.usuario_id ?? clienteRegistrado.id) : null;
        if (!clienteGenerico && !clienteId) {
            setAlert({ type: 'error', message: 'Selecciona el cliente comprador.' });
            return;
        }

        const payload = {
            cliente_generico:    clienteGenerico,
            cliente_id:          clienteGenerico ? null : clienteId,
            comprador_documento: clienteGenerico ? comprador.documento : null,
            comprador_nombres:   clienteGenerico ? comprador.nombres.trim() : null,
            comprador_apellidos: clienteGenerico ? comprador.apellidos.trim() : null,
            metodo_pago:         metodoPago,
            numero_operacion:    metodoPago === 'TRANSFERENCIA' ? (numeroOperacion.trim() || null) : null,
            lotes: carrito.map(c => ({ lote: c.lote, precio_venta: c.precio_venta })),
        };

        // Se captura antes del reset: después el carrito queda vacío
        const totalCobrado = totalCarrito;

        setAlert(null);
        setProcesando(true);
        try {
            const res = await registrarVenta(payload);
            const comprobante = res?.data?.numero_comprobante;

            setAlert({
                type: 'success',
                message: `Venta registrada correctamente${comprobante ? ` (${comprobante})` : ''}. Total cobrado: S/ ${fmt(totalCobrado)}.`,
            });
            resetVenta();
            if (documentoBuscado) cargarLotes(documentoBuscado, { silencioso: true });
            onVentaRegistrada?.();
        } catch (err) {
            setAlert(handleApiError(err, 'Error al registrar la venta.'));
            if (documentoBuscado) cargarLotes(documentoBuscado, { silencioso: true });
        } finally {
            setProcesando(false);
        }
    };

    return {
        // búsqueda
        documentoBusqueda, setDocumentoBusqueda, documentoBuscado,
        clienteBusqueda, prestamos, loading, handleBuscar, limpiarBusqueda,
        alert, setAlert,
        // detalle de lote
        loteDetalle, loadingDetalle, modalLoteOpen, abrirDetalleLote, cerrarDetalleLote,
        // carrito
        carrito, enCarrito, agregarAlCarrito, quitarDelCarrito, vaciarCarrito, totalCarrito,
        // comprador
        clienteGenerico, cambiarTipoCliente,
        comprador, setComprador,
        clienteRegistrado, setClienteRegistrado, clienteKey,
        // pago
        metodoPago, setMetodoPago, numeroOperacion, setNumeroOperacion,
        procesarVenta, procesando,
    };
};