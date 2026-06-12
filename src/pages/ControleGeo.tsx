import { Pagina } from "../App";

type Props = {
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
};

export default function ControleGeo({ setPagina }: Props) {
  return (
    <div
      style={{
        padding: 20,
        color: "white",
        minHeight: "100vh",
        background: "#1e3c72"
      }}
    >
      <h1>Controle GEO</h1>

      <button
        onClick={() => setPagina("menu")}
      >
        Voltar
      </button>
    </div>
  );
}
