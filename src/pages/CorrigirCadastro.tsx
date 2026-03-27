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

    temPermissao(
      "global",
      ["admin"]
    )

    ||

    (
      temPermissao(
        "global",
        ["usuario"]
      )
      &&
      temPermissao(
        "chaves",
        ["comissionador"]
      )
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


    // busca pela nota (ns)
    const rNota = await supabase
      .from("db_chaves")
      .select("*")
      .eq("ns", valor);


    if (rNota.error) {

      console.log(rNota.error);

      alert("Erro ao buscar");

      setLoading(false);

      return;

    }


    if (rNota.data && rNota.data.length > 0) {

      setLista(rNota.data);

      setLoading(false);

      return;

    }


    // busca pela chave (numero)
    const rNumero = await supabase
      .from("db_chaves")
      .select("*")
      .eq("numero", valor);


    if (rNumero.error) {

      console.log(rNumero.error);

      alert("Erro ao buscar");

      setLoading(false);

      return;

    }


    setLista(rNumero.data || []);

    setLoading(false);

  }


  async function removerAssociacao(id: number) {

    const confirmar = confirm(
      "Deseja remover a associação desta chave?"
    );

    if (!confirmar) return;


    const { error } = await supabase
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


    if (error) {

      console.log(error);

      alert("Erro ao remover associação");

      return;

    }


    pesquisar();

  }


  if (!acessoPermitido)
    return <div>Sem permissão</div>;


  return (

    <div className="paginaPadrao">

      <h2>Corrigir cadastro</h2>


      <div className="barraBusca">

        <input
          placeholder="Digite número da chave ou nota"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") pesquisar();
          }}
        />

        <button onClick={pesquisar}>
          Pesquisar
        </button>

      </div>


      {loading && <p>Buscando...</p>}


      {!loading && lista.length === 0 && (
        <p>Nenhum registro encontrado</p>
      )}


      {lista.length > 0 && (

        <table>

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

            {lista.map(item => (

              <tr key={item.id}>

                <td>{item.numero}</td>

                <td>{item.ns}</td>

                <td>{item.poste}</td>

                <td>{item.folha}</td>

                <td>{item.coord}</td>

                <td>{item.usuario_associacao}</td>

                <td>
                  {item.data_associacao
                    ? new Date(item.data_associacao)
                      .toLocaleString("pt-BR")
                    : ""
                  }
                </td>

                <td>

                  <button
                    onClick={() =>
                      removerAssociacao(item.id)
                    }
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

  );

}
