import { useState, useEffect, useCallback, useRef } from 'react';
import { index, show, updatePermisos } from 'services/rolService';
import { handleApiError } from 'utilities/Errors/apiErrorHandler';

export const useIndex = () => {
    const [loading, setLoading] = useState(true);
    const [roles, setRoles] = useState([]);
    const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, total: 0 });
    const [filters, setFilters] = useState({ search: '' });
    const filtersRef = useRef(filters);
    const [alert, setAlert] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [allPermisos, setAllPermisos] = useState([]);
    const [checkedPermisos, setCheckedPermisos] = useState([]);
    const [permisoBloqueados, setPermisosBloqueados] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [moduleFilter, setModuleFilter] = useState('');

    const fetchRoles = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await index(page, filtersRef.current);
            setRoles(response.data || []);
            setPaginationInfo({
                currentPage: response.current_page,
                totalPages: response.last_page,
                total: response.total,
            });
        } catch (err) {
            setAlert(handleApiError(err, 'Error al cargar roles'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRoles(1); }, [fetchRoles]);

    const handleManage = async (id) => {
        setIsEditing(true);
        setEditLoading(true);
        setModuleFilter('');
        try {
            const res = await show(id);
            setSelectedRole(res.data.rol);
            setAllPermisos(res.data.todos_los_permisos);
            setCheckedPermisos(res.data.rol.permisos.map(p => p.id));
            setPermisosBloqueados(res.data.permisos_bloqueados || []);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al obtener permisos'));
            setIsEditing(false);
        } finally {
            setEditLoading(false);
        }
    };

    // No permite desmarcar bloqueados
    const togglePermission = (permisoId) => {
        if (permisoBloqueados.includes(permisoId)) return;
        setCheckedPermisos(prev =>
            prev.includes(permisoId)
                ? prev.filter(id => id !== permisoId)
                : [...prev, permisoId]
        );
    };

    const toggleTodos = () => {
        const todosIds = allPermisos.map(p => p.id);
        setCheckedPermisos(prev => {
            const todosActivos = todosIds.every(id => prev.includes(id));
            // Al deseleccionar todo, respetamos los bloqueados
            return todosActivos ? [...permisoBloqueados] : [...todosIds];
        });
    };

    const toggleModulo = (permisos) => {
        const ids = permisos.map(p => p.id).filter(id => !permisoBloqueados.includes(id));
        setCheckedPermisos(prev => {
            const todosActivos = ids.every(id => prev.includes(id));
            if (todosActivos) {
                return prev.filter(id => !ids.includes(id));
            } else {
                const faltantes = ids.filter(id => !prev.includes(id));
                return [...prev, ...faltantes];
            }
        });
    };

    const handleCancel = () => {
        setIsEditing(false);
        setSelectedRole(null);
        setCheckedPermisos([]);
        setPermisosBloqueados([]);
        setModuleFilter('');
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updatePermisos(selectedRole.id, checkedPermisos);
            setAlert({ type: 'success', message: 'Permisos actualizados correctamente.' });
            setIsEditing(false);
            setSelectedRole(null);
            setPermisosBloqueados([]);
            setModuleFilter('');
            fetchRoles(paginationInfo.currentPage);
        } catch (err) {
            setAlert(handleApiError(err, 'Error al guardar permisos'));
        } finally {
            setIsSaving(false);
        }
    };

    return {
        loading, roles, paginationInfo, filters, setFilters, alert, setAlert, fetchRoles,
        isEditing, editLoading, selectedRole, allPermisos, checkedPermisos, permisoBloqueados,
        togglePermission, toggleTodos, toggleModulo,
        handleManage, handleSave, handleCancel, isSaving,
        moduleFilter, setModuleFilter,
    };
};