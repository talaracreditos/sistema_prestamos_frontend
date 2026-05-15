import { fetchWithAuth } from 'js/authToken';
import API_BASE_URL from 'js/urlHelper';
import { handleResponse } from 'utilities/Responses/handleResponse';

const BASE_URL = `${API_BASE_URL}/api/empleado`;

// GET: Listar
export const index = async (page = 1, filters = {}) => {
  const params = new URLSearchParams({
    page: page,
    search: filters.search || '',
    sexo: filters.sexo || '',
    estado: filters.estado || '',
    rol: filters.rol_id || ''
  });

  const response = await fetchWithAuth(`${BASE_URL}/index?${params.toString()}`, { method: 'GET' });
  return handleResponse(response);
};

// GET: Ver uno
export const show = async (id) => {
  const response = await fetchWithAuth(`${BASE_URL}/show/${id}`, { method: 'GET' });
  return handleResponse(response);
};

// POST: Crear
export const store = async (data) => {
  const response = await fetchWithAuth(`${BASE_URL}/store`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// PUT: Actualizar
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

export const combobox = async (page = 1, filters = {}) => {
    const params = new URLSearchParams({
        page:   page,
        search: filters.search || '',
        estado: filters.estado || '',
        rol:    filters.rol    || '',
    });
    const response = await fetchWithAuth(`${BASE_URL}/combobox?${params.toString()}`, { method: 'GET' });
    return handleResponse(response);
};