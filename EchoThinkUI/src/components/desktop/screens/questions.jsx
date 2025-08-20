import React, { useEffect, useState } from "react";
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


  const BACKEND_URL = "https://cidivan-production.up.railway.app";
  
        useEffect(() => {
          const validateSession = async () => {
            try {
              // Primeiro: obter o CSRF token (o cookie será setado aqui)
              await fetch(`${BACKEND_URL}/api/csrf/`, {
                method: "GET",
                credentials: "include",
              })
              .then((res) => res.json())
              .then((data) => {
                console.log("Token do backend:", data.csrfToken);
                setCsrfToken(data.csrfToken);
              })
              .catch((err) => console.error("Erro ao buscar CSRF:", err));
            
              // Segundo: validar a sessão com CSRF
              const response = await fetch(`${BACKEND_URL}/me/`, {
                method: "GET",
                headers: {
                  "X-CSRFToken": csrfToken,
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

    const fetchCsrfToken = async () => {
      getCSRFToken();
    };
    fetchCsrfToken();
  }, [Icon]);

  useEffect(() => {
    if (Perguntas) setStartTime(Date.now());
  }, [IndicePergunta, Perguntas]);

  const fetchPerguntas = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/questions/listar-perguntas/`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Erro ao carregar perguntas");
      const data = await response.json();
      setListaPerguntas(data);
      console.log("Perguntas carregadas:", data);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar perguntas");
    }
  };

  const ShowInstrucao = (event) => {
    event.preventDefault();
    setInstrucao(true);
    setPerguntas(false);
  };

const ShowPerguntas = (event) => {
  event.preventDefault();
  setInstrucao(false);
  setPerguntas(true);

  // Tentar entrar em modo tela cheia
  const elem = document.documentElement; // pega o <html>
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { // Firefox
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { // Chrome, Safari e Opera
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { // IE/Edge antigo
    elem.msRequestFullscreen();
  }
};

  const enviarRespostas = async (todasRespostas) => {
    try {
      const payload = {
        respostas: todasRespostas.map((r) => ({
          user: 1, // Substitua pelo ID do usuário real
          question: r.perguntaId,
          resposta_texto: r.resposta,
          resposta_opcao: r.resposta,
          tempo_resposta: r.tempoEmMilissegundos,
        })),
      };
      console.log("Enviando respostas:", payload);
      const response = await fetch(`${BACKEND_URL}/api/questions/responder-multiplo/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (response.ok) {
        alert("Respostas enviadas com sucesso!");
      } else {
        alert("Respostas não enviadas. Pois ja tem registro para este usuário.");
      }
    } catch (err) {
      console.error("Erro ao enviar respostas:", err);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("https://cidivan-production.up.railway.app/api/auth/logout/", {
        method: "POST",
        credentials: "include", // importante para enviar cookies de sessão
        headers: {
          "X-CSRFToken": csrfToken,
        },
      });

      if (response.ok) {
        alert("Logout realizado com sucesso!");
        window.location.href = "/"; // redireciona para a tela de login
      } else {
        const data = await response.json();
        alert("Erro ao deslogar: " + (data.mensagem || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro no logout:", error);
    }
  };

const proximaPergunta = () => {
  const endTime = Date.now();
  const tempoRespostaMs = endTime - startTime; // em milissegundos
  const tempoRespostaSeg = (tempoRespostaMs / 1000).toFixed(6); // em segundos (6 casas decimais)

  const pergunta = ListaPerguntas[IndicePergunta];

  const respostaAtual = {
    perguntaId: pergunta.id,
    perguntaTexto: pergunta.question || pergunta.title,
    resposta: respostaSelecionada,
    tempoEmMilissegundos: parseFloat(tempoRespostaSeg), // agora em segundos
  };

  const novasRespostas = [...respostas, respostaAtual];
  setRespostas(novasRespostas);

  if (IndicePergunta + 1 < ListaPerguntas.length) {
    setIndicePergunta(IndicePergunta + 1);
    setRespostaSelecionada(null);
  } else {
    setPerguntas(false);
    setFinalizacao(true);
    enviarRespostas(novasRespostas);
  }
};




  const renderPergunta = (pergunta) => (
  <div className="w-full max-w-xl p-4 flex flex-col items-center justify-center text-white gap-4">
    <h2 className="text-2xl font-bold uppercase text-center">{pergunta.title}</h2>

    {pergunta.question && (
      <p className="text-center max-w-md">{pergunta.question}</p>
    )}

    {pergunta.image_url && (
      <img
        key={`img-${pergunta.id}`}  // 🔑 força recriação da imagem
        src={pergunta.image_url}
        alt="Imagem"
        className="w-1/2 max-w-md object-contain rounded-lg"
      />
    )}

    {pergunta.audio_url && (
      <audio
        key={`audio-${pergunta.id}`}  // 🔑 força recriação do áudio
        controls
        className="w-full max-w-md"
      >
        <source src={pergunta.audio_url} type="audio/mp3" />
        Seu navegador não suporta áudio.
      </audio>
    )}

    <div className="flex gap-3 mt-4 max-w-md w-full justify-center items-center">
      {pergunta.options.map((opcao, idx) => {
        const textoOpcao =
          typeof opcao === "object" && opcao !== null
            ? opcao.text || opcao.label || JSON.stringify(opcao)
            : opcao;

        return (
          <label
            key={opcao.id || idx}
            className="flex items-center gap-2 cursor-pointer select-none text-white"
          >
            <input
              type="radio"
              name={`pergunta_${pergunta.id}`}
              value={textoOpcao}
              checked={respostaSelecionada === textoOpcao}
              onChange={(e) => setRespostaSelecionada(e.target.value)}
              className="accent-white text-white"
              required
            />
            {textoOpcao}
          </label>
        );
      })}
    </div>

    <button
      onClick={proximaPergunta}
      disabled={!respostaSelecionada}
      className={`px-6 py-2 mt-4 rounded font-bold transition ${
        respostaSelecionada
          ? "bg-white text-black hover:bg-gray-200 cursor-pointer"
          : "bg-gray-500 text-gray-300 cursor-not-allowed"
      }`}
    >
      {IndicePergunta + 1 < ListaPerguntas.length ? "PRÓXIMO" : "FINALIZAR"}
    </button>
  </div>
);

  
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
          <img src={Logo} alt="logo" className="max-w-24 w-full object-contain" />
        </div>

        {/* Conteúdo da tela */}
        {(() => {
          const telas = [
            {
              titulo: "Bem-vindo(a) ao nosso estudo!",
              texto: (
                <>
                  <p>
                    Agradecemos imensamente o seu tempo e a sua disposição em participar desta
                    pesquisa sobre o processamento da língua portuguesa. Sua contribuição é muito
                    valiosa para nós.
                  </p>
                  <p className="mt-3">
                    O experimento levará aproximadamente <b>15 minutos</b> para ser concluído.
                  </p>
                  <p className="mt-3">
                    Por favor, procure estar em um ambiente tranquilo e sem distrações durante este
                    período.
                  </p>
                </>
              ),
            },
            {
              titulo: "Como funciona a tarefa?",
              texto: (
                <>
                  <p>
                    Você ouvirá uma série de frases, uma de cada vez. Para cada frase, sua tarefa será
                    dividida em <b>duas etapas rápidas</b>.
                  </p>
                </>
              ),
            },
            {
              titulo: "1ª Etapa: Avaliar a Naturalidade da Frase",
              texto: (
                <>
                  <p>
                    Após ouvir a frase, pediremos que você a avalie em uma escala de 1 a 5, indicando o
                    quão natural ela soa para você.
                  </p>
                  <p className="mt-3">
                    <b>Nota 1:</b> Soa artificial <br />
                    <b>Nota 5:</b> Soa totalmente natural
                  </p>
                  <p className="mt-3">
                    Para esta avaliação, não há respostas "certas" ou "erradas". Queremos apenas a sua
                    opinião e intuição como falante de português. Confie no seu primeiro instinto.
                  </p>
                </>
              ),
            },
            {
              titulo: "2ª Etapa: Responder a uma Pergunta de Interpretação",
              texto: (
                <>
                  <p>
                    Logo após dar a sua nota, uma pergunta simples de <b>Sim/Não</b> sobre o conteúdo da
                    frase aparecerá na tela.
                  </p>
                  <p className="mt-3">
                    <i>
                      Exemplo: Se a frase for "O menino comprou a camiseta", a pergunta poderia ser "Foi o
                      menino quem comprou a camiseta?".
                    </i>
                  </p>
                </>
              ),
            },
            {
              titulo: "Resumindo:",
              texto: (
                <>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Escutar a frase clicando no botão.</li>
                    <li>Avaliar o quão natural ela soa (de 1 a 5).</li>
                    <li>Responder à pergunta de interpretação sobre ela.</li>
                  </ul>
                  <p className="mt-3">
                    O processo se repetirá para todas as frases. Haverá alguns exemplos de treino no início
                    para que você possa se familiarizar antes de começarmos o experimento de verdade.
                  </p>
                  <p className="mt-3 font-semibold">Agradecemos novamente sua colaboração!</p>
                </>
              ),
            },
          ];

          const [indiceTela, setIndiceTela] = useState(0);

          return (
            <div className="text-center text-white flex flex-col gap-4">
              <h1 className="text-2xl sm:text-3xl font-bold">{telas[indiceTela].titulo}</h1>
              <div className="text-base sm:text-lg leading-relaxed text-justify px-2 sm:px-6">
                {telas[indiceTela].texto}
              </div>

              {/* Indicadores de progresso */}
              <div className="flex justify-center gap-2 mt-2">
                {telas.map((_, i) => (
                  <span
                    key={i}
                    className={`w-3 h-3 rounded-full transition ${
                      i === indiceTela ? "bg-white scale-110" : "bg-gray-500"
                    }`}
                  ></span>
                ))}
              </div>

              {/* Navegação */}
              <div className="flex justify-center gap-4 mt-4">
                {indiceTela > 0 && (
                  <button
                    className="px-5 py-2 bg-gray-500 text-white rounded font-medium hover:bg-gray-600 transition"
                    onClick={() => setIndiceTela(indiceTela - 1)}
                  >
                    Voltar
                  </button>
                )}

                {indiceTela < telas.length - 1 ? (
                  <button
                    className="px-5 py-2 bg-white text-black rounded font-bold hover:bg-gray-200 transition"
                    onClick={() => setIndiceTela(indiceTela + 1)}
                  >
                    Próximo
                  </button>
                ) : (
                  <button
                    className="px-6 py-2 bg-Button text-black rounded font-bold hover:bg-gray-200 transition"
                    onClick={ShowPerguntas}
                  >
                    INICIAR
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  </div>
        )}
        {Perguntas && (
          <div className="w-full max-w-7xl h-full flex items-center justify-center">
            <div className="borderlaran max-w-4xl w-full">
            <div className="w-full max-w-4xl bg-Secundary p-6 flex flex-col items-center gap-6">
              <img
                src={Logo}
                alt="logo"
                className="max-w-20 w-full object-contain"
              />
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
              <h1 className="text-3xl font-bold text-center">Obrigado por participar!</h1>
              <p className="text-center">Suas respostas foram enviadas com sucesso.</p>
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
