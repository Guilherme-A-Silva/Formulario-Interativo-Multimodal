import React, { useEffect, useState, useRef } from "react";
import { getCSRFToken } from "../../CSRF/csrf";
import { GetIMG } from "../../scripts/GetIMG";
import "../styles/global.css";
import "../styles/loginDefault.css";

const LoginDefault = () => {
  const [Error, setError] = useState(true);
  const [Icon, setIcon] = useState("");
  const [Logo, setLogo] = useState("");
  const [Instrucao, setInstrucao] = useState(true);
  const [Perguntas, setPerguntas] = useState(false);
  const [Finalizacao, setFinalizacao] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [respostaSelecionada, setRespostaSelecionada] = useState(null);
  const [respostas, setRespostas] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [IndicePergunta, setIndicePergunta] = useState(0);
  const [ListaPerguntas, setListaPerguntas] = useState([]);
  const [isValid, setIsValid] = useState(null);
  const [indiceTela, setIndiceTela] = useState(0);

  const [audioConcluido, setAudioConcluido] = useState(true); // true por padrão (perguntas sem áudio)
  const audioRef = useRef(null);
  const audioTimeoutRef = useRef(null);

  const BACKEND_URL = "https://cidivan-production.up.railway.app";

  // telas (corrigi class -> className)
  const telas = [
    {
      titulo: "Bem-vindo(a) ao nosso estudo!",
      texto: (
        <>
          <p className="font-bold text-2xl mt-2">
            Agradecemos imensamente o seu tempo e a sua disposição em participar
            da pesquisa sobre a “Influência da prosódia no processamento de
            orações topicalizadas e anti topicalizadas”. Sua contribuição é
            muito valiosa para nós.
          </p>
        </>
      ),
    },
    {
      texto: (
        <>
          <p className="font-bold text-2xl">
            O experimento levará aproximadamente 20 minutos para ser concluído.
            Por favor, procure um ambiente tranquilo e sem distrações; e utilize
            um fone de ouvido para ouvir os áudios.
          </p>
        </>
      ),
    },
    {
      titulo: "Como funcionará a tarefa?",
      texto: (
        <>
          <p className="font-bold text-2xl mt-2">
            Você ouvirá uma frase de cada vez. O áudio da frase iniciará sempre
            após 5 segundos. Depois de ouvir a frase, pediremos que você avalie
            a aceitabilidade em uma escala de 1 a 5, sendo que 1 totalmente
            inaceitável e 5 totalmente aceitável.
          </p>
        </>
      ),
    },
    {
      texto: (
        <>
          <p className="font-bold text-2xl">
            Em um experimento, não há respostas "certas" ou "erradas". Queremos
            apenas a sua opinião e intuição como falante de português. Então,
            confie no seu primeiro instinto e aperte a tecla correspondente ao
            nível de aceitabilidade.
          </p>
        </>
      ),
    },
    {
      titulo: "Resumindo",
      texto: (
        <>
          <ul className="list-disc pl-5 space-y-3 font-bold text-2xl mt-2">
            <li>
              Avalie o nível de aceitabilidade, utilizando as teclas de 1 a 5.
            </li>
            <li>Escute a frase.</li>
          </ul>

          <p className="font-bold text-2xl text-center mt-2">
            O processo se repetirá para todas as frases.
          </p>
          <p className="font-bold text-2xl text-center mt-2">
            Agradecemos novamente sua colaboração!
          </p>
        </>
      ),
    },
  ];

  const ShowPerguntas = (event) => {
    event.preventDefault();
    setInstrucao(false);
    setPerguntas(true);

    // Tentar entrar em modo tela cheia
    const elem = document.documentElement; // pega o <html>
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  };

  useEffect(() => {
    const validateSession = async () => {
      try {
        const tokenRes = await fetch(`${BACKEND_URL}/api/csrf/`, {
          method: "GET",
          credentials: "include",
        });
        const tokenData = await tokenRes.json();
        console.log("Token do backend:", tokenData.csrfToken);
        setCsrfToken(tokenData.csrfToken);

        // Segundo: validar a sessão com CSRF - usar token obtido diretamente
        const response = await fetch(`${BACKEND_URL}/me/`, {
          method: "GET",
          headers: {
            "X-CSRFToken": tokenData.csrfToken,
          },
          credentials: "include",
        });

        if (response.ok) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      } catch (error) {
        console.error("Erro na validação da sessão:", error);
        setIsValid(false);
      }
    };

    validateSession();
  }, []);

  /* --------------------------
     Load inicial, imagens, perguntas
     -------------------------- */
  useEffect(() => {
    document.title = "EchoThink";
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = Icon;
    document.head.appendChild(link);

    const loadImages = async () => {
      const IconImg = GetIMG("EchoThink.ico");
      const LogoImg = GetIMG("Logo.png");
      setIcon(IconImg);
      setLogo(LogoImg);
    };
    loadImages();

    fetchPerguntas();

    // tentar setar CSRF cookie via helper (se necessário)
    try {
      getCSRFToken();
    } catch (e) {
      // se getCSRFToken não existir ou falhar, não interrompe o componente
      console.warn("getCSRFToken helper falhou:", e);
    }
  }, [Icon]);

  /* --------------------------
     Carrega perguntas do backend
     -------------------------- */
  const fetchPerguntas = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/questions/listar-perguntas/`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Erro ao carregar perguntas");
      const data = await response.json();
      setListaPerguntas(data);
      console.log("Perguntas carregadas:", data);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar perguntas");
    }
  };

  /* --------------------------
     Controle de teclado (1-5)
     -------------------------- */
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!audioConcluido) return;

      const key = e.key;
      if (!["1", "2", "3", "4", "5"].includes(key)) return;

      const index = parseInt(key, 10) - 1;
      const pergunta = ListaPerguntas[IndicePergunta];
      if (!pergunta || !pergunta.options || !pergunta.options[index]) return;
      const opcao = pergunta.options[index];

      const value =
        typeof opcao === "object" && opcao !== null
          ? opcao.option_text ?? opcao.value ?? opcao.text ?? opcao.label
          : String(opcao);

      // definimos visualmente a seleção (opcional)
      setRespostaSelecionada(value);

      // chamamos proximaPergunta informando a resposta diretamente para evitar race condition
      setTimeout(() => {
        proximaPergunta(value);
      }, 150);
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [audioConcluido, ListaPerguntas, IndicePergunta, startTime]);

  /* --------------------------
     Quando muda pergunta — controlar áudio e timer
     -------------------------- */
  useEffect(() => {
    if (!Perguntas || ListaPerguntas.length === 0) return;

    const pergunta = ListaPerguntas[IndicePergunta];
    setRespostaSelecionada(null); // reset da seleção ao trocar pergunta

    // Limpa qualquer timeout anterior
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
      audioTimeoutRef.current = null;
    }

    // Pause e reset em qualquer áudio anterior
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (err) {
        // ignore
      }
    }

    if (pergunta.audio_url) {
      // Bloqueia seleção enquanto o áudio não terminar
      setAudioConcluido(false);
      setStartTime(null); // ainda não iniciou o timer

      // tocar o áudio APÓS 5s
      audioTimeoutRef.current = setTimeout(() => {
        if (audioRef.current && typeof audioRef.current.play === "function") {
          audioRef.current
            .play()
            .then(() => {
              // tocar corretamente; o timer de resposta será iniciado no onEnded
            })
            .catch((err) => {
              // autoplay bloqueado: fallback
              console.warn("Autoplay bloqueado ou erro ao tocar audio:", err);
              setAudioConcluido(true);
              setStartTime(Date.now());
            });
        } else {
          // sem elemento de áudio disponível (fallback)
          setAudioConcluido(true);
          setStartTime(Date.now());
        }
        audioTimeoutRef.current = null;
      }, 5000);
    } else {
      // Sem áudio: liberar imediatamente e iniciar o timer
      setAudioConcluido(true);
      setStartTime(Date.now());
    }

    return () => {
      if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current);
        audioTimeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [IndicePergunta, Perguntas, ListaPerguntas]);

  /* --------------------------
     Avançar para próxima pergunta (aceita override de resposta)
     -------------------------- */
  const proximaPergunta = (respostaOverride = null) => {
    // Proteção extra: só permitir avançar se startTime estiver definido
    if (!startTime) {
      console.warn("Tentou avançar sem startTime definido.");
      return;
    }

    const endTime = Date.now();
    const tempoRespostaMs = endTime - startTime; // em milissegundos

    const pergunta = ListaPerguntas[IndicePergunta];
    const respostaFinal = respostaOverride ?? respostaSelecionada;

    const respostaAtual = {
      perguntaId: pergunta.id,
      perguntaTexto: pergunta.question || pergunta.title,
      resposta: respostaFinal,
      tempoEmMilissegundos: tempoRespostaMs, // em ms
    };

    const novasRespostas = [...respostas, respostaAtual];
    setRespostas(novasRespostas);

    if (IndicePergunta + 1 < ListaPerguntas.length) {
      setIndicePergunta((prev) => prev + 1);
      setRespostaSelecionada(null);
      setStartTime(null);
      setAudioConcluido(true); // será atualizado pelo useEffect que observa IndicePergunta
    } else {
      // fim das perguntas
      setPerguntas(false);
      setFinalizacao(true);
      enviarRespostas(novasRespostas);
    }
  };

  const enviarRespostas = async (respostasParaEnviar = null) => {
    const payloadArray = (respostasParaEnviar ?? respostas).map((r) => ({
      user: 1,
      question: r.perguntaId,
      resposta_texto: r.resposta,
      resposta_opcao: r.resposta,
      tempo_resposta: (r.tempoEmMilissegundos / 1000).toFixed(8),
    }));

    const payload = { respostas: payloadArray };

    try {
      console.log("Enviando respostas:", payload);
      const response = await fetch(
        `${BACKEND_URL}/api/questions/responder-multiplo/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify(payload),
          credentials: "include",
        }
      );

      if (response.ok) {
        alert("Respostas enviadas com sucesso!");
      } else {
        let errText =
          "Respostas não enviadas. Pois ja tem registro para este usuário.";
        try {
          const data = await response.json();
          errText = data.message || data.detail || errText;
        } catch {}
        alert(errText);
      }
    } catch (err) {
      console.error("Erro ao enviar respostas:", err);
      alert("Erro ao enviar respostas. Veja o console para detalhes.");
    }
  };

  /* --------------------------
     Logout
     -------------------------- */
  const handleLogout = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/logout/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });

      if (response.ok) {
        alert("Logout realizado com sucesso!");
        window.location.href = "/";
      } else {
        const data = await response.json();
        alert("Erro ao deslogar: " + (data.mensagem || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro no logout:", error);
    }
  };

  /* --------------------------
     Handlers de áudio
     -------------------------- */
  const handleAudioEnd = () => {
    setAudioConcluido(true);
    setStartTime(Date.now());
  };

  const handleAudioError = (e) => {
    console.warn("Erro ao reproduzir áudio:", e);
    setAudioConcluido(true);
    setStartTime(Date.now());
  };

  /* --------------------------
     Render pergunta
     -------------------------- */
  const renderPergunta = (pergunta) => (
    <div className="w-full max-w-xl p-4 flex flex-col items-center justify-center text-white gap-4">
      <h2 className="text-2xl font-bold uppercase text-center">
        {pergunta.title}
      </h2>

      {pergunta.question && (
        <p className="text-center max-w-md">{pergunta.question}</p>
      )}

      {pergunta.image_url && (
        <img
          key={`img-${pergunta.id}`}
          src={pergunta.image_url}
          alt="Imagem"
          className="w-1/2 max-w-md object-contain rounded-lg"
        />
      )}

      {pergunta.audio_url && (
        <>
          <audio
            key={`audio-${pergunta.id}`}
            ref={audioRef}
            onEnded={handleAudioEnd}
            onError={handleAudioError}
            style={{ display: "none" }}
          >
            <source src={pergunta.audio_url} type="audio/mp3" />
          </audio>

          <img
            src={GetIMG("audiobg.png")}
            alt="Ícone de áudio"
            className="w-96 h-24 mt-4"
          />
        </>
      )}

      <div className="flex gap-3 mt-4 max-w-md w-full justify-center items-center flex-col">
        <div className="w-full flex flex-wrap gap-4 justify-center items-center mt-4">
          {pergunta.options.map((opcao, idx) => {
            const textoOpcao =
              typeof opcao === "object" && opcao !== null
                ? opcao.value ?? opcao.text ?? opcao.label ?? opcao.option_text
                : String(opcao);

            const value = textoOpcao;
            const isSelected = respostaSelecionada === value;

            return (
              <button
                key={(opcao && opcao.id) || idx}
                type="button"
                onClick={() => {
                  if (!audioConcluido) return;

                  const chosen =
                    typeof opcao === "object" && opcao !== null
                      ? opcao.option_text ??
                        opcao.value ??
                        opcao.text ??
                        opcao.label
                      : String(opcao);

                  // definir visualmente e chamar proximaPergunta passando a resposta
                  setRespostaSelecionada(chosen);
                  setTimeout(() => {
                    proximaPergunta(chosen);
                  }, 150);
                }}
                disabled={!audioConcluido}
                aria-pressed={isSelected}
                className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-xl shadow-md font-semibold transition-transform select-none
        ${
          isSelected
            ? "bg-white text-black scale-105 ring-2 ring-offset-2 ring-gray-200"
            : "bg-white text-gray-700"
        }
        ${
          !audioConcluido ? "opacity-60 cursor-not-allowed" : "hover:scale-105"
        }`}
                style={{ userSelect: "none" }}
              >
                {textoOpcao}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* --------------------------
     Exibição do componente
     -------------------------- */
  return (
    <section className="w-screen min-h-screen flex flex-col bg-PrimaryFocus px-4 py-8 justify-center items-center">
      <section className="w-full flex items-center justify-center h-full">
        {Instrucao && (
          <div className="w-full max-w-7xl h-full flex items-center justify-center">
            <div className="w-full max-w-4xl borderlaran">
              <div className="w-full max-w-4xl bg-Secundary flex flex-col gap-6 p-6 rounded-2xl shadow-lg">
                {/* Botão sair */}
                <div className="flex justify-end">
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-600 transition"
                  >
                    Sair
                  </button>
                </div>

                {/* Logo */}
                <div className="flex justify-center">
                  <img
                    src={Logo}
                    alt="logo"
                    className="max-w-24 w-full object-contain"
                  />
                </div>

                <div className="text-center text-white flex flex-col gap-4">
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    {telas[indiceTela].titulo}
                  </h1>
                  <div
                    className="text-base sm:text-lg leading-relaxed text-justify 
                px-2 sm:px-6 min-h-[120px]"
                  >
                    {telas[indiceTela].texto}
                  </div>

                  <div className="flex justify-center gap-2 mt-2">
                    {telas.map((_, i) => (
                      <span
                        key={i}
                        className={`w-3 h-3 rounded-full transition ${
                          i === indiceTela
                            ? "bg-white scale-110"
                            : "bg-gray-500"
                        }`}
                      ></span>
                    ))}
                  </div>

                  <div className="flex justify-center gap-4 mt-4">
                    {indiceTela > 0 && indiceTela < telas.length - 1 && (
                      <button
                        className="px-5 py-2 bg-gray-500 text-white rounded font-medium hover:bg-gray-600 transition"
                        onClick={() => setIndiceTela((p) => Math.max(0, p - 1))}
                      >
                        Voltar
                      </button>
                    )}

                    {indiceTela < telas.length - 1 ? (
                      <button
                        className="px-5 py-2 bg-white text-black rounded font-bold hover:bg-gray-200 transition"
                        onClick={() =>
                          setIndiceTela((p) =>
                            Math.min(telas.length - 1, p + 1)
                          )
                        }
                      >
                        Próximo
                      </button>
                    ) : (
                      <button
                        className="px-6 py-2 bg-Button text-black rounded font-bold hover:bg-gray-200 transition"
                        onClick={(e) => {
                          ShowPerguntas(e);
                        }}
                      >
                        INICIAR
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {Perguntas && (
          <div className="w-full max-w-7xl h-full flex items-center justify-center">
            <div className="borderlaran max-w-4xl w-full">
              <div className="w-full max-w-4xl bg-Secundary p-6 flex flex-col items-center gap-6">
                {ListaPerguntas.length === 0 ? (
                  <p>Carregando perguntas...</p>
                ) : (
                  renderPergunta(ListaPerguntas[IndicePergunta])
                )}
              </div>
            </div>
          </div>
        )}

        {Finalizacao && (
          <div className="w-full max-w-7xl h-full flex items-center justify-center">
            <div className="borderlaran max-w-4xl w-full">
              <div className="w-full max-w-4xl bg-Secundary p-6 flex flex-col items-center gap-6">
                <img
                  src={Logo}
                  alt="logo"
                  className="max-w-20 w-full object-contain"
                />
                <h1 className="text-3xl font-bold text-center">
                  Obrigado por participar!
                </h1>
                <p className="text-center">
                  Suas respostas foram enviadas com sucesso.
                </p>
                <button
                  className="bg-Button px-6 py-2 rounded font-bold hover:bg-gray-200 transition"
                  onClick={handleLogout}
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </section>
  );
};

export default LoginDefault;
