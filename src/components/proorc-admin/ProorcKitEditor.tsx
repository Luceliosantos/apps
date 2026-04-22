import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ProorcKitEditor() {
  const [kits, setKits] = useState<any[]>([]);
  const [kitSelecionado, setKitSelecionado] = useState<any>(null);
  const [itens, setItens] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [quantidade, setQuantidade] = useState(1);

  // 🔹 carregar kits
  const loadKits = async () => {
    const { data } = await supabase
      .from("db_proorc_kits")
      .select("*")
      .order("codigo_kit");

    setKits(data || []);
  };

  // 🔹 carregar itens do kit
  const loadItens = async (kitId: string) => {
    const { data } = await supabase
      .from("vw_proorc_kits")
      .select("*")
      .eq("kit_id", kitId);

    setItens(data || []);
  };

  useEffect(() => {
    loadKits();
  }, []);

  // 🔍 busca inteligente
  const buscarMateriais = async (texto: string) => {
    setBusca(texto);

    if (texto.length < 2) {
      setResultados([]);
      return;
    }

    const { data } = await supabase
      .from("db_proorc_materiais")
      .select("*")
      .ilike("descricao", `%${texto}%`)
      .limit(10);

    setResultados(data || []);
  };

  // ➕ adicionar item ao kit
  const adicionarItem = async (item: any) => {
    if (!kitSelecionado) return;

    await supabase.from("db_proorc_kit_itens").insert({
      kit_id: kitSelecionado.id,
      item_id: item.id,
      quantidade
    });

    setBusca("");
    setResultados([]);
    setQuantidade(1);

    loadItens(kitSelecionado.id);
  };

  // ❌ remover item
  const removerItem = async (itemId: string) => {
    await supabase
      .from("db_proorc_kit_itens")
      .delete()
      .eq("kit_id", kitSelecionado.id)
      .eq("item_id", itemId);

    loadItens(kitSelecionado.id);
  };

  return (
    <div>
      <h3>Editor de Kit</h3>

      {/* SELECT KIT */}
      <select
        onChange={(e) => {
          const kit = kits.find(k => k.id === e.target.value);
          setKitSelecionado(kit);
          loadItens(kit.id);
        }}
      >
        <option>Selecione um kit</option>
        {kits.map(k => (
          <option key={k.id} value={k.id}>
            {k.codigo_kit} - {k.descricao}
          </option>
        ))}
      </select>

      {/* BUSCA MATERIAL */}
      {kitSelecionado && (
        <>
          <h4>Adicionar Item</h4>

          <input
            placeholder="Buscar material..."
            value={busca}
            onChange={(e) => buscarMateriais(e.target.value)}
          />

          <input
            type="number"
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
          />

          {/* RESULTADOS */}
          <ul>
            {resultados.map(r => (
              <li key={r.id}>
                {r.codigo} - {r.descricao}
                <button onClick={() => adicionarItem(r)}>
                  Adicionar
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* ITENS DO KIT */}
      {kitSelecionado && (
        <>
          <h4>Itens do Kit</h4>

          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Descrição</th>
                <th>Qtd</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {itens.map(i => (
                <tr key={i.item_id}>
                  <td>{i.codigo_item}</td>
                  <td>{i.descricao_item}</td>
                  <td>{i.quantidade}</td>
                  <td>
                    <button onClick={() => removerItem(i.item_id)}>
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
