import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ProorcItems({ setPagina }: any) {

  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [itemSelecionado, setItemSelecionado] = useState<any>(null);

  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [unidade, setUnidade] = useState("");
  const [preco, setPreco] = useState("");

  // 🔍 busca por código (somente números)
  const buscar = async (valor: string) => {

    // só permite números
    const somenteNumeros = valor.replace(/\D/g, "");
    setBusca(somenteNumeros);
    setCodigo(somenteNumeros);

    if (!somenteNumeros) {
      limpar();
      return;
    }

    const { data } = await supabase
      .from("db_proorc_materiais")
      .select("*")
      .ilike("codigo", `%${somenteNumeros}%`)
      .limit(10);

    setResultados(data || []);
  };

  // 🎯 selecionar item
  const selecionar = (item: any) => {

    setItemSelecionado(item);

    setCodigo(item.codigo || "");
    setDescricao(item.descricao || "");
    setUnidade(item.unidade || "");
    setPreco(item.preco || "");

    setResultados([]);
  };

  // ⌨️ comportamento teclado
  const handleKeyDown = (e: any) => {

    if (e.key === "Enter") {
      e.preventDefault();
      if (resultados.length > 0) {
        selecionar(resultados[0]);
      }
    }

    if (e.key === "Tab") {
      setResultados([]);
    }
  };

  // 💾 salvar
  const salvar = async () => {

    if (!codigo || !descricao) {
      alert("Informe código e descrição");
      return;
    }

    if (isNaN(Number(codigo))) {
      alert("Código deve ser numérico");
      return;
    }

    if (itemSelecionado) {

      await supabase
        .from("db_proorc_materiais")
        .update({
          codigo,
          descricao,
          unidade,
          preco,
          tipo: "ITEM"
        })
        .eq("id", itemSelecionado.id);

      alert("Atualizado");

    } else {

      await supabase
        .from("db_proorc_materiais")
        .insert({
          codigo,
          descricao,
          unidade,
          preco,
          tipo: "ITEM"
        });

      alert("Cadastrado");

    }

    limpar();
  };

  const limpar = () => {
    setItemSelecionado(null);
    setCodigo("");
    setDescricao("");
    setUnidade("");
    setPreco("");
    setBusca("");
    setResultados([]);
  };

  return (

    <div style={styles.container}>

      {/* topo */}
      <div style={styles.topo}>
        <div></div>

        <button
          style={styles.botaoVoltar}
          onClick={() => setPagina("proorc")}
        >
          Voltar
        </button>
      </div>

      {/* busca */}
      <div style={styles.card}>

        <input
          placeholder="Digite o código..."
          value={busca}
          onChange={(e) => buscar(e.target.value)}
          onKeyDown={handleKeyDown}
          style={styles.input}
        />

        {resultados.length > 0 && (
          <div style={styles.lista}>
            {resultados.map((item) => (
              <div
                key={item.id}
                style={styles.itemLista}
                onClick={() => selecionar(item)}
              >
                <b>{item.codigo}</b> - {item.descricao}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* formulário */}
      <div style={styles.card}>

        <input
          placeholder="Código"
          value={codigo}
          onChange={(e) => buscar(e.target.value)}
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
          placeholder="Preço"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          style={styles.input}
        />

        <input
          value="ITEM"
          disabled
          style={{ ...styles.input, background: "#eee" }}
        />

        <div style={{ display: "flex", gap: 10 }}>

          <button style={styles.salvar} onClick={salvar}>
            {itemSelecionado ? "Atualizar" : "Cadastrar"}
          </button>

          <button style={styles.limpar} onClick={limpar}>
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
    justifyContent: "space-between",
    marginBottom: 20
  },

  botaoVoltar: {
    background: "#1e3c72",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 6,
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

  salvar: {
    background: "#27ae60",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    borderRadius: 6,
    cursor: "pointer"
  },

  limpar: {
    background: "#7f8c8d",
    color: "#fff",
    border: "none",
    padding: "10px 15px",
    borderRadius: 6,
    cursor: "pointer"
  }

};
