import React, { useState } from 'react';

import logo from 'assets/img/logo.gif';

const LoadingScreen = () => {
  const [gifKey] = useState(() => Date.now());

  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition-all duration-300">

      <img
        key={gifKey}
        src={`${logo}?t=${gifKey}`}
        alt="Cargando"
        className="w-40 h-40 object-contain"
      />

      <p className="mt-6 text-gray-500 text-sm font-medium tracking-widest uppercase animate-pulse">
        Cargando ...
      </p>
    </div>
  );
};

export default LoadingScreen;