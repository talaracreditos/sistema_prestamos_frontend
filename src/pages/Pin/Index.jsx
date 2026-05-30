import React, { useMemo } from 'react';
import { useIndex } from 'hooks/Pin/useIndex';
import { useAuth } from 'context/AuthContext';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import EmpleadoSearchSelect from 'components/Shared/Comboboxes/EmpleadoSearchSelect';
import { ShieldCheckIcon, TrashIcon } from '@heroicons/react/24/outline';

const Index = () => {
    const {
        loading, pins, paginationInfo, filters, alert, setAlert, comboKey,
        fetchPins, handleFilterChange, handleFilterSubmit, handleFilterClear,
        isConfirmOpen, setIsConfirmOpen,
        openInhabilitarModal, handleConfirmInhabilitar,
    } = useIndex();

    const { can } = useAuth();

    const columns = useMemo(() => [
        {
            header: 'Generado Por',
            render: (row) => (
                <span className="text-[10px] font-black text-slate-700 uppercase">{row.generado_por}</span>
            ),
        },
        {
            header: 'Para Usuario',
            render: (row) => (
                <span className={`text-[10px] font-bold uppercase ${row.para_usuario === 'Cualquier usuario' ? 'text-slate-400 italic' : 'text-slate-700'}`}>
                    {row.para_usuario}
                </span>
            ),
        },
        {
            header: 'Usos',
            render: (row) => (
                <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-slate-700">
                        {row.usos_realizados} / {row.usos_maximos === 0 ? '∞' : row.usos_maximos}
                    </span>
                    {row.usos_restantes !== '∞' && row.usos_restantes === 0 && (
                        <span className="text-[8px] font-black text-slate-400 bg-slate-100 rounded px-1">AGOTADO</span>
                    )}
                </div>
            ),
        },
        {
            header: 'Expira',
            render: (row) => (
                <span className="text-[10px] text-slate-500 font-medium">
                    {row.expira_at
                        ? new Date(row.expira_at).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                        : '—'}
                </span>
            ),
        },
        {
            header: 'Estado',
            render: (row) => (
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                    row.vigente
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-slate-50 text-slate-500 border-slate-200'
                }`}>
                    {row.vigente ? 'VIGENTE' : 'INACTIVO'}
                </span>
            ),
        },
        {
            header: 'Generado',
            render: (row) => {
                const d = new Date(row.created_at);
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
        {
            header: 'Acciones',
            render: (row) => row.vigente ? (
                <button
                    onClick={() => openInhabilitarModal(row.id)}
                    title="Inhabilitar PIN"
                    className="p-1.5 text-slate-400 hover:text-brand-red hover:bg-brand-red-light rounded-lg transition-all border border-transparent hover:border-brand-red/20"
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
            ) : null,
        },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ], []);

    const filterConfig = [
        {
            name: 'generado_por_id', type: 'custom', label: 'Generado Por',
            colSpan: 'col-span-12 sm:col-span-4',
            render: () => (
                <EmpleadoSearchSelect
                    key={comboKey}
                    onSelect={(u) => handleFilterChange('generado_por_id', u ? u.id : '')}
                    clearOnSelect={false}
                />
            ),
        },
        {
            name: 'usuario_id', type: 'custom', label: 'Para Usuario',
            colSpan: 'col-span-12 sm:col-span-4',
            render: () => (
                <EmpleadoSearchSelect
                    key={comboKey + 1}
                    onSelect={(u) => handleFilterChange('usuario_id', u ? u.id : '')}
                    clearOnSelect={false}
                />
            ),
        },
        {
            name: 'activo', type: 'select', label: 'Estado',
            colSpan: 'col-span-12 sm:col-span-4',
            options: [
                { value: '',  label: 'Todos' },
                { value: '1', label: 'Vigentes' },
                { value: '0', label: 'Inactivos' },
            ],
        },
    ];

    return (
        <div className="container mx-auto p-4 sm:p-6 w-full max-w-full">
            <PageHeader
                title="PINs de Autorización"
                icon={ShieldCheckIcon}
                buttonText={can('pin.store') ? '+ Generar PIN' : null}
                buttonLink={can('pin.store') ? '/pin/generar' : null}
            />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            <Table
                columns={columns} data={pins} loading={loading}
                filterConfig={filterConfig} filters={filters}
                onFilterChange={handleFilterChange} onFilterSubmit={handleFilterSubmit}
                onFilterClear={handleFilterClear}
                pagination={{ ...paginationInfo, onPageChange: fetchPins }}
            />

            {isConfirmOpen && (
                <ConfirmModal
                    title="¿Inhabilitar PIN?"
                    message="El PIN quedará inactivo de inmediato y no podrá usarse más. Esta acción no se puede deshacer."
                    confirmText="Sí, Inhabilitar"
                    requirePin={false}
                    onConfirm={handleConfirmInhabilitar}
                    onCancel={() => setIsConfirmOpen(false)}
                />
            )}
        </div>
    );
};

export default Index;