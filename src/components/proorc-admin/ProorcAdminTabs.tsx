import { useState } from "react";
import ProorcItems from "./ProorcItems";
import ProorcKits from "./ProorcKits";
import ProorcBulkReplace from "./ProorcBulkReplace";

export default function ProorcAdminTabs() {
  const [tab, setTab] = useState("items");

  return (
    <div style={{ padding: 20 }}>
      <h2>Administração PROORC</h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
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
