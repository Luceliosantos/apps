import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ProorcBulkReplace() {
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [total, setTotal] = useState<number | null>(null);

  const simular = async () => {
    const { data } = await supabase.rpc("count_item_usage", {
      codigo_item: origem
    });

    setTotal(data);
  };

  const executar = async () => {
    await supabase.rpc("replace_item_global", {
      codigo_antigo: origem,
      codigo_novo: destino
    });

    alert("Substituição concluída!");
  };

  return (
    <div>
      <h3>Substituição em lote</h3>

      <input placeholder="Item atual"
        value={origem}
        onChange={e => setOrigem(e.target.value)} />

      <input placeholder="Novo item"
        value={destino}
        onChange={e => setDestino(e.target.value)} />

      <button onClick={simular}>Simular</button>

      {total !== null && <p>Afeta {total} registros</p>}

      <button onClick={executar}>Confirmar</button>
    </div>
  );
}
