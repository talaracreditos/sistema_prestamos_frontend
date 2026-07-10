import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/dashboard`;

const buildQs = (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    const qs = params.toString();
    return qs ? '?' + qs : '';
};

// ── Pagos ─────────────────────────────────────────────────────────────────────
export const getPagosDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/pagos${buildQs(filters)}`, { method: 'GET' });
    return handleResponse(response);
};
export const exportPagosDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/pagos/export${buildQs(filters)}`, { method: 'GET' });
    if (!response.ok) throw new Error('Error al exportar pagos');
    return response.blob();
};

// ── Préstamos ─────────────────────────────────────────────────────────────────
export const getPrestamosDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/prestamos${buildQs(filters)}`, { method: 'GET' });
    return handleResponse(response);
};
export const exportPrestamosDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/prestamos/export${buildQs(filters)}`, { method: 'GET' });
    if (!response.ok) throw new Error('Error al exportar préstamos');
    return response.blob();
};

// ── Asesores ──────────────────────────────────────────────────────────────────
export const getAsesoresDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/asesores${buildQs(filters)}`, { method: 'GET' });
    return handleResponse(response);
};
export const exportAsesoresDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/asesores/export${buildQs(filters)}`, { method: 'GET' });
    if (!response.ok) throw new Error('Error al exportar asesores');
    return response.blob();
};

// ── Mora ──────────────────────────────────────────────────────────────────────
export const getMoraDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/mora${buildQs(filters)}`, { method: 'GET' });
    return handleResponse(response);
};
export const exportMoraDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/mora/export${buildQs(filters)}`, { method: 'GET' });
    if (!response.ok) throw new Error('Error al exportar mora');
    return response.blob();
};

// ── Clientes mora ─────────────────────────────────────────────────────────────
export const getClientesMoraDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/clientes-mora${buildQs(filters)}`, { method: 'GET' });
    return handleResponse(response);
};
export const exportClientesMoraDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/clientes-mora/export${buildQs(filters)}`, { method: 'GET' });
    if (!response.ok) throw new Error('Error al exportar clientes mora');
    return response.blob();
};

// ── Saldo capital ─────────────────────────────────────────────────────────────
export const getSaldoCapitalDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/saldo-capital${buildQs(filters)}`, { method: 'GET' });
    return handleResponse(response);
};
export const exportSaldoCapitalDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/saldo-capital/export${buildQs(filters)}`, { method: 'GET' });
    if (!response.ok) throw new Error('Error al exportar saldo capital');
    return response.blob();
};

// ── Desembolso y recupero de capital ─────────────────────────────────────────
export const getDesembolsoCapitalDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/desembolso-capital${buildQs(filters)}`, { method: 'GET' });
    return handleResponse(response);
};
export const exportDesembolsoCapitalDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/desembolso-capital/export${buildQs(filters)}`, { method: 'GET' });
    if (!response.ok) throw new Error('Error al exportar desembolso y recupero de capital');
    return response.blob();
};

// ── Grupos asesor ─────────────────────────────────────────────────────────────
export const getGruposAsesorDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/grupos-asesor${buildQs(filters)}`, { method: 'GET' });
    return handleResponse(response);
};
export const exportGruposAsesorDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/grupos-asesor/export${buildQs(filters)}`, { method: 'GET' });
    if (!response.ok) throw new Error('Error al exportar grupos asesor');
    return response.blob();
};

// ── Cuota del día ─────────────────────────────────────────────────────────────
export const getCuotaDiaDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/cuota-dia${buildQs(filters)}`, { method: 'GET' });
    return handleResponse(response);
};
export const exportCuotaDiaDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/cuota-dia/export${buildQs(filters)}`, { method: 'GET' });
    if (!response.ok) throw new Error('Error al exportar cuotas del día');
    return response.blob();
};

// ── SBS ───────────────────────────────────────────────────────────────────────
export const getSBSDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/sbs${buildQs(filters)}`, { method: 'GET' });
    return handleResponse(response);
};
export const exportSBSDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/sbs/export${buildQs(filters)}`, { method: 'GET' });
    if (!response.ok) throw new Error('Error al exportar SBS');
    return response.blob();
};

// ── Master ────────────────────────────────────────────────────────────────────
export const getMasterDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/master${buildQs(filters)}`, { method: 'GET' });
    return handleResponse(response);
};
export const exportMasterDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/master/export${buildQs(filters)}`, { method: 'GET' });
    if (!response.ok) throw new Error('Error al exportar reporte master');
    return response.blob();
};

// ── Accesos de clientes ───────────────────────────────────────────────────────
export const getAccesosDashboard = async (filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/accesos${buildQs(filters)}`, { method: 'GET' });
    return handleResponse(response);
};