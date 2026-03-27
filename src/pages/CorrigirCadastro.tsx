import { useState } from "react";
import { supabase } from "../supabase";

type Props = {
  permissoes: any[];
};

export default function CorrigirCadastro({
  permissoes
}: Props) {

  const [busca, setBusca] = useState("");
  const [lista, setLista] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);


  function temPermissao(
    sistema: string,
    tipos: string[]
  ) {

    const p =
      permissoes.find(
        x => x.sistema === sistema
      );

    if (!p) return false;

    if (p.tipo === "admin") return true;

    return tipos.includes(p.tipo);

  }


  const acessoPermitido =

    temPermissao("global", ["admin"])

    ||

    (
      temPermissao("global", ["usuario"])
      &&
      temPermissao("chaves", ["comissionador"])
    );


  async function pesquisar() {

    if (!busca) return;

    setLoading(true);

    const valor = Number(busca);

    if (isNaN(valor)) {

      setLista([]);

      setLoading(false);

      return;

    }


    const rNota = await supabase
      .from("db_chaves")
      .select("*")
      .eq("ns", valor);


    if (rNota.error) {

      alert("Erro ao buscar");

      setLoading(false);

      return;

    }


    if (rNota.data && rNota.data.length > 0) {

      setLista(rNota.data);

      setLoading(false);

      return;

    }


    const rNumero = await supabase
      .from("db_chaves")
      .select("*")
      .eq("numero", valor);


    if (rNumero.error) {

      alert("Erro ao buscar");

      setLoading(false);

      return;

    }


    setLista(rNumero.data || []);

    setLoading(false);

  }


  async function removerAssociacao(id: number) {

    if (!confirm("Remover associação da chave?")) return;


    await supabase
      .from("db_chaves")
      .update({
        ns: null,
        poste: null,
        folha: null,
        coord: null,
        usuario_associacao: null,
        data_associacao: null
      })
      .eq("id", id);


    pesquisar();

  }


  if (!acessoPermitido)
    return <div>Sem permissão</div>;


  return (

    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('/fundo.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "40px"
      }}
    >

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "30px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)"
        }}
      >

        <h2 style={{ marginBottom: "20px" }}>
          Corrigir cadastro
        </h2>


        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px"
          }}
        >

          <input
            placeholder="Digite número da chave ou nota"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") pesquisar();
            }}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc"
            }}
          />

          <button
            onClick={pesquisar}
            style={{
              padding: "10px 20px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#1f3b73",
              color: "white",
              cursor: "pointer"
            }}
          >
            Pesquisar
          </button>

        </div>


        {loading && <p>Buscando...</p>}


        {!loading && lista.length === 0 && (
          <p>Nenhum registro encontrado</p>
        )}


        {lista.length > 0 && (

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse"
            }}
          >

            <thead>

              <tr
                style={{
                  backgroundColor: "#f3f3f3"
                }}
              >

                <th style={th}>Chave</th>
                <th style={th}>Nota</th>
                <th style={th}>Poste</th>
                <th style={th}>Folha</th>
                <th style={th}>Coordenada</th>
                <th style={th}>Usuário</th>
                <th style={th}>Data Associação</th>
                <th style={th}>Associação</th>

              </tr>

            </thead>


            <tbody>

              {lista.map(item => (

                <tr key={item.id}>

                  <td style={td}>{item.numero}</td>

                  <td style={td}>{item.ns}</td>

                  <td style={td}>{item.poste}</td>

                  <td style={td}>{item.folha}</td>

                  <td style={td}>{item.coord}</td>

                  <td style={td}>{item.usuario_associacao}</td>

                  <td style={td}>
                    {item.data_associacao
                      ? new Date(item.data_associacao)
                        .toLocaleString("pt-BR")
                      : ""
                    }
                  </td>

                  <td style={td}>

                    <button
                      onClick={() =>
                        removerAssociacao(item.id)
                      }
                      style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: "#c0392b",
                        color: "white",
                        cursor: "pointer"
                      }}
                    >
                      Remover
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>

  );

}


const th = {
  padding: "10px",
  textAlign: "left",
  borderBottom: "1px solid #ddd"
};


const td = {
  padding: "10px",
  borderBottom: "1px solid #eee"
};
