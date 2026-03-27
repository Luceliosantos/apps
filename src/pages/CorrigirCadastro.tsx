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
  ){

    const p =
      permissoes.find(
        x => x.sistema === sistema
      );

    if(!p) return false;

    if(p.tipo === "admin") return true;

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


  async function pesquisar(){

    if(!busca) return;

    setLoading(true);

    const valor = Number(busca);

    if(isNaN(valor)){

      setLista([]);

      setLoading(false);

      return;

    }


    const rNota = await supabase
      .from("db_chaves")
      .select("*")
      .eq("ns", valor);


    if(rNota.data && rNota.data.length > 0){

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


  async function removerAssociacao(id:number){

    const confirmar =
      confirm("Deseja remover a associação desta chave?");

    if(!confirmar) return;


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


  if(!acessoPermitido)
    return <div>Sem permissão</div>;


  return(

    <div className="pagina">

      <div className="caixa">

        <div className="topo">

          <h2>
            Corrigir cadastro
          </h2>


          <button
            className="botaoHome"
            onClick={()=>setPagina("home")}
          >
            Home
          </button>

        </div>


        <div className="linhaBusca">

          <input
            className="inputPadrao"
            placeholder="Digite número da chave ou nota"
            value={busca}
            onChange={(e)=>setBusca(e.target.value)}
            onKeyDown={(e)=>{
              if(e.key==="Enter") pesquisar();
            }}
          />

          <button
            className="botaoPadrao"
            onClick={pesquisar}
          >
            Pesquisar
          </button>

        </div>


        {loading && <p>Buscando...</p>}


        {!loading && lista.length === 0 && (

          <p>
            Nenhum registro encontrado
          </p>

        )}


        {lista.length > 0 && (

          <table className="tabela">

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

                  <td>
                    {item.numero}
                  </td>


                  <td>
                    {item.ns}
                  </td>


                  <td>
                    {item.poste}
                  </td>


                  <td>
                    {item.flh}
                  </td>


                  <td>
                    {item.coord}
                  </td>


                  <td>
                    {item.usu_ass}
                  </td>


                  <td>

                    {
                      item.dt_ass_db
                      ?

                      new Date(item.dt_ass_db)
                      .toLocaleString("pt-BR")

                      :

                      ""
                    }

                  </td>


                  <td>

                    <button
                      className="botaoExcluir"
                      onClick={()=>
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

    </div>

  );

}
