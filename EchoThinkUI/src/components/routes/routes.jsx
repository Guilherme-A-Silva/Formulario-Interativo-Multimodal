import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { isMobile } from "react-device-detect";

import LoginScreen from "../desktop/auth/loginDefault";
import QuestionsScreen from "../desktop/screens/questions";
import AdminScreen from "../desktop/screens/admin";
import ResetPasswordScreen from "../desktop/screens/reset";
import Unauthorized from "../desktop/screens/Unauthorized";
import { getCookie } from "../CSRF/csrf";
import PrivateRouteAdmin from "./PrivateRouteAdmin";

const BACKEND_URL = "https://cidivan-production.up.railway.app";

const PrivateRoute = ({ element: Element }) => {
  const [isValid, setIsValid] = useState(null);
  const [csrfToken, setCsrfToken] = useState("");

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
        <Route path="/login" element={<LoginScreen />} />
        <Route
          path="/questions"
          element={<PrivateRoute element={QuestionsScreen} />}
        />
        <Route path="/questions777" element={<QuestionsScreen />} />
        <Route path="/admin777" element={<AdminScreen />} />
        <Route
          path="/admin"
          element={<PrivateRouteAdmin element={AdminScreen} />}
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/redefinir-senha" element={<ResetPasswordScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default RoutesComponent;
