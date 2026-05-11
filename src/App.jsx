import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

// Componentes Globales
import SidebarLayout from 'layouts/SidebarLayout';
import { ToastContainer } from 'components/Shared/Notificaciones/ToastNotification';

// UIS AUTH & ERRORS
import ErrorPage404 from 'components/ErrorPage404';
import ErrorPage401 from 'components/ErrorPage401';
import Login from 'pages/auth/Login/Login';

// UI HOME
import Home from 'pages/home/Home';

//UI DASHBOARD
import Dashboard from 'pages/Dashboard/Dashboard';

//UI EMPLEADOS
import AgregarEmpleado from 'pages/Empleado/Store';
import EditarEmpleado from 'pages/Empleado/Update';
import ListarEmpleados from 'pages/Empleado/Index';

//UI CLIENTES
import AgregarCliente from 'pages/Cliente/Store';
import EditarCliente from 'pages/Cliente/Update';
import ListarClientes from 'pages/Cliente/Index';

// UI ENTIDADES BANCARIAS
import AgregarEntidadBancaria from 'pages/EntidadBancaria/Store';
import EditarEntidadBancaria from 'pages/EntidadBancaria/Update';
import ListarEntidadBancarias from 'pages/EntidadBancaria/Index';

// UI PRODUCTO
import AgregarProducto from 'pages/Producto/Store';
import EditarProducto from 'pages/Producto/Update';
import ListarProducto from 'pages/Producto/Index';

// UI SOLICITUD PRESTAMO
import AgregarSolicitud from 'pages/SolicitudPrestamo/Store';
import EditarSolicitud from 'pages/SolicitudPrestamo/Update';
import ListarSolicitudes from 'pages/SolicitudPrestamo/Index';

// UI PRESTAMO
import ListarPrestamos from 'pages/Prestamo/Index';

// UI CAJAS
import ListarCajas from 'pages/Caja/Index';
import AgregarCaja from 'pages/Caja/Store';
import EditarCaja from 'pages/Caja/Update';

// UI SESIONES DE CAJA (TURNOS)
import ListarSesiones from 'pages/CajaSesion/Index';

// UI OPERACIONES
import RegistrarOperacion from 'pages/Operacion/Store';
import ListarOperaciones from 'pages/Operacion/Index';

// UI PAGOS
import ListarPagos from 'pages/Pago/Index';

// UI GRUPOS
import ListarGrupos from 'pages/Grupo/Index';
import AgregarGrupo from 'pages/Grupo/Store';
import EditarGrupo from 'pages/Grupo/Update';

// UI ZONAS
import AgregarZona from 'pages/Zona/Store';
import EditarZona from 'pages/Zona/Update';
import ListarZonas from 'pages/Zona/Index';

// UI PROSPECTOS
import ListarProspectos from 'pages/Prospecto/Index';
import AgregarProspecto from 'pages/Prospecto/Store';
import EditarProspecto  from 'pages/Prospecto/Update';

// UI FERIADOS
import ListarFeriados from 'pages/Feriado/Index';
import AgregarFeriado from 'pages/Feriado/Store';
import EditarFeriado from 'pages/Feriado/Update';

// ROL AND PERMISSIONS
import ListarRoles from 'pages/Rol/Index';

// UI HORARIOS SISTEMA
import ListarHorarios from 'pages/HorarioSistema/Index';
import AgregarHorario from 'pages/HorarioSistema/Store';
import EditarHorario  from 'pages/HorarioSistema/Update';

// SETTINGS
import ListarParametros from 'pages/Parametro/Index';
import EditarParametro from 'pages/Parametro/Update';

// Utilities
import ProtectedRouteHome from 'utilities/ProtectedRoutes/ProtectedRouteHome';
import ProtectedRoute from 'utilities/ProtectedRoutes/ProtectedRoute';
import SecureRoute from 'utilities/ProtectedRoutes/SecureRoute';

