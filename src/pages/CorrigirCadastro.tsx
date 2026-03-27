import { useState } from "react";
import { supabase } from "../supabase";
import { Pagina } from "../App";

type Props = {
  permissoes: any[];
  setPagina: React.Dispatch<React.SetStateAction<Pagina>>;
};

export default function CorrigirCadastro({
  permissoes,
  setPagina
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
        (x) => x.sistema === sistema
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


    if (rNota.data && rNota.data.length > 0) {

      setLista(rNota.data);

      setLoading(false);

      return;

    }


    const rNumero = await supabase
      .from("db_chaves")
      .select("*")
      .eq("numero", valor);


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
        flh: null,
        coord: null,
        usu_ass: null,
        dt_ass_db: null

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
        padding: "40px"
      }}
    >

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: "10px",
          padding: "30px"
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px"
          }}
        >

          <h2>Corrigir cadastro</h2>

          <button
            onClick={() => setPagina("home")}
            style={{
              backgroundColor: "#c0392b",
              color: "white",
              border: "none",
              padding: "8px 15px",
              borderRadius: "6px"
            }}
          >
            Home
          </button>

        </div>


        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px"
          }}
        >

          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Digite chave ou nota"
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
              backgroundColor: "#1f3b73",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px"
            }}
          >
            Pesquisar
          </button>

        </div>


        {loading && <p>Buscando...</p>}


        {lista.length > 0 && (

          <table style={{ width: "100%" }}>

            <thead>

              <tr>

                <th>Chave</th>
                <th>Nota</th>
                <th>Poste</th>
                <th>Folha</th>
                <th>Coordenada</th>
                <th>Usuário</th>
                <th>Data Associação</th>
                <th>Associação</th>

              </tr>

            </thead>


            <tbody>

              {lista.map((item) => (

                <tr key={item.id}>

                  <td>{item.numero}</td>

                  <td>{item.ns}</td>

                  <td>{item.poste}</td>

                  <td>{item.flh}</td>

                  <td>{item.coord}</td>

                  <td>{item.usu_ass}</td>

                  <td>
                    {item.dt_ass_db
                      ? new Date(item.dt_ass_db)
                          .toLocaleString("pt-BR")
                      : ""}
                  </td>

                  <td>

                    <button
                      onClick={() =>
                        removerAssociacao(item.id)
                      }
                      style={{
                        backgroundColor: "#c0392b",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px"
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
