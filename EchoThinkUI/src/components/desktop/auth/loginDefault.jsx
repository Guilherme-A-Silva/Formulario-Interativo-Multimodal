import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getCsrfToken } from "../../CSRF/csrf";
import { GetIMG } from "../../scripts/GetIMG";
import "../styles/global.css";
import "../styles/loginDefault.css";

const LoginDefault = () => {
  const [Error, setError] = useState(true);
  const [Icon, setIcon] = useState("");
  const [Logo, setLogo] = useState("");
  const [Login, setLogin] = useState(false);
  const [Register, setRegister] = useState(true);
  const [Esqueceu, setEsqueceu] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [formData, setFormData] = useState({ field1: "", field2: "" });
  const navigate = useNavigate();

  const [form, setForm] = useState({
    INS_Email: "",
    INS_Password: "",
    INS_Nome: "",
    INS_CNPJ: "",
    INS_Rua: "",
    INS_Numero: "",
    INS_Bairro: "",
    INS_Cidade: "",
    INS_Estado: "",
    INS_Cep: "",
  });

  const [ErrorText, setErrorText] = useState({
    Text: "",
  });

  useEffect(() => {
    document.title = "EchoThink";
    const link = document.createElement("link");
    link.rel = "icon";
    link.href = Icon;
    document.head.appendChild(link);
    const fetchCsrfToken = async () => {
      const token = getCsrfToken();
      setCsrfToken(token);
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
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const LoginSubmit = (event) => {
    event.preventDefault();
    fetch("/LoginUserProfileView", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify(formData),
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.error || "Network response was not ok");
          });
        }
        return response.json();
      })
      .then((response) => {
        return fetch("/ValidateTokenView", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
          },
          body: JSON.stringify({ token: response.token }),
          credentials: "include",
        });
      })
      .then((validationResponse) => {
        return validationResponse.json().then((data) => {
          if (!validationResponse.ok) {
            throw new Error(data.error || "Token validation failed");
          }
          navigate("/home");
          localStorage.setItem("token", data.token);
        });
      })
      .catch((error) => {
        console.error("Erro:", error)
        setError(true)
        setErrorText("Erro ao logar no Sistema. Tente novamente mais tarde.")
      });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const newValue = value;
    setForm({ ...form, [name]: newValue });
  };

  const RegisterSubmit = (event) => {
    event.preventDefault();
    fetch("/RegisterUserProfileView", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      body: JSON.stringify(form),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

    const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    fetch('https://cidivan-production.up.railway.app/api/hello/')
      .then(res => res.json())
      .then(data => setMensagem(data.message))
      .catch(err => console.error(err));
  }, []);

  return (
    <section className="w-full h-full flex flex-col bg-Primary justify-center items-center">
      <section className="w-screen h-full flex items-center justify-center">
        {Login && (
          <div className="w-6/12 h-screen flex items-center justify-center">
            <div className="border w-full items-center justify-center flex flex-col border-Config">
              <div className="border w-full items-center justify-center flex flex-col bg-Secundary">
                <div className="p-4 text-xl">
                Mensagem do backend: {mensagem}
              </div>
                <h1>Login</h1>
                <h2 className="Input">Insira seu Email</h2>
                <input type="text" className="bg-Input" />
                <h2 className="Input">Insira sua senha</h2>
                <input type="password" className="bg-Input" />
                <button className="bg-Button">Logar</button>
                <a href="#" onClick={ShowEsqueceu} className="mt hover:text-inherit">Esqueceu sua senha?</a>
                <a href="#" onClick={ShowRegister} className="mb hover:text-inherit">Não tem uma conta? Clique aqui</a>
              </div>
            </div>
          </div>
        )}
        {Register && (
          <div className="w-6/12 h-screen flex items-center justify-center">
            <div className="border w-full items-center justify-center flex flex-col border-Config">
              <div className="border w-full items-center justify-center flex flex-col bg-Secundary">
                <img src={Logo} alt="" width={10} height={10}/>
                <h1>Cadastro</h1>
                <h2 className="Input">Insira seu nome completo</h2>
                <input type="text" className="bg-Input" />
                <h2 className="Input">Insira seu telefone</h2>
                <input type="tel" className="bg-Input" />
                <h2 className="Input">Insira seu endereço</h2>
                <input type="text" className="bg-Input" />
                <div className="flex w-1/2 justify-between items-center force">
                  <div className="flex flex-col w-2/5">
                  <h2 className="InputCol">Insira sua idade</h2>
                  <input type="text" className="bg-InputCol" />
                  </div>

                  <div className="flex flex-col w-2/5">
                  <h2 className="InputCol">Insira seu genero</h2>
                  <input type="text" className="bg-InputCol" />
                  </div>
                </div>
                <h2 className="Input">Insira seu Email</h2>
                <input type="text" className="bg-Input" />
                <button className="bg-Button">CADASTRAR</button>
                <a href="#" onClick={ShowLogin} className="mb hover:text-inherit">Já tenho uma conta.</a>
              </div>
            </div>
          </div>
        )}
        {Esqueceu && (
          <div className="w-6/12 h-screen flex items-center justify-center">
            <div className="border w-full items-center justify-center flex flex-col border-Config">
              <div className="border w-full items-center justify-center flex flex-col bg-Secundary">
                <img src={Logo} alt="" />
                <h1>Esqueci a senha</h1>
                <h2 className="Input">Insira seu Email</h2>
                <input type="text" className="bg-Input" />
                <button className="bg-Button">Recuperar</button>
                <a href="#" onClick={ShowLogin} className="mt hover:text-inherit">Possui uma conta? Clique aqui</a>
                <a href="#" onClick={ShowRegister} className="mb hover:text-inherit">Não tem uma conta? Clique aqui</a>
              </div>
            </div>
          </div>
        )}
      </section>
    </section>
  );
};

export default LoginDefault;
