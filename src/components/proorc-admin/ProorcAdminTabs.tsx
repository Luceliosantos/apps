import { useState } from "react";
import ProorcItems from "./ProorcItems";
import ProorcKits from "./ProorcKits";
import ProorcBulkReplace from "./ProorcBulkReplace";

export default function ProorcAdminTabs() {
  const [tab, setTab] = useState("items");

  return (
    <div style={{ padding: 20 }}>
      <h2>Administração PROORC</h2>

      <div 
        style={{  padding: "8px 16px",
  borderRadius: 20,
  border: "none",
  background: ativo ? "#1e3c72" : "#ccc",
  color: ativo ? "#fff" : "#333",
  cursor: "pointer",
  marginRight: 10
}}>
        <button onClick={() => setTab("items")}>Itens</button>
        <button onClick={() => setTab("kits")}>Kits</button>
        <button onClick={() => setTab("replace")}>Substituição</button>
      </div>

      {tab === "items" && <ProorcItems />}
      {tab === "kits" && <ProorcKits />}
      {tab === "replace" && <ProorcBulkReplace />}
    </div>
  );
}
