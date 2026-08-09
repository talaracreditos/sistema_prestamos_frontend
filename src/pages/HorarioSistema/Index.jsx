// ── Index.jsx ─────────────────────────────────────────────────────────────────
import React from 'react';
import { useIndex } from 'hooks/HorarioSistema/useIndex';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import { ClockIcon, PencilSquareIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
 
const DIAS_LABELS = { 0:'Dom', 1:'Lun', 2:'Mar', 3:'Mié', 4:'Jue', 5:'Vie', 6:'Sáb' };
 
const Index = () => {
    const {
        loading, horarios, paginationInfo, filters,
        alert, setAlert,
        showDelete, setShowDelete,
        handleAskDelete, handleConfirmDelete, fetchHorarios,
        handleFilterChange, handleFilterSubmit, handleFilterClear,
    } = useIndex();
 
    const columns = [
        {
            header: 'Horario',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-black text-slate-800 dark:text-dark-text text-sm uppercase transition-colors">{row.nombre}</span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-brand-red dark:text-brand-gold mt-0.5 transition-colors">
                        <ClockIcon className="w-3 h-3" />
                        {row.hora_inicio} — {row.hora_fin}
                    </span>
                </div>
            ),
        },
        {
            header: 'Días',
            render: (row) => (
                <div className="flex gap-1 flex-wrap">
                    {[1,2,3,4,5,6,0].map(d => (
                        <span key={d}
                            className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase transition-colors
                                ${row.dias.includes(d)
                                    ? 'bg-brand-red dark:bg-brand-red-glow text-white dark:text-black'
                                    : 'bg-slate-100 dark:bg-dark-surface-alt text-slate-300 dark:text-dark-text-muted/40'}`}>
                            {DIAS_LABELS[d]}
                        </span>
                    ))}
                </div>
            ),
        },
        {
            header: 'Roles Asignados',
            render: (row) => (
                <div className="flex flex-wrap gap-1">
                    {row.roles.length > 0
                        ? row.roles.map(r => (
                            <span key={r.id}
                                className="flex items-center gap-1 px-2 py-0.5 bg-brand-red-light dark:bg-brand-gold/10 border border-brand-red/20 dark:border-brand-gold/20 rounded-lg text-[9px] font-black text-brand-red dark:text-brand-gold uppercase transition-colors">
                                <ShieldCheckIcon className="w-3 h-3" />
                                {r.nombre}
                            </span>
                        ))
                        : <span className="text-[10px] text-slate-400 dark:text-dark-text-muted/60 italic font-bold transition-colors">Sin restricción</span>
                    }
                </div>
            ),
        },
        {
            header: 'Estado',
            render: (row) => row.activo
                ? <span className="flex items-center gap-1 text-[10px] font-black text-green-600 dark:text-green-400 uppercase transition-colors"><CheckCircleIcon className="w-4 h-4" /> Activo</span>
                : <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 dark:text-dark-text-muted uppercase transition-colors"><XCircleIcon className="w-4 h-4" /> Inactivo</span>,
        },
        {
            header: 'Acciones',
            render: (row) => (
                <div className="flex justify-end gap-2">
                    <Link to={`/horario-sistema/editar/${row.id}`}
                        className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-brand-red/20 dark:hover:border-brand-gold/20 shadow-sm">
                        <PencilSquareIcon className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleAskDelete(row.id)}
                        className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-red-400 hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-brand-red/20 dark:hover:border-red-500/20 shadow-sm">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            ),
        },
    ];
 
    const filterConfig = [
        {
            name: 'search', type: 'text', label: 'Buscar Nombre',
            placeholder: 'Ej: Horario Laboral...',
            colSpan: 'col-span-12 md:col-span-5',
        },
        {
            name: 'activo', type: 'select', label: 'Estado',
            colSpan: 'col-span-12 md:col-span-3',
            options: [
                { value: '',    label: 'Todos' },
                { value: '1',   label: 'Activos' },
                { value: '0',   label: 'Inactivos' },
            ],
        },
    ];
 
    return (
        <div className="container mx-auto p-6 transition-colors">
            <PageHeader
                title="Horarios del Sistema"
                icon={ClockIcon}
                buttonText="+ Nuevo Horario"
                buttonLink="/horario-sistema/agregar"
            />
 
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
 
            <Table
                columns={columns}
                data={horarios}
                loading={loading}
                filterConfig={filterConfig}
                filters={filters}
                onFilterChange={handleFilterChange}
                onFilterSubmit={handleFilterSubmit}
                onFilterClear={handleFilterClear}
                pagination={{
                    currentPage:  paginationInfo.currentPage,
                    totalPages:   paginationInfo.totalPages,
                    total:        paginationInfo.total,
                    onPageChange: fetchHorarios,
                }}
            />
 
            {showDelete && (
                <ConfirmModal
                    title="¿Eliminar Horario?"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setShowDelete(false)}
                />
            )}
        </div>
    );
};
 
export default Index;