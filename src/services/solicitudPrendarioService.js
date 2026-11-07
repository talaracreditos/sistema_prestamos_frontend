import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/solicitud-prendario`;

const buildQs = (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) qs.append(k, v);
    });
    const s = qs.toString();
    return s ? `?${s}` : '';
};

const jsonRequest = (method, data) => ({
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data ?? {}),
});

export const index = async (page = 1, filters = {}) => {
    const response = await fetchWithAuth(`${BASE_URL}/index${buildQs({ page, ...filters })}`, { method: 'GET' });
    return handleResponse(response);
};

export const show = async (id) => {
    const response = await fetchWithAuth(`${BASE_URL}/show/${id}`, { method: 'GET' });
    return handleResponse(response);
};

export const store = async (data) => {
    const response = await fetchWithAuth(`${BASE_URL}/store`, jsonRequest('POST', data));
    return handleResponse(response);
};

export const update = async (id, data) => {
    const response = await fetchWithAuth(`${BASE_URL}/update/${id}`, jsonRequest('PUT', data));
    return handleResponse(response);
};

export const changeStatus = async (id, estado, abonadoPor = null) => {
    const payload = { estado };
    if (abonadoPor) payload.abonado_por = abonadoPor;
    const response = await fetchWithAuth(`${BASE_URL}/status/${id}`, jsonRequest('PATCH', payload));
    return handleResponse(response);
};

export const descargarContrato = async (id) => {
    const response = await fetchWithAuth(`${BASE_URL}/${id}/contrato`, { method: 'GET' });
    return handleResponse(response);
};

export const marcarContratoConforme = async (id) => {
    const response = await fetchWithAuth(`${BASE_URL}/${id}/contrato-conforme`, { method: 'PATCH' });
    return handleResponse(response);
};

export const asignarCodigoRecaudo = async (id, codigoRecaudo) => {
    const response = await fetchWithAuth(`${BASE_URL}/${id}/codigo-recaudo`, jsonRequest('PATCH', { codigo_recaudo: codigoRecaudo }));
    return handleResponse(response);
};