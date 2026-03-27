import { useState } from "react";
import { supabase } from "../supabase";

type Props = {
  usuario: any;
};

export default function CorrigirCadastro({ usuario }: Props) {

  const [busca, setBusca] = useState("");
  const [lista, setLista] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // permissões
  const temPermissao =
    usuario?.perfil === "Admin" ||
    usuario?.chaves === "comissionador" ||
    usuario?.geral === "usuario";

  async function pesquisar() {

    if (!busca) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("db_chaves")
      .select(`
        id,
        numero,
        nota,
        postes,
        folha,
        coordenada,
        usuario_associacao,
        data_associacao
      `)
      .or(`nota.eq.${busca},numero.eq.${busca}`)
      .not("nota","is",null)
      .order("data_associacao",{ ascending:false });

    if (error) {
      console.error(error);
      alert("Erro ao buscar registros");
      setLoading(false);
      return;
    }

    setLista(data || []);
    setLoading(false);
  }

  async function removerAssociacao(id:number) {

    const confirmar = confirm(
      "Deseja remover a associação desta chave?"
    );

    if (!confirmar) return;

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
      console.error(error);
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
          placeholder="Digite número da chave ou nota"
          value={busca}
          onChange={(e)=>setBusca(e.target.value)}
          onKeyDown={(e)=>{
            if(e.key==="Enter") pesquisar();
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

                <td>{item.numero}</td>

                <td>{item.nota}</td>

                <td>{item.postes}</td>

                <td>{item.folha}</td>

                <td>{item.coordenada}</td>

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

      )}

    </div>

  );
}
