import React, { useMemo, useState } from 'react';
import { useIndex } from 'hooks/Traslado/useIndex';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import EmpleadoSearchSelect from 'components/Shared/Comboboxes/EmpleadoSearchSelect';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';

const Index = () => {
    const {
        loading, traslados, paginationInfo, filters, alert, setAlert,
        fetchTraslados, handleFilterChange, handleFilterSubmit, handleFilterClear,
    } = useIndex();

    const [comboKey, setComboKey] = useState(Date.now());

    const onClearFilters = () => {
        handleFilterClear();
        setComboKey(Date.now());
    };

    const columns = useMemo(() => [
        {
            header: 'Préstamo',
            render: (row) => (
                <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs font-black text-slate-500 bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5 w-fit">
                        #{row.prestamo_codigo}
                    </span>
                    {row.es_grupal && (
                        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5 w-fit uppercase">
                            Grupal
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: 'Titular',
            render: (row) => (
                <span className="text-[11px] font-black text-slate-700 uppercase">{row.titular}</span>
            ),
        },
        {
            header: 'Asesor Origen',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase">{row.asesor_origen}</span>
                </div>
            ),
        },
        {
            header: 'Asesor Destino',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase">{row.asesor_destino}</span>
                </div>
            ),
        },
        {
            header: 'Registrado por',
            render: (row) => (
                <span className="text-[10px] font-bold text-slate-500 uppercase">{row.registrado_por}</span>
            ),
        },
        {
            header: 'Motivo',
            render: (row) => (
                <span className="text-[10px] text-slate-400 font-medium italic">
                    {row.motivo || '—'}
                </span>
            ),
        },
        {
            header: 'Fecha',
            render: (row) => {
                const d = new Date(row.fecha);
                return (
                    <div className="text-[10px] text-slate-500">
                        <span className="font-bold block whitespace-nowrap">
                            {d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                        <span className="uppercase">
                            {d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                    </div>
                );
            },
        },
    ], []);

    const filterConfig = [
        { name: 'search', type: 'text', label: 'Buscar por préstamo', colSpan: 'col-span-12 sm:col-span-4' },
        {
            name: 'asesor_origen_id', type: 'custom', label: 'Asesor Origen',
            colSpan: 'col-span-12 sm:col-span-4',
            render: () => (
                <EmpleadoSearchSelect
                    key={comboKey}
                    rol="asesor"
                    onSelect={(a) => handleFilterChange('asesor_origen_id', a ? a.id : '')}
                    clearOnSelect={false}
                />
            ),
        },
        {
            name: 'asesor_destino_id', type: 'custom', label: 'Asesor Destino',
            colSpan: 'col-span-12 sm:col-span-4',
            render: () => (
                <EmpleadoSearchSelect
                    key={comboKey + 1}
                    rol="asesor"
                    onSelect={(a) => handleFilterChange('asesor_destino_id', a ? a.id : '')}
                    clearOnSelect={false}
                />
            ),
        },
    ];

    return (
        <div className="container mx-auto p-4 sm:p-6 w-full max-w-full xl:max-w-7xl">
            <PageHeader
                title="Historial de Traslados"
                icon={ArrowsRightLeftIcon}
                buttonText="+ Registrar Traslado"
                buttonLink="/traslado/registrar"
            />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            <Table
                columns={columns} data={traslados} loading={loading}
                filterConfig={filterConfig} filters={filters}
                onFilterChange={handleFilterChange} onFilterSubmit={handleFilterSubmit}
                onFilterClear={onClearFilters}
                pagination={{ ...paginationInfo, onPageChange: fetchTraslados }}
            />
        </div>
    );
};

export default Index;