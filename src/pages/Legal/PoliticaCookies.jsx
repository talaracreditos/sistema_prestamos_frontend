import React from 'react';
import LegalLayout from './LegalLayout';

const Section = ({ n, title, children }) => (
  <section>
    <h2 className="flex items-center gap-2 text-sm font-black text-red-600 uppercase tracking-wide mb-2">
      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-red-50 text-red-600 text-[10px] shrink-0">
        {n}
      </span>
      {title}
    </h2>
    <div className="pl-7">{children}</div>
  </section>
);

const filas = [
  { nombre: 'access_token', duracion: 'Sesión', proposito: 'Mantener tu sesión iniciada mientras usas el sistema.' },
  { nombre: 'refresh_token', duracion: '30 días si activas "Recordar sesión"', proposito: 'Renovar tu sesión sin que tengas que volver a iniciar sesión.' },
];

const PoliticaCookies = () => (
  <LegalLayout title="Política de Cookies" updated={`${new Date().getFullYear()}`}>
    <p>
      Esta política explica qué cookies utiliza el sistema de{' '}
      <strong className="text-slate-800">Talara Créditos e Inversiones</strong> y para qué las usamos.
      No usamos cookies de publicidad ni las compartimos con terceros.
    </p>

    <Section n="1" title="¿Qué es una cookie?">
      <p>
        Es un pequeño archivo que el sistema guarda en tu navegador para recordar información entre
        una página y otra, como mantener tu sesión activa mientras usas la plataforma.
      </p>
    </Section>

    <Section n="2" title="Cookies que utilizamos">
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs border-collapse mt-2">
          <thead>
            <tr className="text-left">
              <th className="font-black text-slate-400 uppercase text-[10px] pb-2 pr-3 border-b border-slate-200">Cookie</th>
              <th className="font-black text-slate-400 uppercase text-[10px] pb-2 pr-3 border-b border-slate-200">Duración</th>
              <th className="font-black text-slate-400 uppercase text-[10px] pb-2 border-b border-slate-200">Propósito</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((f) => (
              <tr key={f.nombre} className="align-top">
                <td className="py-2.5 pr-3 border-b border-slate-100 font-mono font-bold text-slate-700 whitespace-nowrap">{f.nombre}</td>
                <td className="py-2.5 pr-3 border-b border-slate-100 whitespace-nowrap">{f.duracion}</td>
                <td className="py-2.5 border-b border-slate-100">{f.proposito}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>

    <Section n="3" title="Cookies estrictamente necesarias">
      <p>
        Todas las cookies que usamos son <strong>necesarias para el funcionamiento del sistema</strong> —
        no usamos cookies de analítica ni de terceros. Por esta razón no requieren un banner de
        consentimiento adicional, ya que sin ellas no podrías iniciar sesión ni usar la plataforma.
      </p>
    </Section>

    <Section n="4" title="Cómo administrarlas">
      <p>
        Puedes eliminar o bloquear estas cookies desde la configuración de tu navegador, pero ten en
        cuenta que si las bloqueas no podrás mantener tu sesión iniciada ni usar funciones como
        "Recordar sesión".
      </p>
    </Section>
  </LegalLayout>
);

export default PoliticaCookies;