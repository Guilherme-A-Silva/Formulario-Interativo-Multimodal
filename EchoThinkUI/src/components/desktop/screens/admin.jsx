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
                      <input type="text" placeholder="Digite a pergunta..." className="p-2 border mt-2" />
                    </>
                  )}
                  {listarPerguntas && (
                    <>
                      <h1>Lista de Perguntas</h1>
                      <p>(aqui virá a tabela com perguntas...)</p>
                    </>
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
