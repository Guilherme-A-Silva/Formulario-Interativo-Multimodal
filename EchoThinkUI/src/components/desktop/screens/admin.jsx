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
  const [csrfToken, setCsrfToken] = useState("");

  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");
  const [image, setImage] = useState(null);
  const [audio, setAudio] = useState(null);
  const [options, setOptions] = useState(["", "", ""]);

  const [listaPerguntas, setListaPerguntas] = useState([]);
  const [loadingPerguntas, setLoadingPerguntas] = useState(false);

  const deletePergunta = async (id) => {
  if (!window.confirm("Tem certeza que deseja excluir esta pergunta?")) return;

  try {
    const response = await fetch(`https://cidivan-production.up.railway.app/api/deletar-pergunta/${id}/`, {
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


  const fetchPerguntas = async () => {
  try {
    setLoadingPerguntas(true);
    const response = await fetch("https://cidivan-production.up.railway.app/api/listar-perguntas/", {
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
  };

  return (
    <section className="w-full menu-box flex flex-col bg-Primary">
      <section className="w-screen menu-box flex items-center justify-center">
        {(home || relatorio || addPerguntas || listarPerguntas || listarParticipantes) && (
          <div className="w-11/12 h-screen flex items-center justify-center">
            <div className="border w-full items-center justify-center flex flex-col border-Config menu-box">
              <div className="border w-full flex bg-Secundary justify-between menu-box1">
                <div className="border bg-New items-center flex flex-col admin-menu">
                  <div className="border p-2 cursor-pointer flex flex-col justify-center items-center admin-item" onClick={ShowHome}>
                    <img src={Principal} alt="" width={"25%"} height={"50%"} />
                    <h2>Home</h2>
                  </div>
                  <div className="border p-2 cursor-pointer flex flex-col justify-center items-center admin-item" onClick={ShowAddPerguntas}>
                    <img src={AdicionarPergunta} alt="" width={"25%"} height={"50%"} />
                    <h2 className="text-center">Adicionar Perguntas</h2>
                  </div>
                  <div className="border p-2 cursor-pointer flex flex-col justify-center items-center admin-item" onClick={ShowListarPerguntas}>
                    <img src={Perguntas} alt="" width={"25%"} height={"50%"} />
                    <h2>Listar Perguntas</h2>
                  </div>
                  <div className="border p-2 cursor-pointer flex flex-col justify-center items-center admin-item" onClick={ShowListarParticipantes}>
                    <img src={Participantes} alt="" width={"25%"} height={"50%"} />
                    <h2>Listar Participantes</h2>
                  </div>
                  <div className="border p-2 cursor-pointer flex flex-col justify-center items-center admin-item" onClick={ShowRelatorio}>
                    <img src={Relatorio} alt="" width={"25%"} height={"50%"} />
                    <h2>Relatório</h2>
                  </div>
                </div>

                <div className="border w-full bg-New3 justify-center items-center flex flex-col">
                  {home && <h1>Home</h1>}
                  {relatorio && (
                    <>
                      <img src={Logo} alt="Logo" />
                      <h1>Relatório</h1>
                      <p>Insira seu nome completo</p>
                      <input type="text" className="p-2 border mt-2" />
                    </>
                  )}
                  {addPerguntas && (
                      <>
                        <h1>Adicionar Perguntas</h1>

                        <form
                          className="flex flex-col gap-2 w-1/2"
                          onSubmit={async (e) => {
                            e.preventDefault();

                            const formData = new FormData();
                            formData.append("title", title);
                            formData.append("question", question);
                            if (image) formData.append("image", image);
                            if (audio) formData.append("audio", audio);
                            options.forEach((opt) => formData.append("options", opt));

                            try {
                              const response = await fetch("http://127.0.0.1:8000/api/criar-pergunta/", {
                                method: "POST",
                                body: formData,
                                credentials: "include", // mantém CSRF/session
                                headers: {
                                  "X-CSRFToken": csrfToken,
                                },
                              });

                              if (!response.ok) throw new Error("Erro ao criar pergunta");

                              const data = await response.json();
                              alert("Pergunta criada com sucesso! ID: " + data.id);

                              // limpa campos
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
                          {/* Título */}
                          <input
                            type="text"
                            placeholder="Título da pergunta"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="p-2 border"
                            required
                          />

                          {/* Enunciado (opcional) */}
                          <textarea
                            placeholder="Texto da pergunta (opcional)"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="p-2 border"
                          />

                          {/* Upload de imagem */}
                          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />

                          {/* Upload de áudio */}
                          <input type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files[0])} />

                          {/* Alternativas */}
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
                      </>
                    )}
                  {listarPerguntas && (
                    <div className="w-full flex flex-col gap-4 p-4">
                      <h1 className="text-2xl font-bold">Lista de Perguntas</h1>

                      {loadingPerguntas ? (
                        <p>Carregando perguntas...</p>
                      ) : (
                        <table className="w-full border-collapse border border-gray-400">
                          <thead>
                              <tr className="bg-gray-200">
                                <th className="border border-gray-400 p-2">ID</th>
                                <th className="border border-gray-400 p-2">Título</th>
                                <th className="border border-gray-400 p-2">Pergunta</th>
                                <th className="border border-gray-400 p-2">Imagem</th>
                                <th className="border border-gray-400 p-2">Áudio</th>
                                <th className="border border-gray-400 p-2">Opções</th>
                                <th className="border border-gray-400 p-2">Ações</th> {/* nova coluna */}
                              </tr>
                            </thead>
                            <tbody>
                              {listaPerguntas.map((p) => (
                                <tr key={p.id}>
                                  <td className="border border-gray-400 p-2">{p.id}</td>
                                  <td className="border border-gray-400 p-2">{p.title}</td>
                                  <td className="border border-gray-400 p-2">{p.question || "-"}</td>
                                  <td className="border border-gray-400 p-2">
                                    {p.image ? (
                                      <img src={p.image} alt="Pergunta" className="w-16 h-16 object-cover" />
                                    ) : (
                                      "-"
                                    )}
                                  </td>
                                  <td className="border border-gray-400 p-2">
                                    {p.audio ? (
                                      <audio controls className="w-32">
                                        <source src={p.audio} type="audio/mpeg" />
                                        Seu navegador não suporta áudio
                                      </audio>
                                    ) : (
                                      "-"
                                    )}
                                  </td>
                                  <td className="border border-gray-400 p-2">
                                    <ul className="list-disc pl-4">
                                      {p.options.map((opt, idx) => (
                                        <li key={idx}>{opt}</li>
                                      ))}
                                    </ul>
                                  </td>
                                  <td className="border border-gray-400 p-2 text-center">
                                    <button
                                      onClick={() => deletePergunta(p.id)}
                                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                    >
                                      Excluir
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
                    <>
                      <h1>Lista de Participantes</h1>
                      <p>(aqui virá a lista dos participantes...)</p>
                    </>
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
