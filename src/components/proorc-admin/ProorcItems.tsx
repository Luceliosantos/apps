import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ProorcItems({ setPagina }: any) {

  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [itemSelecionado, setItemSelecionado] = useState<any>(null);

  const [descricao, setDescricao] = useState("");
  const [unidade, setUnidade] = useState("");
  const [preco, setPreco] = useState("");

  // 🔍 buscar por código
  const buscar = async (valor: string) => {

    const somenteNumeros = valor.replace(/\D/g, "");
    setBusca(somenteNumeros);

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

    setBusca(item.codigo);
    setDescricao(item.descricao || "");
    setUnidade(item.unidade || "");
    setPreco(item.preco || "");

    setResultados([]);
  };

  // ⌨️ teclado
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

    if (!busca || !descricao) {
      alert("Informe código e descrição");
      return;
    }

    if (isNaN(Number(busca))) {
      alert("Código deve ser numérico");
      return;
    }

    if (itemSelecionado) {

      await supabase
        .from("db_proorc_materiais")
        .update({
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
          codigo: busca,
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
    setBusca("");
    setDescricao("");
    setUnidade("");
    setPreco("");
    setResultados([]);
  };

  return (
    <div style={styles.container}>

      {/* TÍTULO */}
      <h2 style={styles.titulo}>Administração PROORC</h2>

      {/* BUSCA */}
      <div style={styles.card}>

        <label style={styles.label}>Código</label>
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

      {/* FORM */}
      <div style={styles.card}>

        <label style={styles.label}>Descrição</label>
        <input
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Unidade</label>
        <input
          value={unidade}
          onChange={(e) => setUnidade(e.target.value)}
          style={styles.input}
        />

        <label style={styles.label}>Preço</label>
        <input
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          style={styles.input}
        />

        <div style={styles.botoes}>
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
    padding: 20,
    background: "linear-gradient(to bottom,#1e3c72,#2a5298)",
    minHeight: "100vh"
  },

  titulo: {
    color: "#fff",
    marginBottom: 20
  },

  card: {
    background: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15
  },

  label: {
    fontWeight: "bold",
    marginBottom: 5,
    display: "block"
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

  botoes: {
    display: "flex",
    gap: 10
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
