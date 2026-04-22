import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ProorcItemForm from "./ProorcItemForm";

export default function ProorcItems() {
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("db_proorc_materiais")
      .select("*")
      .limit(50);

    setItems(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <ProorcItemForm onSaved={load} />

      <h3>Itens cadastrados</h3>

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Descrição</th>
          </tr>
        </thead>
        <tbody>
          {items.map(i => (
            <tr key={i.id}>
              <td>{i.codigo}</td>
              <td>{i.descricao}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
