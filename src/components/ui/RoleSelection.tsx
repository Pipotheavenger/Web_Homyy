'use client';

import { Home, Wrench, ArrowRight } from 'lucide-react';

interface RoleSelectionProps {
  onSelectRole: (role: 'user' | 'worker') => void;
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  return (
    <section className="w-full max-w-[1080px] mx-auto flex flex-col gap-8 px-4 sm:px-5">
      <header className="text-center">
        <p className="text-base sm:text-lg font-semibold text-gray-900 leading-tight tracking-tight m-0">
          ¿Qué te trae por aquí?
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        {/* Cliente */}
        <article
          className="group relative flex flex-col gap-5 lg:gap-6 bg-white border border-gray-100 rounded-[20px] p-5 lg:p-7 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(17,24,39,0.08)] hover:border-transparent motion-reduce:transform-none motion-reduce:transition-none"
        >
          <div className="flex items-start gap-3 md:gap-4">
            <div
              aria-hidden="true"
              className="flex-shrink-0 w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-[#F4EFFA] text-[#4F47B6] grid place-items-center"
            >
              <Home className="w-7 h-7 lg:w-8 lg:h-8" strokeWidth={2} />
            </div>
            <p className="font-bold italic text-gray-900 text-xl lg:text-2xl leading-snug tracking-tight text-balance m-0">
              “Se me dañó la tubería y necesito que alguien venga este viernes”
            </p>
          </div>

          <p className="text-base lg:text-lg leading-relaxed text-gray-500 text-pretty m-0">
            Encuentra en minutos un profesional verificado cerca de ti. Agenda, paga y listo.
          </p>

          <button
            type="button"
            onClick={() => onSelectRole('user')}
            className="group/btn mt-auto inline-flex items-center justify-center gap-2 w-full px-5 py-4 lg:py-[18px] rounded-xl bg-[#4F47B6] text-white font-bold text-base lg:text-lg tracking-tight cursor-pointer transition-all duration-200 ease-out hover:bg-[#3A339A] hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(17,24,39,0.12)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#8B54CF]/35 motion-reduce:transform-none motion-reduce:transition-none"
          >
            Busco un profesional
            <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-200 ease-out group-hover/btn:translate-x-1 motion-reduce:transform-none" />
          </button>
        </article>

        {/* Trabajador */}
        <article
          className="group relative flex flex-col gap-5 lg:gap-6 bg-white border border-gray-100 rounded-[20px] p-5 lg:p-7 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(17,24,39,0.08)] hover:border-transparent motion-reduce:transform-none motion-reduce:transition-none"
        >
          <div className="flex items-start gap-3 md:gap-4">
            <div
              aria-hidden="true"
              className="flex-shrink-0 w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-[#ECFDF5] text-[#059669] grid place-items-center"
            >
              <Wrench className="w-7 h-7 lg:w-8 lg:h-8" strokeWidth={2} />
            </div>
            <p className="font-bold italic text-gray-900 text-xl lg:text-2xl leading-snug tracking-tight text-balance m-0">
              “Tengo el oficio y quiero llenar mi agenda de trabajos”
            </p>
          </div>

          <p className="text-base lg:text-lg leading-relaxed text-gray-500 text-pretty m-0">
            Conecta con hogares cerca de ti. Tú pones el horario, Hommy te consigue clientes.
          </p>

          <button
            type="button"
            onClick={() => onSelectRole('worker')}
            className="group/btn mt-auto inline-flex items-center justify-center gap-2 w-full px-5 py-4 lg:py-[18px] rounded-xl bg-[#059669] text-white font-bold text-base lg:text-lg tracking-tight cursor-pointer transition-all duration-200 ease-out hover:bg-[#047857] hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(17,24,39,0.12)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#10B981]/35 motion-reduce:transform-none motion-reduce:transition-none"
          >
            Ofrezco mis servicios
            <ArrowRight className="w-5 h-5 lg:w-6 lg:h-6 transition-transform duration-200 ease-out group-hover/btn:translate-x-1 motion-reduce:transform-none" />
          </button>
        </article>
      </div>
    </section>
  );
}
