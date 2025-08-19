import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCSRFToken } from "../../CSRF/csrf";
import { GetIMG } from "../../scripts/GetIMG";
import "../styles/global.css";
import "../styles/loginDefault.css";

const LoginDefault = () => {
  const [Error, setError] = useState(true);
  const [Icon, setIcon] = useState("");
  const [Logo, setLogo] = useState("");
  const [Login, setLogin] = useState(true);
  const [Register, setRegister] = useState(false);
  const [Esqueceu, setEsqueceu] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [formData, setFormData] = useState({ field1: "", field2: "" });
  const navigate = useNavigate();
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

  if (isValid === true) {
    navigate("/questions");
  }

const [form, setForm] = useState({
  nome: "",
  username: "",
  telefone: "",
  endereco: "",
  idade: "",
  genero: "",
  email: "",
  password: "",
  consentimento: "", // novo campo
});


  const [ErrorText, setErrorText] = useState({
    Text: "",
  });

  useEffect(() => {
    fetch("https://cidivan-production.up.railway.app/api/csrf/", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Token do backend:", data.csrfToken);
        setCsrfToken(data.csrfToken);
      })
      .catch((err) => console.error("Erro ao buscar CSRF:", err));
  }, []);

  useEffect(() => {
    document.title = "EchoThink";
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = Icon;
    document.head.appendChild(link);
    const loadImages = async () => {
      const Icon = GetIMG("EchoThink.ico");
      const Logo = GetIMG("Logo.png");
      setIcon(Icon);
      setLogo(Logo);
    };
    loadImages();
  }, []);

  const [email, setEmail] = useState("");

  const handleSubmitReset = (e) => {
    e.preventDefault();
    solicitarRedefinicaoSenha(email);
  };

  async function solicitarRedefinicaoSenha(email) {
  try {
    const response = await fetch("https://cidivan-production.up.railway.app/api/auth/solicitar-redefinicao/", {
      method: "POST",
      credentials: "include", 
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({ email: email })
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.mensagem || "Se este email existir, você receberá instruções.");
    } else {
      alert(data.erro || "Erro ao solicitar redefinição de senha.");
    }
  } catch (error) {
    alert("❌ Erro de conexão com o servidor.");
  }
}


  const ShowLogin = (event) => {
    event.preventDefault();
    setLogin(true);
    setRegister(false);
    setEsqueceu(false);
  };

  const ShowRegister = (event) => {
    event.preventDefault();
    setLogin(false);
    setEsqueceu(false);
    setRegister(true);
  };

  const ShowEsqueceu = (event) => {
    event.preventDefault();
    setLogin(false);
    setEsqueceu(true);
    setRegister(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você pode usar o form para enviar os dados
    console.log(form);
    RegisterSubmit(e);
  };

  const LoginSubmit = (event) => {
    event.preventDefault();
    // Verifica se o CSRF token está disponível
    if (!csrfToken) {
      console.error("CSRF token is not available");
      return;
    }
    fetch("https://cidivan-production.up.railway.app/api/auth/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify({
        username: form.username,
        password: form.password,
      }),
      credentials: "include", // importante para manter sessão e cookie CSRF
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Success:", data);
        // você pode redirecionar ou mostrar mensagem aqui
        navigate("/questions"); // Redireciona para a página de dashboard após login
      })
      .catch((error) => {
        console.error("Error:", error);
        setErrorText({
          Text: "Erro ao fazer login. Verifique suas credenciais.",
        });
      });
  };

  const RegisterSubmit = (event) => {
    event.preventDefault();

    // Verifica se o CSRF token está disponível
    if (!csrfToken) {
      console.error("CSRF token is not available");
      return;
    }
    // Verifica se todos os campos obrigatórios estão preenchidos
    if (
      !form.nome ||
      !form.telefone ||
      !form.endereco ||
      !form.idade ||
      !form.genero ||
      !form.email ||
      !form.password ||
      !form.username
    ) {
      console.error("Todos os campos são obrigatórios.");
      return;
    }
    // Verifica se o email é válido
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.email)) {
      console.error("Email inválido.");
      return;
    }
    fetch("https://cidivan-production.up.railway.app/api/auth/register/", {
      // ajuste a URL conforme seu backend
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify(form),
      credentials: "include", // importante para manter sessão e cookie CSRF
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        alert("Cadastro realizado com sucesso! Você já pode fazer login.");
        reload(); // recarrega a página para limpar o formulário
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const reload = () => {
    setForm({
      username: "",
      nome: "",
      telefone: "",
      endereco: "",
      idade: "",
      genero: "",
      email: "",
      password: "",
    });
    setErrorText({ Text: "" });
    setLogin(true);
    setRegister(false);
    setEsqueceu(false);
    window.location.reload();
  };

  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    fetch("https://cidivan-production.up.railway.app/api/hello/")
      .then((res) => res.json())
      .then((data) => setMensagem(data.message))
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className="w-full h-full flex flex-col bg-Primary justify-center items-center">
      <section className="w-screen h-full flex items-center justify-center">
        {Login && (
          <div className="w-full flex justify-center items-center min-h-screen p-4 shadow-lg">
            <div className="responsive-container shadow-lg">
              <div className="w-full items-center justify-center p-6 resposive-containerblack shadow-lg">
              <h1 className="text-center">Login</h1>
              <form onSubmit={LoginSubmit}>
                <h2>Insira seu Username</h2>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
                <h2>Insira sua senha</h2>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button type="submit">Logar</button>
              </form>
              <div className="flex flex-col items-center justify-center text-white gap-2 mt-4">
              <a href="#" onClick={ShowEsqueceu}>
                Esqueceu sua senha?
              </a>
              <a href="#" onClick={ShowRegister}>
                Não tem uma conta? Clique aqui
              </a>
              </div>
            </div>
          </div>
          </div>
        )}
        {Register && (
            <div className="bg-Primary w-full flex justify-center items-center min-h-screen p-4 bg-gray-100">
              <div className="border-Config w-full max-w-2xl rounded-lg shadow-lg">
              <div className="bg-Secundary  w-full max-w-2xl rounded-lg shadow-lg p-6">
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col gap-4"
                >
                  <h1 className="text-2xl font-bold text-center text-white">Cadastro</h1>

                  {/* Nome completo */}
                  <div>
                    <label className="block font-medium text-white">Nome completo</label>
                    <input
                      type="text"
                      name="nome"
                      className="w-full p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={form.nome}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block font-medium text-white">Username</label>
                    <input
                      type="text"
                      name="username"
                      className="w-full p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={form.username}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Telefone */}
                  <div>
                    <label className="block font-medium text-white">Telefone</label>
                    <input
                      type="tel"
                      name="telefone"
                      className="w-full p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={form.telefone}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Endereço */}
                  <div>
                    <label className="block font-medium text-white">Endereço</label>
                    <input
                      type="text"
                      name="endereco"
                      className="w-full p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={form.endereco}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Idade e Gênero - lado a lado no desktop */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block font-medium text-white">Idade</label>
                      <input
                        type="text"
                        name="idade"
                        className="w-full p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={form.idade}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block font-medium text-white">Gênero</label>
                      <input
                        type="text"
                        name="genero"
                        className="w-full p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                        value={form.genero}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-medium text-white">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="w-full p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Senha */}
                  <div>
                    <label className="block font-medium text-white">Senha</label>
                    <input
                      type="password"
                      name="password"
                      className="w-full p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                      value={form.password}
                      onChange={handleChange}
                    />
                  </div>
                  {/* Consentimento */}
                  <div>
                    <label className="block font-medium text-white">
                      Você permite o uso dos seus dados?
                    </label>
                    <select
                      name="consentimento"
                      value={form.consentimento}
                      onChange={handleChange}
                      className="w-full p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Selecione uma opção</option>
                      <option value="sim">Sim, eu permito</option>
                      <option value="nao">Não, não permito</option>
                    </select>
                  </div>
                  {/* Botão */}
                  <button
                    type="submit"
                    className={`w-full text-white font-semibold p-2 rounded-lg transition ${
                      form.consentimento === "sim"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                    disabled={form.consentimento !== "sim"}
                  >
                    Cadastrar
                  </button>

                  {/* Link para login */}
                  <p className="text-center text-sm text-white">
                    Já tem uma conta?{" "}
                    <a
                      href="#"
                      onClick={ShowLogin}
                      className="text-green-600 hover:underline"
                    >
                      Entrar
                    </a>
                  </p>
                </form>
              </div>
              </div>
            </div>
          )}
        {Esqueceu && (
          <div className="bg-Primary w-full min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="border-Config w-full max-w-md rounded-lg shadow-lg">
            <div className="bg-Secundary w-full max-w-md bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
              {/* Logo */}
              <img src={Logo} alt="Logo" className="w-24 h-24 mb-4" />

              <h1 className="text-2xl font-bold text-white mb-6">Esqueci a senha</h1>

              {/* Formulário */}
              <form
                onSubmit={handleSubmitReset}
                className="w-full flex flex-col gap-4 items-center"
              >
                <div className="w-full">
                  <label className="block text-white font-medium mb-1">Email</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu email"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-green-600 text-white font-semibold p-2 rounded-lg hover:bg-green-700 transition"
                >
                  Recuperar
                </button>
              </form>

              {/* Links */}
              <div className="flex flex-col gap-2 mt-6 text-sm text-white">
                <a
                  href="#"
                  onClick={ShowLogin}
                  className="hover:text-green-600 hover:underline text-center text-white" 
                >
                  Já possui uma conta? Clique aqui
                </a>
                <a
                  href="#"
                  onClick={ShowRegister}
                  className="hover:text-green-600 hover:underline text-center text-white"
                >
                  Não tem uma conta? Clique aqui
                </a>
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
