import React, { useEffect } from 'react';
import { DocumentMagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { HiOutlineArrowLongLeft } from 'react-icons/hi2';

const NotFoundPage = () => {
  useEffect(() => {
    const elementsToAnimate = document.querySelectorAll('.animate-in');
    elementsToAnimate.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('animate-show');
      }, 150 * index);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-900 font-sans p-4 relative">
    
        {/* Icono animado de Búsqueda de Archivos */}
        <div className="animate-in opacity-0 translate-y-4 transition-all duration-700 ease-out mb-10">
          <div className="inline-flex items-center justify-center w-36 h-36 border-2 border-slate-100 rounded-full mb-4 animate-float relative shadow-sm bg-slate-50">
            <div className="absolute inset-3 border border-dashed border-slate-300 rounded-full opacity-50"></div>
            <DocumentMagnifyingGlassIcon className="w-16 h-16 text-slate-400" />
          </div>
        </div>
        
        <h1 className="animate-in opacity-0 translate-y-4 transition-all duration-700 ease-out text-8xl font-black tracking-tighter text-slate-900 mb-2">
          404
        </h1>
        
        <h2 className="animate-in opacity-0 translate-y-4 transition-all duration-700 ease-out text-xs font-black uppercase tracking-[0.4em] text-slate-400 mb-8">
          Recurso No Localizado
        </h2>
        
        <p className="animate-in opacity-0 translate-y-4 transition-all duration-700 ease-out mb-12 max-w-sm text-center leading-relaxed font-medium text-slate-500">
           "La página, préstamo o expediente que intenta consultar no existe en nuestra base de datos activa. Verifique la URL e intente nuevamente."
        </p>
        
        <div className="animate-in opacity-0 translate-y-4 transition-all duration-700 ease-out">
          <a
            href="/home"
            className="group inline-flex items-center gap-3 px-10 py-4 bg-white text-slate-900 border-2 border-slate-900 rounded-xl font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all duration-300"
          >
            <HiOutlineArrowLongLeft className="text-xl group-hover:-translate-x-2 transition-transform duration-300" />
            Volver al Inicio
          </a>
        </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-in {
          opacity: 0;
          transform: translateY(20px);
        }
        .animate-show {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;