import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import logo from 'assets/img/logo-negro.png';

const LegalLayout = ({ title, updated, children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors text-xs font-bold shrink-0"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Volver
          </button>
          <div className="h-6 w-px bg-slate-200" />
          <div className="h-8 w-8 shrink-0">
            <img src={logo} alt="Talara" className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-800 leading-tight">Talara</p>
            <p className="text-[9px] font-black text-red-500 tracking-[0.2em] uppercase leading-tight">
              Créditos e Inversiones
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-8 py-10 sm:py-14">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
          {title}
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-10">
          Última actualización: {updated}
        </p>

        <div className="prose-legal space-y-7 text-sm text-slate-600 leading-relaxed">
          {children}
        </div>
      </main>

      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400 font-medium tracking-wide">
          <span>© {new Date().getFullYear()} TALARA CRÉDITOS E INVERSIONES.</span>
          <div className="flex items-center gap-4">
            <span>TELÉFONO: 908 886 179</span>
            <span>CORREO: talaracreditos@gmail.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LegalLayout;