import React, { useState } from 'react';
import { useIndex } from 'hooks/Feriado/useIndex';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import Calendario from 'components/Shared/Calendars/Calendario';
import { CalendarIcon, TrashIcon, PencilSquareIcon, TableCellsIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const ANIOS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i);

const Index = () => {
    const {
        loading, feriados, feriadosCalendario, paginationInfo, filters,
        alert, setAlert,
        showDelete, setShowDelete,
        handleAskDelete, handleConfirmDelete, fetchFeriados,
        handleFilterChange, handleFilterSubmit, handleFilterClear,
    } = useIndex();

    const [vistaCalendario, setVistaCalendario] = useState(false);

    const columns = [
        { header: 'Fecha',     render: (row) => <span className="font-bold text-slate-700 dark:text-dark-text">{row.fecha_display || row.fecha}</span> },
        { header: 'Descripción', render: (row) => <span className="uppercase text-xs font-black text-slate-500 dark:text-dark-text-muted">{row.descripcion}</span> },
        { header: 'Día',         render: (row) => <span className="capitalize text-xs text-slate-400 dark:text-dark-text-muted/70">{row.dia}</span> },
        {
            header: 'Acciones',
            render: (row) => (
                <div className="flex justify-end gap-2">
                    <Link to={`/feriados/editar/${row.id}`}
                        className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-brand-gold hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-brand-red/20 dark:hover:border-brand-gold/20 shadow-sm">
                        <PencilSquareIcon className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleAskDelete(row.id)}
                        className="p-2 text-slate-400 dark:text-dark-text-muted hover:text-brand-red dark:hover:text-red-400 hover:bg-brand-red-light dark:hover:bg-dark-surface-alt rounded-xl transition-all border border-transparent hover:border-brand-red/20 dark:hover:border-red-500/20 shadow-sm">
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    const filterConfig = [
        {
            name: 'search', type: 'text', label: 'Buscar Descripción',
            placeholder: 'Ej: Navidad, Fiestas Patrias...',
            colSpan: 'col-span-12 md:col-span-4',
        },
        {
            name: 'anio', type: 'select', label: 'Año',
            colSpan: 'col-span-12 md:col-span-3',
            options: [
                { value: '', label: 'Todos los años' },
                ...ANIOS.map(a => ({ value: a.toString(), label: a.toString() })),
            ],
        },
        {
            name: 'dia', type: 'select', label: 'Día de Semana',
            colSpan: 'col-span-12 md:col-span-3',
            options: [
                { value: '',  label: 'Todos los días' },
                { value: '1', label: 'Lunes' },
                { value: '2', label: 'Martes' },
                { value: '3', label: 'Miércoles' },
                { value: '4', label: 'Jueves' },
                { value: '5', label: 'Viernes' },
                { value: '6', label: 'Sábado' },
                { value: '0', label: 'Domingo' },
            ],
        },
    ];

    return (
        <div className="container mx-auto p-6 transition-colors">
            <PageHeader
                title="Feriados Registrados"
                icon={CalendarIcon}
                buttonText="+ Nuevo Feriado"
                buttonLink="/feriados/agregar"
            />

            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />

            <button
                onClick={() => setVistaCalendario(v => !v)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase transition-all border shadow-sm mt-4 mb-4 ${
                    vistaCalendario
                        ? 'bg-brand-red dark:bg-brand-red-glow text-white dark:text-black border-brand-red dark:border-transparent hover:bg-brand-red-dark dark:hover:brightness-110'
                        : 'bg-white dark:bg-dark-surface text-slate-600 dark:text-dark-text border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-surface-alt hover:border-slate-300 dark:hover:border-slate-600'
                }`}
            >
                {vistaCalendario
                    ? <><TableCellsIcon className="w-4 h-4" /> Ver Tabla</>
                    : <><CalendarDaysIcon className="w-4 h-4 text-brand-red dark:text-brand-gold" /> Ver Calendario</>
                }
            </button>

            {!vistaCalendario && (
                <Table
                    columns={columns}
                    data={feriados}
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
                        onPageChange: fetchFeriados,
                    }}
                />
            )}

            {vistaCalendario && (
                <div className="flex flex-col items-center gap-6 mt-2">
                    <Calendario mode="view" feriados={feriadosCalendario} size="large" />

                    <div className="flex items-center gap-6 text-xs font-bold text-slate-400 dark:text-dark-text-muted transition-colors">
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-md bg-brand-red-light dark:bg-red-500/20 border-2 border-brand-red/30 dark:border-red-500/40 inline-block" />
                            Feriado
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-md border-2 border-brand-gold-dark dark:border-brand-gold inline-block" />
                            Hoy
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-dark-text-muted/60 uppercase tracking-widest transition-colors">
                        Pasa el cursor sobre un día marcado para ver la descripción
                    </p>
                </div>
            )}

            {showDelete && (
                <ConfirmModal
                    title="¿Eliminar Feriado?"
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setShowDelete(false)}
                />
            )}
        </div>
    );
};

export default Index;