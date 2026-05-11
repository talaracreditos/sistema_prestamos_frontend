import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    HomeIcon, ChartPieIcon, UsersIcon, BanknotesIcon, 
    CurrencyDollarIcon, BuildingLibraryIcon, UserGroupIcon, 
    WalletIcon, DocumentChartBarIcon, Bars3Icon,
    ArrowRightOnRectangleIcon, CubeIcon
} from '@heroicons/react/24/outline';
import ConfirmModal from 'components/Shared/Modals/ConfirmModal';
import { useAuth } from 'context/AuthContext';
import logo from 'assets/img/logo.png'; 
import { Calendar1Icon, ChevronDownIcon, ChevronLeftIcon, CreditCardIcon, Lock, MapIcon, SettingsIcon, ShoppingBagIcon, UserPlusIcon } from 'lucide-react';

// ── Reloj en tiempo real ──────────────────────────────────────────────────────
const LiveClock = ({ collapsed = false }) => {
    const [now, setNow] = useState(new Date());
    const timerRef = useRef(null);

    useEffect(() => {
        timerRef.current = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timerRef.current);
    }, []);

    const hora = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const fecha = now.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });

    if (collapsed) {
        // Modo colapsado: solo hora centrada, compacta
        return (
            <div className="flex flex-col items-center gap-0.5 mt-1">
                <span className="text-[10px] font-black text-brand-red tabular-nums tracking-tight leading-none">
                    {hora.slice(0, 5)}
                </span>
                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wide leading-none">
                    {now.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                </span>
            </div>
        );
    }

    // Modo expandido: hora grande + fecha debajo
    return (
        <div className="mt-1">
            <p className="text-[11px] font-black text-brand-red tabular-nums tracking-tight leading-none">
                {hora}
            </p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide leading-none mt-0.5">
                {fecha}
            </p>
        </div>
    );
};

