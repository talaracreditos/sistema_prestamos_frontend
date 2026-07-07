import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/solicitud-prestamo`;

export const index = async (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page, search: filters.search || '', estado: filters.estado || '' });
    const response = await fetchWithAuth(`${BASE_URL}/index?${params.toString()}`, { method: 'GET' });
    return handleResponse(response);
};

export const show = async (id) => {
    const response = await fetchWithAuth(`${BASE_URL}/show/${id}`, { method: 'GET' });
    return handleResponse(response);
};

export const store = async (data) => {
    const response = await fetchWithAuth(`${BASE_URL}/store`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const update = async (id, data) => {
    const response = await fetchWithAuth(`${BASE_URL}/update/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const changeStatus = async (id, estado, abonado_por, codigoRecaudo) => {
    const response = await fetchWithAuth(`${BASE_URL}/status/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo_recaudo: codigoRecaudo, estado, abonado_por }),
    });
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


export const asignarCodigoRecaudo = async (id, codigo) => {
    const response = await fetchWithAuth(`${BASE_URL}/${id}/codigo-recaudo`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo_recaudo: codigo }),
    });
    return handleResponse(response);
};