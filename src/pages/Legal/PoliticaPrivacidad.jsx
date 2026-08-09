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

const PoliticaPrivacidad = () => (
  <LegalLayout title="Política de Privacidad" updated={`${new Date().getFullYear()}`}>
    <p>
      <strong className="text-slate-800">TALARA CRÉDITOS E INVERSIONES S.A.</strong> ("la Empresa")
      protege los datos personales de sus clientes, prospectos e integrantes de créditos grupales
      conforme a la <strong>Ley N° 29733 — Ley de Protección de Datos Personales</strong> y su reglamento.
    </p>

    <Section n="1" title="Datos que recopilamos">
      <p>
        Nombre completo, DNI/RUC, dirección, celular, CIIU, información crediticia y de pago, y demás
        datos que usted proporciona al solicitar un crédito individual o grupal, así como datos de
        acceso al sistema (usuario, sesión).
      </p>
    </Section>

    <Section n="2" title="Finalidad del tratamiento">
      <p>
        Evaluar y gestionar solicitudes de crédito, administrar cronogramas de pago, calcular mora e
        intereses, generar contratos y comunicarnos con usted sobre el estado de su crédito. En
        créditos grupales, los datos son visibles entre los integrantes del mismo grupo, en su
        condición de avales solidarios.
      </p>
    </Section>

    <Section n="3" title="Conservación">
      <p>
        Sus datos se conservan mientras dure la relación crediticia y durante el plazo adicional que
        exija la normativa contable y tributaria aplicable.
      </p>
    </Section>

    <Section n="4" title="Sus derechos ARCO">
      <p>
        Usted puede solicitar el <strong>Acceso, Rectificación, Cancelación u Oposición</strong> al
        tratamiento de sus datos personales escribiendo a{' '}
        <a href="mailto:talaracreditos@gmail.com" className="text-red-600 font-bold hover:underline">
          talaracreditos@gmail.com
        </a>{' '}
        o llamando al <strong>908 886 179</strong>.
      </p>
    </Section>

    <Section n="5" title="Confidencialidad">
      <p>
        La Empresa no comparte sus datos con terceros ajenos a la relación crediticia, salvo
        requerimiento de autoridad competente o consentimiento expreso del titular.
      </p>
    </Section>
  </LegalLayout>
);

export default PoliticaPrivacidad;