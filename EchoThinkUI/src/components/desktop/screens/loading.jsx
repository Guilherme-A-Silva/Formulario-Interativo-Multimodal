import React, { useEffect, useMemo, useState } from "react";
import { GetIMG } from "../../scripts/GetIMG";

const messages = [
  "Verificando sessão...",
  "Carregando ambiente seguro...",
  "Preparando seu experimento...",
  "Sincronizando com o servidor...",
  "Quase lá...",
];

export default function LoadingScreen({
  title = "EchoThink",
  subtitle = "Aguarde um instante…",
  showTips = true,
}) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex((p) => (p + 1) % messages.length);
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const tip = useMemo(() => messages[msgIndex], [msgIndex]);

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="
        fixed inset-0 z-[9999]
        w-screen h-[100dvh]
        bg-PrimaryFocus
        flex items-center justify-center
        px-4
      "
    >
      {/* blobs discretos no mesmo tom do app */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-28 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse delay-200" />
        <div className="absolute -bottom-28 left-1/3 w-80 h-80 rounded-full bg-white/10 blur-3xl animate-pulse delay-500" />
      </div>

      {/* container igual sua tela */}
      <div className="w-full max-w-7xl h-full flex items-center justify-center">
        <div className="max-w-4xl w-full">
          <div
            className="
              w-full bg-Secundary
              rounded-2xl shadow-lg
              p-6 sm:p-8
              flex flex-col items-center gap-6
              border border-white/10
              animate-[fadeIn_.35s_ease-out]
            "
          >
            {/* logo (igual finalização/instrução) */}
            <div className="flex flex-col items-center gap-3">
              <img
                src={GetIMG("Logo.png")}
                alt="logo"
                className="max-w-20 w-full object-contain drop-shadow"
              />
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {title}
                </h1>
                <p className="text-white/80 mt-1">{subtitle}</p>
              </div>
            </div>

            {/* animação principal */}
            <div className="relative w-40 h-40 flex items-center justify-center">
              {/* halo */}
              <div className="absolute inset-0 rounded-full bg-white/5 blur-2xl animate-pulse" />

              {/* anéis */}
              <div className="absolute inset-2 rounded-full border border-white/15 animate-spin [animation-duration:2.2s]" />
              <div className="absolute inset-6 rounded-full border border-white/15 animate-spin [animation-duration:1.5s]" />
              <div className="absolute inset-10 rounded-full border border-white/15 animate-spin [animation-duration:1.1s]" />

              {/* núcleo */}
              <div className="absolute inset-[54px] rounded-2xl bg-white/90 shadow-md animate-pulse" />

              {/* pontinho orbitando */}
              <div className="absolute inset-0 animate-spin [animation-duration:1.2s]">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white shadow" />
              </div>
            </div>

            {/* texto dinâmico */}
            <div className="w-full max-w-lg flex flex-col items-center gap-3">
              <div className="flex items-center gap-3 text-white font-semibold">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
                </span>
                <span className="text-base sm:text-lg">
                  {showTips ? tip : "Carregando..."}
                </span>
              </div>

              {/* barra */}
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-1/3 bg-white/70 animate-[loadingbar_1.6s_ease-in-out_infinite]" />
              </div>

              <p className="text-white/60 text-sm mt-1">Não feche esta aba.</p>
            </div>
          </div>
        </div>
      </div>

      {/* animações inline */}
      <style>
        {`
          @keyframes loadingbar {
            0% { transform: translateX(-120%); }
            50% { transform: translateX(260%); }
            100% { transform: translateX(-120%); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}
