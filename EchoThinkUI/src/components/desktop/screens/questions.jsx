import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const [csrfToken, setCsrfToken] = useState("");
  const [respostaSelecionada, setRespostaSelecionada] = useState(null);
  const [respostas, setRespostas] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [IndicePergunta, setIndicePergunta] = useState(0);

  const [ListaPerguntas, setListaPerguntas] = useState([]);

  const fetchPerguntas = async () => {
  try {
    const response = await fetch("https://cidivan-production.up.railway.app/api/questions/listar-perguntas/", {
      method: "GET",
      credentials: "include", // mantém cookies/CSRF
    });
    if (!response.ok) throw new Error("Erro ao carregar perguntas");
    const data = await response.json();
    setListaPerguntas(data);
  } catch (error) {
    console.error(error);
    alert("Erro ao carregar perguntas");
  } finally {
    console.log(ListaPerguntas);
  }
};
  useEffect(() => {
    document.title = "EchoThink";
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = Icon;
    document.head.appendChild(link);
    fetchPerguntas();
    const fetchCsrfToken = async () => {
      getCSRFToken();
    };
    fetchCsrfToken();

    const loadImages = async () => {
      const Icon = GetIMG("EchoThink.ico");
      const Logo = GetIMG("Logo.png");
      setIcon(Icon);
      setLogo(Logo);
    };
    loadImages();
  }, []);

  useEffect(() => {
    if (Perguntas) setStartTime(Date.now());
  }, [IndicePergunta, Perguntas]);

  const ShowInstrucao = (event) => {
    event.preventDefault();
    setInstrucao(true);
    setPerguntas(false);
  };

  const ShowPerguntas = (event) => {
    event.preventDefault();
    setInstrucao(false);
    setPerguntas(true);
  };

  const enviarRespostas = async (todasRespostas) => {
  try {
    const payload = {
      respostas: todasRespostas.map(r => ({
        user: 1, // Pega o ID do usuário logado (pode vir do contexto ou localStorage)
        question: r.perguntaId,
        resposta_texto: r.resposta,
        resposta_opcao: r.resposta, // se quiser diferenciar texto de opção, adapte
        tempo_resposta: r.tempoEmSegundos
      }))
    };

    const response = await fetch("https://cidivan-production.up.railway.app/api/questions/responder-multiplo/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include" // importante se usar CSRF
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

  const proximaPergunta = () => {
  const endTime = Date.now();
  const tempoResposta = Math.floor((endTime - startTime) / 1000);

  const pergunta = ListaPerguntas[IndicePergunta];

  const respostaAtual = {
    perguntaId: pergunta.id,
    perguntaTexto: pergunta.question || pergunta.title,
    resposta: respostaSelecionada,
    tempoEmSegundos: tempoResposta,
  };

  const novasRespostas = [...respostas, respostaAtual];
  setRespostas(novasRespostas);

  if (IndicePergunta + 1 < ListaPerguntas.length) {
    setIndicePergunta(IndicePergunta + 1);
    setRespostaSelecionada(null);
  } else {
    enviarRespostas(novasRespostas);
  }
};


 const renderPergunta = (pergunta) => (
  <div className="w-full p-4 flex flex-col items-center justify-center text-white gap-4">
    <h2 className="text-xl font-bold uppercase">{pergunta.title}</h2>

    {pergunta.question && (
      <p className="text-center max-w-md">{pergunta.question}</p>
    )}
    {pergunta.image && (
      <img src={pergunta.image} alt="Imagem" className="w-64 h-auto rounded" />
    )}
    {pergunta.audio && (
      <audio controls className="w-64">
        <source src={pergunta.audio} type="audio/mp3" />
      </audio>
    )}

    <div className="flex flex-col gap-2 mt-4">
      {pergunta.options.map((opcao, idx) => {
        // Se 'opcao' for objeto, extrai 'text' ou outro campo para exibir e salvar
        const textoOpcao = typeof opcao === "object" && opcao !== null ? opcao.text || opcao.label || JSON.stringify(opcao) : opcao;

        return (
          <label key={opcao.id || idx} className="flex items-center gap-2 cursor-pointer select-none">
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
      className={`bg-Button px-6 py-2 mt-4 rounded font-bold transition ${
        respostaSelecionada
          ? "bg-white text-black hover:bg-gray-200 cursor-pointer"
          : "bg-gray-500 text-gray-300 cursor-not-allowed"
      }`}
    >
      PRÓXIMO
    </button>
  </div>
);


  return (
    <section className="w-full h-screen flex flex-col bg-Primary">
      <section className="w-screen flex items-center justify-center">
        {Instrucao && (
          <div className="w-6/12 h-screen flex items-center justify-center">
            <div className=" w-full items-center justify-center flex flex-col border-Config">
              <div className=" w-full items-center justify-center flex flex-col bg-Secundary">
                <img src={Logo} alt="logo" />
                <h1>Instrução</h1>
                <ul>
                  <li>Leia atentamente cada pergunta.</li>
                  <li>Escolha apenas uma alternativa por pergunta.</li>
                  <li>Revise suas respostas antes de enviar.</li>
                </ul>
                <button className="bg-Button" onClick={ShowPerguntas}>INICIAR</button>
              </div>
            </div>
          </div>
        )}

        {Perguntas && (
          <div className="w-6/12 h-screen flex items-center justify-center">
            <div className=" w-full items-center justify-center flex flex-col border-Config">
              <div className=" w-full items-center justify-center flex flex-col bg-Secundary">
                <img src={Logo} alt="logo" />
                {ListaPerguntas.length === 0 ? (
                  <p>Carregando perguntas...</p>
                ) : (
                  renderPergunta(ListaPerguntas[IndicePergunta])
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </section>
  );
};

export default LoginDefault;
