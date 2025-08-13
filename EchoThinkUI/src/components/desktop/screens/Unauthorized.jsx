import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="w-screen flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-900 to-green-950 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-green-950 shadow-2xl rounded-3xl p-8 max-w-md w-full text-center"
      >
        <motion.h1
          className="text-4xl font-extrabold text-white mb-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
        >
            🚫 🚫 🚫 
        </motion.h1>
        <motion.h1
          className="text-4xl font-extrabold text-red-600 mb-4"
          initial={{ rotate: -5 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 0.5 }}
        >
          Acesso Negado
        </motion.h1>
        <p className="text-white mb-6 text-base sm:text-lg">
          Você não tem permissão para acessar esta página.
          <br />
          Talvez você precise estar logado ou ter privilégios de administrador.
        </p>
        <motion.button
          onClick={() => navigate("/")}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Voltar para Home
        </motion.button>
      </motion.div>
      <motion.p
        className="text-white text-sm mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Caso ache que isso é um erro, entre em contato com o suporte.
      </motion.p>
    </div>
  );
};

export default Unauthorized;
