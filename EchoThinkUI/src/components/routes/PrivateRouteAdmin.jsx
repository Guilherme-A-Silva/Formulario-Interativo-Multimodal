import React, { useState, useEffect } from "react";
import Unauthorized from "../desktop/screens/Unauthorized"; // ou uma tela específica de "sem acesso"

const BACKEND_URL = "https://cidivan-production.up.railway.app";

const PrivateRouteAdmin = ({ element: Element }) => {
  const [isValid, setIsValid] = useState(null);

  useEffect(() => {
    const validateAdmin = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/me/`, {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          setIsValid(false);
          return;
        }

        const data = await response.json();
        // Verifica se está logado e se é admin
        if (data.tipo === true) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      } catch (error) {
        console.error("Erro ao validar admin:", error);
        setIsValid(false);
      }
    };

    validateAdmin();
  }, []);

  if (isValid === null) return <div>Carregando...</div>;

  return isValid ? <Element /> : <Unauthorized />;
};

export default PrivateRouteAdmin;
