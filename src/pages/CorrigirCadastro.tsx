import { useState } from "react";
import { supabase } from "../supabaseClient";

type Props = {
  usuario: any;
};

export default function CorrigirCadastro({ usuario }: Props) {

  const [busca, setBusca] = useState("");
  const [lista, setLista] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // verifica permissão
  const temPermissao =
    usuario?.perfil === "Admin" ||
    usuario?.chaves === "comissionador" ||
    usuario?.geral === "usuario";

  async function pesquisar() {

    if (!busca) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("db_chaves")
      .select("*")
      .or(`nota.eq.${busca},chave.eq.${busca}`)
      .order("data_associacao", { ascending: false });

    if (error) {
      console.error(error);
      alert("Erro ao buscar");
    }

    setLista(data || []);
    setLoading(false);
  }

  async function removerAssociacao(id: string) {

    if (!confirm("Deseja remover a associação desta chave?"))
      return;

    const { error } = await supabase
      .from("db_chaves")
      .update({
        nota: null,
        postes: null,
        folha: null,
        coordenada: null,
        usuario_associacao: null,
        data_associacao: null
      })
      .eq("id", id);

    if (error) {
      alert("Erro ao remover associação");
      return;
    }

    pesquisar();
  }

  if (!temPermissao)
    return <div>Sem permissão</div>;

  return (

    <div className="paginaPadrao">

      <h2>Corrigir cadastro</h2>

      <div className="barraBusca">

        <input
          placeholder="Pesquisar por chave ou nota"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && pesquisar()}
        />

        <button onClick={pesquisar}>
          Pesquisar
        </button>

      </div>

      {loading && <p>Buscando...</p>}

      <table>

        <thead>
          <tr>
            <th>Chave</th>
            <th>Nota</th>
            <th>Postes</th>
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

              <td>{item.chave}</td>
              <td>{item.nota}</td>
              <td>{item.postes}</td>
              <td>{item.folha}</td>
              <td>{item.coordenada}</td>
              <td>{item.usuario_associacao}</td>

              <td>
                {item.data_associacao
                  ? new Date(item.data_associacao)
                    .toLocaleString("pt-BR")
                  : ""}
              </td>

              <td>

                <button
                  className="botaoRemover"
                  onClick={() => removerAssociacao(item.id)}
                >
                  Remover
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}
