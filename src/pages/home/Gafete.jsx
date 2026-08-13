import React from 'react';
import { X, Download } from 'lucide-react';
import { toUpper } from 'utilities/Validations/validations';
import logo from 'assets/img/logoblanco.png';
import html2canvas from 'html2canvas';

const Gafete = ({ isOpen, onClose, user, userData }) => {
  if (!isOpen || !user?.qr_gafete) return null;

  const nombre =
    toUpper(userData?.name) ||
    toUpper(user?.username) ||
    'USUARIO';

  const rol =
    toUpper(user?.rol || userData?.role || 'USUARIO');

  const handleDownload = async () => {
    const elemento = document.getElementById('tarjeta-gafete');

    if (!elemento) {
      console.error('No se encontró el gafete');
      return;
    }

    try {
      const canvas = await html2canvas(elemento, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 0,
        removeContainer: true,

        onclone: (doc) => {
          const tarjeta = doc.getElementById('tarjeta-gafete');

          if (tarjeta) {
            tarjeta.style.width = '380px';
            tarjeta.style.maxWidth = '380px';
            tarjeta.style.minWidth = '380px';
            tarjeta.style.transform = 'none';
            tarjeta.style.margin = '0';
            tarjeta.style.position = 'relative';
            tarjeta.style.left = '0';
            tarjeta.style.top = '0';
          }
        },
      });

      const image = canvas.toDataURL('image/png');

      const enlace = document.createElement('a');

      enlace.href = image;
      enlace.download = `Gafete_${nombre
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_-]/g, '')}.png`;

      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);

    } catch (error) {
      console.error('Error al descargar el gafete:', error);
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        flex items-center justify-center
        bg-slate-950/70
        backdrop-blur-md
        p-4
      "
    >

      {/* GAFETE */}
      <div
        id="tarjeta-gafete"
        className="relative overflow-hidden bg-white rounded-[24px] shadow-2xl flex flex-col"
        style={{ width: '380px', maxWidth: '100%' }}
      >

        {/* FRANJA SUPERIOR */}
        <div
          className="relative overflow-hidden bg-gradient-to-br from-red-950 via-red-900 to-red-800"
          style={{ height: '150px', padding: '24px' }}
        >
          <div className="absolute -right-16 -top-16 rounded-full bg-red-500/20" style={{ width: '190px', height: '190px' }} />
          <div className="absolute -left-12 -bottom-20 rounded-full bg-white/5" style={{ width: '160px', height: '160px' }} />
          <div className="absolute top-0 left-0 w-full bg-yellow-400" style={{ height: '5px' }} />

          <div className="relative z-10 flex items-center justify-center">
            <img
              src={logo}
              alt="Talara Créditos"
              crossOrigin="anonymous"
              style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
            />
          </div>

          <div className="relative z-10 text-center mt-4">
            <p className="text-white font-black uppercase tracking-[0.25em]" style={{ fontSize: '11px', margin: 0 }}>
              CREDENCIAL DE ASISTENCIA
            </p>
            <p className="text-red-200 uppercase tracking-widest" style={{ fontSize: '8px', marginTop: '4px', marginBottom: 0 }}>
              TALARA CRÉDITOS E INVERSIONES
            </p>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="relative flex flex-col items-center" style={{ padding: '26px 28px 24px' }}>

          <div className="absolute left-0 top-0 bottom-0 bg-red-900" style={{ width: '4px' }} />

          {/* QR */}
          <div
            className="relative bg-white rounded-2xl border border-slate-200 shadow-lg flex items-center justify-center"
            style={{ width: '218px', height: '218px', padding: '10px' }}
          >
            <div className="absolute top-0 left-0 border-t-4 border-l-4 border-red-800 rounded-tl-xl" style={{ width: '30px', height: '30px' }} />
            <div className="absolute bottom-0 right-0 border-b-4 border-r-4 border-red-800 rounded-br-xl" style={{ width: '30px', height: '30px' }} />
            <img
              src={user.qr_gafete}
              alt="Código QR de asistencia"
              crossOrigin="anonymous"
              style={{ width: '192px', height: '192px', objectFit: 'contain', display: 'block' }}
            />
          </div>

          {/* SEPARADOR */}
          <div className="flex items-center w-full" style={{ marginTop: '18px', marginBottom: '10px' }}>
            <div className="bg-slate-200" style={{ height: '1px', flex: 1 }} />
            <div className="bg-red-900 rounded-full" style={{ width: '7px', height: '7px', margin: '0 10px' }} />
            <div className="bg-slate-200" style={{ height: '1px', flex: 1 }} />
          </div>

          {/* ROL — solo texto, sin ícono ni fondo */}
          <p
            className="text-red-800 font-black uppercase text-center"
            style={{
              fontSize: '11px',
              letterSpacing: '0.15em',
              margin: 0,
            }}
          >
            {rol}
          </p>

          {/* NOMBRE */}
          <div
            className="w-full flex items-center justify-center text-center"
            style={{ marginTop: '8px' }}
          >
            <h2
              className="text-slate-900 font-black uppercase text-center"
              style={{
                width: '100%',
                fontSize: nombre.length > 22 ? '17px' : '21px',
                lineHeight: '1.3',
                margin: 0,
                padding: 0,
                wordBreak: 'break-word',
              }}
            >
              {nombre}
            </h2>
          </div>

          {/* INFORMACIÓN */}
          <div className="w-full bg-slate-50 rounded-xl text-center" style={{ marginTop: '20px', padding: '12px 16px' }}>
            <p className="text-slate-500 font-medium" style={{ fontSize: '9px', lineHeight: '1.5', margin: 0 }}>
              Presenta esta credencial en recepción para
              registrar tu ingreso y salida.
            </p>
          </div>

        </div>

        {/* PIE */}
        <div className="bg-slate-900 flex items-center justify-center" style={{ height: '34px' }}>
          <span className="text-white/70 uppercase tracking-[0.25em] font-bold" style={{ fontSize: '7px' }}>
            CREDENCIAL PERSONAL · TALARA CRÉDITOS
          </span>
        </div>

        {/* CERRAR */}
        <button
          data-html2canvas-ignore="true"
          onClick={onClose}
          type="button"
          className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white flex items-center justify-center transition-all"
        >
          <X size={17} strokeWidth={2.5} />
        </button>

      </div>

      {/* BOTÓN DESCARGAR */}
      <div data-html2canvas-ignore="true" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60]">
        <button
          onClick={handleDownload}
          type="button"
          className="flex items-center justify-center gap-2 bg-red-900 hover:bg-red-950 text-white rounded-xl shadow-xl transition-all active:scale-95 font-bold uppercase tracking-widest"
          style={{ padding: '13px 22px', fontSize: '10px' }}
        >
          <Download size={16} />
          Descargar Gafete
        </button>
      </div>

    </div>
  );
};

export default Gafete;