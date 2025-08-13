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
          tempo_resposta: r.tempoEmSegundos,
        })),
      };

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
        alert("Erro ao enviar respostas.");
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
  const tempoResposta = endTime - startTime; // já está em milissegundos

  const pergunta = ListaPerguntas[IndicePergunta];

  const respostaAtual = {
    perguntaId: pergunta.id,
    perguntaTexto: pergunta.question || pergunta.title,
    resposta: respostaSelecionada,
    tempoEmMilissegundos: tempoResposta, // nome ajustado
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
      {pergunta.image && (
        <img
          src={pergunta.image}
          alt="Imagem"
          className="w-full max-w-md h-auto rounded"
        />
      )}
      {pergunta.audio && (
        <audio controls className="w-full max-w-md">
          <source src={pergunta.audio} type="audio/mp3" />
          Seu navegador não suporta áudio.
        </audio>
      )}

      <div className="flex flex-col gap-3 mt-4 max-w-md w-full">
        {pergunta.options.map((opcao, idx) => {
          const textoOpcao =
            typeof opcao === "object" && opcao !== null
              ? opcao.text || opcao.label || JSON.stringify(opcao)
              : opcao;

          return (
            <label
              key={opcao.id || idx}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <input
                type="radio"
                name={`pergunta_${pergunta.id}`}
                value={textoOpcao}
                checked={respostaSelecionada === textoOpcao}
                onChange={(e) => setRespostaSelecionada(e.target.value)}
                className="accent-white"
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
    <section className="w-screen min-h-screen flex flex-col bg-Primary px-4 py-8 justify-center items-center">
      
      <section className="w-full flex items-center justify-center h-full">
        {Instrucao && (
          <div className="w-full max-w-7xl h-full flex items-center justify-center">
            
            <div className="w-full max-w-4xl borderlaran">
              
            <div className="w-full max-w-4xl bg-Secundary flex flex-col gap-6 items-end">
              <button onClick={handleLogout} className="w-1/12 bg-red-500 text-white p-2 rounded">Sair</button>
              <div className="w-full max-w-4xl p-6 flex flex-col items-center gap-6">
              <img
                src={Logo}
                alt="logo"
                className="max-w-20 w-full object-contain"
              />
              <h1 className="text-3xl font-bold text-center">Instrução</h1>
              <ul className="list-disc pl-6 text-left text-white space-y-2 max-w-md">
                <li>Leia atentamente cada pergunta.</li>
                <li>Escolha apenas uma alternativa por pergunta.</li>
                <li>Revise suas respostas antes de enviar.</li>
              </ul>
              <button
                className="bg-Button px-6 py-2 rounded font-bold hover:bg-gray-200 transition"
                onClick={ShowPerguntas}
              >
                INICIAR
              </button>
              </div>
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
        {Error && (
          <div className="w-full max-w-7xl h-full flex items-center justify-center">
            <div className="borderlaran max-w-4xl w-full">
            <div className="w-full max-w-4xl bg-Secundary p-6 flex flex-col items-center gap-6">
              <img
                src={Logo}
                alt="logo"
                className="max-w-20 w-full object-contain"
              />
              <h1 className="text-3xl font-bold text-center">Erro ao carregar perguntas</h1>
              <p className="text-center">Por favor, tente novamente mais tarde.</p>
              <button
                className="bg-Button px-6 py-2 rounded font-bold hover:bg-gray-200 transition"
                onClick={ShowInstrucao}
              >
                Tentar Novamente
              </button>
            </div>
            </div>
          </div>
        )     
              }
      </section>
    </section>
  );
};

export default LoginDefault;
