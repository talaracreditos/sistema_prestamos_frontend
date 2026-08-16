import React, { useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useIndex } from 'hooks/Prospecto/useIndex';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ViewProspectoModal from './ViewProspectoModal';
import ConvertirProspectoModal from './ConvertirProspectoModal';
import { EstadoBadge } from 'components/Shared/Formularios/Prospecto/ProspectoForm';
import ZonaSearchSelect from 'components/Shared/Comboboxes/ZonaSearchSelect';
import EmpleadoSearchSelect from 'components/Shared/Comboboxes/EmpleadoSearchSelect';
import {
    UsersIcon, EyeIcon, PencilSquareIcon, ArrowRightCircleIcon,
    PhoneIcon, CalendarDaysIcon, UserIcon, BuildingOfficeIcon,
    CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from 'context/AuthContext';

const Index = () => {
    const { can } = useAuth();
    const {
        loading, prospectos, paginationInfo, filters, alert, setAlert,
        isViewOpen, setIsViewOpen, viewData, setViewData, viewLoading,
        fetchProspectos, handleView,
        handleFilterChange, handleFilterSubmit, handleFilterClear,
    } = useIndex();

    const [convertirOpen,       setConvertirOpen]       = useState(false);
    const [prospectoAConvertir, setProspectoAConvertir] = useState(null);
    const [zonaKey,   setZonaKey]   = useState(Date.now());
    const [asesorKey, setAsesorKey] = useState(Date.now());

    const handleAbrirConvertir = useCallback((prospectoId) => {
        setProspectoAConvertir(prospectoId);
        setConvertirOpen(true);
    }, []);

    const handleSuccessConvertir = () => {
        setConvertirOpen(false);
        setProspectoAConvertir(null);
        fetchProspectos(paginationInfo.currentPage);
    };

    const onClearFilters = () => {
        handleFilterClear();
        setZonaKey(Date.now());
        setAsesorKey(Date.now());
    };

    const filterConfig = useMemo(() => [
        {
            name: 'search', type: 'text',
            label: 'Buscar (Nombre/DNI/RUC/Teléfono)',
            placeholder: 'Ej: Juan, 12345678...',
            colSpan: 'col-span-12 md:col-span-5'
        },
        {
            name: 'estado', type: 'select', label: 'Estado',
            colSpan: 'col-span-12 md:col-span-3',
            options: [
                { value: '', label: 'Todos' },
                { value: '1', label: 'Nuevo' },
                { value: '2', label: 'Contactado' },
                { value: '3', label: 'En Evaluación' },
                { value: '4', label: 'Aprobado' },
                { value: '5', label: 'Rechazado' },
                { value: '6', label: 'Convertido' },
            ]
        },
        {
            name: 'tipo', type: 'select', label: 'Tipo',
            colSpan: 'col-span-12 md:col-span-4',
            options: [
                { value: '', label: 'Todos' },
                { value: '1', label: 'Persona' },
                { value: '2', label: 'Empresa' }
            ]
        },
        {
            name: 'zona_id', type: 'custom',
            label: 'Zona',
            colSpan: 'col-span-12 md:col-span-6',
            render: () => (
                <ZonaSearchSelect
                    key={zonaKey}
                    onSelect={(zona) => handleFilterChange('zona_id', zona?.id || '')}
                />
            ),
        },
        {
            name: 'asesor_id', type: 'custom',
            label: 'Asesor',
            colSpan: 'col-span-12 md:col-span-6',
            render: () => (
                <EmpleadoSearchSelect
                    key={asesorKey}
                    rol="asesor"
                    onSelect={(emp) => handleFilterChange('asesor_id', emp?.id || '')}
                    clearOnSelect={false}
                />
            ),
        },
    ], [zonaKey, asesorKey, handleFilterChange]);

    const columns = useMemo(() => [
        {
            header: 'ID',
            render: (row) => (
                <span className="font-mono text-[15px] font-black px-2 py-1 rounded text-slate-600 dark:text-dark-text">
                    {row.id}
                </span>
            )
        },
        {
            header: 'Prospecto',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full border transition-colors ${row.tipo === 2 ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' : 'bg-brand-red-light dark:bg-dark-surface-alt border-brand-red/20 dark:border-brand-gold/20'}`}>
                        {row.tipo === 2
                            ? <BuildingOfficeIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            : <UserIcon className="w-5 h-5 text-brand-red dark:text-brand-gold" />
                        }
                    </div>
                    <div>
                        <p className="font-bold text-slate-800 dark:text-dark-text text-[12px] transition-colors">{row.nombre_completo}</p>
                        <p className="text-[11px] text-slate-400 dark:text-dark-text-muted transition-colors">{row.documento || 'Sin documento'}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Contacto',
            render: (row) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-slate-600 dark:text-dark-text flex items-center gap-1 transition-colors">
                        <PhoneIcon className="w-3 h-3 text-slate-400 dark:text-dark-text-muted" /> {row.telefono}
                    </span>
                    {row.correo && <span className="text-[11px] text-slate-400 dark:text-dark-text-muted transition-colors">{row.correo}</span>}
                </div>
            )
        },
        {
            header: 'Estado',
            render: (row) => <EstadoBadge estado={row.estado} />
        },
        {
            header: 'Asesor / Zona',
            render: (row) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-dark-text transition-colors">{row.asesor}</span>
                    <span className="text-[11px] text-slate-400 dark:text-dark-text-muted transition-colors">{row.zona}</span>
                </div>
            )
        },
        {
            header: 'Registro',
            render: (row) => (
                <span className="text-xs text-slate-500 dark:text-dark-text-muted flex items-center gap-1 transition-colors">
                    <CalendarDaysIcon className="w-3 h-3" /> {row.created_at?.split(' ')[0]}
                </span>
            )
        },
        {
            header: 'Acciones',
            render: (row) => {
                const puedeEditar    = can('prospecto.update') && [1, 2, 3].includes(row.estado);
                const puedeConvertir = can('prospecto.convertir') && row.estado === 4;

                return (
                    <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => handleView(row.id)} title="Ver Detalle"
                            className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-brand-red/20 dark:hover:border-brand-gold/20 shadow-sm">
                            <EyeIcon className="w-4 h-4" />
                        </button>

                        {puedeEditar && (
                            <Link to={`/prospecto/editar/${row.id}`} title="Editar"
                                className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-slate-800 dark:hover:text-dark-text hover:bg-slate-50 dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-dark-border shadow-sm">
                                <PencilSquareIcon className="w-4 h-4" />
                            </Link>
                        )}

                        {puedeConvertir && (
                            <button
                                onClick={() => handleAbrirConvertir(row.id)}
                                title="Convertir a Cliente"
                                className="p-2 text-green-500 dark:text-green-400 hover:text-white dark:hover:text-black hover:bg-green-500 dark:hover:bg-green-400 rounded-xl transition-all border border-green-200 dark:border-green-500/30 hover:border-green-500 shadow-sm"
                            >
                                <ArrowRightCircleIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                );
            }
        },
    ], [handleView, can, handleAbrirConvertir]);

    const handleSeguimientoSuccess = async (updatedData) => {
        fetchProspectos(paginationInfo.currentPage);
        if (updatedData) {
            setIsViewOpen(true);
            setViewData(updatedData);
        }
    };

    return (
        <div className="container mx-auto p-6 transition-colors">
            <PageHeader
                title="Gestión de Prospectos"
                icon={UsersIcon}
                buttonText="+ Nuevo Prospecto"
                buttonLink="/prospecto/agregar"
            />

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <Table
                columns={columns} data={prospectos} loading={loading}
                filterConfig={filterConfig} filters={filters}
                onFilterChange={handleFilterChange}
                onFilterSubmit={handleFilterSubmit}
                onFilterClear={onClearFilters}
                pagination={{ ...paginationInfo, onPageChange: fetchProspectos }}
            />

            <ViewProspectoModal
                isOpen={isViewOpen}
                onClose={() => setIsViewOpen(false)}
                data={viewData}
                isLoading={viewLoading}
                onSeguimientoSuccess={handleSeguimientoSuccess}
            />

            <ConvertirProspectoModal
                isOpen={convertirOpen}
                onClose={() => { setConvertirOpen(false); setProspectoAConvertir(null); }}
                prospectoId={prospectoAConvertir}
                onSuccess={handleSuccessConvertir}
            />
        </div>
    );
};

export default Index;