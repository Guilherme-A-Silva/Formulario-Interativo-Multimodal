import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { isMobile } from "react-device-detect";

import LoginScreen from "../desktop/auth/loginDefault";
import QuestionsScreen from "../desktop/screens/questions";
import AdminScreen from "../desktop/screens/admin";
import Unauthorized from "../desktop/screens/admin";
import { getCookie } from "../CSRF/csrf";

const BACKEND_URL = "https://cidivan-production.up.railway.app";

const PrivateRoute = ({ element: Element }) => {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const validateSession = async () => {
      try {
        // Primeiro: obter o CSRF token (o cookie será setado aqui)
        await fetch(`${BACKEND_URL}/api/csrf/`, {
          method: "GET",
          credentials: "include",
        });

        const csrfToken = getCookie("csrftoken"); // ou pegue via cookie se o backend não retornar no corpo
        if (!csrfToken) {
          setIsValid(false);
          return;
        }

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

  if (isValid === null) {
    return <div>Carregando...</div>; // loading temporário
  }

  return isValid ? <Element /> : <Unauthorized />;
};
// Componente de Rotas
function RoutesComponent() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/questions" element={<QuestionsScreen />} />
        <Route
          path="/questions2"
          element={<PrivateRoute element={QuestionsScreen} />}
        />
        <Route path="/admin" element={<AdminScreen />} />
      </Routes>
    </BrowserRouter>
  );
}


export default RoutesComponent;
