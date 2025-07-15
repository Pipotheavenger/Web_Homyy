// bg-wave.tsx
// Fondo inspirado en la imagen con formas redondeadas que salen desde las esquinas
// Completamente responsive (desktop, tablet, móvil)

export default function BgWave() {
  return (
    <svg
      viewBox="0 0 1440 900"
      className="absolute inset-0 -z-10 w-full h-full pointer-events-none select-none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      {/* Gradiente violeta de fondo */}
      <defs>
        <linearGradient id="purpleGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#743fc6" />
          <stop offset="50%" stopColor="#8a5fd1" />
          <stop offset="100%" stopColor="#a17ad8" />
        </linearGradient>
      </defs>
      
      {/* Fondo violeta base */}
      <rect width="1440" height="900" fill="url(#purpleGrad)" />
      
      {/* Forma redondeada principal desde la esquina superior-izquierda */}
      <path
        d="
          M 0 0
          L 0 600
          Q 0 700 100 750
          Q 300 850 600 800
          Q 900 750 1200 600
          Q 1440 500 1440 200
          Q 1440 100 1350 50
          Q 1200 0 1000 0
          L 0 0
          Z
        "
        fill="#F3F0EC"
      />
    </svg>
  );
}