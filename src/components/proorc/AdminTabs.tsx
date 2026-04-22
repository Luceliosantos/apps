import { useState } from "react";
import ItemManager from "./ItemManager";
import KitManager from "./KitManager";
import BulkReplace from "./BulkReplace";

export default function AdminTabs() {
  const [tab, setTab] = useState("itens");

  return (
    <div style={{ padding: 20 }}>
      <h2>Administração PROORC</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <button onClick={() => setTab("itens")}>Itens</button>
        <button onClick={() => setTab("kits")}>Kits</button>
        <button onClick={() => setTab("replace")}>Substituição</button>
      </div>

      {tab === "itens" && <ItemManager />}
      {tab === "kits" && <KitManager />}
      {tab === "replace" && <BulkReplace />}
    </div>
  );
}
