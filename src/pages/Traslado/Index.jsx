import React, { useMemo, useState } from 'react';
import { useIndex } from 'hooks/Traslado/useIndex';
import { useAuth } from 'context/AuthContext';
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

    const { can } = useAuth();

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
                    <span className="font-mono text-xs font-black text-slate-500 dark:text-dark-text-muted bg-slate-100 dark:bg-dark-surface-alt border border-slate-200 dark:border-dark-border rounded px-1.5 py-0.5 w-fit transition-colors">
                        #{row.prestamo_codigo}
                    </span>
                    {row.es_grupal && (
                        <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded px-1.5 py-0.5 w-fit uppercase transition-colors">
                            Grupal
                        </span>
                    )}
                </div>
            ),
        },
        {
            header: 'Titular',
            render: (row) => (
                <span className="text-[11px] font-black text-slate-700 dark:text-dark-text uppercase transition-colors">{row.titular}</span>
            ),
        },
        {
            header: 'Asesor Origen',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-dark-text-muted uppercase transition-colors">{row.asesor_origen}</span>
                </div>
            ),
        },
        {
            header: 'Asesor Destino',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    <span className="text-[10px] font-bold text-slate-600 dark:text-dark-text-muted uppercase transition-colors">{row.asesor_destino}</span>
                </div>
            ),
        },
        {
            header: 'Registrado por',
            render: (row) => (
                <span className="text-[10px] font-bold text-slate-500 dark:text-dark-text-muted uppercase transition-colors">{row.registrado_por}</span>
            ),
        },
        {
            header: 'Motivo',
            render: (row) => (
                <span className="text-[10px] text-slate-400 dark:text-dark-text-muted/80 font-medium italic transition-colors">
                    {row.motivo || '—'}
                </span>
            ),
        },
        {
            header: 'Fecha',
            render: (row) => {
                const d = new Date(row.fecha);
                return (
                    <div className="text-[10px] text-slate-500 dark:text-dark-text-muted transition-colors">
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
        <div className="container mx-auto p-4 sm:p-6 w-full max-w-full transition-colors">
            <PageHeader
                title="Historial de Traslados"
                icon={ArrowsRightLeftIcon}
                buttonText={can('traslado.store') ? '+ Registrar Traslado' : null}
                buttonLink={can('traslado.store') ? '/traslado/registrar' : null}
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