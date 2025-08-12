import React, { useEffect, useState } from "react";
import { getCSRFToken } from "../../CSRF/csrf";
import { GetIMG } from "../../scripts/GetIMG";
import "../styles/global.css";
import "../styles/loginDefault.css";

const LoginDefault = () => {
  const [Error, setError] = useState(true);
  const [Icon, setIcon] = useState("");
  const [Logo, setLogo] = useState("");
  const [AdicionarPergunta, setAdicionarPergunta] = useState("");
  const [Principal, setPrincipal] = useState("");
  const [Participantes, setParticipantes] = useState("");
  const [Perguntas, setPerguntas] = useState("");
  const [Relatorio, setRelatorio] = useState("");
  const [home, setHome] = useState(true);
  const [relatorio, setrelatorio] = useState(false);
  const [addPerguntas, setaddPerguntas] = useState(false);
  const [listarPerguntas, setlistarPerguntas] = useState(false);
  const [listarParticipantes, setlistarParticipantes] = useState(false);
  const [listarParticipantesArray, setlistarParticipantesArray] = useState(['']);
  const [csrfToken, setCsrfToken] = useState("");

  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [options, setOptions] = useState(["", "", ""]);

  const [listaPerguntas, setListaPerguntas] = useState([
  ]);

  //const [listaPerguntas, setListaPerguntas] = useState([]);
  const [loadingPerguntas, setLoadingPerguntas] = useState(false);

  const [loadingParticipantes, setLoadingParticipantes] = useState(false);

  const [isValid, setIsValid] = useState(null);

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

  const baixarRelatorio = async (formato) => {
  try {
    const response = await fetch(`https://cidivan-production.up.railway.app/api/questions/relatorio-respostas/${formato}/`, {
      method: "GET",
      credentials: "include", // se estiver usando autenticação por sessão/cookie
    });

    if (!response.ok) {
      const text = await response.text();
      alert(`Erro ao gerar relatório: ${text}`);
      return;
    }

    const blob = await response.blob();

    // Define o nome do arquivo conforme o formato
    const nomeArquivo = formato === "excel" ? "relatorio_respostas.xlsx" : "relatorio_respostas.csv";

    // Cria uma URL temporária para download
    const url = window.URL.createObjectURL(blob);

    // Cria um elemento <a> para disparar o download
    const a = document.createElement("a");
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();

    // Remove o elemento e libera a URL
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    alert("Erro ao baixar relatório: " + error.message);
  }
};


  const fetchParticipantes = async () => {
    setLoadingParticipantes(true);
  try {
    const res = await fetch("https://cidivan-production.up.railway.app/api/auth/listar-participantes/", {
      credentials: "include",
    });
    const data = await res.json();
    setlistarParticipantesArray(data);
  } catch (error) {
    alert("Erro ao carregar participantes");
  } finally {
    setLoadingParticipantes(false);
    console.log("Lista de participantes:", listarParticipantes);
  }
};

  const deletePergunta = async (id) => {
  if (!window.confirm("Tem certeza que deseja excluir esta pergunta?")) return;

  try {
    const response = await fetch(`https://cidivan-production.up.railway.app/api/questions/deletar-pergunta/${id}/`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "X-CSRFToken": csrfToken,
      },
    });

    if (!response.ok) throw new Error("Erro ao excluir pergunta");

    alert("Pergunta excluída com sucesso!");
    fetchPerguntas(); // recarrega a lista após excluir
  } catch (error) {
    console.error(error);
    alert("Erro ao excluir pergunta");
  }
};

