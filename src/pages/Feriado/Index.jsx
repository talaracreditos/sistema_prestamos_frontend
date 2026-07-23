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
        { header: 'Fecha',       render: (row) => <span className="font-bold text-slate-700">{row.fecha_display || row.fecha}</span> },
        { header: 'Descripción', render: (row) => <span className="uppercase text-xs font-black text-slate-500">{row.descripcion}</span> },
        { header: 'Día',         render: (row) => <span className="capitalize text-xs text-slate-400">{row.dia}</span> },
        {
            header: 'Acciones',
            render: (row) => (
                <div className="flex justify-end gap-2">
                    <Link to={`/feriados/editar/${row.id}`}
                        className="p-2 text-slate-400 hover:text-brand-red hover:bg-brand-red-light rounded-xl transition-all border border-transparent hover:border-brand-red/20 shadow-sm">
                        <PencilSquareIcon className="w-4 h-4" />
                    </Link>
                    <button onClick={() => handleAskDelete(row.id)}
                        className="p-2 text-slate-400 hover:text-brand-red hover:bg-brand-red-light rounded-xl transition-all border border-transparent hover:border-brand-red/20 shadow-sm">
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

    // IMPORTANTE: el calendario se pinta con `feriadosCalendario` (listado COMPLETO
    // sin paginar, viene ya en formato Y-m-d desde el backend), no con `feriados`
    // (que solo trae los 7 registros de la página actual de la tabla). Antes se
    // derivaba de `feriados` y por eso faltaban feriados de otras páginas al
    // cambiar a vista calendario.

    return (
        <div className="container mx-auto p-6">
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
                        ? 'bg-brand-red text-white border-brand-red hover:bg-brand-red-dark'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
            >
                {vistaCalendario
                    ? <><TableCellsIcon className="w-4 h-4" /> Ver Tabla</>
                    : <><CalendarDaysIcon className="w-4 h-4 text-brand-red" /> Ver Calendario</>
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

                    <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-md bg-brand-red-light border-2 border-brand-red/30 inline-block" />
                            Feriado
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-md border-2 border-brand-gold-dark inline-block" />
                            Hoy
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">
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