import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { isMobile } from "react-device-detect";

import LoginScreen from "../desktop/auth/loginDefault";
import QuestionsScreen from "../desktop/screens/questions";
import AdminScreen from "../desktop/screens/admin";
import { getCsrfToken } from "../CSRF/csrf";

const PrivateRoute = ({ element: Element }) => {
  const [csrfToken, setCsrfToken] = useState("");
  const [isValid, setIsValid] = useState(null); // Estado para controlar a validade do token
  const token = localStorage.getItem("token");

  useEffect(() => {
    document.title = "Delivery - Register";

    const fetchCsrfToken = async () => {
      const token = getCsrfToken();
      setCsrfToken(token);
    };

    fetchCsrfToken();
  }, []);

  useEffect(() => {
    if (csrfToken && token) {
      const sendToken = async () => {
        try {
          const response = await fetch("/ValidateTokenView", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": csrfToken,
            },
            body: JSON.stringify({ token }),
            credentials: "include",
          });

          const Validator = await response.json();
          setIsValid(Validator.valid === 1); // Atualiza o estado com a validade do token
        } catch (error) {
          console.error("Erro ao enviar o token:", error);
        }
      };

      sendToken();
    }
  }, [csrfToken, token]); // Adiciona csrfToken e token como dependências

  if (isValid === null) {
    return <Unauthorized />; // Exibe um carregando enquanto a verificação está em andamento
  }

  return isValid ? <Element /> : <Unauthorized />; // Renderiza Element ou redireciona
};
// Componente de Rotas
function RoutesComponent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={isMobile ? <LoginScreen /> : <LoginScreen />}
        />
        <Route
          path="/questions"
          element={isMobile ? <QuestionsScreen /> : <QuestionsScreen />}
        />
        <Route
          path="/questions2"
          element={
            isMobile ? (
              <PrivateRoute element={QuestionsScreen} />
            ) : (
              <PrivateRoute element={QuestionsScreen} />
            )
          }
        />
        <Route
          path="/admin"
          element={isMobile ? <AdminScreen /> : <AdminScreen />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default RoutesComponent;