const marcarRelevante = async (id) => {
  try {
    const response = await fetch(`https://cidivan-production.up.railway.app/api/questions/marcar-relevante/${id}/`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ is_relevant: true }),
    });

    if (!response.ok) throw new Error("Erro ao marcar pergunta como relevante");

    alert("Pergunta marcada como relevante!");
    // Atualiza lista
    listarPerguntas();
  } catch (error) {
    console.error(error);
  }
};


  const fetchPerguntas = async () => {
  try {
    setLoadingPerguntas(true);
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
    setLoadingPerguntas(false);
  }
};


  useEffect(() => {
    document.title = "EchoThink";
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = Icon;
    document.head.appendChild(link);
    const fetchCsrfToken = async () => {
      getCSRFToken();
    };
    fetchCsrfToken();

    const loadImages = async () => {
      const Icon = GetIMG("EchoThink.ico");
      const Logo = GetIMG("Logo.png");
      const Home = GetIMG("Home.png");
      const AddPergunta = GetIMG("AdicionarPergunta.png");
      const Participantes = GetIMG("Participantes.png");
      const Perguntas = GetIMG("Perguntas.png");
      const Relatorio = GetIMG("Relatorio.png");
      setAdicionarPergunta(AddPergunta);
      setPrincipal(Home);
      setParticipantes(Participantes);
      setPerguntas(Perguntas);
      setRelatorio(Relatorio);
      setIcon(Icon);
      setLogo(Logo);
    };
    loadImages();
  }, []);

  // funções de navegação
  const resetViews = () => {
    setHome(false);
    setrelatorio(false);
    setaddPerguntas(false);
    setlistarPerguntas(false);
    setlistarParticipantes(false);
  };

  const ShowHome = (e) => {
    e.preventDefault();
    resetViews();
    setHome(true);
  };

  const ShowRelatorio = (e) => {
    e.preventDefault();
    resetViews();
    setrelatorio(true);
  };

  const ShowAddPerguntas = (e) => {
    e.preventDefault();
    resetViews();
    setaddPerguntas(true);
  };

  const ShowListarPerguntas = (e) => {
    e.preventDefault();
    resetViews();
    setlistarPerguntas(true);
    fetchPerguntas();
  };

  const ShowListarParticipantes = (e) => {
    e.preventDefault();
    resetViews();
    setlistarParticipantes(true);
    fetchParticipantes();
  };

  return (
  <section className="w-screen h-screen flex flex-col bg-Primary overflow-hidden">
    <section className="flex-1 flex items-center justify-center overflow-hidden">
      {(home || relatorio || addPerguntas || listarPerguntas || listarParticipantes) && (
        <div className="w-11/12 h-5/6 flex items-center justify-center overflow-hidden">
          <div className="w-full h-full flex flex-col border-Config overflow-hidden">
            <div className="w-full flex flex-1 bg-Secundary justify-between overflow-hidden">
              
              {/* MENU LATERAL */}
              <div className="w-2/12 min-w-[160px] bg-New flex flex-col admin-menu overflow-auto justify-center items-center">
                <div
                  className="border p-2 cursor-pointer flex flex-col justify-center items-center admin-item"
                  onClick={ShowHome}
                >
                  <img src={Principal} alt="" className="max-w-[50px] max-h-[50px]" />
                  <h2>Home</h2>
                </div>
                <div
                  className="border p-2 cursor-pointer flex flex-col justify-center items-center admin-item"
                  onClick={ShowAddPerguntas}
                >
                  <img src={AdicionarPergunta} alt="" className="max-w-[50px] max-h-[50px]" />
                  <h2 className="text-center">Adicionar Perguntas</h2>
                </div>
                <div
                  className="border p-2 cursor-pointer flex flex-col justify-center items-center admin-item"
                  onClick={ShowListarPerguntas}
                >
                  <img src={Perguntas} alt="" className="max-w-[50px] max-h-[50px]" />
                  <h2>Listar Perguntas</h2>
                </div>
                <div
                  className="border p-2 cursor-pointer flex flex-col justify-center items-center admin-item"
                  onClick={ShowListarParticipantes}
                >
                  <img src={Participantes} alt="" className="max-w-[50px] max-h-[50px]" />
                  <h2>Listar Participantes</h2>
                </div>
                <div
                  className="border p-2 cursor-pointer flex flex-col justify-center items-center admin-item"
                  onClick={ShowRelatorio}
                >
                  <img src={Relatorio} alt="" className="max-w-[50px] max-h-[50px]" />
                  <h2>Relatório</h2>
                </div>
              </div>

              {/* CONTEÚDO PRINCIPAL */}
              <div className="w-10/12  bg-New3 flex flex-col overflow-auto p-4">
                
                {home && 
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                    <h1 className="text-2xl font-semibold mb-4">Bem-vindo ao sistema!</h1>
                    <p className="max-w-md">
                      Use o menu à esquerda para acessar as opções relevantes do sistema.
                      Aqui você pode navegar e gerenciar todas as funcionalidades disponíveis.
                    </p>
                  </div>
                }
                {relatorio && (
                  <div className="flex flex-col items-center gap-2">
                    <img src={Logo} alt="Logo" className="max-w-[150px] h-auto" />
                    <h1>Relatório</h1>
                    <button onClick={() => baixarRelatorio("csv")}>Baixar CSV</button>
                    <button onClick={() => baixarRelatorio("excel")}>Baixar Excel</button>
                  </div>
                )}

                {addPerguntas && (
                  <div className="flex flex-col items-center gap-4">
                    <h1>Adicionar Perguntas</h1>
                    <form
                      className="flex flex-col gap-2 w-full max-w-lg"
                      onSubmit={async (e) => {
                        e.preventDefault();

                        const formData = new FormData();
                        formData.append("title", title);
                        formData.append("question", question);
                        if (image) formData.append("image", image);
                        if (audio) formData.append("audio", audio);
                        options.forEach((opt) => formData.append("options", opt));

                        try {
                          const response = await fetch("https://cidivan-production.up.railway.app/api/questions/criar-pergunta/", {
                            method: "POST",
                            body: formData,
                            credentials: "include",
                            headers: { "X-CSRFToken": csrfToken },
                          });

                          if (!response.ok) throw new Error("Erro ao criar pergunta");
                          const data = await response.json();
                          alert("Pergunta criada com sucesso! ID: " + data.id);

                          setTitle("");
                          setQuestion("");
                          setImage(null);
                          setAudio(null);
                          setOptions(["", "", ""]);
                        } catch (error) {
                          console.error(error);
                          alert("Erro ao salvar pergunta");
                        }
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Título da pergunta"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="p-2 border"
                        required
                      />

                      <textarea
                        placeholder="Texto da pergunta (opcional)"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="p-2 border"
                      />

                      <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
                      <input type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files[0])} />

                      {options.map((opt, idx) => (
                        <input
                          key={idx}
                          type="text"
                          placeholder={`Alternativa ${idx + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...options];
                            newOpts[idx] = e.target.value;
                            setOptions(newOpts);
                          }}
                          className="p-2 border"
                          required
                        />
                      ))}

                      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                        Salvar Pergunta
                      </button>
                    </form>
                  </div>
                )}

                {listarPerguntas && (
                  <div className="w-full overflow-auto flex flex-col justify-start items-center">
                    <h1 className="text-2xl font-bold mb-5">Lista de Perguntas</h1>
                    {loadingPerguntas ? (
                      <p>Carregando perguntas...</p>
                    ) : (
                      <table className="w-full min-w-[800px] border-collapse  border-gray-400">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className=" border-gray-400 p-2">ID</th>
                            <th className=" border-gray-400 p-2">Título</th>
                            <th className=" border-gray-400 p-2">Pergunta</th>
                            <th className=" border-gray-400 p-2">Imagem</th>
                            <th className=" border-gray-400 p-2">Áudio</th>
                            <th className=" border-gray-400 p-2">Opções</th>
                            <th className=" border-gray-400 p-2">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {listaPerguntas.map((p) => (
                            <tr key={p.id}>
                              <td className=" border-gray-400 p-2">{p.id}</td>
                              <td className=" border-gray-400 p-2">{p.title}</td>
                              <td className=" border-gray-400 p-2">{p.question || "-"}</td>
                              <td className=" border-gray-400 p-2">
                                {p.image_url ? (
                                  <img src={p.image_url} alt="Pergunta" className="max-w-[100px] max-h-[100px] object-cover" />
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className=" border-gray-400 p-2">
                                {p.audio_url ? (
                                  <audio controls className="w-32">
                                    <source src={p.audio_url} type="audio/mpeg" />
                                    Seu navegador não suporta áudio
                                  </audio>
                                ) : (
                                  "-"
                                )}
                              </td>
                              <td className=" border-gray-400 p-2">
                                <ul className="list-disc pl-4">
                                  {p.options.map((opt, idx) => (
                                    <li key={idx}>{opt.text}</li>
                                  ))}
                                </ul>
                              </td>
                              <td className=" border-gray-400 p-2 text-center">
                                <button
                                  onClick={() => deletePergunta(p.id)}
                                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                >
                                  Excluir
                                </button>
                                <button
                                  onClick={() => marcarRelevante(p.id)}
                                  className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 ml-1"
                                >
                                  Marcar Relevante
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {listarParticipantes && (
                  <div className="w-full overflow-auto">
                    <h1>Lista de Participantes</h1>
                    {loadingParticipantes ? (
                      <p>Carregando participantes...</p>
                    ) : (
                      <table className="w-full min-w-[700px] border-collapse  border-gray-400">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className=" border-gray-400 p-2">ID</th>
                            <th className=" border-gray-400 p-2">Usuário</th>
                            <th className=" border-gray-400 p-2">Nome</th>
                            <th className=" border-gray-400 p-2">Telefone</th>
                            <th className=" border-gray-400 p-2">Endereço</th>
                            <th className=" border-gray-400 p-2">Idade</th>
                            <th className=" border-gray-400 p-2">Gênero</th>
                            <th className=" border-gray-400 p-2">Tipo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {listarParticipantesArray.map((p) => (
                            <tr key={p.id}>
                              <td className=" border-gray-400 p-2">{p.id}</td>
                              <td className=" border-gray-400 p-2">{p.user.username}</td>
                              <td className=" border-gray-400 p-2">{p.nome}</td>
                              <td className=" border-gray-400 p-2">{p.telefone}</td>
                              <td className=" border-gray-400 p-2">{p.endereco}</td>
                              <td className=" border-gray-400 p-2">{p.idade}</td>
                              <td className=" border-gray-400 p-2">{p.genero}</td>
                              <td className=" border-gray-400 p-2">{p.tipo ? "Admin" : "Usuário"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  </section>
);
};

export default LoginDefault;
