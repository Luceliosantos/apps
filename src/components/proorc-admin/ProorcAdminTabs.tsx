import { useState } from "react";
import ProorcItems from "./ProorcItems";
import ProorcKits from "./ProorcKits";
import ProorcBulkReplace from "./ProorcBulkReplace";

export default function ProorcAdminTabs() {

  const [aba, setAba] = useState<"itens" | "kits" | "substituicao">("itens");

  const estiloBotao = (nome: string) => ({
    padding: "8px 16px",
    borderRadius: 20,
    border: "none",
    background: aba === nome ? "#1e3c72" : "#ccc",
    color: aba === nome ? "#fff" : "#333",
    cursor: "pointer",
    marginRight: 10
  });

  return (
    <div style={{ padding: 20 }}>

      {/* BOTÕES */}
      <div style={{ marginBottom: 20 }}>
        <button style={estiloBotao("itens")} onClick={() => setAba("itens")}>
          Itens
        </button>

        <button style={estiloBotao("kits")} onClick={() => setAba("kits")}>
          Kits
        </button>

        <button style={estiloBotao("substituicao")} onClick={() => setAba("substituicao")}>
          Substituição
        </button>
      </div>

      {/* CONTEÚDO */}
      {aba === "itens" && <ProorcItems />}
      {aba === "kits" && <ProorcKits />}
      {aba === "substituicao" && <ProorcBulkReplace />}

    </div>
  );
}
