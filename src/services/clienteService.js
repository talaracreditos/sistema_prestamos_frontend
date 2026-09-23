import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/cliente`;

export const index = async (page = 1, filters = {}) => {
    const params = new URLSearchParams({
        page:   page,
        search: filters.search || '',
        estado: filters.estado || '',
        tipo:   filters.tipo   || '',
    });
    const response = await fetchWithAuth(`${BASE_URL}/index?${params.toString()}`, { method: 'GET' });
    return handleResponse(response);
};

export const combobox = async (page = 1, filters = {}) => {
    const params = new URLSearchParams({
        page:   page,
        search: filters.search || '',
        estado: filters.estado || '',
    });
    const response = await fetchWithAuth(`${BASE_URL}/combobox?${params.toString()}`, { method: 'GET' });
    return handleResponse(response);
};

export const show = async (id) => {
    const response = await fetchWithAuth(`${BASE_URL}/show/${id}`, { method: 'GET' });
    return handleResponse(response);
};

export const store = async (data) => {
    const response = await fetchWithAuth(`${BASE_URL}/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const update = async (id, data) => {
    const response = await fetchWithAuth(`${BASE_URL}/update/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse(response);
};

export const toggleStatus = async (id) => {
    const response = await fetchWithAuth(`${BASE_URL}/status/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
};

export const descargarFichaPdf = async (id) => {
    const response = await fetchWithAuth(`${BASE_URL}/pdf/${id}`, { method: 'GET' });
    return handleResponse(response);
};

export const convertirProspecto = async (data) => {
    const response = await fetchWithAuth(`${BASE_URL}/convertir`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
    });
    return handleResponse(response);
};

export const historialCreditos = async (id, page = 1) => {
    const response = await fetchWithAuth(`${BASE_URL}/historial/${id}?page=${page}`, { method: 'GET' });
    return handleResponse(response);
};

export const kardexCredito = async (prestamoId, clienteId) => {
    const params = new URLSearchParams({ cliente_id: clienteId });
    const response = await fetchWithAuth(`${BASE_URL}/kardex/${prestamoId}?${params.toString()}`, { method: 'GET' });
    return handleResponse(response);
};

export const exportarHistorialCreditos = async (clienteId, formato) => {
    const response = await fetchWithAuth(`${BASE_URL}/exportar-historial/${clienteId}?formato=${formato}`, { method: 'GET' });
    return handleResponse(response);
};