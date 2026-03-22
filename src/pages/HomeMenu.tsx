import React from "react";
import { Pagina } from "../App";

type Props = {
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
  handleLogout: () => void;
};

export default function HomeMenu({ setPagina, handleLogout }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">

      <h1 className="text-3xl font-bold mb-6">
        Sistemas Corporativos
      </h1>

      <button
        onClick={() => setPagina("cadastro_chaves")}
        className="w-64 p-3 bg-blue-600 text-white rounded-xl shadow"
      >
        Cadastro de Chaves
      </button>

      <button
        onClick={() => setPagina("geo")}
        className="w-64 p-3 bg-green-600 text-white rounded-xl shadow"
      >
        Acompanhamento GEO
      </button>

      <button
        onClick={() => setPagina("proorc")}
        className="w-64 p-3 bg-purple-600 text-white rounded-xl shadow"
      >
        Proorc 2.0
      </button>

      <button
        onClick={handleLogout}
        className="w-64 p-3 bg-red-600 text-white rounded-xl shadow"
      >
        Sair
      </button>

    </div>
  );
}
