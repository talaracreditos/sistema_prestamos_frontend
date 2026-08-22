import React, { useState, useEffect, useCallback } from 'react';

/**
 * Carrusel de imágenes con transición fade automática.
 *
 * Props:
 * - images: array de strings (imports de imágenes) -> REQUERIDO
 * - interval: ms entre cada cambio (default 5000)
 * - showDots: mostrar indicadores clickeables (default true)
 */
const Carrusel = ({ images = [], interval = 5000}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(goToNext, interval);
    return () => clearInterval(timer);
  }, [goToNext, interval, images.length]);

  if (!images.length) return null;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          alt={`Fondo corporativo Talara ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  );
};

export default Carrusel;