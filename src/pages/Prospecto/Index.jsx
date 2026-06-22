import React, { useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useIndex } from 'hooks/Prospecto/useIndex';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ViewProspectoModal from './ViewProspectoModal';
import ConvertirProspectoModal from './ConvertirProspectoModal';
import { EstadoBadge } from 'components/Shared/Formularios/Prospecto/ProspectoForm';
import ZonaSearchSelect from 'components/Shared/Formularios/ZonaSearchSelect';
import EmpleadoSearchSelect from 'components/Shared/Formularios/EmpleadoSearchSelect';
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

    const handleAbrirConvertir = useCallback((prospectoId) => {
        setProspectoAConvertir(prospectoId);
        setConvertirOpen(true);
    }, []);

    const handleSuccessConvertir = () => {
        setConvertirOpen(false);
        setProspectoAConvertir(null);
        fetchProspectos(paginationInfo.currentPage);
    };

    // ── Filtros extra (zona y asesor) fuera del filterConfig normal ───────────
    const extraFilters = (
        <div className="grid grid-cols-12 gap-3 mt-3">
            <div className="col-span-12 md:col-span-6">
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Zona</label>
                <ZonaSearchSelect
                    initialName={filters._zonaNombre || ''}
                    onSelect={(zona) => {
                        handleFilterChange('zona_id', zona?.id || '');
                        handleFilterChange('_zonaNombre', zona?.nombre || '');
                    }}
                />
            </div>
            <div className="col-span-12 md:col-span-6">
                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wide">Asesor</label>
                <EmpleadoSearchSelect
                    initialName={filters._asesorNombre || ''}
                    rol="asesor"
                    onSelect={(emp) => {
                        handleFilterChange('asesor_id', emp?.id || '');
                        handleFilterChange('_asesorNombre', emp?.nombre_completo || '');
                    }}
                />
            </div>
        </div>
    );

    const filterConfig = useMemo(() => [
        { name: 'search', type: 'text', label: 'Buscar (Nombre/DNI/RUC/Teléfono)', placeholder: 'Ej: Juan, 12345678...', colSpan: 'col-span-12 md:col-span-5' },
        { name: 'estado', type: 'select', label: 'Estado', colSpan: 'col-span-12 md:col-span-3',
          options: [
              { value: '', label: 'Todos' },
              { value: '1', label: 'Nuevo' },
              { value: '2', label: 'Contactado' },
              { value: '3', label: 'En Evaluación' },
              { value: '4', label: 'Aprobado' },
              { value: '5', label: 'Rechazado' },
              { value: '6', label: 'Convertido' },
          ]},
        { name: 'tipo', type: 'select', label: 'Tipo', colSpan: 'col-span-12 md:col-span-4',
          options: [{ value: '', label: 'Todos' }, { value: '1', label: 'Persona' }, { value: '2', label: 'Empresa' }] },
    ], []);

    const columns = useMemo(() => [
        {
            header: 'ID',
            render: (row) => (
                <span className="font-mono text-[15px] font-black px-2 py-1 rounded text-slate-600">
                    {row.id}
                </span>
            )
        },
        {
            header: 'Prospecto',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full border ${row.tipo === 2 ? 'bg-amber-50 border-amber-200' : 'bg-brand-red-light border-brand-red/20'}`}>
                        {row.tipo === 2
                            ? <BuildingOfficeIcon className="w-5 h-5 text-amber-600" />
                            : <UserIcon className="w-5 h-5 text-brand-red" />
                        }
                    </div>
                    <div>
                        <p className="font-bold text-slate-800 text-sm">{row.nombre_completo}</p>
                        <p className="text-[11px] text-slate-400">{row.documento || 'Sin documento'}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Contacto',
            render: (row) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                        <PhoneIcon className="w-3 h-3 text-slate-400" /> {row.telefono}
                    </span>
                    {row.correo && <span className="text-[11px] text-slate-400">{row.correo}</span>}
                </div>
            )
        },
        {
            header: 'Monto / Ingreso',
            render: (row) => (
                <div className="flex flex-col gap-0.5">
                    {row.monto_solicitado && (
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <CurrencyDollarIcon className="w-3 h-3 text-green-500" />
                            S/ {parseFloat(row.monto_solicitado).toLocaleString()}
                        </span>
                    )}
                    {row.ingreso_estimado && (
                        <span className="text-[11px] text-slate-400">Ingreso: S/ {parseFloat(row.ingreso_estimado).toLocaleString()}</span>
                    )}
                    {!row.monto_solicitado && !row.ingreso_estimado && <span className="text-slate-300 text-xs">—</span>}
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
                    <span className="text-xs font-bold text-slate-600">{row.asesor}</span>
                    <span className="text-[11px] text-slate-400">{row.zona}</span>
                </div>
            )
        },
        {
            header: 'Registro',
            render: (row) => (
                <span className="text-xs text-slate-500 flex items-center gap-1">
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
                            className="p-2 text-slate-400 hover:text-brand-red hover:bg-brand-red-light rounded-xl transition-all border border-transparent hover:border-brand-red/20 shadow-sm">
                            <EyeIcon className="w-4 h-4" />
                        </button>

                        {puedeEditar && (
                            <Link to={`/prospecto/editar/${row.id}`} title="Editar"
                                className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-200 shadow-sm">
                                <PencilSquareIcon className="w-4 h-4" />
                            </Link>
                        )}

                        {puedeConvertir && (
                            <button
                                onClick={() => handleAbrirConvertir(row.id)}
                                title="Convertir a Cliente"
                                className="p-2 text-green-500 hover:text-white hover:bg-green-500 rounded-xl transition-all border border-green-200 hover:border-green-500 shadow-sm"
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
        <div className="container mx-auto p-6">
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
                onFilterClear={handleFilterClear}
                extraFilters={extraFilters}
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