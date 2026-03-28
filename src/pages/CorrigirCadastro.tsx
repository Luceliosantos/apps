import { useState, useEffect } from "react";
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
  const [quantidadeDisponivel, setQuantidadeDisponivel] = useState(0);


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


  useEffect(()=>{
    carregarQuantidadeDisponivel();
  },[]);


  async function carregarQuantidadeDisponivel(){

    const r = await supabase
      .from("db_chaves")
      .select("*", { count:"exact", head:true })
      .is("ns", null);

    setQuantidadeDisponivel(r.count || 0);

  }


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
    carregarQuantidadeDisponivel();

  }


  if(!acessoPermitido)
    return <div>Sem permissão</div>;


  return(

    <div
      style={{
        minHeight:"100vh",
        backgroundImage:"url('/fundo.jpg')",
        backgroundSize:"cover",
        backgroundPosition:"center",
        padding:"40px"
      }}
    >

      <div
        style={{
          maxWidth:"1100px",
          margin:"0 auto",
          backgroundColor:"rgba(255,255,255,0.95)",
          borderRadius:"12px",
          padding:"30px",
          boxShadow:"0 6px 25px rgba(0,0,0,0.25)"
        }}
      >

        <div
          style={{
            display:"flex",
            justifyContent:"space-between",
            alignItems:"center",
            marginBottom:"10px"
          }}
        >

          <h2>
            Corrigir cadastro
          </h2>


          <button
            onClick={()=>setPagina("home")}
            style={botaoPadrao}
          >
            Voltar
          </button>

        </div>


        <div
          style={{
            fontSize:"18px",
            marginBottom:"25px",
            textAlign:"center",
            fontWeight:"500"
          }}
        >
          {quantidadeDisponivel} chaves disponíveis
        </div>



        <div
          style={{
            display:"flex",
            gap:"10px",
            marginBottom:"20px"
          }}
        >

          <input
            placeholder="Digite número da chave ou nota"
            value={busca}
            onChange={(e)=>setBusca(e.target.value)}
            onKeyDown={(e)=>{
              if(e.key==="Enter") pesquisar();
            }}
            style={inputPadrao}
          />

          <button
            onClick={pesquisar}
            style={botaoPadrao}
          >
            Pesquisar
          </button>

        </div>


        {loading && <p>Buscando...</p>}


        {!loading && lista.length === 0 && (

          <p
            style={{
              textAlign:"center"
            }}
          >
            Nenhum registro encontrado
          </p>

        )}


        {lista.length > 0 && (

          <table
            style={{
              width:"100%",
              borderCollapse:"collapse",
              textAlign:"center"
            }}
          >

            <thead>

              <tr>

                <th style={th}>CHAVE</th>

                <th style={th}>NOTA</th>

                <th style={th}>POSTE</th>

                <th style={th}>FOLHA</th>

                <th style={th}>COORDENADA</th>

                <th style={th}>USUÁRIO</th>

                <th style={th}>DATA ASSOCIAÇÃO</th>

                <th style={th}>AÇÃO</th>

              </tr>

            </thead>


            <tbody>

              {lista.map(item => (

                <tr key={item.id}>

                  <td style={td}>
                    {item.numero}
                  </td>


                  <td style={td}>
                    {item.ns}
                  </td>


                  <td style={td}>
                    {item.poste}
                  </td>


                  <td style={td}>
                    {item.flh}
                  </td>


                  <td style={td}>
                    {item.coord}
                  </td>


                  <td style={td}>
                    {item.usu_ass}
                  </td>


                  <td style={td}>

                    {
                      item.dt_ass_db
                      ?

                      new Date(item.dt_ass_db)
                      .toLocaleString("pt-BR")

                      :

                      ""
                    }

                  </td>


                  <td style={td}>

                    <button
                      onClick={()=>
                        removerAssociacao(item.id)
                      }
                      style={botaoPadrao}
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



const botaoPadrao:React.CSSProperties={

  padding:"10px 18px",
  borderRadius:"8px",
  border:"none",
  backgroundColor:"#1f3b73",
  color:"white",
  cursor:"pointer",
  fontWeight:"600"

};


const inputPadrao:React.CSSProperties={

  flex:1,
  padding:"10px",
  borderRadius:"8px",
  border:"1px solid #ccc",
  textAlign:"center"

};


const th:React.CSSProperties={

  padding:"10px",
  border:"1px solid #dcdcdc",
  backgroundColor:"#f1f1f1",
  fontWeight:"700"

};


const td:React.CSSProperties={

  padding:"10px",
  border:"1px solid #e5e5e5"

};
