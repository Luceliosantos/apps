import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProorcKitForm() {
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");

  const criar = async () => {
    await supabase.from("db_proorc_kits").insert({
      codigo_kit: codigo,
      descricao
    });

    setCodigo("");
    setDescricao("");
  };

  return (
    <div>
      <h3>Criar Kit</h3>

      <input placeholder="Código do Kit"
        value={codigo}
        onChange={e => setCodigo(e.target.value)} />

      <input placeholder="Descrição"
        value={descricao}
        onChange={e => setDescricao(e.target.value)} />

      <button onClick={criar}>Criar</button>
    </div>
  );
}
