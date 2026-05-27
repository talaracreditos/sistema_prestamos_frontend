import React, { useMemo, useState } from 'react';
import { useIndex } from 'hooks/Prestamo/useIndex';
import { useAuth } from 'context/AuthContext';
import Table from 'components/Shared/Tables/Table';
import PageHeader from 'components/Shared/Headers/PageHeader';
import AlertMessage from 'components/Shared/Errors/AlertMessage';
import LoadingScreen from 'components/Shared/LoadingScreen';
import ViewModal from 'components/Shared/Modals/ViewModal';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import ViewPrestamoModal from './ViewPrestamoModal';
import EmpleadoSearchSelect from 'components/Shared/Comboboxes/EmpleadoSearchSelect';
import { 
    BanknotesIcon, EyeIcon, PhotoIcon,
    ArrowPathIcon, UserGroupIcon, UserIcon,
    BriefcaseIcon, TrashIcon
} from '@heroicons/react/24/outline';

const Index = () => {
    const {
        loading, prestamos, paginationInfo, filters, alert, setAlert,
        handleFilterChange, handleFilterSubmit, handleFilterClear, fetchPrestamos,
        handleView, isViewOpen, setIsViewOpen, viewData, viewLoading,
        handleRefreshView,
        handleOpenAbono, isAbonoModalOpen, setIsAbonoModalOpen, selectedAbonoUrl,
        isDeleteModalOpen, setIsDeleteModalOpen, openDeleteModal, handleConfirmDelete, deleteLoading
    } = useIndex();

    const { role, can } = useAuth();
    const canDelete = can('prestamo.delete');
    const [asesorKey, setAsesorKey] = useState(Date.now());

    const onClearFilters = () => {
        handleFilterClear();
        setAsesorKey(Date.now());
    };
    const filterConfig = useMemo(() => {
        const config = [];
        if (role !== 'cliente') {
            config.push({ 
                name: 'search', type: 'text', 
                label: 'Buscar: ID / Cod. Recaudo / Cliente / DNI / RUC / Grupo', 
                placeholder: 'Ej: Mendoza o Los Halcones...', 
                colSpan: 'col-span-12 md:col-span-5' 
            });
            config.push({
                name: 'asesor_id', type: 'custom',
                label: 'Filtrar por Asesor',
                colSpan: 'col-span-12 md:col-span-4',
                render: () => (
                    <EmpleadoSearchSelect
                        key={asesorKey}
                        rol="asesor"
                        onSelect={(a) => handleFilterChange('asesor_id', a ? a.id : '')}
                        clearOnSelect={false}
                    />
                ),
            });
        }
        config.push({ 
            name: 'estado', type: 'select', label: 'Estado Préstamo', 
            colSpan: role !== 'cliente' ? 'col-span-12 md:col-span-3' : 'col-span-12',
            options: [
                { value: '1',   label: 'VIGENTES' },
                { value: '2',   label: 'CANCELADOS' },
                { value: '3',   label: 'LIQUIDADOS' },
                { value: '4',   label: 'REFINANCIADOS' },
                { value: 'all', label: 'TODOS' }
            ]
        });
        return config;
    }, [role, asesorKey, handleFilterChange]);

    const columns = useMemo(() => {
        const cols = [
            { 
                header: 'ID', 
                render: (row) => (
                    <span className="font-mono text-[12px] font-black px-2 py-1 rounded text-slate-600">
                        {row.id}
                    </span>
                )
            },
            { 
                header: 'Cod. Recaudo', 
                render: (row) => (
                    <span className="font-mono text-[12px] font-black px-2 py-1 rounded text-slate-600">
                        {row.codigo_recaudo}
                    </span>
                )
            },
            { header: 'Cliente / Producto', render: (row) => (
                <div className="flex flex-col uppercase">
                    <div className="flex items-center gap-1.5">
                        {row.es_grupal ? <UserGroupIcon className="w-3.5 h-3.5 text-brand-red" /> : <UserIcon className="w-3.5 h-3.5 text-slate-400" />}
                        <span className={`font-black text-[10px] ${row.es_grupal ? 'text-brand-red' : 'text-slate-800'}`}>
                            {row.cliente}
                        </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold mt-0.5 ml-5">{row.producto}</span>
                </div>
            )},
            { header: 'Asesor', render: (row) => (
                <div className="flex items-center gap-1.5 text-[11px] text-black w-fit">
                    <BriefcaseIcon className="w-3 h-3 text-black" />
                    {row.asesor}
                </div>
            )},
            { header: 'Financiero', render: (row) => (
                <div className="flex flex-col">
                    <span className="text-[8px] font-black text-brand-red italic text-sm">S/ {row.monto}</span>
                    <span className="text-[8px] text-slate-600 font-black uppercase tracking-tighter">{row.abonado_por}</span>
                </div>
            )},
            { header: 'Cuotas', render: (row) => (
                <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-700">{row.cuotas_detalle}</span>
                    <span className="text-[8px] text-slate-400 uppercase font-bold">{row.frecuencia}</span>
                </div>
            )},
            { header: 'Fecha Inicio', render: (row) => (
                <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
                    {row.fecha_inicio ?? '—'}
                </span>
            )},
            { header: 'Estado', render: (row) => {
                const colors = { 
                    1: 'bg-green-50 text-green-700 border-green-100', 
                    2: 'bg-slate-50 text-slate-600 border-slate-100', 
                    3: 'bg-brand-gold-light text-brand-gold-dark border-brand-gold/30',
                    4: 'bg-blue-50 text-blue-700 border-blue-100', 
                };
                const labels = { 1: 'VIGENTE', 2: 'CANCELADO', 3: 'LIQUIDADO', 4: 'REFINANCIADO' };
                return <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border ${colors[row.estado]}`}>{labels[row.estado]}</span>;
            }},
            { header: 'Acciones', render: (row) => {
                const canShow = can('prestamo.show');
                const hasActions = canShow || row.abono_url || (canDelete && !row.desembolsado && row.estado !== 2);
                if (!hasActions) return null;
                return (
                    <div className="flex gap-2 items-center justify-end">
                        {canShow && (
                            <button onClick={() => handleView(row.id)} title="Ver Cronograma"
                                className="p-2 text-slate-400 hover:text-brand-red hover:bg-brand-red-light rounded-xl transition-all border border-transparent hover:border-brand-red/20 shadow-sm">
                                <EyeIcon className="w-4 h-4" />
                            </button>
                        )}
                        {row.abono_url && (
                            <button onClick={() => handleOpenAbono(row.abono_url)} title="Ver Comprobante"
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl border border-transparent hover:border-emerald-100 transition-all shadow-sm">
                                <PhotoIcon className="w-4 h-4" />
                            </button>
                        )}
                        {canDelete && !row.desembolsado && row.estado !== 2 && (
                            <button onClick={() => openDeleteModal(row.id)} title="Cancelar Préstamo"
                                className="p-2 text-slate-400 hover:text-brand-red hover:bg-brand-red-light rounded-xl transition-all border border-transparent hover:border-brand-red/20 shadow-sm">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                );
            }}
        ];
        return cols;
    }, [handleView, handleOpenAbono, openDeleteModal, canDelete, can]);

    if (loading && prestamos.length === 0) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
            <PageHeader title="Cartera de Préstamos" icon={BanknotesIcon} />
            <AlertMessage type={alert?.type} message={alert?.message} details={alert?.details} onClose={() => setAlert(null)} />
            
            <Table 
                columns={columns} data={prestamos} loading={loading} 
                pagination={{ ...paginationInfo, onPageChange: fetchPrestamos }} 
                onFilterChange={handleFilterChange} onFilterSubmit={handleFilterSubmit}
                onFilterClear={onClearFilters}
                filters={filters} filterConfig={filterConfig}
            />


            <ViewPrestamoModal 
                isOpen={isViewOpen} 
                onClose={() => setIsViewOpen(false)} 
                data={viewData} 
                isLoading={viewLoading} 
                onRefresh={handleRefreshView}
            />

            <ViewModal isOpen={isAbonoModalOpen} onClose={() => setIsAbonoModalOpen(false)} title="Voucher de Abono Bancario">
                <div className="flex justify-center bg-slate-50 rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                    {selectedAbonoUrl ? (
                        <img src={selectedAbonoUrl} alt="Abono" className="max-w-full h-auto object-contain" style={{ maxHeight: '75vh' }} />
                    ) : (
                        <div className="py-20 text-center">
                            <ArrowPathIcon className="w-10 h-10 animate-spin text-brand-red mx-auto" />
                            <p className="mt-4 text-slate-400 font-black uppercase text-[10px] tracking-widest">Cargando imagen...</p>
                        </div>
                    )}
                </div>
            </ViewModal>

            {isDeleteModalOpen && (
                <ConfirmModal
                    title="¿Cancelar Préstamo?"
                    message="El préstamo será marcado como cancelado. Esta acción no se puede deshacer."
                    confirmText={deleteLoading ? "Cancelando..." : "Sí, Cancelar Préstamo"}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setIsDeleteModalOpen(false)}
                />
            )}
        </div>
    );
};

export default Index;