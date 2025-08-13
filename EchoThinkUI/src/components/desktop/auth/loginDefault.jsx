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
    username: "",
    nome: "",
    telefone: "",
    endereco: "",
    idade: "",
    genero: "",
    email: "",
    password: "",
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
          <div className="w-full flex justify-center items-center min-h-screen p-4">
            <div className="responsive-container">
              <div className="w-full items-center justify-center resposive-containerblack">
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
          <div className="w-full flex justify-center items-center min-h-screen p-4">
            <div className="responsive-containerRegister">
            <form
              onSubmit={handleSubmit}
              className="w-full items-center justify-center flex flex-col border-Config"
            >
              <div className="w-full items-center justify-center flex flex-col bg-Secundary">
                <img src={Logo} alt="" width={"10%"} height={"10%"} />
                <h1>Cadastro</h1>

                <h2 className="Input">Insira seu nome completo</h2>
                <input
                  type="text"
                  name="nome"
                  className="bg-Input"
                  value={form.nome}
                  onChange={handleChange}
                />
                <h2 className="Input">Insira seu username</h2>
                <input 
                  type="text"
                  name="username"
                  className="bg-Input"
                  value={form.username}
                  onChange={handleChange}
                />
                <h2 className="Input">Insira seu telefone</h2>
                <input
                  type="tel"
                  name="telefone"
                  className="bg-Input"
                  value={form.telefone}
                  onChange={handleChange}
                />

                <h2 className="Input">Insira seu endereço</h2>
                <input
                  type="text"
                  name="endereco"
                  className="bg-Input"
                  value={form.endereco}
                  onChange={handleChange}
                />

                <div className="flex w-1/2 justify-between items-center">
                  <div className="flex flex-col w-2/5">
                    <h2 className="InputCol">Insira sua idade</h2>
                    <input
                      type="text"
                      name="idade"
                      className="bg-InputCol"
                      value={form.idade}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="flex flex-col w-2/5">
                    <h2 className="InputCol">Insira seu gênero</h2>
                    <input
                      type="text"
                      name="genero"
                      className="bg-InputCol"
                      value={form.genero}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <h2 className="Input">Insira seu Email</h2>
                <input
                  type="email"
                  name="email"
                  className="bg-Input"
                  value={form.email}
                  onChange={handleChange}
                />

                <h2 className="Input">Insira sua senha</h2>
                <input
                  type="password"
                  name="password"
                  className="bg-Input"
                  value={form.password}
                  onChange={handleChange}
                />

                <button type="submit" className="bg-Button">
                  CADASTRAR
                </button>

                <a
                  href="#"
                  onClick={ShowLogin}
                  className="mb hover:text-inherit"
                >
                  Já tenho uma conta.
                </a>
              </div>
            </form>
            </div>
          </div>
        )}
        {Esqueceu && (
          <div className="w-full h-screen flex items-center justify-center ">
            <div className="responsive-containerEsqueceu">
            <div className="w-full items-center justify-center flex flex-col border-Config">
              <div className="w-full items-center justify-center flex flex-col bg-Secundary">
                <img src={Logo} alt="" width={"10%"} height={"10%"} />
                <h1>Esqueci a senha</h1>
                <form onSubmit={handleSubmitReset} className="space-y-4 justify-start w-full items-center flex flex-col">
                <h2 className="Input">Insira seu Email</h2>
                <input type="text" className="bg-white p-2 rounded-lg w-10/12 text-black " value={email} onChange={(e) => setEmail(e.target.value)}/>
                <button className="bg-Button" type="submit">Recuperar</button>
                </form>
                <a
                  href="#"
                  onClick={ShowLogin}
                  className="mt hover:text-inherit"
                >
                  Possui uma conta? Clique aqui
                </a>
                <a
                  href="#"
                  onClick={ShowRegister}
                  className="mb hover:text-inherit"
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
