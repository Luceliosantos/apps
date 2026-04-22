import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProorcItemForm({ onSaved }: any) {
  const [form, setForm] = useState({
    codigo: "",
    descricao: "",
    unidade: "",
    preco: 0
  });

  const salvar = async () => {
    await supabase.from("db_proorc_materiais").insert(form);
    setForm({ codigo: "", descricao: "", unidade: "", preco: 0 });
    onSaved();
  };

  return (
    <div>
      <h3>Novo Item</h3>

      <input placeholder="Código"
        value={form.codigo}
        onChange={e => setForm({ ...form, codigo: e.target.value })} />

      <input placeholder="Descrição"
        value={form.descricao}
        onChange={e => setForm({ ...form, descricao: e.target.value })} />

      <input placeholder="Unidade"
        value={form.unidade}
        onChange={e => setForm({ ...form, unidade: e.target.value })} />

      <input type="number" placeholder="Preço"
        onChange={e => setForm({ ...form, preco: Number(e.target.value) })} />

      <button onClick={salvar}>Salvar</button>
    </div>
  );
}