// CONTEXT
import { SecureModuleProvider } from 'context/SecureModuleContext';
import { AuthProvider } from 'context/AuthContext';
import { NotificacionProvider } from 'components/Shared/Notificaciones/NotificacionContext';

function AppContent() {
  return (
    <Routes>
      {/* 1. LOGIN */}
      <Route path="/" element={<ProtectedRouteHome element={<Login />} />} />

      {/* 2. LAYOUT GLOBAL */}
      <Route element={<ProtectedRoute element={<SidebarLayout />} />}>

        {/* HOME */}
        <Route path="/home" element={<ProtectedRoute element={<Home />} />} />

        {/* DASHBOARD */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        
        {/* CLIENTES */}
        <Route path="/cliente/agregar" element={<ProtectedRoute requiredPermission="cliente.store" element={<AgregarCliente />} />} />
        <Route path="/cliente/editar/:id" element={<ProtectedRoute requiredPermission="cliente.update" element={<EditarCliente />} />} />
        <Route path="/cliente/listar" element={<ProtectedRoute requiredPermission="cliente.index" element={<ListarClientes />} />} />

        {/* EMPLEADOS */}
        <Route path="/empleado/agregar" element={<ProtectedRoute requiredPermission="empleado.store" element={<AgregarEmpleado />} />} />
        <Route path="/empleado/editar/:id" element={<ProtectedRoute requiredPermission="empleado.update" element={<EditarEmpleado />} />} />
        <Route path="/empleado/listar" element={<ProtectedRoute requiredPermission="empleado.index" element={<ListarEmpleados />} />} />


        {/* ENTIDADES BANCARIAS */}
        <Route path="/entidadBancaria/agregar" element={<ProtectedRoute requiredPermission="entidadBancaria.store" element={<AgregarEntidadBancaria />} />} />
        <Route path="/entidadBancaria/editar/:id" element={<ProtectedRoute requiredPermission="entidadBancaria.update" element={<EditarEntidadBancaria />} />} />
        <Route path="/entidadBancaria/listar" element={<ProtectedRoute requiredPermission="entidadBancaria.index" element={<ListarEntidadBancarias />} />} />

        {/* PRODUCTO */}
        <Route path="/producto/agregar" element={<ProtectedRoute requiredPermission="producto.store" element={<AgregarProducto />} />} />
        <Route path="/producto/editar/:id" element={<ProtectedRoute requiredPermission="producto.update" element={<EditarProducto />} />} />
        <Route path="/producto/listar" element={<ProtectedRoute requiredPermission="producto.index" element={<ListarProducto />} />} />

        {/* SOLICITUD PRESTAMO */}
        <Route path="/solicitudPrestamo/agregar" element={<ProtectedRoute requiredPermission="solicitudPrestamo.store" element={<AgregarSolicitud />} />} />
        <Route path="/solicitudPrestamo/editar/:id" element={<ProtectedRoute requiredPermission="solicitudPrestamo.update" element={<EditarSolicitud />} />} />
        <Route path="/solicitudPrestamo/listar" element={<ProtectedRoute requiredPermission="solicitudPrestamo.index" element={<ListarSolicitudes />} />} />

        {/* PRESTAMO */}
        <Route path="/prestamo/listar" element={<ProtectedRoute requiredPermission="prestamo.index" element={<ListarPrestamos />} />} />

        {/* CAJAS  */}
        <Route path="/caja/listar" element={<ProtectedRoute requiredPermission="caja.index" element={<ListarCajas />} />} />
        <Route path="/caja/agregar" element={<ProtectedRoute requiredPermission="caja.store" element={<AgregarCaja />} />} />
        <Route path="/caja/editar/:id" element={<ProtectedRoute requiredPermission="caja.update" element={<EditarCaja />} />} />

        {/* CAJAS SESIONES (TURNOS) */}
        <Route path="/caja/sesiones" element={<ProtectedRoute requiredPermission="cajaSesion.index" element={<ListarSesiones />} />} />

        {/* OPERACIONES */}
        <Route path="/operacion/caja" element={<ProtectedRoute requiredPermission="operacion.store" element={<RegistrarOperacion />} />} />
        <Route path="/operacion/listar" element={<ProtectedRoute requiredPermission="operacion.index" element={<ListarOperaciones />} />} />

        {/* PAGOS */}
        <Route path="/pago/listar" element={<ProtectedRoute requiredPermission="pago.index" element={<ListarPagos />} />} />

        {/* GRUPOS */}
        <Route path="/grupo/listar" element={<ProtectedRoute requiredPermission="grupo.index" element={<ListarGrupos />} />} />
        <Route path="/grupo/agregar" element={<ProtectedRoute requiredPermission="grupo.store" element={<AgregarGrupo />} />} />
        <Route path="/grupo/editar/:id" element={<ProtectedRoute requiredPermission="grupo.update" element={<EditarGrupo />} />} />

        {/* ZONAS OPERATIVAS */}
        <Route path="/zona/listar" element={<ProtectedRoute requiredPermission="zona.index" element={<ListarZonas />} />} />
        <Route path="/zona/agregar" element={<ProtectedRoute requiredPermission="zona.store" element={<AgregarZona />} />} />
        <Route path="/zona/editar/:id" element={<ProtectedRoute requiredPermission="zona.update" element={<EditarZona />} />} />

        {/* PROSPECTOS */}
        <Route path="/prospecto/listar"       element={<ProtectedRoute requiredPermission="prospecto.index"  element={<ListarProspectos />} />} />
        <Route path="/prospecto/agregar"      element={<ProtectedRoute requiredPermission="prospecto.store"  element={<AgregarProspecto />} />} />
        <Route path="/prospecto/editar/:id"   element={<ProtectedRoute requiredPermission="prospecto.update" element={<EditarProspecto  />} />} />

        {/* FERIADOS */}
        <Route path="/feriados/listar" element={<ProtectedRoute requiredPermission="feriado.index" element={<SecureRoute element={<ListarFeriados />} />} />} />
        <Route path="/feriados/agregar" element={<ProtectedRoute requiredPermission="feriado.store" element={<SecureRoute element={<AgregarFeriado />} />} />} />
        <Route path="/feriados/editar/:id" element={<ProtectedRoute requiredPermission="feriado.update" element={<SecureRoute element={<EditarFeriado />} />} />} />

        {/* ROLES Y PERMISOS */}
        <Route path="/rol/listar" element={<ProtectedRoute requiredPermission="rol.index"  element={<SecureRoute element={<ListarRoles />} />} />} />   

        <Route path="/horario-sistema/listar"     element={<ProtectedRoute requiredPermission="horarioSistema.index"  element={<SecureRoute element={<ListarHorarios />} />} />} />
        <Route path="/horario-sistema/agregar"    element={<ProtectedRoute requiredPermission="horarioSistema.store"   element={<SecureRoute element={<AgregarHorario />} />} />} />
        <Route path="/horario-sistema/editar/:id" element={<ProtectedRoute requiredPermission="horarioSistema.update"  element={<SecureRoute element={<EditarHorario />} />} />} />

        {/* SETTINGS */}
        <Route path="/parametro/listar" element={<ProtectedRoute requiredPermission="parametro.index" element={<SecureRoute element={<ListarParametros />} />} />} />   
        <Route path="/parametro/editar/:id" element={<ProtectedRoute requiredPermission="parametro.update" element={<SecureRoute element={<EditarParametro />} />} />} />   


      </Route>

      {/* 3. ERRORES */}
      <Route path="/401" element={<ErrorPage401 />} />
      <Route path="*" element={<ErrorPage404 />} />
    </Routes>
  );
}

function App() {
  return (   
    <AuthProvider>
     <NotificacionProvider>
        <SecureModuleProvider>
          <Router>
            <div className="min-h-screen bg-white text-primary">
              <AppContent />
              <ToastContainer />
            </div>
          </Router>
        </SecureModuleProvider>
      </NotificacionProvider>
    </AuthProvider>
  );
}

export default App;