export const MENU_GROUPS = [
    {
        groupName: 'Principal',
        items: [
            { section: 'Home', link: '/home', icon: HomeIcon }
        ]
    },
    {
        groupName: 'Métricas y Análisis',
        items: [
            { section: 'Dashboard', link: '/dashboard', icon: ChartPieIcon }
        ]
    },
    {
        groupName: 'Portal del Cliente',
        items: [
            {
                section: 'Pagos', icon: CreditCardIcon,
                subs: [
                    { name: 'Ver Pagos', link: '/pago/listar', requiredPermission: 'pago.index' },
                ],
            }
        ]
    },
    {
        groupName: 'Gestión de Cartera',
        items: [
            {
                section: 'Prospectos', icon: UserPlusIcon,
                subs: [
                    { name: 'Listar Prospectos', link: '/prospecto/listar', requiredPermission: 'prospecto.index' },
                    { name: 'Nuevo Prospecto',   link: '/prospecto/agregar', requiredPermission: 'prospecto.store' },
                ],
            },
            {
                section: 'Clientes', icon: UsersIcon,
                subs: [
                    { name: 'Listar Clientes',   link: '/cliente/listar',  requiredPermission: 'cliente.index' },
                    { name: 'Registrar Cliente', link: '/cliente/agregar', requiredPermission: 'cliente.store' },
                ],
            },
            {
                section: 'Grupos', icon: UserGroupIcon,
                subs: [
                    { name: 'Listar Grupos',   link: '/grupo/listar',  requiredPermission: 'grupo.index' },
                    { name: 'Registrar Grupo', link: '/grupo/agregar', requiredPermission: 'grupo.store' },
                ],
            },
            {
                section: 'Préstamos', icon: BanknotesIcon,
                subs: [
                    { name: 'Listar Préstamos', link: '/prestamo/listar',          requiredPermission: 'prestamo.index' },
                    { name: 'Nuevo Préstamo',   link: '/prestamo/agregar',         requiredPermission: 'prestamo.store' },
                    { name: 'Nueva Solicitud',  link: '/solicitudPrestamo/agregar', requiredPermission: 'solicitudPrestamo.store' },
                    { name: 'Solicitudes',      link: '/solicitudPrestamo/listar',  requiredPermission: 'solicitudPrestamo.index' },
                ],
            }
        ]
    },
    {
        groupName: 'Caja y Recaudación',
        items: [
            {
                section: 'Operaciones', icon: CurrencyDollarIcon,
                subs: [
                    { name: 'Caja Operativa',           link: '/operacion/caja',   requiredPermission: 'operacion.store' },
                    { name: 'Historial de Movimientos', link: '/operacion/listar', requiredPermission: 'operacion.index' },
                ],
            },
            {
                section: 'Cajas', icon: WalletIcon,
                subs: [
                    { name: 'Sesiones (Apertura/Cierre)', link: '/caja/sesiones', requiredPermission: 'cajaSesion.index' },
                    { name: 'Gestión de Cajas',           link: '/caja/listar',   requiredPermission: 'caja.index' },
                    { name: 'Nueva Caja',                 link: '/caja/agregar',  requiredPermission: 'caja.store' },
                ],
            }
        ]
    },
    {
        groupName: 'Reportes',
        items: [
            {
                section: 'Informes', icon: DocumentChartBarIcon,
                subs: [
                    { name: 'Clientes Morosos', link: '/reporte/morosos',    requiredPermission: 'reporte.morosidad' },
                    { name: 'Flujo de Caja',    link: '/reporte/flujo-caja', requiredPermission: 'reporte.flujo' },
                ],
            }
        ]
    },
    {
        groupName: 'Administración y Ajustes',
        items: [
            {
                section: 'Zonas Operativas', icon: MapIcon,
                subs: [
                    { name: 'Listar Zonas', link: '/zona/listar',  requiredPermission: 'zona.index' },
                    { name: 'Nueva Zona',   link: '/zona/agregar', requiredPermission: 'zona.store' },
                ],
            },
            {
                section: 'Entidades Bancarias', icon: BuildingLibraryIcon,
                subs: [
                    { name: 'Listar Bancos', link: '/entidadBancaria/listar',  requiredPermission: 'entidadBancaria.index' },
                    { name: 'Agregar Banco', link: '/entidadBancaria/agregar', requiredPermission: 'entidadBancaria.store' },
                ],
            },
            {
                section: 'Productos', icon: ShoppingBagIcon,
                subs: [
                    { name: 'Listar Productos', link: '/producto/listar',  requiredPermission: 'producto.index' },
                    { name: 'Nuevo Producto',   link: '/producto/agregar', requiredPermission: 'producto.store' },
                ],
            },
            {
                section: 'Empleados', icon: UserGroupIcon,
                subs: [
                    { name: 'Listar Personal',  link: '/empleado/listar',  requiredPermission: 'empleado.index' },
                    { name: 'Agregar Empleado', link: '/empleado/agregar', requiredPermission: 'empleado.store' },
                ],
            },
            { section: 'Feriados',         icon: Calendar1Icon, link: '/feriados/listar', requiredPermission: 'feriado.index'   },
            { section: 'Roles y Permisos', icon: Lock,          link: '/rol/listar',       requiredPermission: 'rol.index'       },
            { section: 'Parámetros',       icon: SettingsIcon,  link: '/parametro/listar', requiredPermission: 'parametro.index' },
        ]
    }
];

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
    const [isOpen,      setIsOpen]      = useState(false);
    const [openSection, setOpenSection] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const location = useLocation();
    const { can, logout } = useAuth();

    const handleLogout = () => { logout(); setShowConfirm(false); };

    const userMenuGroups = useMemo(() => {
        return MENU_GROUPS.map(group => {
            const filteredItems = group.items.map(item => {
                if (item.subs) {
                    const visibleSubs = item.subs.filter(sub => can(sub.requiredPermission));
                    return { ...item, subs: visibleSubs };
                }
                return item;
            }).filter(item => {
                if (item.subs) return item.subs.length > 0;
                if (!item.requiredPermission) return true;
                return can(item.requiredPermission);
            });
            return { ...group, items: filteredItems };
        }).filter(group => group.items.length > 0);
    }, [can]);

    const handleSectionClick = (section) => {
        if (isCollapsed && window.innerWidth >= 768) {
            setIsCollapsed(false);
            setOpenSection(section);
        } else {
            setOpenSection(prev => prev === section ? null : section);
        }
    };

    const isSectionActive = useCallback((item) => {
        if (item.subs) return item.subs.some(sub => location.pathname.startsWith(sub.link));
        if (item.link) return location.pathname === item.link;
        return false;
    }, [location.pathname]);

    useEffect(() => {
        if (openSection === null) {
            for (const group of userMenuGroups) {
                const activeItem = group.items.find(item => isSectionActive(item));
                if (activeItem && activeItem.subs) {
                    setOpenSection(activeItem.section);
                    break;
                }
            }
        }
    }, [location.pathname, userMenuGroups, isSectionActive, openSection]);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const sidebarWidth = isCollapsed ? 'md:w-20' : 'md:w-72';

    return (
        <>
            <style>{`
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* Botón hamburguesa móvil */}
            <button
                className={`md:hidden fixed top-4 left-4 z-50 p-2 bg-brand-red text-white rounded-md shadow-lg transition-all duration-300 ${
                    isOpen ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 visible'
                }`}
                onClick={() => setIsOpen(true)}
            >
                <Bars3Icon className="h-6 w-6" />
            </button>

            {/* Overlay móvil */}
            <div
                className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden
                    ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <div
                className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-100 shadow-sm z-40 transition-all duration-300 ease-in-out flex flex-col
                    ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full'}
                    ${sidebarWidth} md:translate-x-0`}
                style={{ height: '100dvh' }}
            >
                {/* Botón colapsar PC */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex absolute -right-3.5 top-8 bg-white border border-gray-200 rounded-full p-1.5 shadow-md z-50 hover:bg-brand-red-light text-gray-600 hover:text-brand-red transition-all"
                >
                    <ChevronLeftIcon className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                </button>

                {/* HEADER */}
                <div className={`flex items-center justify-center flex-shrink-0 border-b border-gray-100 transition-all duration-300 relative bg-white ${isCollapsed ? 'h-24 md:h-24' : 'h-24'}`}>

                    {/* Modo colapsado — logo + reloj centrados */}
                    <div className={`hidden md:flex flex-col items-center gap-0.5 absolute transition-all duration-300 ${
                        isCollapsed ? 'opacity-100 scale-100 delay-100' : 'opacity-0 scale-50 pointer-events-none'
                    }`}>
                        <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
                        <LiveClock collapsed />
                    </div>

                    {/* Modo expandido — logo + texto + reloj */}
                    <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 whitespace-nowrap
                        ${isCollapsed ? 'md:w-0 md:opacity-0' : 'w-auto opacity-100'}`}>
                        <img src={logo} alt="Logo" className="w-8 h-8 object-contain flex-shrink-0" />
                        <div className="leading-tight">
                            <p className="font-black text-sm text-brand-red uppercase tracking-tight">TALARA</p>
                            <p className="font-bold text-[10px] text-gray-400 uppercase tracking-widest">Créditos e Inversiones</p>
                            <LiveClock />
                        </div>
                    </div>
                </div>

                {/* BODY */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-4 hide-scrollbar px-3">
                    {userMenuGroups.map((group, gIndex) => (
                        <div key={gIndex} className="mb-2">
                            <div className={`px-4 mb-2 text-[9px] font-black text-gray-400 uppercase tracking-widest transition-all duration-300
                                ${isCollapsed ? 'md:opacity-0 md:h-0 md:mb-0 overflow-hidden' : 'opacity-100'}`}>
                                {group.groupName}
                            </div>

                            {isCollapsed && gIndex !== 0 && (
                                <div className="hidden md:block border-t border-gray-100 my-3 mx-4" />
                            )}

                            <div className="space-y-0.5">
                                {group.items.map((item, idx) => {
                                    const isActive      = isSectionActive(item);
                                    const isSubOpen     = item.subs && openSection === item.section;
                                    const IconComponent = item.icon || CubeIcon;

                                    const base     = "flex items-center flex-nowrap w-full px-3 py-2.5 rounded-xl transition-all duration-200 group relative";
                                    const active   = "bg-brand-red text-white shadow-md shadow-brand-red/20";
                                    const inactive = "text-gray-600 hover:bg-brand-red-light hover:text-brand-red";

                                    return (
                                        <div key={idx}>
                                            {item.subs ? (
                                                <>
                                                    <button
                                                        onClick={() => handleSectionClick(item.section)}
                                                        className={`${base} ${isActive && isCollapsed ? 'bg-brand-red-light text-brand-red' : (isActive ? active : inactive)}`}
                                                        title={isCollapsed ? item.section : ''}
                                                    >
                                                        <IconComponent className="h-5 w-5 flex-shrink-0 min-w-[20px]" />
                                                        <span className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300
                                                            ${isCollapsed ? 'md:w-0 md:opacity-0 md:ml-0' : 'md:w-auto md:opacity-100 ml-3'}`}>
                                                            {item.section}
                                                        </span>
                                                        <ChevronDownIcon className={`ml-auto h-3.5 w-3.5 transition-transform duration-300 flex-shrink-0
                                                            ${isSubOpen ? 'rotate-180' : ''}
                                                            ${isCollapsed ? 'md:hidden' : ''}`}
                                                        />
                                                    </button>

                                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out
                                                        ${isSubOpen ? 'max-h-96 opacity-100 mt-0.5' : 'max-h-0 opacity-0'}
                                                        ${isCollapsed ? 'md:hidden' : ''}`}>
                                                        <ul className="ml-4 pl-3 border-l-2 border-brand-red/20 space-y-0.5 py-1">
                                                            {item.subs.map((sub, sIdx) => (
                                                                <li key={sIdx}>
                                                                    <Link
                                                                        to={sub.link}
                                                                        onClick={() => setIsOpen(false)}
                                                                        className={`block py-2 px-3 rounded-lg text-[12px] font-medium transition-all truncate
                                                                            ${location.pathname.startsWith(sub.link)
                                                                                ? 'text-brand-red bg-brand-red-light font-black'
                                                                                : 'text-gray-500 hover:text-brand-red hover:bg-brand-red-light'}`}
                                                                    >
                                                                        {sub.name}
                                                                    </Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </>
                                            ) : (
                                                <Link
                                                    to={item.link}
                                                    onClick={() => setIsOpen(false)}
                                                    className={`${base} ${isActive ? active : inactive}`}
                                                    title={isCollapsed ? item.section : ''}
                                                >
                                                    <IconComponent className="h-5 w-5 flex-shrink-0 min-w-[20px]" />
                                                    <span className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300
                                                        ${isCollapsed ? 'md:w-0 md:opacity-0 md:ml-0' : 'md:w-auto md:opacity-100 ml-3'}`}>
                                                        {item.section}
                                                    </span>
                                                </Link>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* FOOTER */}
                <div className="p-4 border-t border-gray-100 flex-shrink-0 bg-white">
                    <button
                        onClick={() => setShowConfirm(true)}
                        className={`flex items-center w-full px-3 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-brand-red transition-all duration-200 ${isCollapsed ? 'md:justify-center' : ''}`}
                        title="Cerrar Sesión"
                    >
                        <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0 min-w-[20px]" />
                        <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 font-medium text-sm
                            ${isCollapsed ? 'md:w-0 md:opacity-0 md:ml-0' : 'md:w-auto md:opacity-100 ml-3'}`}>
                            Salir
                        </span>
                    </button>
                </div>
            </div>

            {showConfirm && (
                <ConfirmModal
                    message="¿Deseas cerrar sesión del sistema?"
                    onConfirm={handleLogout}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
        </>
    );
};

export default Sidebar;