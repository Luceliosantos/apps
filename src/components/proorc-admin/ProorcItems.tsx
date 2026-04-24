import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ProorcItems({ setPagina }: any) {

  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [itemSelecionado, setItemSelecionado] = useState<any>(null);

  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [unidade, setUnidade] = useState("");
  const [tipo, setTipo] = useState("");

  // 🔍 autocomplete
  const buscarItens = async (texto: string) => {

    setBusca(texto);

    if (!texto) {
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

  // 🎯 selecionar item
  const selecionarItem = (item: any) => {

    setItemSelecionado(item);

    setCodigo(item.codigo || "");
    setDescricao(item.descricao || "");
    setUnidade(item.unidade || "");
    setTipo(item.tipo || "");

    setResultados([]);
    setBusca(item.descricao);
  };

  // 💾 salvar (update ou insert)
  const salvar = async () => {

    if (!descricao || !codigo) {
      alert("Informe código e descrição");
      return;
    }

    if (itemSelecionado) {

      // UPDATE
      await supabase
        .from("db_proorc_materiais")
        .update({
          codigo,
          descricao,
          unidade,
          tipo
        })
        .eq("id", itemSelecionado.id);

      alert("Item atualizado");

    } else {

      // INSERT
      await supabase
        .from("db_proorc_materiais")
        .insert({
          codigo,
          descricao,
          unidade,
          tipo
        });

      alert("Item cadastrado");

    }

    limpar();
  };

  const limpar = () => {
    setItemSelecionado(null);
    setCodigo("");
    setDescricao("");
    setUnidade("");
    setTipo("");
    setBusca("");
    setResultados([]);
  };

  return (

    <div style={styles.container}>

      {/* 🔙 topo */}
      <div style={styles.topo}>
        <button style={styles.botaoVoltar} onClick={() => setPagina("proorc")}>
          ← voltar
        </button>
        <h2>Cadastro de Itens</h2>
      </div>

      {/* 🔎 busca */}
      <div style={styles.card}>

        <input
          placeholder="Buscar item..."
          value={busca}
          onChange={(e) => buscarItens(e.target.value)}
          style={styles.input}
        />

        {resultados.length > 0 && (
          <div style={styles.lista}>
            {resultados.map((item) => (
              <div
                key={item.id}
                style={styles.itemLista}
                onClick={() => selecionarItem(item)}
              >
                <b>{item.codigo}</b> - {item.descricao}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* 📝 formulário */}
      <div style={styles.card}>

        <input
          placeholder="Código"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Unidade"
          value={unidade}
          onChange={(e) => setUnidade(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          style={styles.input}
        />

        <div style={{ display: "flex", gap: 10 }}>

          <button style={styles.botaoSalvar} onClick={salvar}>
            {itemSelecionado ? "Atualizar" : "Cadastrar"}
          </button>

          <button style={styles.botaoLimpar} onClick={limpar}>
            Limpar
          </button>

        </div>

      </div>

    </div>
  );
}

const styles: any = {

  container: {
    minHeight: "100vh",
    padding: 20,
    background: "linear-gradient(to bottom,#1e3c72,#2a5298)"
  },

  topo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#fff",
    marginBottom: 20
  },

  botaoVoltar: {
    padding: "8px 12px",
    borderRadius: 6,
    border: "none",
    background: "#c0392b",
    color: "#fff",
    cursor: "pointer"
  },

  card: {
    background: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15
  },

  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    border: "1px solid #ccc"
  },

  lista: {
    border: "1px solid #ddd",
    borderRadius: 6,
    maxHeight: 150,
    overflow: "auto"
  },

  itemLista: {
    padding: 8,
    cursor: "pointer",
    borderBottom: "1px solid #eee"
  },

  botaoSalvar: {
    padding: "10px 15px",
    border: "none",
    background: "#27ae60",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer"
  },

  botaoLimpar: {
    padding: "10px 15px",
    border: "none",
    background: "#7f8c8d",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer"
  }

};
